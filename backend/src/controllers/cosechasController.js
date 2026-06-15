const path = require('path');
const fs = require('fs');
const { sql, getPool } = require('../db');
const { validarCosechaCreacion, UNIDADES_VALIDAS } = require('../utils/cosechaValidation');
const { notificarNuevoProductoTemporada } = require('../services/notificacionesService');

/** Elimina un archivo en public/ a partir de una ruta tipo /uploads/nombre.jpg */
function unlinkPublicUpload(fotoUrl) {
    if (!fotoUrl || typeof fotoUrl !== 'string' || !fotoUrl.startsWith('/uploads/')) return;
    const rel = fotoUrl.replace(/^\//, '');
    const fullPath = path.join(__dirname, '../../public', rel);
    fs.unlink(fullPath, (err) => {
        if (err && err.code !== 'ENOENT') console.warn('No se pudo borrar archivo anterior:', fullPath, err.message);
    });
}

// POST /api/cosechas
exports.crearCosecha = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRol = req.user.rol;
        const userEstado = req.user.estado;

        const pool = await getPool();

        // Obtener estado real del usuario desde SQL Server
        const userResult = await pool.request()
            .input('id', sql.UniqueIdentifier, userId)
            .query('SELECT estado FROM usuarios WHERE id = @id');
            
        if (userResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        
        const realEstado = userResult.recordset[0].estado;

        // Validaciones de negocio
        if (userRol !== 'PRODUCTOR') {
            return res.status(403).json({ message: 'Solo los productores pueden gestionar cosechas.' });
        }
        if (realEstado !== 'VERIFICADO') {
            return res.status(403).json({ message: 'Tu cuenta aún está pendiente de verificación. No puedes publicar productos hasta que un administrador apruebe tus documentos.' });
        }



        // Obtener productor_id y verificar ubicacion_gps
        const productorResult = await pool.request()
            .input('usuario_id', sql.UniqueIdentifier, userId)
            .query('SELECT id, ubicacion_gps.STAsText() AS wkt FROM perfil_productor WHERE usuario_id = @usuario_id');

        if (productorResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Perfil de productor no encontrado.' });
        }

        const productor = productorResult.recordset[0];
        if (!productor.wkt) {
            return res.status(403).json({ message: 'No has registrado la ubicación GPS de tu finca. Por favor, ve a tu perfil y regístrala antes de publicar.' });
        }

        const productor_id = productor.id;

        const {
            nombre_producto,
            descripcion,
            cantidad_disponible,
            unidad_medida,
            precio_unitario,
            fecha_disponibilidad,
            categoria
        } = req.body;

        const foto_url = req.file ? `/uploads/${req.file.filename}` : null;

        const validacion = validarCosechaCreacion(req.body, Boolean(foto_url));
        if (!validacion.ok) {
            console.error('Validation failed:', validacion.message);
            if (req.file) unlinkPublicUpload(`/uploads/${req.file.filename}`);
            return res.status(400).json({ message: validacion.message });
        }

        if (!fecha_disponibilidad) {
            console.error('Validation failed: fecha_disponibilidad is missing');
            return res.status(400).json({ message: 'La fecha de disponibilidad es obligatoria.' });
        }

        const [year, month, day] = fecha_disponibilidad.split('T')[0].split('-');
        const fechaDisp = new Date(year, month - 1, day);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // start of today

        if (fechaDisp < hoy) {
            console.error('Validation failed: fecha_disponibilidad in past', fechaDisp, hoy);
            return res.status(400).json({ message: 'La fecha de disponibilidad no puede ser una fecha pasada.' });
        }


        const insertResult = await pool.request()
            .input('productor_id', sql.UniqueIdentifier, productor_id)
            .input('nombre_producto', sql.VarChar(150), nombre_producto.trim())
            .input('categoria', sql.VarChar(50), categoria.trim())
            .input('descripcion', sql.Text, descripcion.trim())
            .input('foto_url', sql.VarChar(500), foto_url)
            .input('cantidad_disponible', sql.Decimal(10, 2), cantidad_disponible)
            .input('unidad_medida', sql.VarChar(50), unidad_medida.trim())
            .input('precio_unitario', sql.Decimal(10, 2), precio_unitario)
            .input('fecha_disponibilidad', sql.Date, fecha_disponibilidad)
            .query(`
                INSERT INTO Cosechas (
                    productor_id, nombre_producto, categoria, descripcion, foto_url, 
                    cantidad_disponible, unidad_medida, precio_unitario, fecha_disponibilidad
                )
                OUTPUT INSERTED.id
                VALUES (
                    @productor_id, @nombre_producto, @categoria, @descripcion, @foto_url,
                    @cantidad_disponible, @unidad_medida, @precio_unitario, @fecha_disponibilidad
                )
            `);

        const cosechaId = insertResult.recordset[0]?.id;

        if (cosechaId) {
            try {
                await notificarNuevoProductoTemporada(cosechaId, categoria.trim(), nombre_producto.trim(), precio_unitario);
            } catch (notifErr) {
                console.warn('US08: no se pudieron enviar alertas de estacionalidad:', notifErr.message);
            }
        }

        res.status(201).json({ mensaje: 'Cosecha publicada exitosamente.' });
    } catch (error) {
        console.error('Crear Cosecha Error:', error);
        res.status(500).json({ message: 'Error interno al publicar la cosecha.' });
    }
};

// GET /api/cosechas/mi-catalogo
exports.miCatalogo = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`[miCatalogo] Obteniendo catálogo para usuario: ${userId}`);
        
        const pool = await getPool();

        // Primero, verificar si el usuario tiene un perfil_productor
        const profileCheck = await pool.request()
            .input('usuario_id', sql.UniqueIdentifier, userId)
            .query('SELECT id FROM perfil_productor WHERE usuario_id = @usuario_id');

        if (profileCheck.recordset.length === 0) {
            console.log(`[miCatalogo] Usuario no tiene perfil_productor`);
            return res.json([]);
        }

        const result = await pool.request()
            .input('usuario_id', sql.UniqueIdentifier, userId)
            .query(`
                SELECT c.id, c.productor_id, c.nombre_producto, c.categoria, c.descripcion, 
                       c.foto_url, c.cantidad_disponible, c.unidad_medida, c.precio_unitario, 
                       c.fecha_disponibilidad, c.estado_publicacion, c.es_preventa
                FROM Cosechas c
                INNER JOIN perfil_productor p ON c.productor_id = p.id
                WHERE p.usuario_id = @usuario_id AND c.estado_publicacion NOT IN ('Inactivo', 'Eliminado')
                ORDER BY c.fecha_creacion DESC
            `);

        console.log(`[miCatalogo] Encontradas ${result.recordset.length} cosechas`);
        res.json(result.recordset);
    } catch (error) {
        console.error('[miCatalogo] Error:', error.message);
        console.error('[miCatalogo] Stack:', error.stack);
        res.status(500).json({ 
            error: 'Error interno al obtener el catálogo.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// PUT /api/cosechas/:id (multipart opcional: campo "foto"; si no hay archivo, se conserva foto_url)
exports.actualizarCosecha = async (req, res) => {
    try {
        const userId = req.user.id;
        const id = req.params.id;
        const {
            nombre_producto,
            categoria,
            descripcion,
            cantidad_disponible,
            unidad_medida,
            precio_unitario,
            fecha_disponibilidad,
            estado_publicacion
        } = req.body;

        const unidadTrim = unidad_medida != null && unidad_medida !== '' ? String(unidad_medida).trim() : null;
        if (unidadTrim && !UNIDADES_VALIDAS.includes(unidadTrim)) {
            if (req.file) unlinkPublicUpload(`/uploads/${req.file.filename}`);
            return res.status(400).json({ message: 'La unidad de medida debe ser Quintal, Arroba, Kg, Unidad, Caja, Bolsa o Litro.' });
        }

        const pool = await getPool();

        const owner = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('usuario_id', sql.UniqueIdentifier, userId)
            .query(`
                SELECT c.foto_url
                FROM Cosechas c
                INNER JOIN perfil_productor p ON c.productor_id = p.id
                WHERE c.id = @id AND p.usuario_id = @usuario_id
            `);

        if (owner.recordset.length === 0) {
            if (req.file) unlinkPublicUpload(`/uploads/${req.file.filename}`);
            return res.status(404).json({ message: 'Cosecha no encontrada o no tienes permiso para editarla.' });
        }

        const fotoAnterior = owner.recordset[0].foto_url;
        const nuevaFotoUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const trimOrNull = (v) => {
            if (v === undefined || v === null) return null;
            const s = String(v).trim();
            return s === '' ? null : s;
        };

        const reqUpdate = pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('usuario_id', sql.UniqueIdentifier, userId)
            .input('nombre_producto', sql.VarChar(150), trimOrNull(nombre_producto))
            .input('categoria', sql.VarChar(50), trimOrNull(categoria))
            .input('descripcion', sql.Text, trimOrNull(descripcion))
            .input('cantidad_disponible', sql.Decimal(10, 2), cantidad_disponible != null && cantidad_disponible !== '' ? Number(cantidad_disponible) : null)
            .input('unidad_medida', sql.VarChar(50), trimOrNull(unidad_medida))
            .input('precio_unitario', sql.Decimal(10, 2), precio_unitario != null && precio_unitario !== '' ? Number(precio_unitario) : null)
            .input('fecha_disponibilidad', sql.Date, fecha_disponibilidad || null)
            .input('estado_publicacion', sql.VarChar(50), trimOrNull(estado_publicacion));

        let sqlUpdate;
        if (nuevaFotoUrl) {
            reqUpdate.input('foto_url', sql.VarChar(500), nuevaFotoUrl);
            sqlUpdate = `
                UPDATE c
                SET nombre_producto = COALESCE(@nombre_producto, c.nombre_producto),
                    categoria = COALESCE(@categoria, c.categoria),
                    descripcion = COALESCE(@descripcion, c.descripcion),
                    cantidad_disponible = COALESCE(@cantidad_disponible, c.cantidad_disponible),
                    unidad_medida = COALESCE(@unidad_medida, c.unidad_medida),
                    precio_unitario = COALESCE(@precio_unitario, c.precio_unitario),
                    fecha_disponibilidad = COALESCE(@fecha_disponibilidad, c.fecha_disponibilidad),
                    estado_publicacion = COALESCE(@estado_publicacion, c.estado_publicacion),
                    foto_url = @foto_url
                FROM Cosechas c
                INNER JOIN perfil_productor p ON c.productor_id = p.id
                WHERE c.id = @id AND p.usuario_id = @usuario_id
            `;
        } else {
            sqlUpdate = `
                UPDATE c
                SET nombre_producto = COALESCE(@nombre_producto, c.nombre_producto),
                    categoria = COALESCE(@categoria, c.categoria),
                    descripcion = COALESCE(@descripcion, c.descripcion),
                    cantidad_disponible = COALESCE(@cantidad_disponible, c.cantidad_disponible),
                    unidad_medida = COALESCE(@unidad_medida, c.unidad_medida),
                    precio_unitario = COALESCE(@precio_unitario, c.precio_unitario),
                    fecha_disponibilidad = COALESCE(@fecha_disponibilidad, c.fecha_disponibilidad),
                    estado_publicacion = COALESCE(@estado_publicacion, c.estado_publicacion)
                FROM Cosechas c
                INNER JOIN perfil_productor p ON c.productor_id = p.id
                WHERE c.id = @id AND p.usuario_id = @usuario_id
            `;
        }

        const result = await reqUpdate.query(sqlUpdate);
        const affected = result.rowsAffected && result.rowsAffected[0];
        if (!affected) {
            if (nuevaFotoUrl) unlinkPublicUpload(nuevaFotoUrl);
            return res.status(404).json({ message: 'No se pudo actualizar la cosecha.' });
        }

        if (nuevaFotoUrl && fotoAnterior && fotoAnterior !== nuevaFotoUrl) {
            unlinkPublicUpload(fotoAnterior);
        }

        res.json({ mensaje: 'Cosecha actualizada exitosamente.' });
    } catch (error) {
        console.error('Actualizar Cosecha Error:', error);
        if (req.file) unlinkPublicUpload(`/uploads/${req.file.filename}`);
        res.status(500).json({ error: 'Error interno al actualizar la cosecha.' });
    }
};

// DELETE /api/cosechas/:id
exports.eliminarCosecha = async (req, res) => {
    try {
        const userId = req.user.id;
        const id = req.params.id;
        const pool = await getPool();

        const existing = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('usuario_id', sql.UniqueIdentifier, userId)
            .query(`
                SELECT c.foto_url
                FROM Cosechas c
                INNER JOIN perfil_productor p ON c.productor_id = p.id
                WHERE c.id = @id AND p.usuario_id = @usuario_id
            `);

        if (existing.recordset.length === 0) {
            return res.status(404).json({ message: 'Cosecha no encontrada o no tienes permiso para eliminarla.' });
        }

        const fotoUrl = existing.recordset[0].foto_url;

        // Soft delete: marca inactivo; conserva historial en Detalle_Pedidos (US21)
        const del = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('usuario_id', sql.UniqueIdentifier, userId)
            .query(`
                UPDATE Cosechas
                SET estado_publicacion = 'Inactivo'
                WHERE id = @id
                  AND productor_id IN (
                      SELECT id FROM perfil_productor WHERE usuario_id = @usuario_id
                  )
            `);

        const affected = Array.isArray(del.rowsAffected) ? del.rowsAffected[0] : del.rowsAffected;
        if (!affected) {
            return res.status(404).json({ message: 'No se pudo eliminar la cosecha.' });
        }

        res.json({ mensaje: 'Cosecha eliminada exitosamente (Soft Delete).' });
    } catch (error) {
        console.error('Eliminar Cosecha Error:', error);
        const sqlNumber = error?.number ?? error?.originalError?.info?.number;
        if (sqlNumber === 547) {
            return res.status(409).json({
                message: 'No se puede eliminar: la cosecha está vinculada a otros registros (por ejemplo pedidos).'
            });
        }
        res.status(500).json({ error: 'Error interno al eliminar la cosecha.' });
    }
};

// GET /api/cosechas/:id (US23 — detalle enriquecido)
exports.getCosechaById = async (req, res) => {
    try {
        const id = req.params.id;
        const latComprador = parseFloat(req.query.lat_comprador);
        const lngComprador = parseFloat(req.query.lng_comprador);
        const pool = await getPool();

        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query(`
                SELECT 
                    c.*, 
                    c.es_preventa,
                    p.tipo_productor,
                    p.anios_experiencia,
                    p.nombre_finca,
                    p.municipio,
                    p.provincia,
                    p.departamento,
                    p.ubicacion_gps.Lat AS latitud_productor,
                    p.ubicacion_gps.Long AS longitud_productor,
                    u.nombre_completo AS nombre_productor,
                    u.id AS productor_usuario_id,
                    (SELECT COUNT(*) FROM Cosechas c2 
                     WHERE c2.productor_id = p.id AND c2.estado_publicacion = 'Activo') AS productos_publicados,
                    pma.precio_promedio_bs AS precio_mercado_abasto,
                    (c.precio_unitario - pma.precio_promedio_bs) AS diferencia_precio,
                    ((c.precio_unitario - pma.precio_promedio_bs) / NULLIF(pma.precio_promedio_bs, 0) * 100) AS porcentaje_diferencia
                FROM Cosechas c
                LEFT JOIN perfil_productor p ON c.productor_id = p.id
                LEFT JOIN usuarios u ON p.usuario_id = u.id
                LEFT JOIN Precios_Mercado_Abasto pma 
                  ON pma.nombre_producto LIKE '%' + SUBSTRING(c.nombre_producto, 1, 5) + '%'
                WHERE c.id = @id AND c.estado_publicacion NOT IN ('Inactivo', 'Eliminado')
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const row = result.recordset[0];
        const payload = {
            ...row,
            calificacion_productor: 4.5,
            fotos: row.foto_url ? [row.foto_url] : [],
        };

        if (!Number.isNaN(latComprador) && !Number.isNaN(lngComprador) && row.latitud_productor != null && row.longitud_productor != null) {
            const distResult = await pool.request()
                .input('lat', sql.Float, latComprador)
                .input('lng', sql.Float, lngComprador)
                .input('lat_p', sql.Float, row.latitud_productor)
                .input('lng_p', sql.Float, row.longitud_productor)
                .query(`
                    DECLARE @comprador GEOGRAPHY = geography::Point(@lat, @lng, 4326);
                    DECLARE @productor GEOGRAPHY = geography::Point(@lat_p, @lng_p, 4326);
                    SELECT @comprador.STDistance(@productor) / 1000 AS distancia_km
                `);
            payload.distancia_km = distResult.recordset[0]?.distancia_km ?? null;
        }

        res.json(payload);
    } catch (error) {
        console.error('Get Cosecha By Id Error:', error);
        res.status(500).json({ error: 'Error interno al obtener el detalle del producto.' });
    }
};

// GET /api/precios-abasto
exports.getPreciosAbasto = async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT nombre_producto, precio_promedio_bs, fecha_actualizacion 
            FROM Precios_Mercado_Abasto 
            ORDER BY nombre_producto
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error('getPreciosAbasto Error:', error);
        res.status(500).json({ error: 'Error interno al obtener precios del abasto.' });
    }
};

// GET /api/cosechas/comparador?busqueda=Tomate&lat=-17.7&lng=-63.1
exports.compararCosechas = async (req, res) => {
    try {
        const { busqueda, lat, lng } = req.query;
        const pool = await getPool();

        let query = `
            SELECT 
                c.id AS cosecha_id, c.nombre_producto, c.precio_unitario, c.unidad_medida, c.foto_url,
                p.nombre_finca, p.municipio, u.nombre_completo AS productor_nombre,
                pma.precio_promedio_bs AS precio_mercado_abasto,
                ((c.precio_unitario - pma.precio_promedio_bs) / NULLIF(pma.precio_promedio_bs, 0) * 100) AS porcentaje_diferencia
        `;

        if (lat && lng && !Number.isNaN(parseFloat(lat)) && !Number.isNaN(parseFloat(lng))) {
            query += `, geography::Point(${parseFloat(lat)}, ${parseFloat(lng)}, 4326).STDistance(p.ubicacion_gps) / 1000 AS distancia_km `;
        } else {
            query += `, NULL AS distancia_km `;
        }

        query += `
            FROM Cosechas c
            INNER JOIN perfil_productor p ON c.productor_id = p.id
            INNER JOIN usuarios u ON p.usuario_id = u.id
            LEFT JOIN Precios_Mercado_Abasto pma ON pma.nombre_producto LIKE '%' + SUBSTRING(c.nombre_producto, 1, 5) + '%'
            WHERE c.estado_publicacion = 'Activo'
        `;

        const request = pool.request();
        if (busqueda) {
            query += ` AND c.nombre_producto LIKE '%' + @busqueda + '%'`;
            request.input('busqueda', sql.VarChar(100), busqueda);
        }

        query += ` ORDER BY c.precio_unitario ASC`;

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (error) {
        console.error('compararCosechas Error:', error);
        res.status(500).json({ error: 'Error interno al comparar cosechas.' });
    }
};

