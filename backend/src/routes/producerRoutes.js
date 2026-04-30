// ============================================================
// Rutas: Productor (PUT /api/productor/...)
// ============================================================
const express = require('express');
const router = express.Router();
const producerController = require('../controllers/producerController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

// PUT /api/productor/ubicacion — Geolocalización GPS (US02)
router.put('/ubicacion', verifyToken, checkRole('PRODUCTOR'), producerController.updateLocation);

// GET /api/productor/perfil — Ver perfil del productor
router.get('/perfil', verifyToken, checkRole('PRODUCTOR'), producerController.getProfile);

// PUT /api/productor/perfil — Actualizar perfil del productor
router.put('/perfil', verifyToken, checkRole('PRODUCTOR'), producerController.updateProfile);

module.exports = router;
