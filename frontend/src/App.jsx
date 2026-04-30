import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import RegisterWizardPage from './pages/RegisterWizardPage';
import FincaMap from './components/FincaMap';
import ProducerProfile from './components/ProducerProfile';
import AdminVerification from './pages/AdminVerification';
import LoginPage from './pages/LoginPage';
import DashboardProductorPage from './pages/DashboardProductorPage';
import DashboardCompradorPage from './pages/DashboardCompradorPage';
import DashboardTransportistaPage from './pages/DashboardTransportistaPage';
import MisCosechasPage from './pages/MisCosechasPage';
import MiFincaPage from './pages/MiFincaPage';
import MisPedidosProductorPage from './pages/MisPedidosProductorPage';
import MisIngresosPage from './pages/MisIngresosPage';
import MiPerfilProductorPage from './pages/MiPerfilProductorPage';

// Rutas donde NO se muestra el navbar global
const HIDDEN_NAVBAR_ROUTES = [
  '/login', '/', '/registro',
  '/dashboard/productor', '/dashboard/comprador', '/dashboard/transportista',
  '/dashboard/productor/cosechas', '/dashboard/productor/finca',
  '/dashboard/productor/pedidos', '/dashboard/productor/ingresos',
  '/dashboard/productor/perfil'
];

const NavbarWrapper = () => {
  const location = useLocation();
  if (HIDDEN_NAVBAR_ROUTES.includes(location.pathname)) return null;

  return (
    <nav className="text-white shadow-md z-50 relative bg-emerald-700">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold tracking-wider flex items-center gap-2">
          🌱 AgroDirecto
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
  // Mock Data para Perfil de Confianza (US03)
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

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <NavbarWrapper />

        <main className="flex-grow flex flex-col">
          <Routes>
            {/* Sprint 1 — Flujos Principales */}
            <Route path="/" element={<RegisterWizardPage />} />
            <Route path="/registro" element={<RegisterWizardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/mapa" element={<div className="container mx-auto p-4 md:p-8"><FincaMap /></div>} />
            <Route path="/perfil" element={<div className="container mx-auto p-4 md:p-8"><ProducerProfile producer={mockProducer} products={mockProducts} /></div>} />
            <Route path="/admin" element={<div className="container mx-auto p-4 md:p-8"><AdminVerification /></div>} />

            {/* Dashboards existentes */}
            <Route path="/dashboard/productor" element={<DashboardProductorPage />} />
            <Route path="/dashboard/productor/cosechas" element={<MisCosechasPage />} />
            <Route path="/dashboard/productor/finca" element={<MiFincaPage />} />
            <Route path="/dashboard/productor/pedidos" element={<MisPedidosProductorPage />} />
            <Route path="/dashboard/productor/ingresos" element={<MisIngresosPage />} />
            <Route path="/dashboard/productor/perfil" element={<MiPerfilProductorPage />} />
            <Route path="/dashboard/comprador" element={<DashboardCompradorPage />} />
            <Route path="/dashboard/transportista" element={<DashboardTransportistaPage />} />
          </Routes>
        </main>

        <footer className="bg-gray-800 text-gray-400 text-center py-4 text-xs mt-auto">
          AgroDirecto Santa Cruz © 2026 - Sprint 1
        </footer>
      </div>
    </Router>
  );
}

export default App;
