// ============================================================
// Rutas: Administrador — Verificaciones (/api/admin/...)
// ============================================================
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
// NOTA: En producción proteger con verifyToken + checkRole('ADMIN')
// Por ahora se deja abierto para pruebas en Postman.

// GET /api/admin/verificaciones/count — Badge sidebar admin
router.get('/verificaciones/count', adminController.getVerificacionesCount);

// GET /api/admin/verificaciones — Listar usuarios pendientes (US04)
router.get('/verificaciones', adminController.getPendingUsers);

// PUT /api/admin/verificaciones/:id — Aprobar o rechazar usuario (US04)
router.put('/verificaciones/:id', adminController.verifyUser);

module.exports = router;
