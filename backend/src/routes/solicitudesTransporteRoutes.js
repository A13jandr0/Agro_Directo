const express = require('express');
const router = express.Router();
const solicitudesTransporteController = require('../controllers/solicitudesTransporteController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

// POST /api/solicitudes-transporte
router.post('/', verifyToken, checkRole(['PRODUCTOR']), solicitudesTransporteController.crearSolicitud);

// PUT /api/solicitudes-transporte/:id/responder
router.put('/:id/responder', verifyToken, checkRole(['TRANSPORTISTA']), solicitudesTransporteController.responderSolicitud);

module.exports = router;
