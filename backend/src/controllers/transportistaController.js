const { getPool } = require('../db');
const sql = require('mssql');

exports.getSolicitudesPendientes = async (req, res) => {
    try {
        const { id } = req.params;
        if (id !== req.user.id) return res.status(403).json({ error: 'No autorizado' });

        const pool = await getPool();
        const result = await pool.request()
            .input('transportista_id', sql.UniqueIdentifier, id)
            .query(`
                SELECT 
                    s.id, s.pedido_id, s.origen, s.destino, s.descripcion_carga, s.fecha_solicitud,
                    u_prod.nombre_completo AS productor_nombre,
                    u_comp.nombre_completo AS comprador_nombre
                FROM solicitudes_transporte s
                INNER JOIN Pedidos p ON s.pedido_id = p.id
                INNER JOIN Detalle_Pedidos dp ON dp.pedido_id = p.id
                INNER JOIN Cosechas c ON dp.cosecha_id = c.id
                INNER JOIN perfil_productor pp ON c.productor_id = pp.id
                INNER JOIN usuarios u_prod ON pp.usuario_id = u_prod.id
                INNER JOIN usuarios u_comp ON p.comprador_id = u_comp.id
                WHERE s.transportista_id = @transportista_id AND s.estado_solicitud = 'PENDIENTE'
                ORDER BY s.fecha_solicitud DESC
            `);
        
        // Remove duplicates if multiple details
        const map = new Map();
        result.recordset.forEach(r => map.set(r.id, r));
        res.json(Array.from(map.values()));
    } catch (error) {
        console.error('Error fetching solicitudes pendientes:', error);
        res.status(500).json({ error: 'Error interno' });
    }
};

exports.getViajesEnCurso = async (req, res) => {
    try {
        const { id } = req.params;
        if (id !== req.user.id) return res.status(403).json({ error: 'No autorizado' });

        const pool = await getPool();
        const result = await pool.request()
            .input('transportista_id', sql.UniqueIdentifier, id)
            .query(`
                SELECT 
                    p.id, p.direccion_entrega AS destino, p.fecha_pedido, p.estado,
                    u_comp.nombre_completo AS comprador_nombre, u_comp.celular AS comprador_celular,
                    c.nombre_producto, dp.cantidad, dp.unidad_medida,
                    pp.municipio AS origen
                FROM Pedidos p
                INNER JOIN usuarios u_comp ON p.comprador_id = u_comp.id
                INNER JOIN Detalle_Pedidos dp ON dp.pedido_id = p.id
                INNER JOIN Cosechas c ON dp.cosecha_id = c.id
                INNER JOIN perfil_productor pp ON c.productor_id = pp.id
                WHERE p.transportista_id = @transportista_id AND p.estado = 'EN_CAMINO'
            `);

        const map = new Map();
        result.recordset.forEach(row => {
            if (!map.has(row.id)) {
                map.set(row.id, {
                    id: row.id,
                    origen: row.origen,
                    destino: row.destino,
                    comprador_nombre: row.comprador_nombre,
                    comprador_celular: row.comprador_celular,
                    fecha_pedido: row.fecha_pedido,
                    productos: []
                });
            }
            map.get(row.id).productos.push(`${row.cantidad} ${row.unidad_medida} de ${row.nombre_producto}`);
        });

        res.json(Array.from(map.values()));
    } catch (error) {
        console.error('Error fetching viajes en curso:', error);
        res.status(500).json({ error: 'Error interno' });
    }
};

exports.getHistorialViajes = async (req, res) => {
    try {
        const { id } = req.params;
        if (id !== req.user.id) return res.status(403).json({ error: 'No autorizado' });

        const pool = await getPool();
        const result = await pool.request()
            .input('transportista_id', sql.UniqueIdentifier, id)
            .query(`
                SELECT 
                    p.id, p.fecha_entrega, p.monto_total,
                    u_comp.nombre_completo AS comprador_nombre,
                    u_prod.nombre_completo AS productor_nombre
                FROM Pedidos p
                INNER JOIN usuarios u_comp ON p.comprador_id = u_comp.id
                INNER JOIN Detalle_Pedidos dp ON dp.pedido_id = p.id
                INNER JOIN Cosechas c ON dp.cosecha_id = c.id
                INNER JOIN perfil_productor pp ON c.productor_id = pp.id
                INNER JOIN usuarios u_prod ON pp.usuario_id = u_prod.id
                WHERE p.transportista_id = @transportista_id AND p.estado = 'ENTREGADO'
                ORDER BY p.fecha_entrega DESC
            `);

        const map = new Map();
        result.recordset.forEach(r => map.set(r.id, r));
        res.json(Array.from(map.values()));
    } catch (error) {
        console.error('Error fetching historial:', error);
        res.status(500).json({ error: 'Error interno' });
    }
};
