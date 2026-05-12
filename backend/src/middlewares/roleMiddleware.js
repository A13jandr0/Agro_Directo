// ============================================================
// Middleware: Verificación de Rol y Estado
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

/**
 * Valida que el usuario tenga estado 'VERIFICADO'.
 * (Excepto compradores, que no requieren verificación documental para operar).
 */
const checkVerified = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (req.user.rol !== 'COMPRADOR' && req.user.estado !== 'VERIFICADO') {
        return res.status(403).json({ 
            error: 'Su cuenta aún no ha sido verificada. No puede realizar esta operación.' 
        });
    }

    next();
};

module.exports = { checkRole, checkVerified };
