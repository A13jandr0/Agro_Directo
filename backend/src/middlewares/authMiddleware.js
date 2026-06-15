// ============================================================
// Middleware: Autenticación JWT
// ============================================================
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'AgroDirectoSecretKey2026';

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token no provisto o formato inválido' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, nombre, rol, estado }
        
        // Logs temporales solicitados
        console.log('=== LOG DE AUTENTICACIÓN ===');
        console.log('Token recibido:', token);
        console.log('Usuario autenticado:', decoded.nombre);
        console.log('Rol:', decoded.rol);
        console.log('Claims:', decoded);
        console.log('============================');
        
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

module.exports = { verifyToken, JWT_SECRET };
