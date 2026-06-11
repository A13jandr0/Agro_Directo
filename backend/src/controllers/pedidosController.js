const { sql, getPool } = require('../db');
const { calcularMontosLinea, cosechaYaDisponible } = require('../utils/preventaUtils');
const {
    formatPedidoRef,
    notificarNuevoPedido,
    notificarComprobanteEnviado,
    notificarPagoConfirmado,
    notificarPagoRechazado,
    notificarListoDespacho,
    notificarRutaAceptada,
    notificarEntregaCompletada,
    obtenerProductoresDelPedido,
} = require('../services/notificacionesService');

async function descontarInventarioPedido(transaction, pedidoId) {
    const itemsResult = await new sql.Request(transaction)
        .input('pedido_id', sql.UniqueIdentifier, pedidoId)
        .query(`
            SELECT d.cosecha_id, d.cantidad, c.cantidad_disponible, c.nombre_producto
            FROM Detalle_Pedidos d
            INNER JOIN Cosechas c ON d.cosecha_id = c.id
            WHERE d.pedido_id = @pedido_id
        `);

    for (const item of itemsResult.recordset) {
        if (item.cantidad > item.cantidad_disponible) {
            throw new Error(`Stock insuficiente para "${item.nombre_producto}".`);
        }
    }

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
}

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
                    FORMAT(p.fecha_pedido, 'yyyy-MM-ddTHH:mm:ss') AS fecha_pedido,
                    FORMAT(p.fecha_comprobante, 'yyyy-MM-ddTHH:mm:ss') AS fecha_comprobante,
                    FORMAT(p.fecha_pago, 'yyyy-MM-ddTHH:mm:ss') AS fecha_pago,
                    FORMAT(p.fecha_entrega, 'yyyy-MM-ddTHH:mm:ss') AS fecha_entrega,
                    FORMAT(p.fecha_actualizacion, 'yyyy-MM-ddTHH:mm:ss') AS fecha_actualizacion,
                    p.notas,
                    p.comprobante_url,
                    p.monto_total,
                    p.modalidad_entrega,
                    p.direccion_entrega,
                    p.motivo_rechazo_pago,
                    u.nombre_completo AS comprador_nombre,
                    u.correo        AS comprador_correo,
                    u.celular       AS comprador_celular,
                    d.id           AS detalle_id,
                    d.cantidad,
                    d.precio_unitario,
                    c.id           AS cosecha_id,
                    c.nombre_producto,
                    c.foto_url,
                    c.unidad_medida,
                    c.cantidad_disponible AS stock_actual,
                    c.es_preventa,
                    c.fecha_disponibilidad
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
                    fecha_comprobante: row.fecha_comprobante,
                    fecha_pago: row.fecha_pago,
                    fecha_entrega: row.fecha_entrega,
                    fecha_actualizacion: row.fecha_actualizacion,
                    notas: row.notas,
                    comprobante_url: row.comprobante_url,
                    monto_total: row.monto_total,
                    modalidad_entrega: row.modalidad_entrega,
                    direccion_entrega: row.direccion_entrega,
                    motivo_rechazo_pago: row.motivo_rechazo_pago,
                    comprador_nombre: row.comprador_nombre,
                    comprador_correo: row.comprador_correo,
                    comprador_celular: row.comprador_celular,
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
                stock_actual: row.stock_actual,
                es_preventa: row.es_preventa,
                fecha_disponibilidad: row.fecha_disponibilidad,
            });
        }

        res.json(Object.values(pedidosMap));
    } catch (error) {
        console.error('Get Pedidos Productor Error:', error);
        res.status(500).json({ error: 'Error al obtener los pedidos.' });
    }
};

// ── PUT /api/pedidos/:id/confirmar ──
// Productor confirma que recibió el pago (COMPROBANTE_ENVIADO → PAGADO)
exports.confirmarPedido = async (req, res) => {
    if (req.user.rol !== 'PRODUCTOR') {
        return res.status(403).json({ error: 'Solo el productor puede confirmar pagos.' });
    }
    const pedidoId = req.params.id;
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        const pedidoResult = await new sql.Request(transaction)
            .input('pedido_id', sql.UniqueIdentifier, pedidoId)
            .query(`
                SELECT p.id, p.estado, p.comprador_id, p.modalidad_entrega, u.nombre_completo AS comprador_nombre
                FROM Pedidos p
                INNER JOIN usuarios u ON p.comprador_id = u.id
                WHERE p.id = @pedido_id
            `);

        if (pedidoResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Pedido no encontrado.' });
        }

        const pedido = pedidoResult.recordset[0];
        const estadosValidos = ['COMPROBANTE_ENVIADO', 'PENDIENTE', 'PENDIENTE_CONFIRMACION'];
        if (!estadosValidos.includes(pedido.estado)) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Este pedido no está pendiente de confirmación de pago.' });
        }

        await descontarInventarioPedido(transaction, pedidoId);

        await new sql.Request(transaction)
            .input('pedido_id', sql.UniqueIdentifier, pedidoId)
            .query(`
                UPDATE Pedidos
                SET estado = 'PAGADO', motivo_rechazo_pago = NULL, 
                    fecha_pago = GETDATE(), fecha_actualizacion = GETDATE()
                WHERE id = @pedido_id
            `);

        await transaction.commit();

        const productorNombre = req.user.nombre || req.user.nombre_completo || 'El productor';
        await notificarPagoConfirmado(pedidoId, pedido.comprador_id, productorNombre);

        res.json({ mensaje: 'Pago confirmado. Pedido en preparación.' });
    } catch (error) {
        try { await transaction.rollback(); } catch (e) { /* noop */ }
        console.error('Confirmar Pedido Error:', error);
        const msg = error.message?.includes('Stock') ? error.message : 'Error interno al confirmar el pago.';
        res.status(error.message?.includes('Stock') ? 400 : 500).json({ error: msg });
    }
};

// ── PUT /api/pedidos/:id/rechazar ──
// Productor rechaza el pago (COMPROBANTE_ENVIADO → PENDIENTE con motivo)
exports.rechazarPedido = async (req, res) => {
    if (req.user.rol !== 'PRODUCTOR') {
        return res.status(403).json({ error: 'Solo el productor puede rechazar pagos.' });
    }
    try {
        const pedidoId = req.params.id;
        const { motivo_rechazo, motivo } = req.body || {};
        const motivoFinal = motivo_rechazo || motivo;
        const pool = await getPool();

        if (!motivoFinal?.trim()) {
            return res.status(400).json({ error: 'Debés describir el problema con el pago.' });
        }

        const pedidoResult = await pool.request()
            .input('pedido_id', sql.UniqueIdentifier, pedidoId)
            .query(`
                SELECT p.id, p.estado, p.comprador_id
                FROM Pedidos p WHERE p.id = @pedido_id
            `);

        if (pedidoResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado.' });
        }

        const pedido = pedidoResult.recordset[0];
        if (pedido.estado !== 'COMPROBANTE_ENVIADO') {
            return res.status(400).json({ error: 'Solo podés rechazar pedidos con comprobante enviado.' });
        }

        await pool.request()
            .input('pedido_id', sql.UniqueIdentifier, pedidoId)
            .input('motivo', sql.VarChar(500), motivoFinal.trim())
            .query(`
                UPDATE Pedidos
                SET estado = 'PENDIENTE', motivo_rechazo_pago = @motivo, fecha_actualizacion = GETDATE()
                WHERE id = @pedido_id
            `);

        const productorNombre = req.user.nombre || req.user.nombre_completo || 'El productor';
        await notificarPagoRechazado(pedidoId, pedido.comprador_id, productorNombre, motivoFinal.trim());

        res.json({ mensaje: 'Problema reportado al comprador.' });
    } catch (error) {
        console.error('Rechazar Pedido Error:', error);
        res.status(500).json({ error: 'Error al rechazar el pago.' });
    }
};

// ── POST /api/pedidos/:id/comprobante ──
exports.subirComprobante = async (req, res) => {
    try {
        const pedidoId = req.params.id;
        const compradorId = req.user.id;
        // Los comprobantes se suben con uploadDocsMiddleware, el cual guarda en public/documentos
        const comprobante_url = req.file ? `/documentos/${req.file.filename}` : null;

        if (!comprobante_url) {
            return res.status(400).json({ error: 'Debés subir el comprobante de pago.' });
        }

        const pool = await getPool();
        const pedidoResult = await pool.request()
            .input('id', sql.UniqueIdentifier, pedidoId)
            .input('comprador_id', sql.UniqueIdentifier, compradorId)
            .query(`
                SELECT p.id, p.estado, u.nombre_completo AS comprador_nombre
                FROM Pedidos p
                INNER JOIN usuarios u ON p.comprador_id = u.id
                WHERE p.id = @id AND p.comprador_id = @comprador_id
            `);

        if (pedidoResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado.' });
        }

        const pedido = pedidoResult.recordset[0];
        const estadosPermitidos = ['PENDIENTE_CONFIRMACION', 'PENDIENTE'];
        if (!estadosPermitidos.includes(pedido.estado)) {
            return res.status(400).json({ error: 'Este pedido no acepta comprobantes en su estado actual.' });
        }

        await pool.request()
            .input('id', sql.UniqueIdentifier, pedidoId)
            .input('comprobante_url', sql.VarChar(500), comprobante_url)
            .query(`
                UPDATE Pedidos
                SET comprobante_url = @comprobante_url,
                    estado = 'COMPROBANTE_ENVIADO',
                    motivo_rechazo_pago = NULL,
                    fecha_comprobante = GETDATE(),
                    fecha_actualizacion = GETDATE()
                WHERE id = @id
            `);

        await notificarComprobanteEnviado(pedidoId, pedido.comprador_nombre);

        res.json({
            mensaje: 'Comprobante enviado al productor.',
            pedido_ref: formatPedidoRef(pedidoId),
        });
    } catch (error) {
        console.error('Subir Comprobante Error:', error);
        res.status(500).json({ error: 'Error al subir el comprobante.' });
    }
};

// ── PUT /api/pedidos/:id/estado ──
exports.actualizarEstado = async (req, res) => {
    try {
        const pedidoId = req.params.id;
        const { estado, motivo_rechazo } = req.body;
        const pool = await getPool();

        if (estado === 'PAGADO') {
            return exports.confirmarPedido(req, res);
        }
        if (estado === 'PENDIENTE' && motivo_rechazo) {
            req.body.motivo = motivo_rechazo;
            return exports.rechazarPedido(req, res);
        }
        if (estado === 'LISTO_PARA_DESPACHO') {
            const pedidoResult = await pool.request()
                .input('id', sql.UniqueIdentifier, pedidoId)
                .query('SELECT id, estado, comprador_id FROM Pedidos WHERE id = @id');

            if (pedidoResult.recordset.length === 0) {
                return res.status(404).json({ error: 'Pedido no encontrado.' });
            }
            const pedido = pedidoResult.recordset[0];
            if (pedido.estado !== 'PAGADO') {
                return res.status(400).json({ error: 'El pedido debe estar pagado para marcarlo listo.' });
            }

            await pool.request()
                .input('id', sql.UniqueIdentifier, pedidoId)
                .query(`
                    UPDATE Pedidos SET estado = 'LISTO_PARA_DESPACHO', fecha_actualizacion = GETDATE()
                    WHERE id = @id
                `);

            await notificarListoDespacho(pedidoId, pedido.comprador_id);
            return res.json({ mensaje: 'Pedido marcado como listo para despacho.' });
        }

        return res.status(400).json({ error: 'Transición de estado no soportada.' });
    } catch (error) {
        console.error('Actualizar Estado Error:', error);
        res.status(500).json({ error: 'Error al actualizar el estado.' });
    }
};

// ── POST /api/pedidos (Comprador crea un pedido desde su carrito) ──
exports.crearPedido = async (req, res) => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    try {
        const compradorId = req.user.id;
        let { items, notas, notas_adicionales, modalidad_entrega, direccion_entrega } = req.body;
        notas = notas || notas_adicionales || null;
        
        // Si viene de FormData, items suele ser un string JSON
        if (typeof items === 'string') {
            items = JSON.parse(items);
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'El pedido debe tener al menos un producto.' });
        }

        const comprobante_url = req.file ? `/uploads/${req.file.filename}` : null;

        await transaction.begin();

        const lineas = [];
        let montoTotal = 0;
        let montoAnticipo = 0;
        let montoSaldo = 0;

        for (const item of items) {
            const stockCheck = await new sql.Request(transaction)
                .input('cosecha_id', sql.UniqueIdentifier, item.cosecha_id)
                .query(`
                    SELECT cantidad_disponible, nombre_producto, precio_unitario,
                           es_preventa, fecha_disponibilidad, estado_publicacion
                    FROM Cosechas WHERE id = @cosecha_id
                `);

            if (stockCheck.recordset.length === 0) {
                await transaction.rollback();
                return res.status(404).json({ error: 'Uno de los productos ya no está disponible.' });
            }

            const cosecha = stockCheck.recordset[0];
            if (cosecha.estado_publicacion !== 'Activo') {
                await transaction.rollback();
                return res.status(400).json({ error: `"${cosecha.nombre_producto}" no está activo en el marketplace.` });
            }
            if (item.cantidad > cosecha.cantidad_disponible) {
                await transaction.rollback();
                return res.status(400).json({
                    error: `Stock insuficiente para "${cosecha.nombre_producto}". Disponible: ${cosecha.cantidad_disponible}, Solicitado: ${item.cantidad}.`,
                });
            }

            const precioUnitario = Number(cosecha.precio_unitario);
            const esPreventa = Boolean(cosecha.es_preventa);
            const montos = calcularMontosLinea(precioUnitario, item.cantidad, esPreventa);

            montoTotal += montos.subtotal;
            montoAnticipo += montos.monto_anticipo;
            montoSaldo += montos.monto_saldo;

            lineas.push({
                cosecha_id: item.cosecha_id,
                cantidad: item.cantidad,
                precio_unitario: precioUnitario,
                es_preventa: esPreventa,
                fecha_disponibilidad: cosecha.fecha_disponibilidad,
                ...montos,
            });
        }

        montoTotal = Math.round(montoTotal * 100) / 100;
        montoAnticipo = Math.round(montoAnticipo * 100) / 100;
        montoSaldo = Math.round(montoSaldo * 100) / 100;

        const pedidoResult = await new sql.Request(transaction)
            .input('comprador_id', sql.UniqueIdentifier, compradorId)
            .input('notas', sql.Text, notas || null)
            .input('comprobante_url', sql.VarChar(500), comprobante_url)
            .input('monto_total', sql.Decimal(10, 2), montoTotal)
            .input('monto_pagado_anticipo', sql.Decimal(10, 2), montoAnticipo)
            .input('monto_saldo_pendiente', sql.Decimal(10, 2), montoSaldo)
            .input('modalidad_entrega', sql.VarChar(30), modalidad_entrega || null)
            .input('direccion_entrega', sql.VarChar(300), direccion_entrega || null)
            .query(`
                INSERT INTO Pedidos (
                    comprador_id, notas, comprobante_url, estado,
                    monto_total, monto_pagado_anticipo, monto_saldo_pendiente,
                    modalidad_entrega, direccion_entrega
                )
                OUTPUT INSERTED.id
                VALUES (
                    @comprador_id, @notas, @comprobante_url, 'PENDIENTE_CONFIRMACION',
                    @monto_total, @monto_pagado_anticipo, @monto_saldo_pendiente,
                    @modalidad_entrega, @direccion_entrega
                )
            `);

        const pedidoId = pedidoResult.recordset[0].id;

        for (const linea of lineas) {
            await new sql.Request(transaction)
                .input('pedido_id', sql.UniqueIdentifier, pedidoId)
                .input('cosecha_id', sql.UniqueIdentifier, linea.cosecha_id)
                .input('cantidad', sql.Decimal(10, 2), linea.cantidad)
                .input('precio_unitario', sql.Decimal(10, 2), linea.precio_unitario)
                .input('es_preventa', sql.Bit, linea.es_preventa ? 1 : 0)
                .input('fecha_disponibilidad', sql.Date, linea.fecha_disponibilidad)
                .input('subtotal_linea', sql.Decimal(10, 2), linea.subtotal)
                .input('monto_anticipo', sql.Decimal(10, 2), linea.monto_anticipo)
                .input('monto_saldo', sql.Decimal(10, 2), linea.monto_saldo)
                .query(`
                    INSERT INTO Detalle_Pedidos (
                        pedido_id, cosecha_id, cantidad, precio_unitario,
                        es_preventa, fecha_disponibilidad,
                        subtotal_linea, monto_anticipo, monto_saldo
                    ) VALUES (
                        @pedido_id, @cosecha_id, @cantidad, @precio_unitario,
                        @es_preventa, @fecha_disponibilidad,
                        @subtotal_linea, @monto_anticipo, @monto_saldo
                    )
                `);
        }

        await transaction.commit();

        const compradorNombre = req.user.nombre || req.user.nombre_completo || 'Comprador';
        await notificarNuevoPedido(pedidoId, compradorNombre, montoAnticipo > 0 ? montoAnticipo : montoTotal);

        res.status(201).json({
            mensaje: 'Pedido creado. Realizá el pago y subí tu comprobante.',
            pedido_id: pedidoId,
            pedido_ref: formatPedidoRef(pedidoId),
            monto_total: montoTotal,
            monto_pagado_anticipo: montoAnticipo,
            monto_saldo_pendiente: montoSaldo,
        });
    } catch (error) {
        try { await transaction.rollback(); } catch (e) {}
        console.error('Crear Pedido Error:', error);
        res.status(500).json({ error: 'Error al crear el pedido.' });
    }
};
// Marca pedidos con saldo vencido y devuelve flags US06
async function enriquecerPedidosComprador(pool, pedidos) {
    for (const pedido of pedidos) {
        const tienePreventaLista = pedido.items.some(
            (it) => it.es_preventa && cosechaYaDisponible(it.fecha_disponibilidad)
        );
        pedido.requiere_pago_saldo =
            Number(pedido.monto_saldo_pendiente) > 0 &&
            !pedido.saldo_pagado &&
            tienePreventaLista &&
            pedido.estado !== 'RECHAZADO' &&
            pedido.estado !== 'CANCELADO';

        if (pedido.requiere_pago_saldo && !pedido.notificado_saldo_disponible) {
            await pool.request()
                .input('id', sql.UniqueIdentifier, pedido.id)
                .query(`
                    UPDATE Pedidos
                    SET notificado_saldo_disponible = 1,
                        estado = CASE WHEN estado = 'CONFIRMADO' THEN 'PENDIENTE_SALDO' ELSE estado END
                    WHERE id = @id
                `);
            pedido.notificado_saldo_disponible = true;
            if (pedido.estado === 'CONFIRMADO') pedido.estado = 'PENDIENTE_SALDO';
        }
    }
    return pedidos;
}

// ── GET /api/pedidos/comprador ──
exports.getPedidosComprador = async (req, res) => {
    try {
        const userId = req.user.id;
        const { estado, filtro_fecha, desde, hasta } = req.query;
        
        let filtroFechaColumna = 'p.fecha_pedido';
        if (filtro_fecha === 'fecha_actualizacion') {
            filtroFechaColumna = 'p.fecha_actualizacion';
        }

        const pool = await getPool();
        const request = pool.request();
        request.input('usuario_id', sql.UniqueIdentifier, userId);

        let whereClause = 'WHERE p.comprador_id = @usuario_id';

        if (estado) {
            whereClause += ' AND p.estado = @estado';
            request.input('estado', sql.VarChar, estado);
        }

        if (desde) {
            whereClause += ` AND ${filtroFechaColumna} >= @desde`;
            request.input('desde', sql.DateTime, new Date(desde));
        }

        if (hasta) {
            // Añadir 23:59:59 al final del día
            const hastaDate = new Date(hasta);
            hastaDate.setHours(23, 59, 59, 999);
            whereClause += ` AND ${filtroFechaColumna} <= @hasta`;
            request.input('hasta', sql.DateTime, hastaDate);
        }

        const querySql = `
            SELECT
                p.id, p.estado, 
                FORMAT(p.fecha_pedido, 'yyyy-MM-ddTHH:mm:ss') AS fecha_pedido, 
                FORMAT(p.fecha_comprobante, 'yyyy-MM-ddTHH:mm:ss') AS fecha_comprobante, 
                FORMAT(p.fecha_pago, 'yyyy-MM-ddTHH:mm:ss') AS fecha_pago, 
                FORMAT(p.fecha_entrega, 'yyyy-MM-ddTHH:mm:ss') AS fecha_entrega, 
                p.notas, p.comprobante_url,
                p.monto_total, p.monto_pagado_anticipo, p.monto_saldo_pendiente,
                p.saldo_pagado, p.notificado_saldo_disponible, p.comprobante_saldo_url,
                p.modalidad_entrega, p.direccion_entrega, p.motivo_rechazo_pago,
                pt.placa_vehiculo, ut.nombre_completo AS transportista_nombre, ut.celular AS transportista_celular,
                d.cantidad, d.precio_unitario, d.es_preventa AS detalle_es_preventa,
                d.fecha_disponibilidad AS detalle_fecha_disponibilidad,
                d.monto_saldo AS detalle_monto_saldo, d.saldo_pagado AS detalle_saldo_pagado,
                c.nombre_producto, c.foto_url, c.es_preventa, c.fecha_disponibilidad,
                c.productor_id AS productor_id
            FROM Pedidos p
            INNER JOIN Detalle_Pedidos d ON d.pedido_id = p.id
            INNER JOIN Cosechas c ON d.cosecha_id = c.id
            LEFT JOIN perfil_transportista pt ON p.transportista_id = pt.id
            LEFT JOIN usuarios ut ON pt.usuario_id = ut.id
            ${whereClause}
            ORDER BY ${filtroFechaColumna} DESC
        `;

        const result = await request.query(querySql);

        const pedidosMap = {};
        result.recordset.forEach((row) => {
            if (!pedidosMap[row.id]) {
                pedidosMap[row.id] = {
                    id: row.id,
                    estado: row.estado,
                    fecha_pedido: row.fecha_pedido,
                    fecha_comprobante: row.fecha_comprobante,
                    fecha_pago: row.fecha_pago,
                    fecha_entrega: row.fecha_entrega,
                    notas: row.notas,
                    comprobante_url: row.comprobante_url,
                    comprobante_saldo_url: row.comprobante_saldo_url,
                    monto_total: row.monto_total,
                    monto_pagado_anticipo: row.monto_pagado_anticipo,
                    monto_saldo_pendiente: row.monto_saldo_pendiente,
                    saldo_pagado: row.saldo_pagado,
                    notificado_saldo_disponible: row.notificado_saldo_disponible,
                    modalidad_entrega: row.modalidad_entrega,
                    direccion_entrega: row.direccion_entrega,
                    motivo_rechazo_pago: row.motivo_rechazo_pago,
                    transportista_nombre: row.transportista_nombre,
                    transportista_celular: row.transportista_celular,
                    transportista_placa: row.placa_vehiculo,
                    items: [],
                };
            }
            pedidosMap[row.id].items.push({
                nombre_producto: row.nombre_producto,
                foto_url: row.foto_url,
                cantidad: row.cantidad,
                precio_unitario: row.precio_unitario,
                es_preventa: row.detalle_es_preventa ?? row.es_preventa,
                fecha_disponibilidad: row.detalle_fecha_disponibilidad || row.fecha_disponibilidad,
                monto_saldo: row.detalle_monto_saldo,
                saldo_pagado: row.detalle_saldo_pagado,
                productor_id: row.productor_id
            });
        });

        const pedidos = await enriquecerPedidosComprador(pool, Object.values(pedidosMap));
        res.json(pedidos);
    } catch (error) {
        console.error('Get Pedidos Comprador Error:', error);
        res.status(500).json({ error: 'Error al obtener tus pedidos.' });
    }
};

// ── GET /api/pedidos/comprador/notificaciones-saldo (US06) ──
exports.getNotificacionesSaldo = async (req, res) => {
    try {
        const userId = req.user.id;
        const pool = await getPool();
        const result = await pool.request()
            .input('usuario_id', sql.UniqueIdentifier, userId)
            .query(`
                SELECT DISTINCT p.id, p.monto_saldo_pendiente, p.fecha_pedido
                FROM Pedidos p
                INNER JOIN Detalle_Pedidos d ON d.pedido_id = p.id
                WHERE p.comprador_id = @usuario_id
                  AND p.monto_saldo_pendiente > 0
                  AND p.saldo_pagado = 0
                  AND d.es_preventa = 1
                  AND d.fecha_disponibilidad <= CAST(GETDATE() AS DATE)
                  AND p.estado NOT IN ('RECHAZADO', 'CANCELADO')
            `);

        res.json({
            notificaciones: result.recordset.map((r) => ({
                pedido_id: r.id,
                mensaje: `Tu cosecha en preventa ya está disponible. Completa el saldo de Bs. ${Number(r.monto_saldo_pendiente).toFixed(2)} del pedido #${String(r.id).slice(0, 8)}.`,
                monto_saldo_pendiente: r.monto_saldo_pendiente,
            })),
        });
    } catch (error) {
        console.error('Notificaciones Saldo Error:', error);
        res.status(500).json({ error: 'Error al obtener notificaciones.' });
    }
};

// ── PUT /api/pedidos/:id/pagar-saldo (US06) ──
exports.pagarSaldoPedido = async (req, res) => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    try {
        const pedidoId = req.params.id;
        const compradorId = req.user.id;
        // Los comprobantes se suben con uploadDocsMiddleware, el cual guarda en public/documentos
        const comprobante_saldo_url = req.file ? `/documentos/${req.file.filename}` : null;

        if (!comprobante_saldo_url) {
            return res.status(400).json({ error: 'Sube el comprobante del pago del saldo (60%).' });
        }

        await transaction.begin();

        const pedidoResult = await new sql.Request(transaction)
            .input('id', sql.UniqueIdentifier, pedidoId)
            .input('comprador_id', sql.UniqueIdentifier, compradorId)
            .query(`
                SELECT id, estado, monto_saldo_pendiente, saldo_pagado
                FROM Pedidos
                WHERE id = @id AND comprador_id = @comprador_id
            `);

        if (pedidoResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Pedido no encontrado.' });
        }

        const pedido = pedidoResult.recordset[0];
        if (pedido.saldo_pagado) {
            await transaction.rollback();
            return res.status(400).json({ error: 'El saldo de este pedido ya fue pagado.' });
        }
        if (Number(pedido.monto_saldo_pendiente) <= 0) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Este pedido no tiene saldo pendiente.' });
        }

        const lineasPreventa = await new sql.Request(transaction)
            .input('pedido_id', sql.UniqueIdentifier, pedidoId)
            .query(`
                SELECT id, fecha_disponibilidad
                FROM Detalle_Pedidos
                WHERE pedido_id = @pedido_id AND es_preventa = 1 AND monto_saldo > 0
            `);

        const algunaLista = lineasPreventa.recordset.some((l) =>
            cosechaYaDisponible(l.fecha_disponibilidad)
        );
        if (!algunaLista) {
            await transaction.rollback();
            return res.status(400).json({
                error: 'Aún no llegó la fecha de disponibilidad de tu preventa. Te notificaremos cuando puedas pagar el saldo.',
            });
        }

        await new sql.Request(transaction)
            .input('id', sql.UniqueIdentifier, pedidoId)
            .input('comprobante_saldo_url', sql.VarChar(500), comprobante_saldo_url)
            .query(`
                UPDATE Pedidos
                SET saldo_pagado = 1,
                    comprobante_saldo_url = @comprobante_saldo_url,
                    estado = CASE WHEN estado = 'PENDIENTE_SALDO' THEN 'CONFIRMADO' ELSE estado END
                WHERE id = @id
            `);

        await new sql.Request(transaction)
            .input('pedido_id', sql.UniqueIdentifier, pedidoId)
            .query(`
                UPDATE Detalle_Pedidos
                SET saldo_pagado = 1
                WHERE pedido_id = @pedido_id AND es_preventa = 1
            `);

        await transaction.commit();

        res.json({
            mensaje: 'Saldo pagado correctamente. El productor fue notificado del pago completo.',
            monto_saldo: pedido.monto_saldo_pendiente,
        });
    } catch (error) {
        try { await transaction.rollback(); } catch (e) { /* noop */ }
        console.error('Pagar Saldo Error:', error);
        res.status(500).json({ error: 'Error al registrar el pago del saldo.' });
    }
};

// ── GET /api/pedidos/conteos — badges en sidebar por rol ──
exports.getConteosPedidos = async (req, res) => {
    try {
        const userId = req.user.id;
        const rol = req.user.rol;
        const pool = await getPool();

        if (rol === 'PRODUCTOR') {
            const result = await pool.request()
                .input('usuario_id', sql.UniqueIdentifier, userId)
                .query(`
                    SELECT COUNT(DISTINCT p.id) AS total
                    FROM Pedidos p
                    INNER JOIN Detalle_Pedidos d ON d.pedido_id = p.id
                    INNER JOIN Cosechas c ON d.cosecha_id = c.id
                    INNER JOIN perfil_productor pp ON c.productor_id = pp.id
                    WHERE pp.usuario_id = @usuario_id
                      AND p.estado IN ('COMPROBANTE_ENVIADO', 'PENDIENTE_CONFIRMACION', 'PENDIENTE')
                `);
            return res.json({ pedidos_pendientes: result.recordset[0]?.total ?? 0 });
        }

        if (rol === 'COMPRADOR') {
            const result = await pool.request()
                .input('usuario_id', sql.UniqueIdentifier, userId)
                .query(`
                    SELECT COUNT(*) AS total
                    FROM Pedidos
                    WHERE comprador_id = @usuario_id
                      AND estado IN ('PENDIENTE', 'PENDIENTE_CONFIRMACION', 'COMPROBANTE_ENVIADO')
                `);
            return res.json({ pedidos_pendientes: result.recordset[0]?.total ?? 0 });
        }

        if (rol === 'TRANSPORTISTA') {
            const result = await pool.request()
                .query(`
                    SELECT COUNT(*) AS total
                    FROM Pedidos
                    WHERE estado = 'LISTO_PARA_DESPACHO'
                      AND modalidad_entrega = 'ENVIO_DOMICILIO'
                      AND transportista_id IS NULL
                `);
            return res.json({ cargas_disponibles: result.recordset[0]?.total ?? 0 });
        }

        if (rol === 'ADMINISTRADOR') {
            const verif = await pool.request().query(`
                SELECT COUNT(*) AS total FROM usuarios WHERE estado = 'PENDIENTE_VERIFICACION'
            `);
            return res.json({ verificaciones_pendientes: verif.recordset[0]?.total ?? 0 });
        }

        res.json({});
    } catch (error) {
        console.error('Get Conteos Error:', error);
        res.status(500).json({ error: 'Error al obtener conteos.' });
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
                SELECT pp.qr_pago_ruta, pp.nombre_finca, u.nombre_completo AS titular
                FROM perfil_productor pp
                INNER JOIN usuarios u ON pp.usuario_id = u.id
                WHERE pp.id = @productorId
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Productor no encontrado.' });
        }

        const data = result.recordset[0];
        res.json({
            ...data,
            qrImageUrl: data.qr_pago_ruta
                ? (data.qr_pago_ruta.startsWith('http') ? data.qr_pago_ruta : `http://localhost:5000${data.qr_pago_ruta}`)
                : null,
            banco: 'Transferencia bancaria',
        });
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
                SELECT p.id, p.fecha_pedido, p.monto_total, p.direccion_entrega,
                       u.nombre_completo AS comprador,
                       pp.nombre_finca AS origen, pp.municipio AS origen_municipio,
                       ISNULL(p.direccion_entrega, pc.ciudad_principal) AS destino,
                       STRING_AGG(c.nombre_producto, ', ') AS productos,
                       SUM(d.cantidad) AS peso_total
                FROM Pedidos p
                INNER JOIN usuarios u ON p.comprador_id = u.id
                INNER JOIN perfil_comprador pc ON u.id = pc.usuario_id
                INNER JOIN Detalle_Pedidos d ON d.pedido_id = p.id
                INNER JOIN Cosechas c ON d.cosecha_id = c.id
                INNER JOIN perfil_productor pp ON c.productor_id = pp.id
                WHERE p.estado = 'LISTO_PARA_DESPACHO'
                  AND p.modalidad_entrega = 'ENVIO_DOMICILIO'
                  AND p.transportista_id IS NULL
                GROUP BY p.id, p.fecha_pedido, p.monto_total, p.direccion_entrega,
                         u.nombre_completo, pp.nombre_finca, pp.municipio, pc.ciudad_principal
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

        const profileData = await pool.request()
            .input('user_id', sql.UniqueIdentifier, userId)
            .query(`
                SELECT pt.placa_vehiculo, u.nombre_completo
                FROM perfil_transportista pt
                INNER JOIN usuarios u ON pt.usuario_id = u.id
                WHERE pt.usuario_id = @user_id
            `);

        const placa = profileData.recordset[0]?.placa_vehiculo;
        const transportistaNombre = profileData.recordset[0]?.nombre_completo || 'Transportista';

        const updateResult = await pool.request()
            .input('id', sql.UniqueIdentifier, pedidoId)
            .input('transportista_id', sql.UniqueIdentifier, transportistaId)
            .query(`
                UPDATE Pedidos
                SET estado = 'EN_CAMINO', transportista_id = @transportista_id, fecha_actualizacion = GETDATE()
                OUTPUT INSERTED.comprador_id
                WHERE id = @id AND estado = 'LISTO_PARA_DESPACHO' AND transportista_id IS NULL
            `);

        if (updateResult.recordset.length === 0) {
            return res.status(400).json({ error: 'La carga ya no está disponible.' });
        }

        const compradorId = updateResult.recordset[0].comprador_id;
        const productorIds = await obtenerProductoresDelPedido(pool, pedidoId);
        await notificarRutaAceptada(pedidoId, productorIds, compradorId, transportistaNombre, placa);

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

        const updateResult = await pool.request()
            .input('id', sql.UniqueIdentifier, pedidoId)
            .input('firma_url', sql.VarChar(500), firma_url)
            .query(`
                UPDATE Pedidos
                SET estado = 'ENTREGADO', firma_comprador_url = @firma_url, 
                    fecha_entrega = GETDATE(), fecha_actualizacion = GETDATE()
                OUTPUT INSERTED.comprador_id, INSERTED.monto_total, INSERTED.transportista_id
                WHERE id = @id AND estado = 'EN_CAMINO'
            `);

        if (updateResult.recordset.length === 0) {
            return res.status(400).json({ error: 'No se pudo confirmar la entrega.' });
        }

        const { comprador_id, monto_total, transportista_id } = updateResult.recordset[0];
        const productorIds = await obtenerProductoresDelPedido(pool, pedidoId);

        let transportistaUserId = null;
        if (transportista_id) {
            const tRes = await pool.request()
                .input('id', sql.UniqueIdentifier, transportista_id)
                .query('SELECT usuario_id FROM perfil_transportista WHERE id = @id');
            transportistaUserId = tRes.recordset[0]?.usuario_id;
        }

        await notificarEntregaCompletada(pedidoId, comprador_id, productorIds, transportistaUserId, monto_total);

        res.json({ mensaje: 'Pedido entregado exitosamente.', firma_url });
    } catch (error) {
        console.error('Entregar Pedido Error:', error);
        res.status(500).json({ error: 'Error al procesar la entrega.' });
    }
};

// ── GET /api/pedidos/:id ──
// Obtiene el detalle de un pedido específico
exports.getPedidoById = async (req, res) => {
    try {
        const pedidoId = req.params.id.toLowerCase();
        const pool = await getPool();

        // 1. Obtener datos principales del pedido
        const result = await pool.request()
            .input('pedido_id', sql.UniqueIdentifier, pedidoId)
            .query(`
                SELECT 
                    p.id, p.monto_total, p.estado, 
                    FORMAT(p.fecha_pedido, 'yyyy-MM-ddTHH:mm:ss') AS fecha_pedido, 
                    FORMAT(p.fecha_comprobante, 'yyyy-MM-ddTHH:mm:ss') AS fecha_comprobante, 
                    FORMAT(p.fecha_pago, 'yyyy-MM-ddTHH:mm:ss') AS fecha_pago, 
                    FORMAT(p.fecha_entrega, 'yyyy-MM-ddTHH:mm:ss') AS fecha_entrega, 
                    p.modalidad_entrega, p.direccion_entrega, 
                    p.comprobante_url, p.motivo_rechazo_pago,
                    up.nombre_completo AS productor_nombre,
                    up.qr_banco_url, up.nombre_banco, up.titular_banco,
                    uc.nombre_completo AS comprador_nombre,
                    uc.celular AS comprador_celular
                FROM Pedidos p
                INNER JOIN usuarios uc ON p.comprador_id = uc.id
                LEFT JOIN Detalle_Pedidos dp ON dp.pedido_id = p.id
                LEFT JOIN Cosechas c ON dp.cosecha_id = c.id
                LEFT JOIN perfil_productor pp ON c.productor_id = pp.id
                LEFT JOIN usuarios up ON pp.usuario_id = up.id
                WHERE p.id = @pedido_id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado.' });
        }

        const data = result.recordset[0];

        // 2. Obtener items del pedido
        const itemsResult = await pool.request()
            .input('pedido_id', sql.UniqueIdentifier, pedidoId)
            .query(`
                SELECT 
                    dp.cantidad, dp.precio_unitario, c.unidad_medida, dp.es_preventa,
                    c.nombre_producto, c.foto_url
                FROM Detalle_Pedidos dp
                LEFT JOIN Cosechas c ON dp.cosecha_id = c.id
                WHERE dp.pedido_id = @pedido_id
            `);

        res.json({
            id: data.id,
            numero_pedido: data.id,
            estado: data.estado,
            monto_total: data.monto_total,
            fecha_pedido: data.fecha_pedido,
            fecha_comprobante: data.fecha_comprobante,
            fecha_pago: data.fecha_pago,
            fecha_entrega: data.fecha_entrega,
            modalidad_entrega: data.modalidad_entrega,
            direccion_entrega: data.direccion_entrega,
            comprobante_url: data.comprobante_url,
            motivo_rechazo_pago: data.motivo_rechazo_pago,
            comprador: {
                nombre_completo: data.comprador_nombre,
                celular: data.comprador_celular
            },
            productor: {
                nombre_completo: data.productor_nombre,
                qr_banco_url: data.qr_banco_url
                    ? (data.qr_banco_url.startsWith('http') ? data.qr_banco_url : `http://localhost:5000${data.qr_banco_url}`)
                    : null,
                nombre_banco: data.nombre_banco || 'Transferencia',
                titular_banco: data.titular_banco || data.productor_nombre
            },
            items: itemsResult.recordset
        });
    } catch (error) {
        console.error('=== ERROR getPedidoById ===');
        console.error('Mensaje:', error.message);
        console.error('SQL Number:', error.number);
        console.error('Stack:', error.stack);
        res.status(500).json({ message: 'Error interno', debug: error.message });
    }
};

// ── PUT /api/pedidos/:id/comprobante-demo ──
exports.comprobanteDemo = async (req, res) => {
    try {
        const pedidoId = req.params.id;
        const { comprobante_url } = req.body;
        const pool = await getPool();

        await pool.request()
            .input('id', sql.UniqueIdentifier, pedidoId)
            .input('comprobante_url', sql.VarChar(500), comprobante_url)
            .query(`
                UPDATE Pedidos
                SET comprobante_url = @comprobante_url,
                    estado = 'COMPROBANTE_ENVIADO',
                    motivo_rechazo_pago = NULL,
                    fecha_comprobante = GETDATE(),
                    fecha_actualizacion = GETDATE()
                WHERE id = @id
            `);

        res.json({ mensaje: 'Comprobante demo enviado exitosamente.' });
    } catch (error) {
        console.error('Comprobante Demo Error:', error);
        res.status(500).json({ error: 'Error al procesar el comprobante demo.' });
    }
};

// ── Marcar como entregado (Transportista) ──
exports.marcarEntregado = async (req, res) => {
    try {
        const pedidoId = req.params.id;
        const transportistaId = req.user.id;

        const pool = await getPool();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Verificar pedido
            const check = await new sql.Request(transaction)
                .input('pedido_id', sql.UniqueIdentifier, pedidoId)
                .input('transportista_id', sql.UniqueIdentifier, transportistaId)
                .query(`
                    SELECT id, comprador_id, estado
                    FROM Pedidos
                    WHERE id = @pedido_id AND transportista_id = @transportista_id
                `);

            if (check.recordset.length === 0) {
                await transaction.rollback();
                return res.status(404).json({ error: 'Pedido no encontrado o no asignado a ti.' });
            }

            if (check.recordset[0].estado !== 'EN_CAMINO') {
                await transaction.rollback();
                return res.status(400).json({ error: 'El pedido debe estar EN_CAMINO para marcarse como entregado.' });
            }

            const comprador_id = check.recordset[0].comprador_id;
            const pedidoCorto = pedidoId.split('-')[0].toUpperCase();

            // Actualizar pedido
            await new sql.Request(transaction)
                .input('pedido_id', sql.UniqueIdentifier, pedidoId)
                .query(`
                    UPDATE Pedidos
                    SET estado = 'ENTREGADO', 
                        fecha_entrega = GETDATE(),
                        fecha_actualizacion = GETDATE()
                    WHERE id = @pedido_id
                `);

            // Notificar al comprador
            const { getIo } = require('../socket');
            const result = await new sql.Request(transaction)
                .input('usuario_id', sql.UniqueIdentifier, comprador_id)
                .input('tipo', sql.VarChar, 'PEDIDO_ENTREGADO')
                .input('titulo', sql.VarChar, 'Pedido entregado')
                .input('mensaje', sql.VarChar, \`Tu pedido #\${pedidoCorto} fue entregado exitosamente.\`)
                .input('pedido_id', sql.UniqueIdentifier, pedidoId)
                .query(\`
                    INSERT INTO notificaciones_app (usuario_id, tipo, titulo, mensaje, pedido_id, leida, fecha_creacion)
                    OUTPUT INSERTED.*
                    VALUES (@usuario_id, @tipo, @titulo, @mensaje, @pedido_id, 0, GETDATE())
                \`);
                
            try {
                const io = getIo();
                io.to(comprador_id).emit('nueva_notificacion', result.recordset[0]);
            } catch(e) {
                console.error('Socket.io error', e);
            }

            await transaction.commit();
            res.json({ message: 'Pedido marcado como entregado exitosamente.' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (error) {
        console.error('Error marcarEntregado:', error);
        res.status(500).json({ error: 'Error interno al actualizar pedido.' });
    }
};
