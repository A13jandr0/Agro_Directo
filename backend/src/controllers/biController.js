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

/**
 * Endpoint for MisIngresosPage.jsx
 * GET /api/bi/productor/ingresos
 */
exports.getProductorIngresos = async (req, res) => {
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

        // 2. ingresosMensuales: ingresos por mes últimos 6 meses
        const tendenciaQuery = `
            SELECT 
                MONTH(p.fecha_pedido) AS mes_num,
                SUM(dp.subtotal_linea) AS ingresos
            FROM Pedidos p
            JOIN Detalle_Pedidos dp ON p.id = dp.pedido_id
            JOIN Cosechas c ON dp.cosecha_id = c.id
            WHERE c.productor_id = @producerId 
              AND p.estado IN ('CONFIRMADO', 'ENTREGADO', 'ENVIADO')
              AND p.fecha_pedido >= DATEADD(month, -6, GETDATE())
            GROUP BY MONTH(p.fecha_pedido)
            ORDER BY mes_num;
        `;

        // 3. ventasPorProducto: top 5 productos
        const topProductosQuery = `
            SELECT TOP 5
                c.nombre_producto AS name,
                SUM(dp.cantidad) AS value
            FROM Detalle_Pedidos dp
            JOIN Cosechas c ON dp.cosecha_id = c.id
            JOIN Pedidos p ON dp.pedido_id = p.id
            WHERE c.productor_id = @producerId AND p.estado IN ('CONFIRMADO', 'ENTREGADO', 'ENVIADO')
            GROUP BY c.nombre_producto
            ORDER BY value DESC;
        `;

        // 4. transacciones: últimas 10 transacciones
        const transaccionesQuery = `
            SELECT TOP 10
                p.id AS id,
                p.fecha_pedido AS fecha,
                u.nombre_completo AS comprador,
                c.nombre_producto AS producto,
                CONCAT(CAST(dp.cantidad AS FLOAT), ' ', c.unidad_medida) AS cantidad,
                dp.subtotal_linea AS monto,
                p.estado AS estado
            FROM Pedidos p
            JOIN Detalle_Pedidos dp ON p.id = dp.pedido_id
            JOIN Cosechas c ON dp.cosecha_id = c.id
            JOIN usuarios u ON p.comprador_id = u.id
            WHERE c.productor_id = @producerId
            ORDER BY p.fecha_pedido DESC;
        `;

        const resTendencia = await pool.request().input('producerId', sql.UniqueIdentifier, producerId).query(tendenciaQuery);
        const resVentas = await pool.request().input('producerId', sql.UniqueIdentifier, producerId).query(topProductosQuery);
        const resTransacciones = await pool.request().input('producerId', sql.UniqueIdentifier, producerId).query(transaccionesQuery);

        const mesesMap = {
            1: 'Ene', 2: 'Feb', 3: 'Mar', 4: 'Abr', 5: 'May', 6: 'Jun',
            7: 'Jul', 8: 'Ago', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dic'
        };

        const ingresosMensuales = resTendencia.recordset.map(row => ({
            mes: mesesMap[row.mes_num] || `Mes ${row.mes_num}`,
            ingresos: Number(row.ingresos) || 0
        }));

        const ventasPorProducto = resVentas.recordset.map(row => ({
            name: row.name,
            value: Number(row.value) || 0
        }));

        const transacciones = resTransacciones.recordset.map(row => {
            let estadoMapped = 'Pendiente';
            if (row.estado === 'ENTREGADO') estadoMapped = 'Entregado';
            else if (row.estado === 'ENVIADO') estadoMapped = 'En camino';
            else if (row.estado === 'CANCELADO' || row.estado === 'RECHAZADO') estadoMapped = 'Cancelado';
            else if (row.estado === 'CONFIRMADO') estadoMapped = 'Confirmado';
            
            return {
                id: `TR-${row.id.toString().substring(0, 5).toUpperCase()}`,
                fecha: new Date(row.fecha).toLocaleDateString('es-BO', { day: 'numeric', month: 'short' }),
                comprador: row.comprador,
                producto: row.producto,
                cantidad: row.cantidad,
                monto: Number(row.monto) || 0,
                estado: estadoMapped
            };
        });

        res.json({
            ingresosMensuales,
            ventasPorProducto,
            transacciones
        });

    } catch (error) {
        console.error('getProductorIngresos Error:', error);
        res.status(500).json({ error: 'Error al procesar ingresos del productor' });
    }
};

/**
 * GET /api/bi/transportista/resumen
 */
exports.getTransportistaResumen = async (req, res) => {
    try {
        const userId = req.user.id;
        const pool = await getPool();

        // 1. Obtener nombre del transportista y perfil ID
        const profileResult = await pool.request()
            .input('user_id', sql.UniqueIdentifier, userId)
            .query(`
                SELECT u.nombre_completo, pt.id, pt.zona_operacion, u.estado 
                FROM usuarios u
                JOIN perfil_transportista pt ON u.id = pt.usuario_id
                WHERE u.id = @user_id
            `);

        if (profileResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Perfil de transportista no encontrado' });
        }

        const transportista = profileResult.recordset[0];
        const transportistaId = transportista.id;

        // 2. totalEntregas e ingresosDelMes (Simulado: 150 Bs por entrega)
        const statsResult = await pool.request()
            .input('transportista_id', sql.UniqueIdentifier, transportistaId)
            .query(`
                SELECT 
                    COUNT(id) AS totalEntregas,
                    COALESCE(SUM(150), 0) AS ingresosDelMes
                FROM Pedidos
                WHERE transportista_id = @transportista_id AND estado = 'ENTREGADO'
            `);

        const stats = statsResult.recordset[0] || { totalEntregas: 0, ingresosDelMes: 0 };

        // 3. rutaActiva (Pedido actual en estado EN_CAMINO asignado a este transportista)
        const rutaResult = await pool.request()
            .input('transportista_id', sql.UniqueIdentifier, transportistaId)
            .query(`
                SELECT TOP 1
                    p.id,
                    p.estado,
                    pp.nombre_finca AS origen,
                    pc.ciudad_principal AS destino,
                    c.nombre_producto AS producto,
                    dp.cantidad,
                    c.unidad_medida
                FROM Pedidos p
                JOIN Detalle_Pedidos dp ON p.id = dp.pedido_id
                JOIN Cosechas c ON dp.cosecha_id = c.id
                JOIN perfil_productor pp ON c.productor_id = pp.id
                JOIN usuarios u_comp ON p.comprador_id = u_comp.id
                JOIN perfil_comprador pc ON u_comp.id = pc.usuario_id
                WHERE p.transportista_id = @transportista_id AND p.estado = 'EN_CAMINO'
            `);

        let rutaActiva = null;
        if (rutaResult.recordset.length > 0) {
            const r = rutaResult.recordset[0];
            rutaActiva = {
                id: `R-${r.id.toString().substring(0, 5).toUpperCase()}`,
                origen: r.origen,
                destino: r.destino,
                producto: r.producto,
                cantidad: `${r.cantidad} ${r.unidad_medida}`,
                paradas: [
                    { tipo: 'Recogida', lugar: r.origen, completado: false },
                    { tipo: 'Entrega', lugar: r.destino, completado: false }
                ],
                progreso: 0
            };
        }

        // 4. historialReciente: últimas 5 entregas completadas
        const historialResult = await pool.request()
            .input('transportista_id', sql.UniqueIdentifier, transportistaId)
            .query(`
                SELECT TOP 5
                    p.id,
                    p.fecha_pedido,
                    c.nombre_producto AS producto,
                    pp.municipio AS origen,
                    pc.ciudad_principal AS destino
                FROM Pedidos p
                JOIN Detalle_Pedidos dp ON p.id = dp.pedido_id
                JOIN Cosechas c ON dp.cosecha_id = c.id
                JOIN perfil_productor pp ON c.productor_id = pp.id
                JOIN usuarios u_comp ON p.comprador_id = u_comp.id
                JOIN perfil_comprador pc ON u_comp.id = pc.usuario_id
                WHERE p.transportista_id = @transportista_id AND p.estado = 'ENTREGADO'
                ORDER BY p.fecha_pedido DESC
            `);

        const historial = historialResult.recordset.map(h => ({
            id: `H-${h.id.toString().substring(0, 4).toUpperCase()}`,
            producto: h.producto,
            ruta: `${h.origen} → ${h.destino}`,
            pago: 150,
            calificacion: 5,
            fecha: new Date(h.fecha_pedido).toLocaleDateString('es-BO', { day: 'numeric', month: 'short' })
        }));

        res.json({
            nombre: transportista.nombre_completo.split(' ')[0],
            estado: transportista.estado,
            zonaOperacion: transportista.zona_operacion,
            entregasMes: stats.totalEntregas,
            ingresosMes: stats.ingresosDelMes,
            calificacion: 5.0,
            tiempoPromedio: 2.1,
            rutaActiva,
            historialReciente: historial
        });

    } catch (error) {
        console.error('getTransportistaResumen Error:', error);
        res.status(500).json({ error: 'Error al procesar resumen de transportista' });
    }
};

