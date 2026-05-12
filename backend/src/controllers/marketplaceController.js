const { sql, getPool } = require('../db');

// GET /api/marketplace/productos
exports.obtenerProductos = async (req, res) => {
    try {
        // Coordenadas por defecto de Santa Cruz (Centro) si no se proveen
        const lat = parseFloat(req.query.lat_comprador) || -17.7833;
        const lng = parseFloat(req.query.lng_comprador) || -63.1821;
        const radio_km = parseFloat(req.query.radio_km) || 50; // 50km por defecto

        // SRID 4326 (WGS 84)
        const radio_metros = radio_km * 1000;

        const pool = await getPool();

        const result = await pool.request()
            .input('lat', sql.Float, lat)
            .input('lng', sql.Float, lng)
            .input('radio_metros', sql.Float, radio_metros)
            .query(`
                DECLARE @compradorUbicacion GEOGRAPHY = geography::Point(@lat, @lng, 4326);

                SELECT 
                    c.id AS cosecha_id,
                    c.nombre_producto,
                    c.descripcion,
                    c.foto_url,
                    c.cantidad_disponible,
                    c.unidad_medida,
                    c.precio_unitario,
                    c.fecha_disponibilidad,
                    c.es_preventa,
                    p.nombre_finca,
                    p.municipio,
                    p.ubicacion_gps.STDistance(@compradorUbicacion) / 1000 AS distancia_km
                FROM Cosechas c
                INNER JOIN perfil_productor p ON c.productor_id = p.id
                WHERE c.estado_publicacion = 'Activo'
                  AND p.ubicacion_gps IS NOT NULL
                  AND p.ubicacion_gps.STDistance(@compradorUbicacion) <= @radio_metros
                ORDER BY distancia_km ASC
            `);

        res.json(result.recordset);
    } catch (error) {
        console.error('Marketplace Productos Error:', error);
        res.status(500).json({ error: 'Error interno al obtener productos del marketplace.' });
    }
};
