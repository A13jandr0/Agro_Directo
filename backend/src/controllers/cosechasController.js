const path = require('path');
const fs = require('fs');
const { sql, getPool } = require('../db');

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
            categoria // included if sent by frontend, but we don't save it if it's not in db or we can just ignore
        } = req.body;

        const foto_url = req.file ? `/uploads/${req.file.filename}` : null;

        if (!nombre_producto || !precio_unitario || !cantidad_disponible || !unidad_medida || !foto_url) {
            return res.status(400).json({ message: 'Los campos nombre, precio, cantidad, unidad y foto son obligatorios.' });
        }

        if (!fecha_disponibilidad) {
            return res.status(400).json({ message: 'La fecha de disponibilidad es obligatoria.' });
        }

        const fechaDisp = new Date(fecha_disponibilidad);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // start of today

        if (fechaDisp < hoy) {
            return res.status(400).json({ message: 'La fecha de disponibilidad no puede ser una fecha pasada.' });
        }


        await pool.request()
            .input('productor_id', sql.UniqueIdentifier, productor_id)
            .input('nombre_producto', sql.VarChar(150), nombre_producto)
            .input('descripcion', sql.Text, descripcion || null)
            .input('foto_url', sql.VarChar(500), foto_url)
            .input('cantidad_disponible', sql.Decimal(10, 2), cantidad_disponible)
            .input('unidad_medida', sql.VarChar(50), unidad_medida)
            .input('precio_unitario', sql.Decimal(10, 2), precio_unitario)
            .input('fecha_disponibilidad', sql.Date, fecha_disponibilidad)
            .query(`
                INSERT INTO Cosechas (
                    productor_id, nombre_producto, descripcion, foto_url, 
                    cantidad_disponible, unidad_medida, precio_unitario, fecha_disponibilidad
                ) VALUES (
                    @productor_id, @nombre_producto, @descripcion, @foto_url,
                    @cantidad_disponible, @unidad_medida, @precio_unitario, @fecha_disponibilidad
                )
            `);

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
        const pool = await getPool();

        const result = await pool.request()
            .input('usuario_id', sql.UniqueIdentifier, userId)
            .query(`
                SELECT c.*, c.es_preventa 
                FROM Cosechas c
                INNER JOIN perfil_productor p ON c.productor_id = p.id
                WHERE p.usuario_id = @usuario_id AND (c.estado_publicacion IS NULL OR c.estado_publicacion != 'Eliminado')
                ORDER BY c.fecha_disponibilidad DESC
            `);

        res.json(result.recordset);
    } catch (error) {
        console.error('Mi Catalogo Error:', error);
        res.status(500).json({ error: 'Error interno al obtener el catálogo.' });
    }
};

// PUT /api/cosechas/:id (multipart opcional: campo "foto"; si no hay archivo, se conserva foto_url)
exports.actualizarCosecha = async (req, res) => {
    try {
        const userId = req.user.id;
        const id = req.params.id;
        const {
            nombre_producto,
            descripcion,
            cantidad_disponible,
            unidad_medida,
            precio_unitario,
            fecha_disponibilidad,
            estado_publicacion
        } = req.body;

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

        const enPedidos = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query(`
                SELECT COUNT(*) AS cnt
                FROM Detalle_Pedidos
                WHERE cosecha_id = @id
            `);

        const cnt = enPedidos.recordset[0]?.cnt ?? 0;
        if (cnt > 0) {
            return res.status(409).json({
                message:
                    'No se puede eliminar: esta cosecha ya aparece en al menos un pedido.'
            });
        }

        // Soft delete: actualizar estado_publicacion
        const del = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('usuario_id', sql.UniqueIdentifier, userId)
            .query(`
                UPDATE Cosechas
                SET estado_publicacion = 'Eliminado'
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

// GET /api/cosechas/:id
exports.getCosechaById = async (req, res) => {
    try {
        const id = req.params.id;
        const pool = await getPool();

        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query(`
                SELECT 
                    c.*, 
                    c.es_preventa,
                    p.nombre_finca,
                    p.municipio,
                    p.provincia,
                    p.departamento,
                    u.nombre_completo AS nombre_productor
                FROM Cosechas c
                LEFT JOIN perfil_productor p ON c.productor_id = p.id
                LEFT JOIN usuarios u ON p.usuario_id = u.id
                WHERE c.id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Get Cosecha By Id Error:', error);
        res.status(500).json({ error: 'Error interno al obtener el detalle del producto.' });
    }
};
