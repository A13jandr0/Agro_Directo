// ============================================================
// Server Entry Point — AgroDirecto Santa Cruz
// ============================================================
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { connectDB } = require('./src/db');
const socketConfig = require('./src/socket');

// Rutas
const authRoutes = require('./src/routes/authRoutes');
const producerRoutes = require('./src/routes/producerRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const cosechasRoutes = require('./src/routes/cosechasRoutes');
const marketplaceRoutes = require('./src/routes/marketplaceRoutes');
const marketplaceController = require('./src/controllers/marketplaceController');
const preciosRoutes = require('./src/routes/preciosRoutes');
const pedidosRoutes = require('./src/routes/pedidosRoutes');
const biRoutes = require('./src/routes/biRoutes');
const historyRoutes = require('./src/routes/historyRoutes');
const notificacionesRoutes = require('./src/routes/notificacionesRoutes');
const transportistaRoutes = require('./src/routes/transportistaRoutes');
const solicitudesTransporteRoutes = require('./src/routes/solicitudesTransporteRoutes');

const app = express();
const server = http.createServer(app);

// Inicializar WebSockets
socketConfig.init(server);

// Conectar a SQL Server
connectDB();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/documentos', express.static(path.join(__dirname, 'public/documentos')));
app.use('/docs', express.static(path.join(__dirname, 'uploads'))); // en caso de que existan docs en la anterior

// ── Montaje de Rutas ──────────────────────────────────
// US01: Autenticación (registro multitipo + login)
app.use('/api/auth', authRoutes);

// US02: Productor (geolocalización + perfil)
app.use('/api/productor', producerRoutes);
app.use('/api/productores', producerRoutes);

// US04: Subida de documentos por usuarios
app.use('/api/usuarios', uploadRoutes);

// US04: Panel de verificación del administrador
app.use('/api/admin', adminRoutes);

// US05 y US06: Gestión de Cosechas (Productor)
app.use('/api/cosechas', cosechasRoutes);

// US07: Marketplace Inteligente (Comprador)
app.use('/api/marketplace', marketplaceRoutes);

// US09: Comparador de Precios Abasto
app.use('/api/precios-abasto', preciosRoutes);

// US10-US11: Gestión de Pedidos
app.use('/api/pedidos', pedidosRoutes);

// US19-US20: Inteligencia de Negocio (BI)
app.use('/api/bi', biRoutes);

// US08: Alertas de estacionalidad y notificaciones generales
app.use('/api/notificaciones', notificacionesRoutes);

// US14: Historial de Transacciones
app.use('/api/historial', historyRoutes);

// Panel del Transportista
app.use('/api/transportista', transportistaRoutes);

// Solicitudes de Transporte
app.use('/api/solicitudes-transporte', solicitudesTransporteRoutes);

// ── Health check ──────────────────────────────────────
const { getPool } = require('./src/db');
app.get('/api/health', async (req, res) => {
    try {
        const pool = await getPool();
        await pool.request().query('SELECT 1');
        res.json({ 
            status: "OK", 
            timestamp: new Date(), 
            db: "connected" 
        });
    } catch (error) {
        res.status(500).json({ 
            status: "ERROR", 
            timestamp: new Date(), 
            db: "disconnected",
            error: error.message 
        });
    }
});

// ── DB Schema verification ────────────────────────────
app.get('/api/db-check', async (req, res) => {
    try {
        const pool = await getPool();
        const sql = require('mssql');
        
        const tables = ['usuarios', 'perfil_productor', 'Cosechas', 'Pedidos'];
        const results = {};
        
        for (const table of tables) {
            const result = await pool.request()
                .query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${table}'`);
            results[table] = result.recordset.length > 0 ? 'EXISTS' : 'MISSING';
        }
        
        res.json({
            status: "DB_CHECK",
            timestamp: new Date(),
            tables: results
        });
    } catch (error) {
        res.status(500).json({
            status: "DB_CHECK_ERROR",
            timestamp: new Date(),
            error: error.message
        });
    }
});


// ── Iniciar servidor ──────────────────────────────────
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
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
    console.log('  -- Épica 2 --');
    console.log('  POST   /api/cosechas');
    console.log('  GET    /api/cosechas/mi-catalogo');
    console.log('  GET    /api/marketplace/productos');
    console.log('  GET    /api/marketplace/productores');
    console.log('  GET    /api/precios-abasto?producto=X');
    console.log('  -- Épica 3 --');
    console.log('  POST   /api/pedidos');
    console.log('  GET    /api/pedidos/productor');
    console.log('  PUT    /api/pedidos/:id/confirmar');
    console.log('  PUT    /api/pedidos/:id/rechazar');
    console.log('──────────────────────────────────────');
});
