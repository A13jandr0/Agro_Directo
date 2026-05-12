// ============================================================
// Controlador: Historial de Transacciones (US14)
// ============================================================
const { sql, getPool } = require('../db');

/**
 * GET /api/historial
 * Devuelve el historial de pedidos finalizados según el rol.
 */
exports.getHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const rol = req.user.rol;
        const pool = await getPool();

        let query = '';
        
        if (rol === 'COMPRADOR') {
            query = `
                SELECT 
                    p.id, p.fecha_pedido, p.estado,
                    u_prod.nombre_completo as productor,
                    SUM(dp.cantidad * dp.precio_unitario) as monto_total
                FROM Pedidos p
                JOIN Detalle_Pedidos dp ON p.id = dp.pedido_id
                JOIN Cosechas c ON dp.cosecha_id = c.id
                JOIN perfil_productor pp ON c.productor_id = pp.id
                JOIN usuarios u_prod ON pp.usuario_id = u_prod.id
                WHERE p.comprador_id = @userId AND p.estado = 'ENTREGADO'
                GROUP BY p.id, p.fecha_pedido, p.estado, u_prod.nombre_completo
                ORDER BY p.fecha_pedido DESC;
            `;
        } else if (rol === 'PRODUCTOR') {
            query = `
                SELECT 
                    p.id, p.fecha_pedido, p.estado,
                    u_comp.nombre_completo as comprador,
                    SUM(dp.cantidad * dp.precio_unitario) as monto_total
                FROM Pedidos p
                JOIN usuarios u_comp ON p.comprador_id = u_comp.id
                JOIN Detalle_Pedidos dp ON p.id = dp.pedido_id
                JOIN Cosechas c ON dp.cosecha_id = c.id
                JOIN perfil_productor pp ON c.productor_id = pp.id
                WHERE pp.usuario_id = @userId AND p.estado = 'ENTREGADO'
                GROUP BY p.id, p.fecha_pedido, p.estado, u_comp.nombre_completo
                ORDER BY p.fecha_pedido DESC;
            `;
        } else if (rol === 'TRANSPORTISTA') {
            query = `
                SELECT 
                    p.id, p.fecha_pedido, p.estado,
                    u_comp.nombre_completo as comprador,
                    u_prod.nombre_completo as productor,
                    SUM(dp.cantidad * dp.precio_unitario) as monto_carga
                FROM Pedidos p
                JOIN perfil_transportista pt ON p.transportista_id = pt.id
                JOIN usuarios u_comp ON p.comprador_id = u_comp.id
                JOIN Detalle_Pedidos dp ON p.id = dp.pedido_id
                JOIN Cosechas c ON dp.cosecha_id = c.id
                JOIN perfil_productor pp ON c.productor_id = pp.id
                JOIN usuarios u_prod ON pp.usuario_id = u_prod.id
                WHERE pt.usuario_id = @userId AND p.estado = 'ENTREGADO'
                GROUP BY p.id, p.fecha_pedido, p.estado, u_comp.nombre_completo, u_prod.nombre_completo
                ORDER BY p.fecha_pedido DESC;
            `;
        } else {
            return res.status(403).json({ error: 'Rol no autorizado para esta acción' });
        }

        const result = await pool.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .query(query);

        res.json(result.recordset);

    } catch (error) {
        console.error('History Fetch Error:', error);
        res.status(500).json({ error: 'Error al obtener el historial' });
    }
};
