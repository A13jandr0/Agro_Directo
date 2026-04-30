import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, LayoutDashboard, Sprout, PlusCircle, ShoppingBag, MapPin, BarChart2, User, Settings, LogOut, 
  Menu, Bell, Download, TrendingUp, Package, Star, Calendar, Eye
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

// Datos para gráficos
const ingresosMensuales = [
  { mes: 'Ene', ingresos: 4200 },
  { mes: 'Feb', ingresos: 5100 },
  { mes: 'Mar', ingresos: 4800 },
  { mes: 'Abr', ingresos: 6300 },
  { mes: 'May', ingresos: 8450 },
  { mes: 'Jun', ingresos: 7900 }
];

const ventasPorProducto = [
  { name: 'Tomate perita', value: 45 },
  { name: 'Soya Grano', value: 25 },
  { name: 'Maíz Amarillo', value: 20 },
  { name: 'Yuca Blanca', value: 10 }
];
const COLORS = ['#1D9E75', '#0F6E56', '#D97706', '#E1F5EE'];

const estadoPedidos = [
  { estado: 'Entregados', cantidad: 34, fill: '#1D9E75' },
  { estado: 'En camino', cantidad: 12, fill: '#D97706' },
  { estado: 'Cancelados', cantidad: 4, fill: '#DC2626' }
];

// Tooltip personalizado
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
        <p className="text-sm font-bold text-[#1a1a1a] mb-1">{label}</p>
        <p className="text-sm font-semibold text-[#1D9E75]">
          Bs. {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const MisIngresosPage = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [periodo, setPeriodo] = useState('Este mes');

  // Transacciones Simuladas
  const [transacciones] = useState([
    { id: 'TR-001', fecha: '27 Abr 2026', comprador: 'Juan Pérez', producto: 'Tomate perita', cantidad: '3 quintales', monto: 135, estado: 'Entregado' },
    { id: 'TR-002', fecha: '26 Abr 2026', comprador: 'Supermercados Ketal', producto: 'Maíz Amarillo Duro', cantidad: '50 quintales', monto: 4750, estado: 'En camino' },
    { id: 'TR-003', fecha: '25 Abr 2026', comprador: 'Maria López', producto: 'Soya Grano de Oro', cantidad: '10 quintales', monto: 1200, estado: 'Entregado' },
    { id: 'TR-004', fecha: '24 Abr 2026', comprador: 'Agroindustrias Norte', producto: 'Yuca Blanca', cantidad: '20 arrobas', monto: 600, estado: 'Entregado' },
    { id: 'TR-005', fecha: '23 Abr 2026', comprador: 'Restaurante El Buen Sabor', producto: 'Cebolla Roja', cantidad: '2 quintales', monto: 100, estado: 'Cancelado' }
  ]);

  const menuItems = [
    { id: 'dashboard', label: 'Mi Dashboard', icon: LayoutDashboard, path: '/dashboard/productor' },
    { id: 'cosechas', label: 'Mis Cosechas', icon: Sprout, path: '/dashboard/productor/cosechas' },
    { id: 'publicar', label: 'Publicar Producto', icon: PlusCircle, path: '#' },
    { id: 'pedidos', label: 'Mis Pedidos', icon: ShoppingBag, path: '/dashboard/productor/pedidos' },
    { id: 'finca', label: 'Mi Finca', icon: MapPin, path: '/dashboard/productor/finca' },
    { id: 'ingresos', label: 'Mis Ingresos', icon: BarChart2, path: '/dashboard/productor/ingresos', active: true },
    { id: 'perfil', label: 'Mi Perfil', icon: User, path: '/dashboard/productor/perfil' },
    { id: 'configuracion', label: 'Configuración', icon: Settings, path: '#' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getBadgeColor = (estado) => {
    switch(estado) {
      case 'Entregado': return 'bg-green-100 text-green-700';
      case 'En camino': return 'bg-orange-100 text-orange-700';
      case 'Cancelado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex h-screen bg-[#f9fafb] font-sans overflow-hidden">
      
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
            </button>
            <button className="w-9 h-9 rounded-full bg-[#1D9E75] text-white flex items-center justify-center font-bold text-sm shadow-sm hover:ring-2 hover:ring-[#1D9E75]/30 transition-all">
              JP
            </button>
          </div>
        </header>

        {/* CONTENIDO SCROLLABLE */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* HEADER DE LA SECCIÓN */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#E1F5EE] flex items-center justify-center text-[#1D9E75] shrink-0">
                <BarChart2 className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold text-[#1a1a1a]">Mis Ingresos</h1>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <select 
                className="flex-1 md:flex-none py-2.5 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] shadow-sm"
                value={periodo}
                onChange={e => setPeriodo(e.target.value)}
              >
                <option>Este mes</option>
                <option>Últimos 3 meses</option>
                <option>Este año</option>
              </select>
              <button className="flex items-center justify-center gap-2 bg-[#1D9E75] text-white py-2.5 px-5 rounded-lg text-sm font-semibold hover:bg-[#0F6E56] transition-colors shadow-sm whitespace-nowrap">
                <Download className="w-4 h-4" />
                Descargar reporte
              </button>
            </div>
          </div>

          {/* MÉTRICAS (4 Tarjetas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#E1F5EE] flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6 text-[#1D9E75]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#6b7280]">Ingresos totales</p>
                <h3 className="text-2xl font-bold text-[#1a1a1a] my-1">Bs. 8,450</h3>
                <p className="text-xs font-bold text-[#1D9E75]">+12% vs mes anterior</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#E1F5EE] flex items-center justify-center shrink-0">
                <ShoppingBag className="w-6 h-6 text-[#1D9E75]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#6b7280]">Pedidos completados</p>
                <h3 className="text-2xl font-bold text-[#1a1a1a] my-1">34</h3>
                <p className="text-xs font-bold text-[#1D9E75]">+5 vs mes anterior</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#E1F5EE] flex items-center justify-center shrink-0">
                <Package className="w-6 h-6 text-[#1D9E75]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#6b7280]">Producto más vendido</p>
                <h3 className="text-lg font-bold text-[#1a1a1a] my-1 truncate">Tomate perita</h3>
                <p className="text-xs font-medium text-[#6b7280]">12 pedidos</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#E1F5EE] flex items-center justify-center shrink-0">
                <Star className="w-6 h-6 text-[#1D9E75]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#6b7280]">Calificación promedio</p>
                <h3 className="text-2xl font-bold text-[#1a1a1a] my-1">4.8</h3>
                <p className="text-xs font-medium text-[#6b7280]">18 calificaciones</p>
              </div>
            </div>
          </div>

          {/* GRÁFICO PRINCIPAL */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-6">Ingresos mensuales</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ingresosMensuales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `Bs. ${value}`} dx={-10} />
                  <RechartsTooltip cursor={{ fill: '#f9fafb' }} content={<CustomTooltip />} />
                  <Bar dataKey="ingresos" fill="#1D9E75" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DOS GRÁFICOS INFERIORES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* PIE CHART */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#1a1a1a] mb-6">Distribución por producto</h2>
              <div className="h-[250px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ventasPorProducto}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {ventasPorProducto.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#1a1a1a', fontWeight: 'bold' }} />
                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: '500', color: '#6b7280' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* HORIZONTAL BAR CHART */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#1a1a1a] mb-6">Estado de pedidos</h2>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={estadoPedidos} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="estado" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 13, fontWeight: '500' }} width={80} />
                    <RechartsTooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="cantidad" radius={[0, 4, 4, 0]} barSize={24}>
                      {estadoPedidos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* TABLA DE TRANSACCIONES */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1a1a1a]">Últimas transacciones</h2>
              <a href="#" className="text-sm font-semibold text-[#1D9E75] hover:underline">Ver todas →</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50/50 text-[#6b7280] text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Fecha</th>
                    <th className="px-6 py-4 font-semibold">Comprador</th>
                    <th className="px-6 py-4 font-semibold">Producto</th>
                    <th className="px-6 py-4 font-semibold">Cantidad</th>
                    <th className="px-6 py-4 font-semibold">Monto</th>
                    <th className="px-6 py-4 font-semibold">Estado</th>
                    <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transacciones.map(tr => (
                    <tr key={tr.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                          <Calendar className="w-4 h-4" /> {tr.fecha}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#1a1a1a]">{tr.comprador}</td>
                      <td className="px-6 py-4 text-sm text-[#6b7280]">{tr.producto}</td>
                      <td className="px-6 py-4 text-sm text-[#6b7280]">{tr.cantidad}</td>
                      <td className="px-6 py-4 font-bold text-[#1D9E75]">Bs. {tr.monto}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getBadgeColor(tr.estado)}`}>
                          {tr.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="text-gray-400 hover:text-[#1D9E75] transition-colors p-1.5 rounded hover:bg-[#E1F5EE]">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* PAGINACIÓN */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm">
              <button className="px-4 py-2 border border-gray-200 rounded-lg font-semibold text-[#6b7280] hover:bg-gray-50 transition-colors">Anterior</button>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-lg bg-[#1D9E75] text-white font-bold flex items-center justify-center">1</button>
                <button className="w-8 h-8 rounded-lg text-[#6b7280] hover:bg-gray-100 font-semibold flex items-center justify-center transition-colors">2</button>
                <button className="w-8 h-8 rounded-lg text-[#6b7280] hover:bg-gray-100 font-semibold flex items-center justify-center transition-colors">3</button>
              </div>
              <button className="px-4 py-2 border border-gray-200 rounded-lg font-semibold text-[#6b7280] hover:bg-gray-50 transition-colors">Siguiente</button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default MisIngresosPage;
