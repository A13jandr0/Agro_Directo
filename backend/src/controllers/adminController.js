// ============================================================
// Controlador: Administrador — Verificación de Documentos
// Épica 1 · US04
// ============================================================
const { sql, getPool } = require('../db');
const { verificacionSchema } = require('../validators/authValidators');
const { notificarVerificacionCuenta } = require('../services/notificacionesService');

// -------------------------------------------------------
// GET /api/admin/verificaciones
// -------------------------------------------------------
// Lista todos los usuarios con estado PENDIENTE_VERIFICACION,
// incluyendo la URL del documento subido.
// -------------------------------------------------------
exports.getVerificacionesCount = async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT COUNT(*) AS total FROM usuarios WHERE estado = 'PENDIENTE_VERIFICACION'
        `);
        res.json({ total: result.recordset[0]?.total ?? 0 });
    } catch (error) {
        console.error('Get Verificaciones Count Error:', error);
        res.status(500).json({ error: 'Error al obtener conteo.' });
    }
};

exports.getPendingUsers = async (req, res) => {
    try {
        const pool = await getPool();

        const result = await pool.request().query(`
            SELECT 
                u.id,
                u.nombre_completo,
                u.correo,
                u.celular,
                u.rol,
                u.estado,
                u.fecha_registro,
                -- Documentos según el rol
                pp.tipo_documento      AS doc_tipo_productor,
                pp.numero_documento    AS doc_numero_productor,
                pp.url_documento       AS doc_url_productor,
                pp.nombre_finca,
                pt.tipo_documento_subido AS doc_tipo_transportista,
                pt.numero_licencia,
                pt.placa_vehiculo,
                pt.url_documento       AS doc_url_transportista
            FROM usuarios u
            LEFT JOIN perfil_productor pp    ON u.id = pp.usuario_id
            LEFT JOIN perfil_transportista pt ON u.id = pt.usuario_id
            WHERE u.estado = 'PENDIENTE_VERIFICACION'
            ORDER BY u.fecha_registro ASC
        `);

        // Formatear resultados para respuesta limpia
        const usuarios = result.recordset.map(r => ({
            id: r.id,
            nombre_completo: r.nombre_completo,
            correo: r.correo,
            celular: r.celular,
            rol: r.rol,
            estado: r.estado,
            fecha_registro: r.fecha_registro,
            documento: {
                tipo: r.doc_tipo_productor || r.doc_tipo_transportista || null,
                numero: r.doc_numero_productor || r.numero_licencia || null,
                url: r.doc_url_productor || r.doc_url_productor_legacy || r.doc_url_transportista || null,
                placa: r.placa_vehiculo || null,
                finca: r.nombre_finca || null
            }
        }));

        res.json({
            total: usuarios.length,
            usuarios
        });

    } catch (error) {
        console.error('Get Pending Users Error:', error);
        res.status(500).json({ error: 'Error interno al obtener usuarios pendientes' });
    }
};


// -------------------------------------------------------
// PUT /api/admin/verificaciones/:id
// -------------------------------------------------------
// El administrador aprueba o rechaza a un usuario.
// Payload: { accion: 'aprobar' | 'rechazar', motivo: 'string' }
// -------------------------------------------------------
exports.verifyUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar payload con Zod
        const parseResult = verificacionSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                error: 'Error de validación',
                detalles: parseResult.error.errors.map(e => ({
                    campo: e.path.join('.'),
                    mensaje: e.message
                }))
            });
        }

        const { accion, motivo } = parseResult.data;

        // Mapear acción a estado de BD
        const nuevoEstado = accion === 'aprobar' ? 'VERIFICADO' : 'RECHAZADO';

        const pool = await getPool();

        // Verificar que el usuario existe y está en PENDIENTE_VERIFICACION
        const checkResult = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query(`
                SELECT id, nombre_completo, estado, rol 
                FROM usuarios 
                WHERE id = @id
            `);

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const usuario = checkResult.recordset[0];

        if (usuario.estado !== 'PENDIENTE_VERIFICACION') {
            return res.status(400).json({
                error: `El usuario no está en estado PENDIENTE_VERIFICACION. Estado actual: ${usuario.estado}`
            });
        }

        // Actualizar el estado y motivo de rechazo
        await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('estado', sql.VarChar(50), nuevoEstado)
            .input('motivo', sql.VarChar(500), accion === 'rechazar' ? (motivo || null) : null)
            .query(`
                UPDATE usuarios 
                SET estado = @estado, motivo_rechazo = @motivo, fecha_actualizacion = GETDATE()
                WHERE id = @id
            `);

        await notificarVerificacionCuenta(id, accion === 'aprobar', motivo);

        res.json({
            mensaje: `Usuario ${accion === 'aprobar' ? 'aprobado' : 'rechazado'} exitosamente`,
            usuario: {
                id,
                nombre_completo: usuario.nombre_completo,
                rol: usuario.rol,
                estado_anterior: 'PENDIENTE_VERIFICACION',
                estado_nuevo: nuevoEstado,
                motivo: motivo || null
            }
        });

    } catch (error) {
        console.error('Verify User Error:', error);
        res.status(500).json({ error: 'Error interno al verificar usuario' });
    }
};
