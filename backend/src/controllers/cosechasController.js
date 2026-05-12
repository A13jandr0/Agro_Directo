const { sql, getPool } = require('../db');

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
            fecha_disponibilidad
        } = req.body;

        const foto_url = req.file ? `/uploads/${req.file.filename}` : null;

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
                WHERE p.usuario_id = @usuario_id
                ORDER BY c.fecha_disponibilidad DESC
            `);

        res.json(result.recordset);
    } catch (error) {
        console.error('Mi Catalogo Error:', error);
        res.status(500).json({ error: 'Error interno al obtener el catálogo.' });
    }
};

// PUT /api/cosechas/:id
exports.actualizarCosecha = async (req, res) => {
    try {
        const id = req.params.id;
        const { cantidad_disponible, precio_unitario, estado_publicacion } = req.body;
        const pool = await getPool();

        await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('cantidad_disponible', sql.Decimal(10, 2), cantidad_disponible)
            .input('precio_unitario', sql.Decimal(10, 2), precio_unitario)
            .input('estado_publicacion', sql.VarChar(50), estado_publicacion)
            .query(`
                UPDATE Cosechas
                SET cantidad_disponible = COALESCE(@cantidad_disponible, cantidad_disponible),
                    precio_unitario = COALESCE(@precio_unitario, precio_unitario),
                    estado_publicacion = COALESCE(@estado_publicacion, estado_publicacion)
                WHERE id = @id
            `);

        res.json({ mensaje: 'Cosecha actualizada exitosamente.' });
    } catch (error) {
        console.error('Actualizar Cosecha Error:', error);
        res.status(500).json({ error: 'Error interno al actualizar la cosecha.' });
    }
};

// DELETE /api/cosechas/:id
exports.eliminarCosecha = async (req, res) => {
    try {
        const id = req.params.id;
        const pool = await getPool();

        await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query('DELETE FROM Cosechas WHERE id = @id');

        res.json({ mensaje: 'Cosecha eliminada exitosamente.' });
    } catch (error) {
        console.error('Eliminar Cosecha Error:', error);
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
