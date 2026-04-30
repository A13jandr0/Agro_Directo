// ============================================================
// Middleware: Verificación de Rol
// ============================================================

/**
 * Recibe un rol o array de roles permitidos.
 * Valida contra req.user.rol (inyectado por verifyToken).
 */
const checkRole = (requiredRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

        if (!rolesArray.includes(req.user.rol)) {
            return res.status(403).json({
                error: `Acceso denegado. Se requiere el rol: ${rolesArray.join(' o ')}`
            });
        }

        next();
    };
};

module.exports = { checkRole };
