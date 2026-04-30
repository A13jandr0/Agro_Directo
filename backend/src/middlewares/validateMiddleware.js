// ============================================================
// Middleware genérico de validación con Zod
// ============================================================

/**
 * Recibe un schema Zod y valida req.body.
 * Si falla, responde 400 con la lista detallada de errores.
 */
const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const errores = result.error.errors.map(err => ({
            campo: err.path.join('.'),
            mensaje: err.message
        }));

        return res.status(400).json({
            error: 'Error de validación',
            detalles: errores
        });
    }

    // Reemplazar body con los datos parseados (aplica defaults, coerciones, etc.)
    req.body = result.data;
    next();
};

module.exports = { validate };
