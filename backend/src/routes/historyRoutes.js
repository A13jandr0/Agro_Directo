// ============================================================
// Rutas: Historial de Transacciones (/api/historial)
// ============================================================
const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const { verifyToken } = require('../middlewares/authMiddleware');

// US14: Ver historial de pedidos entregados (Comprador, Productor, Transportista)
router.get('/', verifyToken, historyController.getHistory);

module.exports = router;
