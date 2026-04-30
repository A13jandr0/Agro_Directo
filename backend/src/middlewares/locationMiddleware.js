// ============================================================
// Middleware: Verificar que el Productor tiene GPS configurado
// ============================================================
// Bloquea el acceso a endpoints de publicación de productos
// si el productor no ha registrado su ubicación GPS.
// ============================================================
const { sql, getPool } = require('../db');

const requireLocation = async (req, res, next) => {
    try {
        // Solo aplica a productores
        if (req.user.rol !== 'PRODUCTOR') {
            return next();
        }

        const pool = await getPool();
        const result = await pool.request()
            .input('usuario_id', sql.UniqueIdentifier, req.user.id)
            .query(`
                SELECT ubicacion_gps 
                FROM perfil_productor 
                WHERE usuario_id = @usuario_id
            `);

        if (result.recordset.length === 0) {
            return res.status(403).json({
                error: 'No se encontró el perfil de productor'
            });
        }

        const { ubicacion_gps } = result.recordset[0];

        if (!ubicacion_gps) {
            return res.status(403).json({
                error: 'Debe registrar su ubicación GPS antes de publicar productos',
                codigo: 'GPS_REQUERIDO'
            });
        }

        next();
    } catch (error) {
        console.error('Location Middleware Error:', error);
        res.status(500).json({ error: 'Error interno al verificar ubicación' });
    }
};

module.exports = { requireLocation };
