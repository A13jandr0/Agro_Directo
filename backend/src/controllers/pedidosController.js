const { sql, getPool } = require('../db');

// ── GET /api/pedidos/productor ──
// Lista pedidos que contienen productos de este productor
exports.getPedidosProductor = async (req, res) => {
    try {
        const userId = req.user.id;
        const pool = await getPool();

        const result = await pool.request()
            .input('usuario_id', sql.UniqueIdentifier, userId)
            .query(`
                SELECT
                    p.id           AS pedido_id,
                    p.estado       AS pedido_estado,
                    p.fecha_pedido,
                    p.notas,
                    p.comprobante_url,
                    u.nombre_completo AS comprador_nombre,
                    u.correo        AS comprador_correo,
                    d.id           AS detalle_id,
                    d.cantidad,
                    d.precio_unitario,
                    c.id           AS cosecha_id,
                    c.nombre_producto,
                    c.foto_url,
                    c.unidad_medida,
                    c.cantidad_disponible AS stock_actual
                FROM Pedidos p
                INNER JOIN Detalle_Pedidos d ON d.pedido_id = p.id
                INNER JOIN Cosechas c        ON d.cosecha_id = c.id
                INNER JOIN perfil_productor pp ON c.productor_id = pp.id
                INNER JOIN usuarios u         ON p.comprador_id = u.id
                WHERE pp.usuario_id = @usuario_id
                ORDER BY p.fecha_pedido DESC
            `);

        // Agrupar filas por pedido
        const pedidosMap = {};
        for (const row of result.recordset) {
            if (!pedidosMap[row.pedido_id]) {
                pedidosMap[row.pedido_id] = {
                    id: row.pedido_id,
                    estado: row.pedido_estado,
                    fecha_pedido: row.fecha_pedido,
                    notas: row.notas,
                    comprobante_url: row.comprobante_url,
                    comprador_nombre: row.comprador_nombre,
                    comprador_correo: row.comprador_correo,
                    items: []
                };
            }
            pedidosMap[row.pedido_id].items.push({
                detalle_id: row.detalle_id,
                cosecha_id: row.cosecha_id,
                nombre_producto: row.nombre_producto,
                foto_url: row.foto_url,
                unidad_medida: row.unidad_medida,
                cantidad: row.cantidad,
                precio_unitario: row.precio_unitario,
                stock_actual: row.stock_actual
            });
        }

        res.json(Object.values(pedidosMap));
    } catch (error) {
        console.error('Get Pedidos Productor Error:', error);
        res.status(500).json({ error: 'Error al obtener los pedidos.' });
    }
};

// ── PUT /api/pedidos/:id/confirmar ──
// Confirma el pedido y resta inventario con TRANSACCIÓN
exports.confirmarPedido = async (req, res) => {
    const pedidoId = req.params.id;
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // 1. Verificar que el pedido existe y está PENDIENTE
        const pedidoResult = await new sql.Request(transaction)
            .input('pedido_id', sql.UniqueIdentifier, pedidoId)
            .query('SELECT id, estado FROM Pedidos WHERE id = @pedido_id');

        if (pedidoResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Pedido no encontrado.' });
        }
        if (pedidoResult.recordset[0].estado !== 'PENDIENTE') {
            await transaction.rollback();
            return res.status(400).json({ error: 'Este pedido ya fue procesado.' });
        }

        // 2. Obtener los items del pedido
        const itemsResult = await new sql.Request(transaction)
            .input('pedido_id', sql.UniqueIdentifier, pedidoId)
            .query(`
                SELECT d.cosecha_id, d.cantidad, c.cantidad_disponible, c.nombre_producto
                FROM Detalle_Pedidos d
                INNER JOIN Cosechas c ON d.cosecha_id = c.id
                WHERE d.pedido_id = @pedido_id
            `);

        // 3. Validar stock para CADA item
        for (const item of itemsResult.recordset) {
            if (item.cantidad > item.cantidad_disponible) {
                await transaction.rollback();
                return res.status(400).json({
                    error: `Stock insuficiente para "${item.nombre_producto}". Disponible: ${item.cantidad_disponible}, Solicitado: ${item.cantidad}.`
                });
            }
        }

        // 4. Restar inventario
        for (const item of itemsResult.recordset) {
            await new sql.Request(transaction)
                .input('cosecha_id', sql.UniqueIdentifier, item.cosecha_id)
                .input('cantidad', sql.Decimal(10, 2), item.cantidad)
                .query(`
                    UPDATE Cosechas
                    SET cantidad_disponible = cantidad_disponible - @cantidad
                    WHERE id = @cosecha_id
                `);
        }

        // 5. Actualizar estado del pedido
        await new sql.Request(transaction)
            .input('pedido_id', sql.UniqueIdentifier, pedidoId)
            .query("UPDATE Pedidos SET estado = 'CONFIRMADO' WHERE id = @pedido_id");

        await transaction.commit();

        res.json({ mensaje: 'Pedido confirmado e inventario actualizado exitosamente.' });
    } catch (error) {
        try { await transaction.rollback(); } catch (e) { /* already rolled back */ }
        console.error('Confirmar Pedido Error:', error);
        res.status(500).json({ error: 'Error interno al confirmar el pedido.' });
    }
};

// ── PUT /api/pedidos/:id/rechazar ──
exports.rechazarPedido = async (req, res) => {
    try {
        const pedidoId = req.params.id;
        const pool = await getPool();

        const result = await pool.request()
            .input('pedido_id', sql.UniqueIdentifier, pedidoId)
            .query(`
                UPDATE Pedidos SET estado = 'RECHAZADO'
                WHERE id = @pedido_id AND estado = 'PENDIENTE'
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(400).json({ error: 'No se pudo rechazar. El pedido ya fue procesado o no existe.' });
        }

        res.json({ mensaje: 'Pedido rechazado.' });
    } catch (error) {
        console.error('Rechazar Pedido Error:', error);
        res.status(500).json({ error: 'Error al rechazar el pedido.' });
    }
};

// ── POST /api/pedidos (Comprador crea un pedido desde su carrito) ──
exports.crearPedido = async (req, res) => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    try {
        const compradorId = req.user.id;
        let { items, notas } = req.body;
        
        // Si viene de FormData, items suele ser un string JSON
        if (typeof items === 'string') {
            items = JSON.parse(items);
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'El pedido debe tener al menos un producto.' });
        }

        const comprobante_url = req.file ? `/uploads/${req.file.filename}` : null;

        await transaction.begin();

        // Validar stock antes de crear pedido
        for (const item of items) {
            const stockCheck = await new sql.Request(transaction)
                .input('cosecha_id', sql.UniqueIdentifier, item.cosecha_id)
                .query('SELECT cantidad_disponible, nombre_producto FROM Cosechas WHERE id = @cosecha_id');
            
            if (stockCheck.recordset.length > 0) {
                const stockItem = stockCheck.recordset[0];
                if (item.cantidad > stockItem.cantidad_disponible) {
                    await transaction.rollback();
                    return res.status(400).json({
                        error: `Stock insuficiente para "${stockItem.nombre_producto}". Disponible: ${stockItem.cantidad_disponible}, Solicitado: ${item.cantidad}.`
                    });
                }
            }
        }

        // Crear el pedido con comprobante
        const pedidoResult = await new sql.Request(transaction)
            .input('comprador_id', sql.UniqueIdentifier, compradorId)
            .input('notas', sql.Text, notas || null)
            .input('comprobante_url', sql.VarChar(500), comprobante_url)
            .query(`
                INSERT INTO Pedidos (comprador_id, notas, comprobante_url, estado)
                OUTPUT INSERTED.id
                VALUES (@comprador_id, @notas, @comprobante_url, 'PENDIENTE')
            `);

        const pedidoId = pedidoResult.recordset[0].id;

        // Insertar detalles
        for (const item of items) {
            await new sql.Request(transaction)
                .input('pedido_id', sql.UniqueIdentifier, pedidoId)
                .input('cosecha_id', sql.UniqueIdentifier, item.cosecha_id)
                .input('cantidad', sql.Decimal(10, 2), item.cantidad)
                .input('precio_unitario', sql.Decimal(10, 2), item.precio_unitario)
                .query(`
                    INSERT INTO Detalle_Pedidos (pedido_id, cosecha_id, cantidad, precio_unitario)
                    VALUES (@pedido_id, @cosecha_id, @cantidad, @precio_unitario)
                `);
        }

        await transaction.commit();

        res.status(201).json({ mensaje: 'Pedido creado exitosamente.', pedido_id: pedidoId });
    } catch (error) {
        try { await transaction.rollback(); } catch (e) {}
        console.error('Crear Pedido Error:', error);
        res.status(500).json({ error: 'Error al crear el pedido.' });
    }
};
// ── GET /api/pedidos/comprador ──
exports.getPedidosComprador = async (req, res) => {
    try {
        const userId = req.user.id;
        const pool = await getPool();
        const result = await pool.request()
            .input('usuario_id', sql.UniqueIdentifier, userId)
            .query(`
                SELECT p.*, d.cantidad, d.precio_unitario, c.nombre_producto, c.foto_url, c.es_preventa, c.fecha_disponibilidad
                FROM Pedidos p
                INNER JOIN Detalle_Pedidos d ON d.pedido_id = p.id
                INNER JOIN Cosechas c ON d.cosecha_id = c.id
                WHERE p.comprador_id = @usuario_id
                ORDER BY p.fecha_pedido DESC
            `);

        // Agrupar por pedido
        const pedidosMap = {};
        result.recordset.forEach(row => {
            if (!pedidosMap[row.id]) {
                pedidosMap[row.id] = { ...row, items: [] };
            }
            pedidosMap[row.id].items.push({
                nombre_producto: row.nombre_producto,
                foto_url: row.foto_url,
                cantidad: row.cantidad,
                precio_unitario: row.precio_unitario,
                es_preventa: row.es_preventa,
                fecha_disponibilidad: row.fecha_disponibilidad
            });
        });

        res.json(Object.values(pedidosMap));
    } catch (error) {
        console.error('Get Pedidos Comprador Error:', error);
        res.status(500).json({ error: 'Error al obtener tus pedidos.' });
    }
};

// ── GET /api/pedidos/checkout/:productorId ──
// Devuelve el QR del productor para el pago
exports.getCheckoutInfo = async (req, res) => {
    try {
        const { productorId } = req.params;
        const pool = await getPool();

        const result = await pool.request()
            .input('productorId', sql.UniqueIdentifier, productorId)
            .query(`
                SELECT qr_pago_ruta, nombre_finca
                FROM perfil_productor
                WHERE id = @productorId
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Productor no encontrado.' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Checkout Info Error:', error);
        res.status(500).json({ error: 'Error al obtener info de pago.' });
    }
};

// ── GET /api/pedidos/bolsa (Bolsa de Carga para Transportistas) ──
exports.getPedidosBolsa = async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .query(`
                SELECT p.id, p.fecha_pedido, u.nombre_completo AS comprador,
                       pp.municipio AS origen, u.departamento AS destino,
                       COUNT(d.id) AS total_items
                FROM Pedidos p
                INNER JOIN usuarios u ON p.comprador_id = u.id
                INNER JOIN Detalle_Pedidos d ON d.pedido_id = p.id
                INNER JOIN Cosechas c ON d.cosecha_id = c.id
                INNER JOIN perfil_productor pp ON c.productor_id = pp.id
                WHERE p.estado = 'CONFIRMADO'
                GROUP BY p.id, p.fecha_pedido, u.nombre_completo, pp.municipio, u.departamento
            `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Bolsa Carga Error:', error);
        res.status(500).json({ error: 'Error al obtener la bolsa de carga.' });
    }
};

// ── PUT /api/pedidos/:id/aceptar-ruta ──
exports.aceptarRuta = async (req, res) => {
    try {
        const pedidoId = req.params.id;
        const userId = req.user.id;
        const pool = await getPool();

        // Obtener ID de perfil_transportista
        const profileResult = await pool.request()
            .input('user_id', sql.UniqueIdentifier, userId)
            .query('SELECT id FROM perfil_transportista WHERE usuario_id = @user_id');

        if (profileResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Perfil de transportista no encontrado' });
        }

        const transportistaId = profileResult.recordset[0].id;

        await pool.request()
            .input('id', sql.UniqueIdentifier, pedidoId)
            .input('transportista_id', sql.UniqueIdentifier, transportistaId)
            .query(`
                UPDATE Pedidos 
                SET estado = 'EN_CAMINO', transportista_id = @transportista_id
                WHERE id = @id AND estado = 'CONFIRMADO'
            `);

        res.json({ mensaje: 'Ruta aceptada. El pedido está en camino.' });
    } catch (error) {
        console.error('Aceptar Ruta Error:', error);
        res.status(500).json({ error: 'Error al aceptar la ruta.' });
    }
};

// ── GET /api/pedidos/transportista/actual ──
exports.getPedidoActualTransportista = async (req, res) => {
    try {
        const userId = req.user.id;
        const pool = await getPool();

        const result = await pool.request()
            .input('user_id', sql.UniqueIdentifier, userId)
            .query(`
                SELECT 
                    p.id, p.estado, p.notas,
                    pp.nombre_finca, pp.municipio, pp.provincia,
                    pp.ubicacion_gps.Lat AS latitud, pp.ubicacion_gps.Long AS longitud,
                    u_comp.nombre_completo AS comprador_nombre,
                    pc.ciudad_principal,
                    d.cantidad, d.precio_unitario, c.nombre_producto, c.unidad_medida
                FROM Pedidos p
                JOIN perfil_transportista pt ON p.transportista_id = pt.id
                JOIN usuarios u_comp ON p.comprador_id = u_comp.id
                JOIN perfil_comprador pc ON u_comp.id = pc.usuario_id
                JOIN Detalle_Pedidos d ON p.id = d.pedido_id
                JOIN Cosechas c ON d.cosecha_id = c.id
                JOIN perfil_productor pp ON c.productor_id = pp.id
                WHERE pt.usuario_id = @user_id AND p.estado = 'EN_CAMINO'
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'No tienes pedidos en camino.' });
        }

        // Agrupar items
        const pedido = {
            id: result.recordset[0].id,
            estado: result.recordset[0].estado,
            notas: result.recordset[0].notas,
            nombre_finca: result.recordset[0].nombre_finca,
            municipio: result.recordset[0].municipio,
            provincia: result.recordset[0].provincia,
            latitud: result.recordset[0].latitud,
            longitud: result.recordset[0].longitud,
            comprador_nombre: result.recordset[0].comprador_nombre,
            ciudad_principal: result.recordset[0].ciudad_principal,
            items: result.recordset.map(r => ({
                nombre_producto: r.nombre_producto,
                cantidad: r.cantidad,
                unidad_medida: r.unidad_medida
            }))
        };

        res.json(pedido);
    } catch (error) {
        console.error('Get Actual Ruta Error:', error);
        res.status(500).json({ error: 'Error al obtener el pedido actual.' });
    }
};

// ── PUT /api/pedidos/:id/entregar (Con Firma Digital vía Multer) ──
exports.entregarPedido = async (req, res) => {
    try {
        const pedidoId = req.params.id;
        const pool = await getPool();

        if (!req.file) {
            return res.status(400).json({ error: 'La firma (archivo) es obligatoria para la entrega.' });
        }

        const firma_url = `/uploads/${req.file.filename}`;

        await pool.request()
            .input('id', sql.UniqueIdentifier, pedidoId)
            .input('firma_url', sql.VarChar(500), firma_url)
            .query(`
                UPDATE Pedidos 
                SET estado = 'ENTREGADO', firma_comprador_url = @firma_url, fecha_actualizacion = GETDATE()
                WHERE id = @id AND estado = 'EN_CAMINO'
            `);

        res.json({ mensaje: 'Pedido entregado exitosamente.', firma_url });
    } catch (error) {
        console.error('Entregar Pedido Error:', error);
        res.status(500).json({ error: 'Error al procesar la entrega.' });
    }
};
