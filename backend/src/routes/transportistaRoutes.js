const express = require('express');
const router = express.Router();
const transportistaController = require('../controllers/transportistaController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

router.get('/:id/solicitudes-pendientes', verifyToken, checkRole(['TRANSPORTISTA']), transportistaController.getSolicitudesPendientes);
router.get('/:id/viajes-en-curso', verifyToken, checkRole(['TRANSPORTISTA']), transportistaController.getViajesEnCurso);
router.get('/:id/historial', verifyToken, checkRole(['TRANSPORTISTA']), transportistaController.getHistorialViajes);

module.exports = router;
