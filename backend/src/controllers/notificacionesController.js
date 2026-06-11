const { getPool } = require('../db');
const sql = require('mssql');

// ── Preferencias de Estacionalidad ──
exports.getPreferencias = async (req, res) => {
    try {
        const userId = req.user.id;
        const pool = await getPool();
        
        const perfil = await pool.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .query(`SELECT notificaciones_activas FROM perfil_comprador WHERE usuario_id = @userId`);
            
        const subs = await pool.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .query(`SELECT categoria FROM suscripcion_categorias_comprador WHERE comprador_id = @userId`);
            
        res.json({
            notificaciones_activas: perfil.recordset[0]?.notificaciones_activas ?? true,
            suscripciones: subs.recordset.map(s => s.categoria)
        });
    } catch (error) {
        console.error('Error getPreferencias:', error);
        res.status(500).json({ error: 'Error al obtener preferencias' });
    }
};

exports.updatePreferencias = async (req, res) => {
    try {
        const userId = req.user.id;
        const { notificaciones_activas, suscripciones } = req.body;
        const pool = await getPool();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            await new sql.Request(transaction)
                .input('userId', sql.UniqueIdentifier, userId)
                .input('activas', sql.Bit, notificaciones_activas ? 1 : 0)
                .query(`UPDATE perfil_comprador SET notificaciones_activas = @activas WHERE usuario_id = @userId`);
                
            await new sql.Request(transaction)
                .input('userId', sql.UniqueIdentifier, userId)
                .query(`DELETE FROM suscripcion_categorias_comprador WHERE comprador_id = @userId`);
                
            if (suscripciones && suscripciones.length > 0) {
                for (let cat of suscripciones) {
                    await new sql.Request(transaction)
                        .input('userId', sql.UniqueIdentifier, userId)
                        .input('cat', sql.VarChar, cat)
                        .query(`INSERT INTO suscripcion_categorias_comprador (comprador_id, categoria) VALUES (@userId, @cat)`);
                }
            }
            await transaction.commit();
            res.json({ message: 'Preferencias actualizadas correctamente' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (error) {
        console.error('Error updatePreferencias:', error);
        res.status(500).json({ error: 'Error al actualizar preferencias' });
    }
};

// ── Notificaciones en tiempo real ──

// GET /api/notificaciones/:usuario_id?soloNoLeidas=true
exports.getNotificaciones = async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const { soloNoLeidas } = req.query;
        
        if (usuario_id !== req.user.id) {
            return res.status(403).json({ error: 'No tienes permiso para ver estas notificaciones.' });
        }

        const pool = await getPool();
        let query = `
            SELECT id, usuario_id, tipo, titulo, mensaje, cosecha_id, pedido_id, leida, fecha_creacion
            FROM notificaciones_app
            WHERE usuario_id = @usuario_id
        `;
        
        if (soloNoLeidas === 'true') {
            query += ` AND leida = 0`;
        }
        
        query += ` ORDER BY fecha_creacion DESC`;

        const result = await pool.request()
            .input('usuario_id', sql.UniqueIdentifier, usuario_id)
            .query(query);

        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching notificaciones:', error);
        res.status(500).json({ error: 'Error interno al obtener notificaciones.' });
    }
};

// PUT /api/notificaciones/:id/leer
exports.marcarComoLeida = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getPool();
        
        const check = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query(`SELECT usuario_id FROM notificaciones_app WHERE id = @id`);
            
        if (check.recordset.length === 0) {
            return res.status(404).json({ error: 'Notificación no encontrada.' });
        }
        
        if (check.recordset[0].usuario_id !== req.user.id) {
            return res.status(403).json({ error: 'No tienes permiso para modificar esta notificación.' });
        }

        await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query(`UPDATE notificaciones_app SET leida = 1 WHERE id = @id`);

        res.json({ message: 'Notificación marcada como leída.' });
    } catch (error) {
        console.error('Error marking notificacion:', error);
        res.status(500).json({ error: 'Error interno al actualizar la notificación.' });
    }
};

// PUT /api/notificaciones/leer-todas/:usuario_id
exports.marcarTodasComoLeidas = async (req, res) => {
    try {
        const { usuario_id } = req.params;
        
        if (usuario_id !== req.user.id) {
            return res.status(403).json({ error: 'No tienes permiso.' });
        }

        const pool = await getPool();
        await pool.request()
            .input('usuario_id', sql.UniqueIdentifier, usuario_id)
            .query(`UPDATE notificaciones_app SET leida = 1 WHERE usuario_id = @usuario_id AND leida = 0`);

        res.json({ message: 'Todas las notificaciones marcadas como leídas.' });
    } catch (error) {
        console.error('Error marking all notificaciones:', error);
        res.status(500).json({ error: 'Error interno al actualizar las notificaciones.' });
    }
};
