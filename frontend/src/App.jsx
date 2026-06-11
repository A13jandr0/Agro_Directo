import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import RegisterWizardPage from './pages/RegisterWizardPage';
import FincaMap from './components/FincaMap';
import ProducerProfile from './components/ProducerProfile';
import PanelAdminPage from './pages/PanelAdminPage';
import LoginPage from './pages/LoginPage';
import DashboardProductorPage from './pages/DashboardProductorPage';
import DashboardCompradorPage from './pages/DashboardCompradorPage';
import PanelTransportistaPage from './pages/PanelTransportistaPage';
import MisCosechasPage from './pages/MisCosechasPage';
import MiFincaPage from './pages/MiFincaPage';
import PedidosProductorPage from './pages/PedidosProductorPage';
import MisIngresosPage from './pages/MisIngresosPage';
import MiPerfilProductorPage from './pages/MiPerfilProductorPage';
import MiPerfilCompradorPage from './pages/MiPerfilCompradorPage';
import MarketplacePage from './pages/MarketplacePage';
import ProductoDetallePage from './pages/ProductoDetallePage';
import MainLayout from './components/MainLayout';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import CarritoPage from './pages/CarritoPage';
import PagoQRPage from './pages/PagoQRPage';
import MisPedidosPage from './pages/MisPedidosPage';
import HojaDeRutaPage from './pages/HojaDeRutaPage';
import BolsaCargaPage from './pages/BolsaCargaPage';
import PerfilTransportistaPage from './pages/PerfilTransportistaPage';
import HistorialTransaccionesPage from './pages/HistorialTransaccionesPage';

// Admin pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminVerificacionesPage from './pages/AdminVerificacionesPage';
import AdminPedidosPage from './pages/AdminPedidosPage';
import AdminConfiguracionPage from './pages/AdminConfiguracionPage';

import MapaProductoresPage from './pages/MapaProductoresPage';

// Rutas donde NO se muestra el navbar global
const HIDDEN_NAVBAR_ROUTES = [
  '/login', '/', '/registro',
  '/dashboard/productor', '/dashboard/comprador', '/dashboard/transportista',
  '/dashboard/productor/cosechas', '/dashboard/productor/finca',
  '/dashboard/productor/pedidos', '/dashboard/productor/ingresos',
  '/dashboard/productor/perfil', '/admin/verificaciones', '/marketplace',
  '/carrito', '/dashboard/comprador/mis-pedidos', '/dashboard/comprador/perfil', '/dashboard/transportista/bolsa',
  '/dashboard/transportista/hoja-de-ruta'
];

const NavbarWrapper = () => {
  const location = useLocation();
  
  // Ocultar en rutas específicas o que empiecen con /producto o /dashboard
  const isHidden = HIDDEN_NAVBAR_ROUTES.includes(location.pathname) || 
                   location.pathname.startsWith('/producto/') ||
                   location.pathname.startsWith('/dashboard/');

  if (isHidden) return null;

  return (
    <nav className="text-white shadow-md z-50 relative bg-emerald-700">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold tracking-wider flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 1c1 2 2 4.5 2 8 0 5.5-4.78 11-10 11Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
          AgroDirecto
        </Link>
        <ul className="flex space-x-6 text-sm font-medium items-center">
          <li><Link to="/registro" className="hover:opacity-80 transition-opacity">Registro</Link></li>
          <li><Link to="/mapa" className="hover:opacity-80 transition-opacity">Mapa Finca</Link></li>
          <li><Link to="/perfil" className="hover:opacity-80 transition-opacity">Perfil Confianza</Link></li>
          <li><Link to="/admin" className="hover:opacity-80 transition-opacity">Admin</Link></li>
          <li>
            <Link to="/login" className="bg-white text-emerald-700 px-4 py-1.5 rounded-full transition-colors font-bold shadow-sm hover:bg-emerald-50">
              Iniciar Sesión
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

function App() {
  const mockProducer = {
    id: 1,
    nombreCompleto: 'Juan Pérez Mamani',
    nombreFinca: 'Hacienda El Sol',
    municipio: 'Montero',
    provincia: 'Obispo Santistevan',
    celular: '+591 77711122',
    correo: 'juan.productor@mail.com',
    calificacionPromedio: 4.5,
    aniosExperiencia: 10,
    ventasCompletadas: 24,
    tipoProductor: 'Individual',
    estado: 'PENDIENTE_VERIFICACION'
  };

  const mockProducts = [
    { id: 101, nombre: 'Soya Grano de Oro', precio: 120, unidadMedida: 'Quintal', stockAcumulado: 50, categoria: 'Granos' },
    { id: 102, nombre: 'Sorgo Forrajero', precio: 80, unidadMedida: 'Quintal', stockAcumulado: 120, categoria: 'Cereales' },
    { id: 103, nombre: 'Tomate Santa Cruz', precio: 30, unidadMedida: 'Caja', stockAcumulado: 15, categoria: 'Hortalizas' },
    { id: 104, nombre: 'Maíz Amarillo Duro', precio: 95, unidadMedida: 'Quintal', stockAcumulado: 200, categoria: 'Granos' }
  ];

  React.useEffect(() => {
    if (!localStorage.getItem('productorQR')) {
      localStorage.setItem('productorQR', JSON.stringify({
        banco: "BNB",
        titular: "Ramiro Flores Vaca",
        qrImageUrl: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=200&h=200&fit=crop"
      }));
    }
  }, []);

  return (
    <ToastProvider>
      <NotificationProvider>
        <CartProvider>
          <Router>
          <div className="min-h-screen bg-[#fafbfc] flex flex-col">
            <NavbarWrapper />

          <main className="flex-grow flex flex-col">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/registro" element={<RegisterWizardPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/mapa" element={<div className="container mx-auto p-4 md:p-8"><FincaMap /></div>} />
              <Route path="/perfil" element={<div className="container mx-auto p-4 md:p-8"><ProducerProfile producer={mockProducer} products={mockProducts} /></div>} />
              <Route path="/admin/verificaciones" element={<PanelAdminPage />} />

              <Route element={<MainLayout />}>
                <Route path="/dashboard/productor" element={<DashboardProductorPage />} />
                <Route path="/dashboard/productor/cosechas" element={<MisCosechasPage />} />
                <Route path="/dashboard/productor/finca" element={<MiFincaPage />} />
                <Route path="/dashboard/productor/pedidos" element={<PedidosProductorPage />} />
                <Route path="/dashboard/productor/ingresos" element={<MisIngresosPage />} />
                <Route path="/dashboard/productor/perfil" element={<MiPerfilProductorPage />} />
                <Route path="/dashboard/comprador" element={<DashboardCompradorPage />} />
                <Route path="/dashboard/comprador/mapa" element={<MapaProductoresPage />} />
                <Route path="/dashboard/transportista" element={<PanelTransportistaPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/producto/:id" element={<ProductoDetallePage />} />
                <Route path="/carrito" element={<CarritoPage />} />
                <Route path="/dashboard/comprador/pago-qr/:pedidoId" element={<PagoQRPage />} />
                <Route path="/dashboard/comprador/mis-pedidos" element={<MisPedidosPage />} />
                <Route path="/dashboard/comprador/perfil" element={<MiPerfilCompradorPage />} />
                <Route path="/dashboard/transportista/perfil" element={<PerfilTransportistaPage />} />
                <Route path="/dashboard/transportista/bolsa" element={<BolsaCargaPage />} />
                <Route path="/dashboard/transportista/hoja-de-ruta" element={<HojaDeRutaPage />} />
                <Route path="/dashboard/historial" element={<HistorialTransaccionesPage />} />
                
                {/* Admin Routes */}
                <Route path="/dashboard/admin" element={<AdminDashboardPage />} />
                <Route path="/dashboard/admin/verificaciones" element={<AdminVerificacionesPage />} />
                <Route path="/dashboard/admin/pedidos" element={<AdminPedidosPage />} />
                <Route path="/dashboard/admin/bi" element={<AdminDashboardPage />} />
                <Route path="/dashboard/admin/configuracion" element={<AdminConfiguracionPage />} />
              </Route>
            </Routes>
          </main>

          <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-500 text-center py-5 text-xs mt-auto font-medium tracking-wide">
            <span className="text-slate-400 font-bold">AgroDirecto</span> Santa Cruz &copy; 2026 — Plataforma Agropecuaria Digital
          </footer>
        </div>
      </Router>
        </CartProvider>
      </NotificationProvider>
    </ToastProvider>
  );
}

export default App;
