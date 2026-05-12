// ============================================================
// Controlador: Autenticación — Registro Multitipo & Login
// Épica 1 · US01
// ============================================================
const { sql, getPool } = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middlewares/authMiddleware');
const {
    baseSchema,
    productorSchema,
    compradorSchema,
    transportistaSchema
} = require('../validators/authValidators');

// -------------------------------------------------------
// POST /api/auth/registro
// -------------------------------------------------------
exports.registro = async (req, res) => {
    try {
        // ── 1. Validar campos comunes ──────────────────────
        const baseResult = baseSchema.safeParse(req.body);
        if (!baseResult.success) {
            return res.status(400).json({
                error: 'Error de validación en campos comunes',
                detalles: baseResult.error.errors.map(e => ({
                    campo: e.path.join('.'),
                    mensaje: e.message
                }))
            });
        }

        const { nombre_completo, correo, contrasena, celular, rol, acepto_terminos, acepto_privacidad } = baseResult.data;

        // ── 2. Validar campos específicos según el rol ────
        let perfilData = {};
        let perfilResult;

        switch (rol) {
            case 'PRODUCTOR':
                perfilResult = productorSchema.safeParse(req.body);
                if (!perfilResult.success) {
                    return res.status(400).json({
                        error: 'Error de validación para rol PRODUCTOR',
                        detalles: perfilResult.error.errors.map(e => ({
                            campo: e.path.join('.'),
                            mensaje: e.message
                        }))
                    });
                }
                perfilData = perfilResult.data;
                break;

            case 'COMPRADOR':
                perfilResult = compradorSchema.safeParse(req.body);
                if (!perfilResult.success) {
                    return res.status(400).json({
                        error: 'Error de validación para rol COMPRADOR',
                        detalles: perfilResult.error.errors.map(e => ({
                            campo: e.path.join('.'),
                            mensaje: e.message
                        }))
                    });
                }
                perfilData = perfilResult.data;
                break;

            case 'TRANSPORTISTA':
                perfilResult = transportistaSchema.safeParse(req.body);
                if (!perfilResult.success) {
                    return res.status(400).json({
                        error: 'Error de validación para rol TRANSPORTISTA',
                        detalles: perfilResult.error.errors.map(e => ({
                            campo: e.path.join('.'),
                            mensaje: e.message
                        }))
                    });
                }
                perfilData = perfilResult.data;
                break;
        }

        // ── 3. Verificar que el correo no exista ──────────
        const pool = await getPool();

        const existsResult = await pool.request()
            .input('correo', sql.VarChar(150), correo)
            .query('SELECT id FROM usuarios WHERE correo = @correo');

        if (existsResult.recordset.length > 0) {
            return res.status(409).json({ error: 'El correo ya está registrado' });
        }

        // ── 4. Hashear contraseña ─────────────────────────
        const password_hash = await bcrypt.hash(contrasena, 12);

        // ── 5. Transacción: insertar usuario + perfil ─────
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // 5a. Insertar en tabla usuarios
            // NOTA: No se puede usar OUTPUT inserted.* con trigger INSTEAD OF.
            // Se inserta y luego se recupera el registro por correo (unique).
            const insertUserQuery = `
                INSERT INTO usuarios (nombre_completo, correo, password_hash, celular, rol, acepto_terminos, acepto_privacidad)
                VALUES (@nombre, @correo, @hash, @celular, @rol, @terminos, @privacidad);
            `;

            const userRequest = new sql.Request(transaction);
            await userRequest
                .input('nombre', sql.VarChar(150), nombre_completo)
                .input('correo', sql.VarChar(150), correo)
                .input('hash', sql.VarChar(255), password_hash)
                .input('celular', sql.VarChar(20), celular)
                .input('rol', sql.VarChar(50), rol)
                .input('terminos', sql.Bit, acepto_terminos ? 1 : 0)
                .input('privacidad', sql.Bit, acepto_privacidad ? 1 : 0)
                .query(insertUserQuery);

            // Recuperar el usuario recién creado (el trigger ya asignó el estado)
            const selectReq = new sql.Request(transaction);
            const selectResult = await selectReq
                .input('correo', sql.VarChar(150), correo)
                .query('SELECT id, estado FROM usuarios WHERE correo = @correo');

            const newUser = selectResult.recordset[0];
            const userId = newUser.id;
            const estado = newUser.estado;

            // 5b. Insertar en la tabla de perfil correspondiente
            const profileRequest = new sql.Request(transaction);
            profileRequest.input('usuario_id', sql.UniqueIdentifier, userId);

            if (rol === 'PRODUCTOR') {
                await profileRequest
                    .input('tipo_productor', sql.VarChar(50), perfilData.tipo_productor)
                    .input('nombre_finca', sql.VarChar(150), perfilData.nombre_finca)
                    .input('municipio', sql.VarChar(100), perfilData.municipio)
                    .input('provincia', sql.VarChar(100), perfilData.provincia)
                    .input('departamento', sql.VarChar(100), perfilData.departamento || 'Santa Cruz')
                    .input('anios_experiencia', sql.Int, perfilData.anios_experiencia)
                    .input('tipo_documento', sql.VarChar(50), perfilData.tipo_documento)
                    .input('numero_documento', sql.VarChar(50), perfilData.numero_documento)
                    .query(`
                        INSERT INTO perfil_productor 
                            (usuario_id, tipo_productor, nombre_finca, municipio, provincia, departamento, anios_experiencia, tipo_documento, numero_documento)
                        VALUES 
                            (@usuario_id, @tipo_productor, @nombre_finca, @municipio, @provincia, @departamento, @anios_experiencia, @tipo_documento, @numero_documento)
                    `);
            }
            else if (rol === 'COMPRADOR') {
                await profileRequest
                    .input('tipo_comprador', sql.VarChar(50), perfilData.tipo_comprador)
                    .input('nombre_negocio', sql.VarChar(150), perfilData.nombre_negocio || null)
                    .input('ciudad_principal', sql.VarChar(100), perfilData.ciudad_principal)
                    .query(`
                        INSERT INTO perfil_comprador 
                            (usuario_id, tipo_comprador, nombre_negocio, ciudad_principal)
                        VALUES 
                            (@usuario_id, @tipo_comprador, @nombre_negocio, @ciudad_principal)
                    `);
            }
            else if (rol === 'TRANSPORTISTA') {
                await profileRequest
                    .input('tipo_transporte', sql.VarChar(50), perfilData.tipo_transporte)
                    .input('capacidad_carga_kg', sql.Decimal(10, 2), perfilData.capacidad_carga_kg)
                    .input('zona_operacion', sql.VarChar(50), perfilData.zona_operacion)
                    .input('numero_licencia', sql.VarChar(100), perfilData.numero_licencia)
                    .input('placa_vehiculo', sql.VarChar(20), perfilData.placa_vehiculo)
                    .input('tipo_documento_subido', sql.VarChar(50), perfilData.tipo_documento_subido)
                    .query(`
                        INSERT INTO perfil_transportista 
                            (usuario_id, tipo_transporte, capacidad_carga_kg, zona_operacion, numero_licencia, placa_vehiculo, tipo_documento_subido)
                        VALUES 
                            (@usuario_id, @tipo_transporte, @capacidad_carga_kg, @zona_operacion, @numero_licencia, @placa_vehiculo, @tipo_documento_subido)
                    `);
            }

            await transaction.commit();

            // ── 6. Generar JWT ────────────────────────────
            const token = jwt.sign(
                { id: userId, nombre: nombre_completo, rol, estado },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                mensaje: 'Registro exitoso',
                token,
                usuario: { id: userId, nombre_completo, correo, rol, estado }
            });

        } catch (trxError) {
            await transaction.rollback();
            throw trxError;
        }

    } catch (error) {
        console.error('Register Error:', error);

        // Manejar errores de constraint de SQL Server
        if (error.number === 2627 || error.number === 2601) {
            return res.status(409).json({ error: 'Ya existe un registro con esos datos (correo o placa duplicados)' });
        }
        if (error.number === 547) {
            return res.status(400).json({ error: 'Error de restricción en la base de datos. Verifique los valores enviados.' });
        }

        res.status(500).json({ error: 'Error interno del servidor al registrar' });
    }
};


// -------------------------------------------------------
// POST /api/auth/login
// -------------------------------------------------------
exports.login = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
        }

        const pool = await getPool();
        const result = await pool.request()
            .input('correo', sql.VarChar(150), correo)
            .query('SELECT id, nombre_completo, password_hash, rol, estado FROM usuarios WHERE correo = @correo');

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = result.recordset[0];
        const isMatch = await bcrypt.compare(contrasena, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user.id, nombre: user.nombre_completo, rol: user.rol, estado: user.estado },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            mensaje: 'Login exitoso',
            token,
            usuario: {
                id: user.id,
                nombre_completo: user.nombre_completo,
                rol: user.rol,
                estado: user.estado
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Error interno del servidor al iniciar sesión' });
    }
};


// -------------------------------------------------------
// GET /api/auth/perfil  (Protegido con JWT)
// -------------------------------------------------------
// Devuelve el perfil completo del usuario autenticado,
// incluyendo los datos de su tabla de perfil específica.
// -------------------------------------------------------
exports.getPerfil = async (req, res) => {
    try {
        const userId = req.user.id;
        const pool = await getPool();

        // Datos comunes del usuario
        const userResult = await pool.request()
            .input('id', sql.UniqueIdentifier, userId)
            .query('SELECT id, nombre_completo, correo, celular, rol, estado, fecha_registro FROM usuarios WHERE id = @id');

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const usuario = userResult.recordset[0];
        let perfil = {};

        // Datos específicos según el rol
        if (usuario.rol === 'PRODUCTOR') {
            const r = await pool.request()
                .input('uid', sql.UniqueIdentifier, userId)
                .query(`
                    SELECT tipo_productor, nombre_finca, municipio, provincia, departamento,
                           anios_experiencia, tipo_documento, numero_documento, url_documento,
                           ubicacion_gps.STAsText() AS ubicacion_wkt
                    FROM perfil_productor WHERE usuario_id = @uid
                `);
            const row = r.recordset[0] || {};

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
            perfil = { ...row, latitud, longitud };
        }
        else if (usuario.rol === 'COMPRADOR') {
            const r = await pool.request()
                .input('uid', sql.UniqueIdentifier, userId)
                .query('SELECT tipo_comprador, nombre_negocio, ciudad_principal FROM perfil_comprador WHERE usuario_id = @uid');
            perfil = r.recordset[0] || {};
        }
        else if (usuario.rol === 'TRANSPORTISTA') {
            const r = await pool.request()
                .input('uid', sql.UniqueIdentifier, userId)
                .query(`
                    SELECT tipo_transporte, capacidad_carga_kg, zona_operacion,
                           numero_licencia, placa_vehiculo, tipo_documento_subido, url_documento
                    FROM perfil_transportista WHERE usuario_id = @uid
                `);
            perfil = r.recordset[0] || {};
        }

        res.json({ ...usuario, ...perfil });

    } catch (error) {
        console.error('Get Perfil Error:', error);
        res.status(500).json({ error: 'Error interno al obtener el perfil' });
    }
};
