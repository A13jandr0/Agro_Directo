// ============================================================
// Server Entry Point — AgroDirecto Santa Cruz
// ============================================================
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./src/db');

// Rutas
const authRoutes = require('./src/routes/authRoutes');
const producerRoutes = require('./src/routes/producerRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();

// Conectar a SQL Server
connectDB();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Montaje de Rutas ──────────────────────────────────
// US01: Autenticación (registro multitipo + login)
app.use('/api/auth', authRoutes);

// US02: Productor (geolocalización + perfil)
app.use('/api/productor', producerRoutes);

// US04: Subida de documentos por usuarios
app.use('/api/usuarios', uploadRoutes);

// US04: Panel de verificación del administrador
app.use('/api/admin', adminRoutes);

// ── Health check ──────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── Iniciar servidor ──────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 AgroDirecto API corriendo en http://localhost:${PORT}`);
    console.log('──────────────────────────────────────');
    console.log('  POST   /api/auth/registro');
    console.log('  POST   /api/auth/login');
    console.log('  PUT    /api/productor/ubicacion');
    console.log('  GET    /api/productor/perfil');
    console.log('  PUT    /api/productor/perfil');
    console.log('  POST   /api/usuarios/documentos');
    console.log('  GET    /api/admin/verificaciones');
    console.log('  PUT    /api/admin/verificaciones/:id');
    console.log('──────────────────────────────────────');
});
