const express = require('express');
const router = express.Router();
const cosechasController = require('../controllers/cosechasController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkRole, checkVerified } = require('../middlewares/roleMiddleware');
const uploadImage = require('../middlewares/uploadImageMiddleware');

router.post('/', verifyToken, checkRole(['PRODUCTOR']), checkVerified, uploadImage.single('foto'), cosechasController.crearCosecha);
router.get('/mi-catalogo', verifyToken, checkRole(['PRODUCTOR']), cosechasController.miCatalogo);
router.put('/:id', verifyToken, checkRole(['PRODUCTOR']), checkVerified, cosechasController.actualizarCosecha);
router.delete('/:id', verifyToken, checkRole(['PRODUCTOR']), checkVerified, cosechasController.eliminarCosecha);
router.get('/:id', verifyToken, cosechasController.getCosechaById);

module.exports = router;
