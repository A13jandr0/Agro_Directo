const { sql, getPool } = require('../db');

// GET /api/marketplace/productos
exports.obtenerProductos = async (req, res) => {
    try {
        console.log('[Marketplace] Iniciando búsqueda de productos');
        
        const pool = await getPool();
        const latComprador = parseFloat(req.query.lat_comprador);
        const lngComprador = parseFloat(req.query.lng_comprador);
        const radioKm = parseFloat(req.query.radio_km);
        const aplicarFiltroDistancia = !Number.isNaN(latComprador) && !Number.isNaN(lngComprador) && !Number.isNaN(radioKm);

        const countResult = await pool.request()
            .query(`
                SELECT COUNT(*) as total_cosechas 
                FROM Cosechas 
                WHERE estado_publicacion = 'Activo'
            `);
        
        const totalCosechas = countResult.recordset[0]?.total_cosechas || 0;
        console.log(`[Marketplace] Total de cosechas activas: ${totalCosechas}`);

        const request = pool.request();
        if (aplicarFiltroDistancia) {
            request
                .input('lat', sql.Float, latComprador)
                .input('lng', sql.Float, lngComprador)
                .input('radio_km', sql.Float, radioKm)
                .input('aplicarFiltro', sql.Bit, 1);
        } else {
            request
                .input('lat', sql.Float, 0)
                .input('lng', sql.Float, 0)
                .input('radio_km', sql.Float, 0)
                .input('aplicarFiltro', sql.Bit, 0);
        }

        const result = await request.query(`
            DECLARE @comprador GEOGRAPHY = geography::Point(@lat, @lng, 4326);

            SELECT 
                c.id AS cosecha_id,
                c.nombre_producto,
                c.categoria,
                c.descripcion,
                c.foto_url,
                c.cantidad_disponible,
                c.unidad_medida,
                c.precio_unitario,
                c.fecha_disponibilidad,
                c.es_preventa,
                p.id AS productor_id,
                p.nombre_finca,
                p.municipio,
                p.provincia,
                p.departamento,
                p.ubicacion_gps.Lat AS latitud_productor,
                p.ubicacion_gps.Long AS longitud_productor,
                @comprador.STDistance(p.ubicacion_gps) / 1000.0 AS distancia_km
            FROM Cosechas c
            INNER JOIN perfil_productor p ON c.productor_id = p.id
            WHERE c.estado_publicacion = 'Activo'
              AND p.ubicacion_gps IS NOT NULL
              AND (
                    @aplicarFiltro = 0
                    OR @comprador.STDistance(p.ubicacion_gps) / 1000.0 <= @radio_km
                  )
            ORDER BY 
                CASE WHEN @aplicarFiltro = 1 THEN @comprador.STDistance(p.ubicacion_gps) / 1000.0 ELSE 0 END,
                c.fecha_disponibilidad DESC
        `);

        console.log(`[Marketplace] Productos recuperados: ${result.recordset.length}`);
        res.json(result.recordset);
        
    } catch (error) {
        console.error('[Marketplace] Error detallado:', {
            message: error.message,
            code: error.code,
            number: error.number,
            state: error.state
        });
        res.json([]);
    }
};

// GET /api/marketplace/productores
exports.obtenerProductoresMapa = async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .query(`
                SELECT 
                    p.id AS productor_id,
                    u.nombre_completo AS nombre,
                    p.nombre_finca,
                    p.municipio,
                    p.provincia,
                    p.departamento,
                    ISNULL(p.ubicacion_gps.Lat, -17.8) AS latitud,
                    ISNULL(p.ubicacion_gps.Long, -63.1667) AS longitud,
                    u.estado AS estado_usuario,
                    ISNULL(
                        (
                            SELECT STRING_AGG(c.nombre_producto, ', ') WITHIN GROUP (ORDER BY c.nombre_producto)
                            FROM Cosechas c
                            WHERE c.productor_id = p.id AND c.estado_publicacion = 'Activo'
                        ),
                        ''
                    ) AS productos_activos
                FROM perfil_productor p
                INNER JOIN usuarios u ON u.id = p.usuario_id
                ORDER BY p.nombre_finca ASC
            `);

        console.log('[Marketplace] Productores obtenidos:', result.recordset.length);
        
        const productores = result.recordset.map((row) => ({
            productor_id: row.productor_id,
            nombre: row.nombre,
            nombre_finca: row.nombre_finca,
            municipio: row.municipio,
            provincia: row.provincia,
            departamento: row.departamento,
            latitud: row.latitud,
            longitud: row.longitud,
            estado_usuario: row.estado_usuario,
            productos: row.productos_activos
                ? row.productos_activos.split(',').map((prod) => prod.trim()).filter(Boolean)
                : []
        }));

        res.json(productores);
    } catch (error) {
        console.error('[Marketplace] Error obteniendo productores para el mapa:', error);
        res.json([]);
    }
};
