import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, 
  LayoutDashboard, 
  Sprout, 
  PlusCircle, 
  ShoppingBag, 
  MapPin, 
  BarChart2, 
  User, 
  Settings, 
  LogOut, 
  AlertTriangle, 
  DollarSign, 
  Package, 
  Star, 
  Upload, 
  Edit2, 
  Trash2, 
  Bell,
  Menu,
  X
} from 'lucide-react';
import axios from 'axios';

const DashboardProductorPage = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [serverError, setServerError] = useState('');

  // Datos del productor autenticado
  const [productor, setProductor] = useState({
    nombre: '',
    estado: 'PENDIENTE_VERIFICACION',
    lat: null,
    lng: null
  });
  const [isLoaded, setIsLoaded] = useState(false);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/usuarios/mi-perfil', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data;
        setProductor({
          nombre: data.nombre_completo || '',
          estado: data.estado || 'PENDIENTE_VERIFICACION',
          lat: data.latitud != null ? data.latitud : null,
          lng: data.longitud != null ? data.longitud : null
        });
      } catch (error) {
        console.error("Error fetching dashboard profile", error);
        setServerError(error.response?.data?.error || 'Error en el servidor al cargar los datos');
      } finally {
        setIsLoaded(true);
      }
    };
    fetchProfile();
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const [metricas] = useState({
    ingresosMes: 'Bs. 2,450',
    pedidosActivos: 3,
    productosPublicados: 7,
    calificacionPromedio: 4.8
  });

  const [productos] = useState([
    { id: 1, nombre: 'Soya Grano de Oro', categoria: 'Granos', precio: 120, stock: 50, estado: 'Activo' },
    { id: 2, nombre: 'Tomate Santa Cruz', categoria: 'Hortalizas', precio: 45, stock: 15, estado: 'Agotado' },
    { id: 3, nombre: 'Maíz Amarillo Duro', categoria: 'Granos', precio: 95, stock: 200, estado: 'Activo' },
    { id: 4, nombre: 'Sorgo Forrajero', categoria: 'Cereales', precio: 80, stock: 120, estado: 'Activo' },
    { id: 5, nombre: 'Yuca Blanca', categoria: 'Tubérculos', precio: 30, stock: 0, estado: 'Pendiente' },
  ]);

  const [pedidos] = useState([
    { id: 'PD-001', comprador: 'Supermercados Ketal', producto: '20 qq - Soya Grano', fecha: '27 Abr 2026', monto: 'Bs. 2,400', estado: 'Pendiente' },
    { id: 'PD-002', comprador: 'Maria Lopez', producto: '5 cajas - Tomate', fecha: '26 Abr 2026', monto: 'Bs. 225', estado: 'Pagado' },
    { id: 'PD-003', comprador: 'Agroindustrias Norte', producto: '50 qq - Maíz Amarillo', fecha: '25 Abr 2026', monto: 'Bs. 4,750', estado: 'Enviado' },
  ]);

  const menuItems = [
    { id: 'dashboard', label: 'Mi Dashboard', icon: LayoutDashboard, active: true, path: '/dashboard/productor' },
    { id: 'cosechas', label: 'Mis Cosechas', icon: Sprout, active: false, path: '/dashboard/productor/cosechas' },
    { id: 'publicar', label: 'Publicar Producto', icon: PlusCircle, active: false, path: '#' },
    { id: 'pedidos', label: 'Mis Pedidos', icon: ShoppingBag, active: false, path: '/dashboard/productor/pedidos' },
    { id: 'finca', label: 'Mi Finca', icon: MapPin, active: false, path: '/dashboard/productor/finca' },
    { id: 'ingresos', label: 'Mis Ingresos', icon: BarChart2, active: false, path: '/dashboard/productor/ingresos' },
    { id: 'perfil', label: 'Mi Perfil', icon: User, active: false, path: '/dashboard/productor/perfil' },
    { id: 'configuracion', label: 'Configuración', icon: Settings, active: false, path: '#' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const renderBadge = (estado) => {
    switch(estado) {
      case 'Activo':
      case 'Pagado':
      case 'Entregado':
        return <span className="bg-[#1D9E75]/10 text-[#1D9E75] px-2 py-1 rounded-full text-xs font-semibold">● {estado}</span>;
      case 'Agotado':
      case 'Pendiente':
        if(estado === 'Agotado') {
            return <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-semibold">● {estado}</span>;
        }
        return <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs font-semibold">● {estado}</span>;
      case 'Enviado':
        return <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-semibold">● {estado}</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-semibold">● {estado}</span>;
    }
  };

  return (
    <div className="flex h-screen bg-[#f9fafb] font-sans overflow-hidden">
      
      {/* OVERLAY PARA MÓVIL */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* SIDEBAR FIJO */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-[240px] bg-[#0F6E56] text-white z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none`}>
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
        
        {/* HEADER DE 64PX */}
        <header className="h-[64px] bg-white shadow-sm flex items-center justify-between px-4 sm:px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-500 hover:text-[#1D9E75]" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-sm font-medium text-[#6b7280] hidden sm:block">Buenos días, <span className="font-bold text-[#1a1a1a]">{productor.nombre}</span></h1>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-[#1D9E75] transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <button className="flex items-center gap-2 focus:outline-none group">
              <div className="w-9 h-9 rounded-full bg-[#1D9E75] text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:ring-2 group-hover:ring-[#1D9E75]/30 transition-all">
                {getInitials(productor.nombre)}
              </div>
            </button>
          </div>
        </header>

        {/* CONTENIDO SCROLLABLE */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* BANNER DE ERROR DEL SERVIDOR */}
          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
              <p className="text-red-700 text-sm font-medium">{serverError}</p>
            </div>
          )}

          {/* BANNERS DE ALERTA */}
          <div className="space-y-4">
            {isLoaded && productor.estado === 'PENDIENTE_VERIFICACION' && (
              <div className="bg-[#FEF3C7] border border-yellow-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-[#92400E] shrink-0 mt-0.5" />
                  <p className="text-[#92400E] text-sm font-medium">Tu cuenta está pendiente de verificación. Sube tus documentos para poder publicar productos.</p>
                </div>
                <button className="bg-[#D97706] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-700 transition-colors shrink-0 whitespace-nowrap shadow-sm">
                  Subir documentos
                </button>
              </div>
            )}

            {isLoaded && (productor.lat === null || productor.lng === null) && (
              <div className="bg-[#FEE2E2] border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-6 h-6 text-[#991B1B] shrink-0 mt-0.5" />
                  <p className="text-[#991B1B] text-sm font-medium">No has registrado la ubicación de tu finca. Sin esto no podrás publicar productos.</p>
                </div>
                <button className="bg-[#DC2626] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors shrink-0 whitespace-nowrap shadow-sm">
                  Registrar ubicación
                </button>
              </div>
            )}
          </div>

          {/* MÉTRICAS (4 Tarjetas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: 'Ingresos del mes', value: metricas.ingresosMes, icon: DollarSign },
              { label: 'Pedidos activos', value: metricas.pedidosActivos, icon: Package },
              { label: 'Productos publicados', value: metricas.productosPublicados, icon: Sprout },
              { label: 'Calificación promedio', value: metricas.calificacionPromedio, icon: Star }
            ].map((m, idx) => {
              const Icon = m.icon;
              return (
                <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#E1F5EE] flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-[#1D9E75]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#1a1a1a]">{m.value}</h3>
                    <p className="text-sm font-medium text-[#6b7280]">{m.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ACCIONES RÁPIDAS (3 Botones) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm">
              <PlusCircle className="w-5 h-5" />
              Publicar nueva cosecha
            </button>
            <button className="bg-white hover:bg-gray-50 border-2 border-[#1D9E75] text-[#1D9E75] py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm">
              <MapPin className="w-5 h-5" />
              Actualizar ubicación de finca
            </button>
            <button className="bg-white hover:bg-gray-50 border-2 border-gray-200 text-[#6b7280] hover:text-[#1a1a1a] py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm">
              <Upload className="w-5 h-5" />
              Subir documentos
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* MIS PRODUCTOS RECIENTES (2 columnas) */}
            <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#1a1a1a]">Mis productos recientes</h2>
                <a href="#" className="text-sm font-semibold text-[#1D9E75] hover:underline">Ver todos →</a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-[#6b7280] text-xs uppercase tracking-wider">
                      <th className="px-6 py-3 font-semibold">Producto</th>
                      <th className="px-6 py-3 font-semibold">Categoría</th>
                      <th className="px-6 py-3 font-semibold">Precio</th>
                      <th className="px-6 py-3 font-semibold">Stock</th>
                      <th className="px-6 py-3 font-semibold">Estado</th>
                      <th className="px-6 py-3 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productos.map(prod => (
                      <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-[#E1F5EE] flex items-center justify-center text-[#1D9E75] shrink-0 overflow-hidden">
                               <Sprout className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-[#1a1a1a]">{prod.nombre}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-gray-100 text-[#6b7280] text-xs font-semibold px-2.5 py-1 rounded-md">{prod.categoria}</span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-[#1a1a1a]">Bs. {prod.precio}</td>
                        <td className="px-6 py-4 text-[#6b7280]">{prod.stock} qq</td>
                        <td className="px-6 py-4">{renderBadge(prod.estado)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="text-[#6b7280] hover:text-[#1D9E75] transition-colors p-1"><Edit2 className="w-4 h-4" /></button>
                            <button className="text-[#6b7280] hover:text-red-600 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PEDIDOS RECIENTES (1 columna) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#1a1a1a]">Últimos pedidos</h2>
                <a href="#" className="text-sm font-semibold text-[#1D9E75] hover:underline">Ver todos →</a>
              </div>
              <ul className="divide-y divide-gray-100 flex-1">
                {pedidos.map(pedido => (
                  <li key={pedido.id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#6b7280] shrink-0">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1a1a1a] truncate">{pedido.comprador}</p>
                        <p className="text-sm text-[#6b7280] truncate">{pedido.producto}</p>
                        <p className="text-xs text-[#6b7280] mt-1">{pedido.fecha}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-[#1D9E75]">{pedido.monto}</p>
                        <div className="mt-1">{renderBadge(pedido.estado)}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
};

export default DashboardProductorPage;
