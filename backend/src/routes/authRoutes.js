const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

// POST /api/auth/registro — Registro multitipo (US01)
router.post('/registro', authController.registro);

// POST /api/auth/login — Inicio de sesión
router.post('/login', authController.login);

// GET /api/auth/perfil — Perfil del usuario autenticado (cualquier rol)
router.get('/perfil', verifyToken, authController.getPerfil);

module.exports = router;
