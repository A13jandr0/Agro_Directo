const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidosController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkRole, checkVerified } = require('../middlewares/roleMiddleware');

// Comprador crea un pedido desde su carrito
router.post('/', verifyToken, checkRole(['COMPRADOR']), pedidosController.crearPedido);

// Productor lista sus pedidos entrantes
router.get('/productor', verifyToken, checkRole(['PRODUCTOR']), pedidosController.getPedidosProductor);

// Productor confirma un pedido (con validación de stock + transacción)
router.put('/:id/confirmar', verifyToken, checkRole(['PRODUCTOR']), checkVerified, pedidosController.confirmarPedido);

// Productor rechaza un pedido
router.put('/:id/rechazar', verifyToken, checkRole(['PRODUCTOR']), checkVerified, pedidosController.rechazarPedido);

// Comprador lista sus pedidos
router.get('/comprador', verifyToken, checkRole(['COMPRADOR']), pedidosController.getPedidosComprador);

// Transportista: Bolsa de carga
router.get('/bolsa', verifyToken, checkRole(['TRANSPORTISTA']), checkVerified, pedidosController.getPedidosBolsa);

// Transportista: Pedido actual en tránsito
router.get('/transportista/actual', verifyToken, checkRole(['TRANSPORTISTA']), checkVerified, pedidosController.getPedidoActualTransportista);

// Transportista: Aceptar una ruta
router.put('/:id/aceptar-ruta', verifyToken, checkRole(['TRANSPORTISTA']), checkVerified, pedidosController.aceptarRuta);

// Transportista: Finalizar entrega con firma
const upload = require('../middlewares/uploadDocsMiddleware');
router.put('/:id/entregar', verifyToken, checkRole(['TRANSPORTISTA']), checkVerified, upload.single('firma'), pedidosController.entregarPedido);

// Checkout: Obtener QR del productor
router.get('/checkout/:productorId', verifyToken, checkRole(['COMPRADOR']), pedidosController.getCheckoutInfo);

module.exports = router;
