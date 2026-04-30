import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const DashboardCompradorPage = () => {
  const navigate = useNavigate();

  // Estados
  const [buyerState] = useState({
    nombre: 'Ana Belén',
    pedidosActivos: 2,
    comprasMes: 5,
    ahorro: 340,
    favoritos: 12
  });

  const [distanciaMaxima, setDistanciaMaxima] = useState(50);
  const [activeFiltro, setActiveFiltro] = useState('Por cercanía');

  // Datos simulados
  const filtrosRapidos = ['Por cercanía', 'Disponible hoy', 'Preventa', 'Mejor precio', 'Más valorados'];
  
  const categorias = [
    { id: 'Verduras', icon: '🍅' }, { id: 'Frutas', icon: '🍎' }, 
    { id: 'Granos', icon: '🌽' }, { id: 'Carnes', icon: '🥩' }, 
    { id: 'Lácteos', icon: '🥛' }, { id: 'Hierbas', icon: '🌿' }
  ];

  const productosDestacados = [
    { id: 1, nombre: 'Tomate Perita Orgánico', productor: 'Finca El Sol', calificacion: 4.8, distancia: 23, precio: 45, unidad: 'Caja', badge: 'Oferta', bg: 'bg-red-500' },
    { id: 2, nombre: 'Soya Grano de Oro', productor: 'Asociación Norte', calificacion: 4.5, distancia: 45, precio: 120, unidad: 'Quintal', badge: 'Preventa', bg: 'bg-yellow-500' },
    { id: 3, nombre: 'Maíz Amarillo Duro', productor: 'Hacienda Verde', calificacion: 4.9, distancia: 12, precio: 90, unidad: 'Quintal', badge: 'Nuevo', bg: 'bg-green-500' },
    { id: 4, nombre: 'Yuca Blanca Fresca', productor: 'Coop. Yapacaní', calificacion: 4.7, distancia: 60, precio: 30, unidad: 'Arroba', badge: '', bg: 'bg-gray-500' }
  ];

  const misPedidos = [
    { id: 'P-501', producto: '2 Cajas - Tomate Perita', productor: 'Finca El Sol', fecha: '27 Abr 2026', monto: 90, estado: 'En camino' },
    { id: 'P-499', producto: '1 Quintal - Soya Grano', productor: 'Asociación Norte', fecha: '25 Abr 2026', monto: 120, estado: 'Confirmado' },
    { id: 'P-480', producto: '5 Arrobas - Yuca Blanca', productor: 'Coop. Yapacaní', fecha: '20 Abr 2026', monto: 150, estado: 'Entregado' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getOrderStatusBadge = (estado) => {
    const colors = {
      'Confirmado': 'bg-blue-100 text-blue-800 border-blue-200',
      'En camino': 'bg-orange-100 text-orange-800 border-orange-200',
      'Entregado': 'bg-green-100 text-green-800 border-green-200'
    };
    return <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${colors[estado]}`}>{estado}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* HEADER PRINCIPAL */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🌱</span>
            <span className="text-xl font-black text-[#378ADD] tracking-wider hidden sm:block">AgroDirecto</span>
          </Link>

          {/* Buscador Central */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Buscar tomates, maíz, soya..." 
                className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-[#378ADD] focus:ring-2 focus:ring-blue-200 rounded-full py-2 pl-4 pr-10 outline-none transition-all"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#378ADD]">
                🔍
              </button>
            </div>
          </div>

          {/* Acciones de Usuario */}
          <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
            <button className="relative text-gray-500 hover:text-[#378ADD] transition-colors">
              <span className="text-2xl">🛒</span>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">3</span>
            </button>
            <button className="relative text-gray-500 hover:text-[#378ADD] transition-colors hidden sm:block">
              <span className="text-2xl">🔔</span>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold border border-blue-300">
                {buyerState.nombre.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-gray-700 hidden lg:block group-hover:text-[#378ADD]">{buyerState.nombre}</span>
            </div>
          </div>
        </div>

        {/* NAVEGACIÓN SECUNDARIA */}
        <div className="bg-[#378ADD] text-white">
          <div className="container mx-auto px-4 overflow-x-auto no-scrollbar">
            <ul className="flex space-x-1 sm:space-x-8 text-sm font-medium whitespace-nowrap">
              <li><a href="#" className="inline-block px-3 py-3 border-b-2 border-white font-bold">🏠 Inicio</a></li>
              <li><a href="#" className="inline-block px-3 py-3 border-b-2 border-transparent hover:text-blue-200 transition-colors">🛒 Marketplace</a></li>
              <li><a href="#" className="inline-block px-3 py-3 border-b-2 border-transparent hover:text-blue-200 transition-colors">📦 Mis Pedidos</a></li>
              <li><a href="#" className="inline-block px-3 py-3 border-b-2 border-transparent hover:text-blue-200 transition-colors">❤️ Favoritos</a></li>
              <li><a href="#" className="inline-block px-3 py-3 border-b-2 border-transparent hover:text-blue-200 transition-colors">👤 Mi Perfil</a></li>
            </ul>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* 1. SECCIÓN DE BÚSQUEDA Y FILTROS DESTACADA */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center md:text-left">¿Qué producto buscas hoy?</h2>
          
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Chips de filtros */}
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-bold uppercase mb-3">Filtros Rápidos</p>
              <div className="flex flex-wrap gap-2">
                {filtrosRapidos.map(filtro => (
                  <button 
                    key={filtro}
                    onClick={() => setActiveFiltro(filtro)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${activeFiltro === filtro ? 'bg-[#378ADD] text-white border-[#378ADD]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#378ADD]'}`}
                  >
                    {filtro}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider de distancia */}
            <div className="w-full md:w-64 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-semibold text-gray-700">Distancia máxima</span>
                <span className="font-bold text-[#378ADD]">{distanciaMaxima} km</span>
              </div>
              <input 
                type="range" min="5" max="200" step="5"
                value={distanciaMaxima} 
                onChange={(e) => setDistanciaMaxima(e.target.value)}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-[#378ADD]"
              />
              <p className="text-[10px] text-gray-500 mt-2 text-center">Mostrando productores a menos de {distanciaMaxima} km</p>
            </div>
          </div>
        </div>

        {/* 4. CATEGORÍAS RÁPIDAS */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {categorias.map(cat => (
            <button key={cat.id} className="bg-white flex flex-col items-center justify-center p-4 rounded-xl shadow-sm border border-gray-100 hover:border-[#378ADD] hover:shadow-md transition-all group">
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-sm font-semibold text-gray-700">{cat.id}</span>
            </button>
          ))}
        </div>

        {/* 2. TARJETAS DE MÉTRICAS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Pedidos activos', value: buyerState.pedidosActivos, icon: '📦', color: 'text-[#378ADD]' },
            { label: 'Compras del mes', value: buyerState.comprasMes, icon: '🛍️', color: 'text-green-600' },
            { label: 'Ahorro estimado', value: `Bs. ${buyerState.ahorro}`, icon: '💰', color: 'text-orange-600' },
            { label: 'Favoritos', value: buyerState.favoritos, icon: '❤️', color: 'text-red-500' }
          ].map((m, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="text-3xl">{m.icon}</div>
              <div>
                <p className={`text-xl font-black ${m.color}`}>{m.value}</p>
                <p className="text-xs text-gray-500 font-medium uppercase">{m.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 3. PRODUCTOS DESTACADOS */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Ofertas Cerca de Ti</h2>
            <a href="#" className="text-sm font-bold text-[#378ADD] hover:underline">Ver todos →</a>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productosDestacados.map(prod => (
              <div key={prod.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group relative flex flex-col">
                
                {/* Badge flotante */}
                {prod.badge && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold uppercase px-2 py-1 rounded z-10 shadow-sm">
                    {prod.badge}
                  </span>
                )}
                
                {/* Ícono de favorito */}
                <button className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition-colors">
                  ❤️
                </button>

                {/* Imagen Placeholder */}
                <div className="h-40 relative bg-green-50 overflow-hidden flex items-center justify-center">
                  <span className="text-6xl group-hover:scale-110 transition-transform">{categorias.find(c => prod.nombre.includes(c.id.slice(0,-1)))?.icon || '🌱'}</span>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1">{prod.nombre}</h3>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                    <span className="font-semibold">{prod.productor}</span>
                    <span>•</span>
                    <span className="text-yellow-500">⭐ {prod.calificacion}</span>
                  </div>

                  <p className="text-xs font-semibold text-gray-500 mb-4 bg-gray-50 inline-block px-2 py-1 rounded w-max">
                    📍 A {prod.distancia} km de ti
                  </p>

                  <div className="mt-auto flex justify-between items-end mb-4">
                    <div>
                      <p className="text-sm text-gray-400 line-through mb-0.5">Bs. {prod.precio + 15}</p>
                      <p className="text-xl font-black text-[#378ADD] leading-none">Bs. {prod.precio} <span className="text-xs font-normal text-gray-500">/{prod.unidad}</span></p>
                    </div>
                  </div>

                  <button className="w-full py-2 bg-white border-2 border-[#378ADD] text-[#378ADD] font-bold rounded-lg hover:bg-[#378ADD] hover:text-white transition-colors">
                    Agregar al carrito
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5 y 6. GRID INFERIOR (MAPA Y PEDIDOS) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* MIS PEDIDOS RECIENTES */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Mis Pedidos Recientes</h3>
              <a href="#" className="text-sm font-semibold text-[#378ADD] hover:underline">Ir a pedidos →</a>
            </div>
            <ul className="divide-y divide-gray-100">
              {misPedidos.map(pedido => (
                <li key={pedido.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-blue-500 font-bold text-xs shrink-0">
                      📦
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{pedido.producto}</p>
                      <p className="text-xs text-gray-500 mt-1">De: <span className="font-medium text-gray-700">{pedido.productor}</span> • {pedido.fecha}</p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto mt-2 sm:mt-0">
                    <span className="font-black text-gray-800">Bs. {pedido.monto}</span>
                    <div className="sm:mt-1">{getOrderStatusBadge(pedido.estado)}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* MAPA MINI */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">Productores Cercanos</h3>
            </div>
            <div className="flex-1 bg-gray-200 relative min-h-[250px] overflow-hidden" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cartographer.png")', backgroundSize: 'cover' }}>
              {/* Puntos verdes simulando productores en el mapa */}
              <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>
              <div className="absolute top-1/2 left-2/3 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
              <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
              
              {/* Punto central (Tú) */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg z-10 flex items-center justify-center">
                <span className="absolute w-8 h-8 bg-blue-400 rounded-full opacity-30 animate-ping"></span>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 text-center">
              <Link to="/mapa" className="text-sm font-bold text-[#378ADD] hover:underline flex items-center justify-center gap-1">
                Ver mapa completo <span>→</span>
              </Link>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default DashboardCompradorPage;
