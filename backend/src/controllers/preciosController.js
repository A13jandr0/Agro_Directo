const { sql, getPool } = require('../db');

// GET /api/precios-abasto?producto=tomate
exports.obtenerPrecioAbasto = async (req, res) => {
    try {
        const producto = req.query.producto;

        const pool = await getPool();
        const request = pool.request();

        let query = 'SELECT TOP 1 id, nombre_producto, precio_promedio_bs, fecha_actualizacion FROM Precios_Mercado_Abasto';
        if (producto) {
            query += ' WHERE nombre_producto LIKE @producto ORDER BY fecha_actualizacion DESC';
            request.input('producto', sql.VarChar(150), `%${producto}%`);
        } else {
            query += ' ORDER BY fecha_actualizacion DESC';
        }

        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'No se encontraron precios para el producto especificado.' });
        }

        const data = result.recordset[0];
        res.json({
            id: data.id,
            nombre_producto: data.nombre_producto,
            precio_promedio_bs: data.precio_promedio_bs,
            fecha_actualizacion: data.fecha_actualizacion
        });
    } catch (error) {
        console.error('Precios Abasto Error:', error);
        res.status(500).json({ error: 'Error interno al consultar el precio del abasto.' });
    }
};
