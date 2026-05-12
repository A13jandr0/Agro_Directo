// ============================================================
// Controlador: Subida de Documentos — Verificación
// Épica 1 · US04
// ============================================================
const { sql, getPool } = require('../db');

// -------------------------------------------------------
// POST /api/usuarios/documentos
// -------------------------------------------------------
// Permite a usuarios en estado PENDIENTE_VERIFICACION
// subir un archivo de documento (PDF, JPG, PNG) mediante Multer.
// -------------------------------------------------------
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.files || (!req.files.documento_ci && !req.files.documento_rau && !req.files.documento)) {
            return res.status(400).json({ error: 'No se subieron documentos' });
        }

        const userId = req.user.id;
        const userRol = req.user.rol;
        const userEstado = req.user.estado;

        // Solo usuarios en estado PENDIENTE_VERIFICACION pueden subir documentos
        if (userEstado !== 'PENDIENTE_VERIFICACION') {
            return res.status(403).json({
                error: 'Solo usuarios en estado PENDIENTE_VERIFICACION pueden subir documentos',
                estado_actual: userEstado
            });
        }

        let filePath = '';
        const paths = [];
        
        if (req.files.documento_ci) paths.push(`/documentos/${req.files.documento_ci[0].filename}`);
        if (req.files.documento_rau) paths.push(`/documentos/${req.files.documento_rau[0].filename}`);
        if (req.files.documento) paths.push(`/documentos/${req.files.documento[0].filename}`); // fallback for transportista if they still use "documento"

        filePath = paths.join(',');

        const pool = await getPool();

        if (userRol === 'PRODUCTOR') {
            await pool.request()
                .input('usuario_id', sql.UniqueIdentifier, userId)
                .input('url', sql.VarChar(500), filePath)
                .query(`
                    UPDATE perfil_productor 
                    SET url_documento = @url, fecha_actualizacion = GETDATE()
                    WHERE usuario_id = @usuario_id
                `);
        }
        else if (userRol === 'TRANSPORTISTA') {
            await pool.request()
                .input('usuario_id', sql.UniqueIdentifier, userId)
                .input('url', sql.VarChar(500), filePath)
                .query(`
                    UPDATE perfil_transportista 
                    SET url_documento = @url, fecha_actualizacion = GETDATE()
                    WHERE usuario_id = @usuario_id
                `);
        }
        else {
            return res.status(400).json({
                error: 'Tu rol no requiere subir documentos de verificación'
            });
        }

        res.json({
            mensaje: 'Documentos subidos correctamente',
            archivos: paths
        });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Error interno al guardar el documento' });
    }
};
