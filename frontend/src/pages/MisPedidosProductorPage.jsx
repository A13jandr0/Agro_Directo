import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, LayoutDashboard, Sprout, PlusCircle, ShoppingBag, MapPin, BarChart2, User, Settings, LogOut, 
  Menu, Bell, Search, Download, ChevronDown, ChevronUp, Phone, Clock, FileCheck, FileX, CheckCircle2, Package, X
} from 'lucide-react';

const MisPedidosProductorPage = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Estados de Pedidos y Filtros
  const [activeTab, setActiveTab] = useState('Pendientes');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState('Todos');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Notificación Simulada
  const [showNotification, setShowNotification] = useState(false);

  // Mock Data
  const [pedidos, setPedidos] = useState([
    {
      id: 'AGD-001',
      comprador: 'Juan Pérez',
      celular: '+591 77712345',
      ciudad: 'Santa Cruz de la Sierra',
      producto: 'Tomate perita',
      cantidad: '3 quintales',
      fecha: '27 Abr 2026',
      hora: '10:45 AM',
      monto: 135,
      estado: 'Pendiente',
      comprobante: true
    },
    {
      id: 'AGD-002',
      comprador: 'Supermercados Ketal',
      celular: '+591 76099887',
      ciudad: 'Montero',
      producto: 'Maíz Amarillo Duro',
      cantidad: '50 quintales',
      fecha: '26 Abr 2026',
      hora: '03:20 PM',
      monto: 4750,
      estado: 'Confirmado',
      comprobante: true
    },
    {
      id: 'AGD-003',
      comprador: 'Maria López',
      celular: '+591 71122334',
      ciudad: 'Warnes',
      producto: 'Soya Grano de Oro',
      cantidad: '10 quintales',
      fecha: '25 Abr 2026',
      hora: '09:15 AM',
      monto: 1200,
      estado: 'Enviado',
      comprobante: true
    },
    {
      id: 'AGD-004',
      comprador: 'Agroindustrias Norte',
      celular: '+591 78844556',
      ciudad: 'Santa Cruz de la Sierra',
      producto: 'Yuca Blanca',
      cantidad: '20 arrobas',
      fecha: '24 Abr 2026',
      hora: '11:30 AM',
      monto: 600,
      estado: 'Entregado',
      comprobante: true
    },
    {
      id: 'AGD-005',
      comprador: 'Restaurante El Buen Sabor',
      celular: '+591 70011223',
      ciudad: 'Samaipata',
      producto: 'Cebolla Roja',
      cantidad: '2 quintales',
      fecha: '27 Abr 2026',
      hora: '08:00 AM',
      monto: 100,
      estado: 'Cancelado',
      comprobante: false
    }
  ]);

  // Simulación de nuevo pedido (Push Notification)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000); // Auto-cerrar en 5s
    }, 4000); // Aparece a los 4s de cargar la página
    return () => clearTimeout(timer);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Mi Dashboard', icon: LayoutDashboard, path: '/dashboard/productor' },
    { id: 'cosechas', label: 'Mis Cosechas', icon: Sprout, path: '/dashboard/productor/cosechas' },
    { id: 'publicar', label: 'Publicar Producto', icon: PlusCircle, path: '#' },
    { id: 'pedidos', label: 'Mis Pedidos', icon: ShoppingBag, path: '/dashboard/productor/pedidos', active: true },
    { id: 'finca', label: 'Mi Finca', icon: MapPin, path: '/dashboard/productor/finca' },
    { id: 'ingresos', label: 'Mis Ingresos', icon: BarChart2, path: '/dashboard/productor/ingresos' },
    { id: 'perfil', label: 'Mi Perfil', icon: User, path: '/dashboard/productor/perfil' },
    { id: 'configuracion', label: 'Configuración', icon: Settings, path: '#' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getStatusColor = (estado) => {
    switch(estado) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-700';
      case 'Confirmado': return 'bg-blue-100 text-blue-700';
      case 'Enviado': return 'bg-orange-100 text-orange-700';
      case 'Entregado': return 'bg-green-100 text-green-700';
      case 'Cancelado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleAction = (id, newStatus) => {
    setPedidos(pedidos.map(p => p.id === id ? { ...p, estado: newStatus } : p));
  };

  const filteredPedidos = pedidos.filter(p => {
    const matchTab = activeTab === 'Todos' || p.estado === activeTab;
    const matchSearch = p.comprador.toLowerCase().includes(searchQuery.toLowerCase());
    const matchProduct = productFilter === 'Todos' || p.producto === productFilter;
    // Omitimos filtrado real de fechas por simplicidad, pero están en el UI
    return matchTab && matchSearch && matchProduct;
  });

  const countByStatus = (status) => pedidos.filter(p => p.estado === status).length;
  const pendientesCount = countByStatus('Pendiente');

  return (
    <div className="flex h-screen bg-[#f9fafb] font-sans overflow-hidden relative">
      
      {/* SIMULACIÓN NOTIFICACIÓN PUSH */}
      {showNotification && (
        <div className="fixed top-20 right-4 lg:top-8 lg:right-8 z-[100] bg-white border border-gray-100 shadow-2xl rounded-xl p-4 w-80 animate-fade-in-down flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1D9E75]/10 flex items-center justify-center">
                <Bell className="w-4 h-4 text-[#1D9E75]" />
              </div>
              <h4 className="font-bold text-[#1a1a1a] text-sm">Nuevo pedido recibido</h4>
            </div>
            <button onClick={() => setShowNotification(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[#6b7280] leading-relaxed">
            <span className="font-semibold text-[#1a1a1a]">Carlos Gómez</span> solicitó 2 quintales de Soya Grano de Oro.
          </p>
          <button className="text-xs font-bold text-[#1D9E75] text-left mt-1 hover:underline">
            Ver pedido
          </button>
        </div>
      )}

      {/* OVERLAY PARA MÓVIL */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* SIDEBAR FIJO */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-[240px] bg-[#0F6E56] text-white z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none shrink-0`}>
        <div className="h-16 flex items-center gap-2 px-6 border-b border-white/10 shrink-0">
          <Leaf className="w-6 h-6 text-white" />
          <span className="text-xl font-bold tracking-wider">AgroDirecto</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button 
                    onClick={() => item.path !== '#' && navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${item.active ? 'bg-white/15 border-l-[3px] border-white text-white' : 'text-white/80 hover:bg-white/5 hover:text-white border-l-[3px] border-transparent'}`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-white/10 p-4 shrink-0">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-2 py-2 text-sm font-medium text-red-200 hover:text-red-100 hover:bg-white/5 rounded transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER TOP NAV */}
        <header className="h-[64px] bg-white shadow-sm flex items-center justify-between px-4 sm:px-8 z-10 shrink-0 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-500 hover:text-[#1D9E75]" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-[#1D9E75] transition-colors">
              <Bell className="w-5 h-5" />
              {pendientesCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
            </button>
            <button className="w-9 h-9 rounded-full bg-[#1D9E75] text-white flex items-center justify-center font-bold text-sm shadow-sm hover:ring-2 hover:ring-[#1D9E75]/30 transition-all">
              JP
            </button>
          </div>
        </header>

        {/* CONTENIDO SCROLLABLE */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {/* HEADER DE LA SECCIÓN */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#E1F5EE] flex items-center justify-center text-[#1D9E75] shrink-0">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-[#1a1a1a]">Mis Pedidos</h1>
                  {pendientesCount > 0 && (
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">
                      {pendientesCount} pendientes
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#6b7280]">Gestiona los pedidos de tus productos</p>
              </div>
            </div>
          </div>

          {/* TABS DE ESTADO */}
          <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-200 mb-6 pb-px">
            {[
              { id: 'Todos', label: 'Todos', count: pedidos.length, badgeClass: 'bg-gray-100 text-gray-600' },
              { id: 'Pendientes', label: 'Pendientes', count: pendientesCount, badgeClass: 'bg-yellow-100 text-yellow-700' },
              { id: 'Confirmados', label: 'Confirmados', count: countByStatus('Confirmado'), badgeClass: 'bg-blue-100 text-blue-700' },
              { id: 'Enviados', label: 'Enviados', count: countByStatus('Enviado'), badgeClass: 'bg-orange-100 text-orange-700' },
              { id: 'Entregados', label: 'Entregados', count: countByStatus('Entregado'), badgeClass: 'bg-green-100 text-green-700' },
              { id: 'Cancelados', label: 'Cancelados', count: countByStatus('Cancelado'), badgeClass: 'bg-red-100 text-red-700' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id 
                    ? 'border-[#1D9E75] text-[#1D9E75]' 
                    : 'border-transparent text-[#6b7280] hover:text-[#1a1a1a] hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tab.id === activeTab ? tab.badgeClass : 'bg-gray-100 text-gray-500'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* FILTROS (SEGUNDA FILA) */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Buscar por comprador..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                className="py-2 px-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] text-[#1a1a1a] min-w-[180px]"
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
              >
                <option value="Todos">Todos los productos</option>
                <option value="Tomate perita">Tomate perita</option>
                <option value="Maíz Amarillo Duro">Maíz Amarillo Duro</option>
                <option value="Soya Grano de Oro">Soya Grano de Oro</option>
                <option value="Yuca Blanca">Yuca Blanca</option>
              </select>
              <div className="flex items-center gap-2">
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="py-2 px-3 border border-gray-200 rounded-lg text-sm text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" title="Desde" />
                <span className="text-gray-400">-</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="py-2 px-3 border border-gray-200 rounded-lg text-sm text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" title="Hasta" />
              </div>
            </div>
            <button className="bg-white border border-gray-200 text-[#1a1a1a] py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-sm w-full lg:w-auto shrink-0 shadow-sm">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>

          {/* LISTA DE PEDIDOS */}
          {filteredPedidos.length > 0 ? (
            <div className="space-y-4">
              {filteredPedidos.map(pedido => {
                const isExpanded = expandedOrderId === pedido.id;
                return (
                  <div key={pedido.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200">
                    
                    {/* CABECERA (SIEMPRE VISIBLE) */}
                    <div 
                      className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors ${isExpanded ? 'bg-gray-50/50' : ''}`}
                      onClick={() => setExpandedOrderId(isExpanded ? null : pedido.id)}
                    >
                      {/* Izquierda */}
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-gray-400 mb-1 block">#{pedido.id}</span>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-[#1D9E75]" />
                          <h3 className="font-bold text-[#1a1a1a] text-base truncate">{pedido.comprador}</h3>
                        </div>
                        <p className="text-xs font-medium text-[#6b7280]">{pedido.fecha}</p>
                      </div>

                      {/* Centro */}
                      <div className="flex-1 flex flex-col md:items-center min-w-0 border-l-2 md:border-l-0 border-gray-100 pl-3 md:pl-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-[#1a1a1a] truncate">{pedido.producto} - <span className="text-[#6b7280] font-normal">{pedido.cantidad}</span></span>
                        </div>
                        <span className="text-lg font-bold text-[#1D9E75]">Bs. {pedido.monto}</span>
                      </div>

                      {/* Derecha */}
                      <div className="flex items-center justify-between md:justify-end gap-6 md:w-[180px] shrink-0 mt-2 md:mt-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(pedido.estado)}`}>
                          {pedido.estado}
                        </span>
                        <button className="text-gray-400 hover:text-[#1a1a1a] transition-colors p-1">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* DETALLE EXPANDIDO */}
                    {isExpanded && (
                      <div className="bg-[#f9fafb] border-t border-gray-100 p-5 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                          
                          {/* Info envío */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Detalles del Comprador</h4>
                            <div className="flex items-center gap-2 text-sm text-[#1a1a1a] font-medium">
                              <Phone className="w-4 h-4 text-gray-400" /> {pedido.celular}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#1a1a1a] font-medium">
                              <MapPin className="w-4 h-4 text-gray-400" /> {pedido.ciudad}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#1a1a1a] font-medium">
                              <Clock className="w-4 h-4 text-gray-400" /> {pedido.hora}
                            </div>
                          </div>

                          {/* Comprobante */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Comprobante de Pago</h4>
                            {pedido.comprobante ? (
                              <button className="flex items-center gap-2 text-sm text-[#1D9E75] font-bold hover:underline bg-[#1D9E75]/10 px-3 py-2 rounded-lg w-fit">
                                <FileCheck className="w-4 h-4" /> Ver comprobante PDF
                              </button>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-red-600 font-medium bg-red-50 px-3 py-2 rounded-lg w-fit">
                                <FileX className="w-4 h-4" /> Sin comprobante aún
                              </div>
                            )}
                          </div>
                          
                          {/* Acciones */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Acciones Disponibles</h4>
                            <div className="flex flex-col gap-2">
                              {pedido.estado === 'Pendiente' && (
                                <>
                                  <button onClick={() => handleAction(pedido.id, 'Confirmado')} className="w-full bg-[#1D9E75] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#0F6E56] transition-colors shadow-sm">Confirmar pedido</button>
                                  <button onClick={() => handleAction(pedido.id, 'Cancelado')} className="w-full bg-red-50 text-red-600 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors">Rechazar pedido</button>
                                </>
                              )}
                              {pedido.estado === 'Confirmado' && (
                                <button onClick={() => handleAction(pedido.id, 'Enviado')} className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors shadow-sm">Marcar como Enviado</button>
                              )}
                              {pedido.estado === 'Enviado' && (
                                <button onClick={() => handleAction(pedido.id, 'Entregado')} className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm">Marcar como Entregado</button>
                              )}
                              {pedido.estado === 'Entregado' && (
                                <div className="flex items-center gap-2 text-green-600 font-bold justify-center py-2 bg-green-50 rounded-lg">
                                  <CheckCircle2 className="w-5 h-5" /> Entregado con éxito
                                </div>
                              )}
                              {pedido.estado === 'Cancelado' && (
                                <div className="flex items-center gap-2 text-red-600 font-bold justify-center py-2 bg-red-50 rounded-lg">
                                  <FileX className="w-5 h-5" /> Pedido Cancelado
                                </div>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          ) : (
            /* ESTADO VACÍO */
            <div className="bg-white rounded-xl border border-gray-100 border-dashed py-20 flex flex-col items-center justify-center text-center mt-6">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-[#1a1a1a]">No tienes pedidos en este estado</h3>
              <p className="text-sm text-[#6b7280] mt-1">Cuando los compradores realicen pedidos, aparecerán aquí.</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default MisPedidosProductorPage;
