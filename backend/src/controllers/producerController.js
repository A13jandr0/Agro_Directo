// ============================================================
// Controlador: Productor — Geolocalización & Perfil
// Épica 1 · US02
// ============================================================
const { sql, getPool } = require('../db');
const { ubicacionSchema } = require('../validators/authValidators');

// -------------------------------------------------------
// PUT /api/productor/ubicacion
// -------------------------------------------------------
// Guarda o actualiza la ubicación GPS del productor
// usando el tipo GEOGRAPHY nativo de SQL Server.
// -------------------------------------------------------
exports.updateLocation = async (req, res) => {
    try {
        // Validar payload con Zod
        const parseResult = ubicacionSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                error: 'Error de validación',
                detalles: parseResult.error.errors.map(e => ({
                    campo: e.path.join('.'),
                    mensaje: e.message
                }))
            });
        }

        const { latitud, longitud } = parseResult.data;
        const userId = req.user.id;

        // Validación geográfica aproximada para Santa Cruz, Bolivia
        // Lat: -19.5 a -13.5, Lng: -65.5 a -57.0
        if (latitud < -19.5 || latitud > -13.5 || longitud < -65.5 || longitud > -57.0) {
            return res.status(400).json({
                error: 'Las coordenadas no parecen estar dentro del departamento de Santa Cruz, Bolivia'
            });
        }

        const pool = await getPool();

        // Verificar que el perfil de productor exista
        const existsResult = await pool.request()
            .input('usuario_id', sql.UniqueIdentifier, userId)
            .query('SELECT id FROM perfil_productor WHERE usuario_id = @usuario_id');

        if (existsResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Perfil de productor no encontrado' });
        }

        // Actualizar ubicación GPS usando GEOGRAPHY::Point(lat, lng, SRID)
        // SRID 4326 = WGS 84 (sistema de coordenadas estándar GPS)
        await pool.request()
            .input('usuario_id', sql.UniqueIdentifier, userId)
            .input('lat', sql.Float, latitud)
            .input('lng', sql.Float, longitud)
            .query(`
                UPDATE perfil_productor 
                SET ubicacion_gps = geography::Point(@lat, @lng, 4326),
                    fecha_actualizacion = GETDATE()
                WHERE usuario_id = @usuario_id
            `);

        res.json({
            mensaje: 'Ubicación GPS actualizada exitosamente',
            coordenadas: { latitud, longitud }
        });

    } catch (error) {
        console.error('Location Update Error:', error);
        res.status(500).json({ error: 'Error interno al actualizar ubicación' });
    }
};


// -------------------------------------------------------
// GET /api/productor/perfil
// -------------------------------------------------------
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const pool = await getPool();

        const result = await pool.request()
            .input('usuario_id', sql.UniqueIdentifier, userId)
            .query(`
                SELECT 
                    u.nombre_completo, u.correo, u.celular, u.estado, u.fecha_registro,
                    p.tipo_productor, p.nombre_finca, p.municipio, p.provincia, p.departamento,
                    p.anios_experiencia, p.tipo_documento, p.numero_documento,
                    p.ubicacion_gps.STAsText() AS ubicacion_wkt
                FROM usuarios u
                INNER JOIN perfil_productor p ON u.id = p.usuario_id
                WHERE u.id = @usuario_id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Productor no encontrado' });
        }

        const row = result.recordset[0];
        // Parsear WKT "POINT (longitud latitud)" → { latitud, longitud }
        let latitud = null;
        let longitud = null;
        if (row.ubicacion_wkt) {
            const match = row.ubicacion_wkt.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
            if (match) {
                longitud = parseFloat(match[1]);
                latitud = parseFloat(match[2]);
            }
        }
        delete row.ubicacion_wkt;
        res.json({ ...row, latitud, longitud });

    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ error: 'Error interno al obtener el perfil' });
    }
};


// -------------------------------------------------------
// PUT /api/productor/perfil
// -------------------------------------------------------
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            nombre_completo, celular,
            tipo_productor, nombre_finca, municipio, provincia, departamento,
            anios_experiencia, tipo_documento, numero_documento
        } = req.body;

        const pool = await getPool();

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Actualizar tabla usuarios
            const userReq = new sql.Request(transaction);
            await userReq
                .input('id', sql.UniqueIdentifier, userId)
                .input('nombre', sql.VarChar(150), nombre_completo)
                .input('celular', sql.VarChar(20), celular)
                .query(`
                    UPDATE usuarios 
                    SET nombre_completo = @nombre, celular = @celular, fecha_actualizacion = GETDATE()
                    WHERE id = @id
                `);

            // Actualizar tabla perfil_productor
            const profileReq = new sql.Request(transaction);
            await profileReq
                .input('usuario_id', sql.UniqueIdentifier, userId)
                .input('tipo_productor', sql.VarChar(50), tipo_productor)
                .input('nombre_finca', sql.VarChar(150), nombre_finca)
                .input('municipio', sql.VarChar(100), municipio)
                .input('provincia', sql.VarChar(100), provincia)
                .input('departamento', sql.VarChar(100), departamento || 'Santa Cruz')
                .input('anios_experiencia', sql.Int, anios_experiencia || 0)
                .input('tipo_documento', sql.VarChar(50), tipo_documento)
                .input('numero_documento', sql.VarChar(50), numero_documento)
                .query(`
                    UPDATE perfil_productor
                    SET tipo_productor = @tipo_productor, nombre_finca = @nombre_finca,
                        municipio = @municipio, provincia = @provincia, departamento = @departamento,
                        anios_experiencia = @anios_experiencia, tipo_documento = @tipo_documento, 
                        numero_documento = @numero_documento, fecha_actualizacion = GETDATE()
                    WHERE usuario_id = @usuario_id
                `);

            await transaction.commit();
            res.json({ mensaje: 'Perfil actualizado correctamente' });

        } catch (txError) {
            await transaction.rollback();
            throw txError;
        }

    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ error: 'Error al actualizar el perfil' });
    }
};

// -------------------------------------------------------
// PUT /api/productor/perfil/qr
// -------------------------------------------------------
exports.updateQR = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Debe subir una imagen del código QR' });
        }

        const userId = req.user.id;
        const qrUrl = `/uploads/${req.file.filename}`;
        const pool = await getPool();

        await pool.request()
            .input('usuario_id', sql.UniqueIdentifier, userId)
            .input('qr_url', sql.VarChar(500), qrUrl)
            .query(`
                UPDATE perfil_productor 
                SET qr_pago_ruta = @qr_url, fecha_actualizacion = GETDATE()
                WHERE usuario_id = @usuario_id
            `);

        res.json({ mensaje: 'Código QR de pago actualizado', qr_url: qrUrl });
    } catch (error) {
        console.error('Update QR Error:', error);
        res.status(500).json({ error: 'Error al actualizar el código QR' });
    }
};
