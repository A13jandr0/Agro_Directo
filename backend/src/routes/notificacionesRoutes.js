const express = require('express');
const router = express.Router();
const notificacionesController = require('../controllers/notificacionesController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

// Preferencias de estacionalidad (existente)
router.get('/preferencias', verifyToken, checkRole(['COMPRADOR']), notificacionesController.getPreferencias);
router.put('/preferencias', verifyToken, checkRole(['COMPRADOR']), notificacionesController.updatePreferencias);

// Nuevos endpoints de notificaciones en tiempo real (según prompt)
router.get('/:usuario_id', verifyToken, notificacionesController.getNotificaciones);
router.put('/:id/leer', verifyToken, notificacionesController.marcarComoLeida);
router.put('/leer-todas/:usuario_id', verifyToken, notificacionesController.marcarTodasComoLeidas);

module.exports = router;
