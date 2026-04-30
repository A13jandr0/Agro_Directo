// ============================================================
// Rutas: Usuarios (POST /api/usuarios/...)
// ============================================================
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// GET /api/usuarios/mi-perfil — Perfil completo del usuario autenticado (cualquier rol)
router.get('/mi-perfil', verifyToken, authController.getPerfil);

// POST /api/usuarios/documentos — Subida de documentos para verificación (US04)
// Solo PRODUCTOR y TRANSPORTISTA (estados PENDIENTE_VERIFICACION)
router.post(
    '/documentos',
    verifyToken,
    checkRole(['PRODUCTOR', 'TRANSPORTISTA']),
    upload.single('documento'),
    uploadController.uploadDocument
);

module.exports = router;

