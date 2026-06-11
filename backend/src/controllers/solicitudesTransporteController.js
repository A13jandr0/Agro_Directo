const { getPool } = require('../db');
const sql = require('mssql');
const { getIo } = require('../socket');

// Helper para emitir notificaciones
const emitirNotificacion = async (transaction, usuario_id, tipo, titulo, mensaje, pedido_id = null) => {
    // Insert in DB
    const result = await new sql.Request(transaction)
        .input('usuario_id', sql.UniqueIdentifier, usuario_id)
        .input('tipo', sql.VarChar, tipo)
        .input('titulo', sql.VarChar, titulo)
        .input('mensaje', sql.VarChar, mensaje)
        .input('pedido_id', sql.UniqueIdentifier, pedido_id)
        .query(`
            INSERT INTO notificaciones_app (usuario_id, tipo, titulo, mensaje, pedido_id, leida, fecha_creacion)
            OUTPUT INSERTED.*
            VALUES (@usuario_id, @tipo, @titulo, @mensaje, @pedido_id, 0, GETDATE())
        `);
        
    const nuevaNotificacion = result.recordset[0];
    
    // Emit by WebSocket
    try {
        const io = getIo();
        io.to(usuario_id).emit('nueva_notificacion', nuevaNotificacion);
    } catch (err) {
        console.error('WebSocket Error (puede que socket.io no esté inicializado):', err);
    }
};

// POST /api/solicitudes-transporte
exports.crearSolicitud = async (req, res) => {
    try {
        const { pedido_id, transportista_id, origen, destino, descripcion_carga } = req.body;
        const productor_id = req.user.id; // El productor autenticado

        const pool = await getPool();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Verificar si el pedido existe y está en estado LISTO_PARA_DESPACHO
            const pedidoCheck = await new sql.Request(transaction)
                .input('pedido_id', sql.UniqueIdentifier, pedido_id)
                .query(`
                    SELECT p.id, p.estado 
                    FROM Pedidos p
                    INNER JOIN Detalle_Pedidos dp ON dp.pedido_id = p.id
                    INNER JOIN Cosechas c ON dp.cosecha_id = c.id
                    WHERE p.id = @pedido_id AND c.productor_id = '${productor_id}'
                `);

            if (pedidoCheck.recordset.length === 0) {
                await transaction.rollback();
                return res.status(404).json({ error: 'Pedido no encontrado o no te pertenece.' });
            }

            if (pedidoCheck.recordset[0].estado !== 'LISTO_PARA_DESPACHO') {
                await transaction.rollback();
                return res.status(400).json({ error: 'El pedido no está en estado LISTO_PARA_DESPACHO.' });
            }

            // Verificar si ya hay una solicitud PENDIENTE o ACEPTADA para este pedido
            const solicitudCheck = await new sql.Request(transaction)
                .input('pedido_id', sql.UniqueIdentifier, pedido_id)
                .query(`
                    SELECT id FROM solicitudes_transporte 
                    WHERE pedido_id = @pedido_id 
                    AND estado_solicitud IN ('PENDIENTE', 'ACEPTADO')
                `);
                
            if (solicitudCheck.recordset.length > 0) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Ya existe una solicitud activa o aceptada para este pedido.' });
            }

            // Insertar solicitud
            await new sql.Request(transaction)
                .input('pedido_id', sql.UniqueIdentifier, pedido_id)
                .input('transportista_id', sql.UniqueIdentifier, transportista_id)
                .input('origen', sql.VarChar, origen)
                .input('destino', sql.VarChar, destino)
                .input('descripcion', sql.Text, descripcion_carga || '')
                .query(`
                    INSERT INTO solicitudes_transporte (pedido_id, transportista_id, estado_solicitud, origen, destino, descripcion_carga, fecha_solicitud)
                    VALUES (@pedido_id, @transportista_id, 'PENDIENTE', @origen, @destino, @descripcion, GETDATE())
                `);

            // Notificar al transportista
            const pedidoCorto = pedido_id.split('-')[0].toUpperCase();
            await emitirNotificacion(
                transaction, 
                transportista_id, 
                'SOLICITUD_TRANSPORTE', 
                'Nueva solicitud de transporte', 
                `Tienes una nueva solicitud de despacho para el pedido #${pedidoCorto}`,
                pedido_id
            );

            await transaction.commit();
            res.status(201).json({ message: 'Solicitud creada con éxito.' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (error) {
        console.error('Error al crear solicitud:', error);
        res.status(500).json({ error: 'Error interno al crear solicitud.' });
    }
};

// PUT /api/solicitudes-transporte/:id/responder
exports.responderSolicitud = async (req, res) => {
    try {
        const { id } = req.params;
        const { accion } = req.body; // 'ACEPTADO' o 'RECHAZADO'
        const transportista_id = req.user.id;

        if (!['ACEPTADO', 'RECHAZADO'].includes(accion)) {
            return res.status(400).json({ error: 'Acción inválida. Debe ser ACEPTADO o RECHAZADO.' });
        }

        const pool = await getPool();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Verificar solicitud
            const solCheck = await new sql.Request(transaction)
                .input('id', sql.UniqueIdentifier, id)
                .input('transportista_id', sql.UniqueIdentifier, transportista_id)
                .query(`
                    SELECT s.id, s.pedido_id, s.estado_solicitud, p.comprador_id, c.productor_id, u.nombre_completo as transportista_nombre
                    FROM solicitudes_transporte s
                    INNER JOIN Pedidos p ON s.pedido_id = p.id
                    INNER JOIN Detalle_Pedidos dp ON dp.pedido_id = p.id
                    INNER JOIN Cosechas c ON dp.cosecha_id = c.id
                    INNER JOIN usuarios u ON u.id = s.transportista_id
                    WHERE s.id = @id AND s.transportista_id = @transportista_id
                `);

            if (solCheck.recordset.length === 0) {
                await transaction.rollback();
                return res.status(404).json({ error: 'Solicitud no encontrada o no te pertenece.' });
            }

            const solicitud = solCheck.recordset[0];
            const { pedido_id, comprador_id, productor_id, transportista_nombre } = solicitud;
            const pedidoCorto = pedido_id.split('-')[0].toUpperCase();

            if (solicitud.estado_solicitud !== 'PENDIENTE') {
                await transaction.rollback();
                return res.status(400).json({ error: 'Esta solicitud ya fue respondida.' });
            }

            // Actualizar solicitud
            await new sql.Request(transaction)
                .input('id', sql.UniqueIdentifier, id)
                .input('accion', sql.VarChar, accion)
                .query(`
                    UPDATE solicitudes_transporte 
                    SET estado_solicitud = @accion, fecha_respuesta = GETDATE()
                    WHERE id = @id
                `);

            if (accion === 'ACEPTADO') {
                // Actualizar pedido
                await new sql.Request(transaction)
                    .input('pedido_id', sql.UniqueIdentifier, pedido_id)
                    .input('transportista_id', sql.UniqueIdentifier, transportista_id)
                    .query(`
                        UPDATE Pedidos 
                        SET estado = 'EN_CAMINO', 
                            transportista_id = @transportista_id,
                            fecha_actualizacion = GETDATE()
                        WHERE id = @pedido_id
                    `);

                // Notificar al comprador
                await emitirNotificacion(
                    transaction, 
                    comprador_id, 
                    'PEDIDO_EN_CAMINO', 
                    'Tu pedido está en camino', 
                    `El transportista ${transportista_nombre} ha aceptado llevar tu pedido.`,
                    pedido_id
                );

                // Notificar al productor
                await emitirNotificacion(
                    transaction, 
                    productor_id, 
                    'TRANSPORTE_CONFIRMADO', 
                    'Transporte confirmado', 
                    `${transportista_nombre} aceptó el despacho del pedido #${pedidoCorto}.`,
                    pedido_id
                );
            } else {
                // Notificar al productor del rechazo
                await emitirNotificacion(
                    transaction, 
                    productor_id, 
                    'TRANSPORTE_RECHAZADO', 
                    'Solicitud rechazada', 
                    `El transportista rechazó el despacho del pedido #${pedidoCorto}. Puedes asignar otro.`,
                    pedido_id
                );
            }

            await transaction.commit();
            res.json({ message: `Solicitud ${accion} con éxito.` });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (error) {
        console.error('Error al responder solicitud:', error);
        res.status(500).json({ error: 'Error interno al responder solicitud.' });
    }
};
