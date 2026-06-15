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
        const latComprador = parseFloat(req.query.lat_comprador);
        const lngComprador = parseFloat(req.query.lng_comprador);
        // Si radio_km es null o NaN, usaremos un valor grande (ej. 100000) para "Todo"
        const radioKm = parseFloat(req.query.radio_km) || 100000;

        const aplicarFiltro = !Number.isNaN(latComprador) && !Number.isNaN(lngComprador);

        const request = pool.request();
        if (aplicarFiltro) {
            request.input('lat', sql.Float, latComprador)
                   .input('lng', sql.Float, lngComprador)
                   .input('radio_km', sql.Float, radioKm);
        }

        let query = `
            SELECT pp.id, 
                   pp.nombre_finca, 
                   pp.municipio, 
                   pp.provincia,
                   u.nombre_completo AS nombre_productor,
                   ISNULL(pp.ubicacion_gps.Lat, -17.8) AS latitud,
                   ISNULL(pp.ubicacion_gps.Long, -63.1667) AS longitud,
                   COUNT(c.id) AS total_productos
        `;

        if (aplicarFiltro) {
            query += `, pp.ubicacion_gps.STDistance(geography::Point(@lat, @lng, 4326)) / 1000 AS distancia_km `;
        } else {
            query += `, NULL AS distancia_km `;
        }
        
        query += `
            FROM perfil_productor pp
            INNER JOIN usuarios u ON pp.usuario_id = u.id
            LEFT JOIN Cosechas c ON c.productor_id = pp.id AND c.estado_publicacion = 'Activo'
            WHERE pp.ubicacion_gps IS NOT NULL
        `;

        if (aplicarFiltro && radioKm < 100000) {
            query += ` AND pp.ubicacion_gps.STDistance(geography::Point(@lat, @lng, 4326)) / 1000 <= @radio_km `;
        }

        query += `
            GROUP BY pp.id, pp.nombre_finca, pp.municipio, pp.provincia, u.nombre_completo,
                     pp.ubicacion_gps.Lat, pp.ubicacion_gps.Long
        `;

        if (aplicarFiltro) {
            query += `, pp.ubicacion_gps.STDistance(geography::Point(@lat, @lng, 4326)) ORDER BY distancia_km ASC`;
        } else {
            query += ` ORDER BY pp.nombre_finca ASC`;
        }

        const result = await request.query(query);

        console.log('[Marketplace] Productores obtenidos para mapa:', result.recordset.length);
        res.json(result.recordset);
    } catch (error) {
        console.error('[Marketplace] Error obteniendo productores para el mapa:', error);
        res.json([]);
    }
};
