import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const DashboardTransportistaPage = () => {
  const navigate = useNavigate();

  // Estados simulados
  const [transporterState] = useState({
    nombre: 'Carlos',
    estado: 'Verificado', // Puedes probar cambiando a 'Pendiente_Verificacion'
    zonaOperacion: 'Local - Santa Cruz de la Sierra',
    entregasMes: 12,
    ingresosMes: 1850,
    calificacion: 4.9,
    tiempoPromedio: 2.3
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDisponible, setIsDisponible] = useState(true);

  // Datos simulados
  const bolsaDeCarga = [
    { id: 'C-101', origen: 'Finca El Paraíso - Warnes', destino: 'Mercado Los Pozos - Santa Cruz', producto: 'Tomate perita', peso: '500 kg', distancia: 45, pago: 120, tiempoLimite: '14:00' },
    { id: 'C-102', origen: 'Asociación Norte - Montero', destino: 'Supermercado Fidalga - Equipetrol', producto: 'Soya en grano', peso: '2000 kg', distancia: 65, pago: 350, tiempoLimite: '16:30' },
    { id: 'C-103', origen: 'Hacienda Verde - La Guardia', destino: 'Mercado Abasto - Santa Cruz', producto: 'Maíz amarillo', peso: '800 kg', distancia: 25, pago: 80, tiempoLimite: '11:00' }
  ];

  const rutaActiva = {
    id: 'R-998',
    paradas: [
      { tipo: 'Recogida', lugar: 'Hacienda San Juan', completado: true },
      { tipo: 'Recogida', lugar: 'Quinta La Esperanza', completado: false },
      { tipo: 'Entrega', lugar: 'Mercado Mutualista', completado: false }
    ],
    progreso: 33
  };

  const historial = [
    { id: 'H-01', producto: 'Yuca y Plátano', ruta: 'Yapacaní → Abasto', pago: 450, calificacion: 5, fecha: 'Ayer' },
    { id: 'H-02', producto: 'Limón', ruta: 'Porongo → Los Pozos', pago: 150, calificacion: 4, fecha: '25 Abr' },
    { id: 'H-03', producto: 'Café (Grano)', ruta: 'Samaipata → Centro', pago: 550, calificacion: 5, fecha: '22 Abr' }
  ];

  const menuItems = [
    { icon: '🚛', label: 'Mi Dashboard', active: true },
    { icon: '📋', label: 'Bolsa de Carga', badge: '12', active: false },
    { icon: '🗺️', label: 'Mis Rutas', active: false },
    { icon: '📦', label: 'Entregas activas', active: false },
    { icon: '✅', label: 'Historial de entregas', active: false },
    { icon: '💰', label: 'Mis Ingresos', active: false },
    { icon: '👤', label: 'Mi Perfil', active: false }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      
      {/* OVERLAY PARA MÓVIL */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* SIDEBAR LOGÍSTICO */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-[#1e293b] text-gray-300 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col shadow-2xl`}>
        <div className="p-6 flex items-center justify-between border-b border-gray-700 bg-gray-900">
          <div className="flex items-center gap-2">
            <span className="text-3xl text-[#BA7517]">🚚</span>
            <span className="text-xl font-black tracking-wider uppercase text-white">AgroDirecto</span>
          </div>
          <button className="lg:hidden text-2xl text-gray-400" onClick={() => setIsSidebarOpen(false)}>✕</button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-2 px-4">
            {menuItems.map((item, idx) => (
              <li key={idx}>
                <a href="#" className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${item.active ? 'bg-[#BA7517] text-white shadow-lg shadow-orange-900/20 font-bold' : 'hover:bg-gray-800 hover:text-white'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    {item.label}
                  </div>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{item.badge}</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-6 border-t border-gray-700 bg-gray-800">
          <button onClick={handleLogout} className="flex items-center gap-3 text-sm font-semibold text-gray-400 hover:text-red-400 transition-colors w-full">
            <span>🚪</span> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER SUPERIOR */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-8 z-10">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-500 hover:text-[#BA7517]" onClick={() => setIsSidebarOpen(true)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <div className="hidden sm:flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-800">Hola, {transporterState.nombre}</h1>
              {transporterState.estado === 'Verificado' ? (
                <span className="bg-green-100 text-green-800 text-[10px] font-black uppercase px-2 py-1 rounded-full border border-green-200 flex items-center gap-1"><span>✓</span> Verificado</span>
              ) : (
                <span className="bg-orange-100 text-orange-800 text-[10px] font-black uppercase px-2 py-1 rounded-full border border-orange-200 flex items-center gap-1"><span>⏱️</span> En Revisión</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <button className="relative text-gray-500 hover:text-[#BA7517] transition-colors">
              <span className="text-2xl">🔔</span>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#BA7517] rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="w-10 h-10 rounded-full bg-orange-100 text-[#BA7517] flex items-center justify-center font-bold border-2 border-[#BA7517] overflow-hidden">
              <img src="https://via.placeholder.com/150/BA7517/FFFFFF?text=TR" alt="avatar" />
            </div>
          </div>
        </header>

        {/* ÁREA SCROLLABLE */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-100">
          
          {/* 1. BANNER DE ALERTA PENDIENTE VERIFICACIÓN */}
          {transporterState.estado === 'Pendiente_Verificacion' && (
            <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-xl shadow-sm flex items-start gap-4 mb-6">
              <span className="text-3xl text-[#BA7517]">🔒</span>
              <div>
                <h3 className="text-[#BA7517] font-bold text-lg">Cuenta en verificación</h3>
                <p className="text-orange-900 mt-1">Estamos validando tu licencia y los documentos del vehículo. Este proceso suele tardar de <strong>24 a 48 horas hábiles</strong>. No podrás aceptar rutas en la Bolsa de Carga hasta que el proceso concluya.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            
            {/* 2. ESTADO DEL TURNO (TOGGLE CENTRAL) */}
            <div className="xl:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col justify-center items-center text-center relative overflow-hidden">
              <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-gray-200 via-[#BA7517] to-gray-200 opacity-50"></div>
              
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Estado de Operación</h3>
              
              <label className="relative inline-flex items-center cursor-pointer mb-6 scale-150">
                <input type="checkbox" className="sr-only peer" checked={isDisponible} onChange={() => setIsDisponible(!isDisponible)} disabled={transporterState.estado === 'Pendiente_Verificacion'} />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#BA7517]"></div>
              </label>

              <h2 className={`text-2xl font-black mb-2 ${isDisponible ? 'text-[#BA7517]' : 'text-gray-400'}`}>
                {isDisponible ? 'DISPONIBLE PARA VIAJES' : 'NO DISPONIBLE'}
              </h2>
              
              <p className="text-sm text-gray-500 mb-6">
                {isDisponible ? 'Apareces activo en la Bolsa de Carga y puedes recibir ofertas de rutas.' : 'Estás oculto. No recibirás nuevas notificaciones de rutas.'}
              </p>

              <div className="bg-gray-50 border border-gray-100 rounded-lg py-2 px-4 w-full flex items-center justify-center gap-2">
                <span>📍</span>
                <span className="text-sm font-semibold text-gray-700">{transporterState.zonaOperacion}</span>
              </div>
            </div>

            {/* 3. TARJETAS DE MÉTRICAS */}
            <div className="xl:col-span-2 grid grid-cols-2 gap-4">
              {[
                { label: 'Entregas mes', value: transporterState.entregasMes, icon: '🚛', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
                { label: 'Ingresos mes', value: `Bs. ${transporterState.ingresosMes}`, icon: '💰', color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
                { label: 'Calificación', value: `⭐ ${transporterState.calificacion}`, icon: '🏆', color: 'text-[#BA7517]', bg: 'bg-orange-50 border-orange-100' },
                { label: 'Tiempo prom.', value: `${transporterState.tiempoPromedio} hrs`, icon: '⏱️', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' }
              ].map((metric, idx) => (
                <div key={idx} className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${metric.bg}`}>
                      {metric.icon}
                    </div>
                  </div>
                  <div>
                    <p className={`text-2xl sm:text-3xl font-black ${metric.color} mb-1`}>{metric.value}</p>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{metric.label}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* 4. BOLSA DE CARGA (Ocupa 2 columnas) */}
            <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-gray-800 text-lg">Bolsa de Carga</h3>
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full border border-red-200">3 Nuevas</span>
                </div>
                <a href="#" className="text-sm font-semibold text-[#BA7517] hover:underline">Ver todas →</a>
              </div>
              
              <div className="p-0">
                <ul className="divide-y divide-gray-100">
                  {bolsaDeCarga.map(carga => (
                    <li key={carga.id} className="p-6 hover:bg-orange-50/30 transition-colors">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                            <span>Ruta de {carga.distancia} km</span>
                            <span>•</span>
                            <span className="text-red-500">Disponible hasta las {carga.tiempoLimite}</span>
                          </div>
                          
                          <div className="relative pl-6 space-y-4 mb-4">
                            {/* Línea conectora */}
                            <div className="absolute top-2 bottom-2 left-[9px] w-0.5 bg-gray-200"></div>
                            
                            <div className="relative">
                              <div className="absolute -left-[27px] top-1 w-3 h-3 bg-white border-2 border-blue-500 rounded-full z-10"></div>
                              <p className="font-bold text-gray-800 text-sm leading-none">{carga.origen}</p>
                            </div>
                            
                            <div className="relative">
                              <div className="absolute -left-[27px] top-1 w-3 h-3 bg-white border-2 border-[#BA7517] rounded-full z-10"></div>
                              <p className="font-bold text-gray-800 text-sm leading-none">{carga.destino}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm bg-gray-50 p-2 rounded-lg inline-flex">
                            <span className="font-medium text-gray-700">📦 {carga.producto}</span>
                            <span className="text-gray-300">|</span>
                            <span className="font-black text-gray-800">⚖️ {carga.peso}</span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto">
                          <div className="text-left sm:text-right mb-0 sm:mb-4">
                            <p className="text-xs text-gray-500 font-bold uppercase">Pago ofrecido</p>
                            <p className="text-2xl font-black text-[#BA7517]">Bs. {carga.pago}</p>
                          </div>
                          <button 
                            disabled={transporterState.estado === 'Pendiente_Verificacion'}
                            className="bg-[#BA7517] hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Aceptar Ruta
                          </button>
                        </div>

                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* COLUMNA DERECHA */}
            <div className="space-y-6">
              
              {/* 5. RUTA ACTIVA */}
              <div className="bg-orange-50 border-2 border-[#BA7517] rounded-2xl overflow-hidden shadow-lg shadow-orange-900/5">
                <div className="bg-[#BA7517] px-5 py-3 flex justify-between items-center text-white">
                  <h3 className="font-bold flex items-center gap-2"><span>🗺️</span> Ruta Activa</h3>
                  <span className="text-xs font-black bg-white/20 px-2 py-1 rounded">{rutaActiva.id}</span>
                </div>
                
                {/* Mini mapa placeholder */}
                <div className="h-32 bg-gray-300 relative" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cartographer.png")', backgroundSize: 'cover' }}>
                  {/* Línea de ruta simulada */}
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    <path d="M 20 20 Q 80 50 150 100 T 280 80" fill="transparent" stroke="#BA7517" strokeWidth="4" strokeDasharray="5,5" className="animate-pulse" />
                  </svg>
                  <div className="absolute top-4 left-4 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow"></div>
                  <div className="absolute bottom-6 right-8 w-6 h-6 bg-[#BA7517] text-white flex items-center justify-center rounded-full text-xs font-bold shadow-lg animate-bounce">📍</div>
                </div>

                <div className="p-5 bg-white">
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-[#BA7517]">Progreso</span>
                      <span className="text-gray-500">{rutaActiva.progreso}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#BA7517] h-2 rounded-full" style={{ width: `${rutaActiva.progreso}%` }}></div>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6 relative">
                    <div className="absolute top-2 bottom-4 left-[11px] w-0.5 bg-gray-200"></div>
                    {rutaActiva.paradas.map((parada, idx) => (
                      <li key={idx} className={`relative pl-8 text-sm ${parada.completado ? 'text-gray-400' : 'text-gray-800'}`}>
                        <div className={`absolute left-0 top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 bg-white ${parada.completado ? 'border-green-500 text-green-500' : 'border-[#BA7517] text-[#BA7517]'}`}>
                          {parada.completado ? <span className="text-[10px]">✓</span> : <span className="w-2 h-2 bg-[#BA7517] rounded-full"></span>}
                        </div>
                        <p className="font-bold leading-tight">{parada.lugar}</p>
                        <p className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">{parada.tipo}</p>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-2">
                    <button className="w-full py-3 bg-[#1D9E75] text-white font-bold rounded-lg shadow hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                      <span>✓</span> Marcar como recogido
                    </button>
                    <button className="w-full py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      <span>📍</span> Abrir en Google Maps
                    </button>
                  </div>
                </div>
              </div>

              {/* 6. HISTORIAL RECIENTE */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">Historial Reciente</h3>
                  <a href="#" className="text-sm font-semibold text-[#BA7517] hover:underline">Ver todo →</a>
                </div>
                <ul className="divide-y divide-gray-100">
                  {historial.map(hist => (
                    <li key={hist.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{hist.producto}</p>
                        <p className="text-xs text-gray-500 mt-1">{hist.ruta} • {hist.fecha}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-[#BA7517] text-sm">Bs. {hist.pago}</p>
                        <p className="text-[10px] text-yellow-500 mt-1">{"⭐".repeat(hist.calificacion)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default DashboardTransportistaPage;
