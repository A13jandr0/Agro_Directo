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

        const userRol = req.user.rol ? req.user.rol.toUpperCase() : '';
        const rolesArray = Array.isArray(requiredRoles) ? requiredRoles.map(r => r.toUpperCase()) : [requiredRoles.toUpperCase()];

        console.log(`[checkRole] User: ${req.user.nombre_completo}, Role in token: "${userRol}", Required: ${rolesArray.join(' o ')}`);

        if (!rolesArray.includes(userRol)) {
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

    const userRol = req.user.rol ? req.user.rol.toUpperCase() : '';
    const userEstado = req.user.estado ? req.user.estado.toUpperCase() : '';

    if (userRol !== 'COMPRADOR' && userEstado !== 'VERIFICADO') {
        console.log(`[checkVerified] Falló: User estado es "${userEstado}" pero se requiere "VERIFICADO" para rol ${userRol}`);
        return res.status(403).json({ 
            error: 'Su cuenta aún no ha sido verificada. No puede realizar esta operación.' 
        });
    }

    next();
};

module.exports = { checkRole, checkVerified };
