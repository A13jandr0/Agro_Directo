const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');

// Endpoint público para el comprador o general
router.get('/productos', marketplaceController.obtenerProductos);

module.exports = router;
