// ============================================================
// Controlador: Inteligencia de Negocio (BI) — AgroDirecto
// Épica 5 · US19 & US20
// ============================================================
const { sql, getPool } = require('../db');

/**
 * US19: Reportes para el Productor
 * Devuelve tendencia de ventas e ingresos y el Top 3 de productos.
 */
exports.getProductorVentas = async (req, res) => {
    try {
        const userId = req.user.id;
        const pool = await getPool();

        // 1. Obtener el ID del perfil de productor para este usuario
        const producerResult = await pool.request()
            .input('usuario_id', sql.UniqueIdentifier, userId)
            .query('SELECT id FROM perfil_productor WHERE usuario_id = @usuario_id');

        if (producerResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Perfil de productor no encontrado' });
        }

        const producerId = producerResult.recordset[0].id;

        // 2. Tendencia de ventas mensual (Ingresos agrupados por mes)
        // Solo pedidos en estado 'ENTREGADO' o 'CONFIRMADO' (dependiendo de la regla de negocio)
        // Usaremos 'ENTREGADO' para ingresos reales.
        const tendenciaQuery = `
            SELECT 
                FORMAT(p.fecha_pedido, 'yyyy-MM') AS mes,
                SUM(dp.cantidad * dp.precio_unitario) AS ingresos
            FROM Pedidos p
            JOIN Detalle_Pedidos dp ON p.id = dp.pedido_id
            JOIN Cosechas c ON dp.cosecha_id = c.id
            WHERE c.productor_id = @producerId AND p.estado IN ('ENTREGADO', 'CONFIRMADO')
            GROUP BY FORMAT(p.fecha_pedido, 'yyyy-MM')
            ORDER BY mes;
        `;

        // 3. Top 3 productos más vendidos por cantidad
        const topProductosQuery = `
            SELECT TOP 3
                c.nombre_producto,
                SUM(dp.cantidad) AS total_vendido
            FROM Detalle_Pedidos dp
            JOIN Cosechas c ON dp.cosecha_id = c.id
            JOIN Pedidos p ON dp.pedido_id = p.id
            WHERE c.productor_id = @producerId AND p.estado IN ('ENTREGADO', 'CONFIRMADO')
            GROUP BY c.nombre_producto
            ORDER BY total_vendido DESC;
        `;

        const tendenciaResult = await pool.request()
            .input('producerId', sql.UniqueIdentifier, producerId)
            .query(tendenciaQuery);

        const topResult = await pool.request()
            .input('producerId', sql.UniqueIdentifier, producerId)
            .query(topProductosQuery);

        res.json({
            tendencia: tendenciaResult.recordset,
            topProductos: topResult.recordset
        });

    } catch (error) {
        console.error('BI Productor Error:', error);
        res.status(500).json({ error: 'Error al procesar reportes de ventas' });
    }
};

/**
 * US20: Mapa de Calor para el Administrador
 * Devuelve coordenadas de origen (fincas) y zonas de demanda (compradores).
 */
exports.getAdminHeatmap = async (req, res) => {
    try {
        const pool = await getPool();

        // Origen: Ubicaciones de fincas con ventas concretadas
        const origenQuery = `
            SELECT 
                pp.nombre_finca,
                pp.ubicacion_gps.Lat AS lat,
                pp.ubicacion_gps.Long AS lng,
                SUM(dp.cantidad) as volumen_produccion
            FROM perfil_productor pp
            JOIN Cosechas c ON pp.id = c.productor_id
            JOIN Detalle_Pedidos dp ON c.id = dp.cosecha_id
            JOIN Pedidos p ON dp.pedido_id = p.id
            WHERE p.estado IN ('ENTREGADO', 'CONFIRMADO') AND pp.ubicacion_gps IS NOT NULL
            GROUP BY pp.nombre_finca, pp.ubicacion_gps.Lat, pp.ubicacion_gps.Long;
        `;

        // Destino: Zonas de compradores con pedidos finalizados
        const destinoQuery = `
            SELECT 
                pc.ciudad_principal as zona,
                COUNT(p.id) as total_pedidos,
                SUM(dp.cantidad * dp.precio_unitario) as total_valor
            FROM perfil_comprador pc
            JOIN Pedidos p ON pc.usuario_id = p.comprador_id
            JOIN Detalle_Pedidos dp ON p.id = dp.pedido_id
            WHERE p.estado IN ('ENTREGADO', 'CONFIRMADO')
            GROUP BY pc.ciudad_principal;
        `;

        const origenResult = await pool.request().query(origenQuery);
        const destinoResult = await pool.request().query(destinoQuery);

        res.json({
            origen: origenResult.recordset,
            destino: destinoResult.recordset
        });

    } catch (error) {
        console.error('BI Admin Heatmap Error:', error);
        res.status(500).json({ error: 'Error al generar mapa de calor' });
    }
};
