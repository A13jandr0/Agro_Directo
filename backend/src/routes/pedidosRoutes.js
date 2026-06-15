const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidosController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkRole, checkVerified } = require('../middlewares/roleMiddleware');

const upload = require('../middlewares/uploadDocsMiddleware');

// Comprador crea un pedido desde su carrito (sin comprobante; se sube en Pago QR)
router.post('/', verifyToken, checkRole(['COMPRADOR']), pedidosController.crearPedido);

// Comprador sube comprobante de pago
router.post('/:id/comprobante', verifyToken, checkRole(['COMPRADOR']), upload.single('comprobante'), pedidosController.subirComprobante);

// Actualizar estado del pedido (PAGADO, LISTO_PARA_DESPACHO, etc.)
router.put('/:id/estado', verifyToken, pedidosController.actualizarEstado);

// Conteos para badges en sidebar
router.get('/conteos', verifyToken, pedidosController.getConteosPedidos);

// Productor lista sus pedidos entrantes
router.get('/productor', verifyToken, checkRole(['PRODUCTOR']), pedidosController.getPedidosProductor);

// Productor confirma un pedido (con validación de stock + transacción)
router.put('/:id/confirmar', verifyToken, checkRole(['PRODUCTOR']), checkVerified, pedidosController.confirmarPedido);

// Productor rechaza un pedido
router.put('/:id/rechazar', verifyToken, checkRole(['PRODUCTOR']), checkVerified, pedidosController.rechazarPedido);

// Comprador lista sus pedidos
router.get('/comprador', verifyToken, checkRole(['COMPRADOR']), pedidosController.getPedidosComprador);

// US06: notificaciones de saldo pendiente cuando la cosecha ya está disponible
router.get('/comprador/notificaciones-saldo', verifyToken, checkRole(['COMPRADOR']), pedidosController.getNotificacionesSaldo);

// US06: completar pago del 60% restante
router.put('/:id/pagar-saldo', verifyToken, checkRole(['COMPRADOR']), upload.single('comprobante_saldo'), pedidosController.pagarSaldoPedido);

// Transportista: Bolsa de carga
router.get('/bolsa', verifyToken, checkRole(['TRANSPORTISTA']), checkVerified, pedidosController.getPedidosBolsa);

// Transportista: Pedido actual en tránsito
router.get('/transportista/actual', verifyToken, checkRole(['TRANSPORTISTA']), checkVerified, pedidosController.getPedidoActualTransportista);

// Transportista: Aceptar una ruta (old)
router.put('/:id/aceptar-ruta', verifyToken, checkRole(['TRANSPORTISTA']), checkVerified, pedidosController.aceptarRuta);

// Transportista: Aceptar viaje (PedidosYa flow)
router.put('/:id/aceptar-viaje', verifyToken, checkRole(['TRANSPORTISTA']), checkVerified, pedidosController.aceptarViaje);

// Transportista: Notificar que recogió y va en camino
router.put('/:id/notificar-camino', verifyToken, checkRole(['TRANSPORTISTA']), checkVerified, pedidosController.notificarCamino);

// Transportista: Finalizar entrega con firma
router.put('/:id/entregar', verifyToken, checkRole(['TRANSPORTISTA']), checkVerified, upload.single('firma'), pedidosController.entregarPedido);

// Transportista: Marcar como entregado (simplificado, de la Funcionalidad 3)
router.put('/:id/marcar-entregado', verifyToken, checkRole(['TRANSPORTISTA']), checkVerified, pedidosController.marcarEntregado);

// Checkout: Obtener QR del productor
router.get('/checkout/:productorId', verifyToken, checkRole(['COMPRADOR']), pedidosController.getCheckoutInfo);

// Demo: Simular subida de comprobante
router.put('/:id/comprobante-demo', verifyToken, checkRole(['COMPRADOR']), pedidosController.comprobanteDemo);

// Obtener un pedido específico por ID (debe ir al final para que no colisione con otras rutas)
router.get('/:id', verifyToken, pedidosController.getPedidoById);

module.exports = router;
