// ============================================================
// Rutas: BI & Reportes (/api/bi/...)
// ============================================================
const express = require('express');
const router = express.Router();
const biController = require('../controllers/biController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

// US19: Dashboard de ventas para el Productor
router.get('/productor/ventas', verifyToken, checkRole('PRODUCTOR'), biController.getProductorVentas);

// Dashboard de ingresos detallado para el Productor
router.get('/productor/ingresos', verifyToken, checkRole('PRODUCTOR'), biController.getProductorIngresos);

// Dashboard de resumen para el Transportista
router.get('/transportista/resumen', verifyToken, checkRole('TRANSPORTISTA'), biController.getTransportistaResumen);

// US20: Mapa de calor para el Administrador
router.get('/admin/heatmap', verifyToken, checkRole('ADMINISTRADOR'), biController.getAdminHeatmap);

module.exports = router;
