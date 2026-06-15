const express = require('express');
const router = express.Router();
const cosechasController = require('../controllers/cosechasController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkRole, checkVerified } = require('../middlewares/roleMiddleware');
const uploadImage = require('../middlewares/uploadImageMiddleware');
const handleUploadImageError = require('../middlewares/handleUploadImageError');

const uploadFoto = (req, res, next) => {
    uploadImage.single('foto')(req, res, (err) => {
        if (err) return handleUploadImageError(err, req, res, next);
        next();
    });
};

router.post('/', verifyToken, checkRole(['PRODUCTOR']), checkVerified, uploadFoto, cosechasController.crearCosecha);
router.get('/mi-catalogo', verifyToken, checkRole(['PRODUCTOR']), cosechasController.miCatalogo);
router.put('/:id', verifyToken, checkRole(['PRODUCTOR']), checkVerified, uploadFoto, cosechasController.actualizarCosecha);
router.delete('/:id', verifyToken, checkRole(['PRODUCTOR']), checkVerified, cosechasController.eliminarCosecha);

// US09: Comparador y Precios Abasto (Deben ir antes de /:id para evitar conflictos)
router.get('/comparador', cosechasController.compararCosechas);
router.get('/precios-abasto', cosechasController.getPreciosAbasto);

router.get('/:id', verifyToken, cosechasController.getCosechaById);

module.exports = router;
