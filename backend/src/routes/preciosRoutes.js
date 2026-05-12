const express = require('express');
const router = express.Router();
const preciosController = require('../controllers/preciosController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Endpoint protegido (puede consultarlo el productor)
router.get('/', verifyToken, preciosController.obtenerPrecioAbasto);

module.exports = router;
