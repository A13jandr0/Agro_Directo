import React, { useState, useEffect, useContext } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, MapPin, Sprout, User, LogOut, Store, ShoppingCart, 
  Clock, Menu, X, Leaf, Package, Truck, ClipboardList, Map, History,
  ChevronRight, UserCircle2
} from 'lucide-react';
import CartContext from '../context/CartContext';

const MainLayout = () => {
  const [userData, setUserData] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { carrito } = useContext(CartContext);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      try {
        const res = await axios.get('http://localhost:5000/api/usuarios/mi-perfil', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(res.data);
      } catch (error) {
        console.error('Error fetching profile for layout:', error);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const productorMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/productor' },
    { id: 'cosechas', label: 'Mis Cosechas', icon: Sprout, path: '/dashboard/productor/cosechas' },
    { id: 'pedidos', label: 'Mis Pedidos', icon: Package, path: '/dashboard/productor/pedidos' },
    { id: 'finca', label: 'Mi Finca', icon: MapPin, path: '/dashboard/productor/finca' },
    { id: 'ingresos', label: 'Ingresos', icon: History, path: '/dashboard/productor/ingresos' },
    { id: 'perfil', label: 'Mi Perfil', icon: User, path: '/dashboard/productor/perfil' },
  ];

  const compradorMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/comprador' },
    { id: 'marketplace', label: 'Marketplace', icon: Store, path: '/marketplace' },
    { id: 'carrito', label: 'Mi Carrito', icon: ShoppingCart, path: '/carrito' },
    { id: 'pedidos', label: 'Mis Pedidos', icon: Package, path: '/dashboard/comprador/mis-pedidos' },
    { id: 'historial', label: 'Historial', icon: Clock, path: '/dashboard/historial' },
  ];

  const transportistaMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/transportista' },
    { id: 'bolsa', label: 'Bolsa de Carga', icon: ClipboardList, path: '/dashboard/transportista/bolsa' },
    { id: 'ruta', label: 'Hoja de Ruta', icon: Map, path: '/dashboard/transportista/hoja-de-ruta' },
    { id: 'perfil', label: 'Mi Perfil', icon: UserCircle2, path: '/dashboard/transportista/perfil' },
    { id: 'historial', label: 'Historial', icon: Clock, path: '/dashboard/historial' },
  ];

  const getMenu = () => {
    if (userData?.rol === 'COMPRADOR') return compradorMenu;
    if (userData?.rol === 'TRANSPORTISTA') return transportistaMenu;
    return productorMenu;
  };

  const menuItems = getMenu();
  const isComprador = userData?.rol === 'COMPRADOR';
  const cartItemCount = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleLabel = () => {
    const labels = { 'PRODUCTOR': 'Productor', 'COMPRADOR': 'Comprador', 'TRANSPORTISTA': 'Transportista' };
    return labels[userData?.rol] || 'Usuario';
  };

  const getRoleColor = () => {
    const colors = { 'PRODUCTOR': 'from-emerald-500 to-teal-600', 'COMPRADOR': 'from-blue-500 to-indigo-600', 'TRANSPORTISTA': 'from-amber-500 to-orange-600' };
    return colors[userData?.rol] || 'from-gray-500 to-gray-600';
  };

  const getAccentColor = () => {
    const colors = { 'PRODUCTOR': 'emerald', 'COMPRADOR': 'blue', 'TRANSPORTISTA': 'amber' };
    return colors[userData?.rol] || 'emerald';
  };

  const accent = getAccentColor();

  return (
    <div className="flex h-screen bg-[#f8f9fc] font-sans overflow-hidden text-slate-900">
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-[272px] z-50 
        transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 
        transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] 
        flex flex-col
        bg-gradient-to-b from-[#0f172a] via-[#111827] to-[#0c1220]
        shadow-2xl shadow-black/20
      `}>
        {/* Logo */}
        <div className="h-20 flex items-center gap-3 px-7 shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-transparent" />
          <div className={`w-11 h-11 bg-gradient-to-br ${getRoleColor()} rounded-xl flex items-center justify-center shadow-lg relative z-10`}>
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div className="relative z-10">
            <span className="text-lg font-black tracking-tight text-white">AgroDirecto</span>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Santa Cruz</span>
          </div>
        </div>

        {/* User card */}
        <div className="mx-4 mt-2 mb-4 p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getRoleColor()} text-white flex items-center justify-center font-black text-sm shadow-lg`}>
              {getInitials(userData?.nombre_completo)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{userData?.nombre_completo || 'Cargando...'}</p>
              <p className={`text-[11px] font-semibold text-${accent}-400`}>{getRoleLabel()}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-3">
          <p className="px-4 mb-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Navegación</p>
          <ul className="space-y-1">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.id} style={{ animationDelay: `${idx * 0.05}s` }} className="animate-fade-in">
                  <Link 
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    onMouseEnter={() => setSidebarHovered(item.id)}
                    onMouseLeave={() => setSidebarHovered(null)}
                    className={`
                      group flex items-center gap-3 px-4 py-3 text-[13px] font-semibold rounded-xl
                      transition-all duration-300 relative overflow-hidden
                      ${isActive 
                        ? `bg-gradient-to-r from-${accent}-600 to-${accent}-700 text-white shadow-lg shadow-${accent}-600/25` 
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                      }
                    `}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-white rounded-r-full" />
                    )}
                    <Icon className={`w-[18px] h-[18px] shrink-0 transition-all duration-300 ${
                      isActive ? 'text-white' : `text-slate-500 group-hover:text-${accent}-400`
                    }`} />
                    <span className="flex-1">{item.label}</span>
                    {!isActive && sidebarHovered === item.id && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 animate-fade-in" />
                    )}
                    {item.id === 'carrito' && cartItemCount > 0 && (
                      <span className={`bg-${accent}-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center`}>
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/[0.06]">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all duration-300"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-6 sm:px-8 z-10 shrink-0 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-slate-500 hover:text-emerald-600 p-2 hover:bg-slate-100 rounded-xl transition-all duration-300" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Plataforma</span>
              <span className="text-sm font-bold text-slate-800">Panel de {getRoleLabel()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            {isComprador && (
              <Link 
                to="/carrito"
                className={`relative p-2.5 text-slate-400 hover:text-${accent}-600 hover:bg-${accent}-50 rounded-xl transition-all duration-300`}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className={`absolute -top-0.5 -right-0.5 bg-${accent}-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-scale-bounce`}>
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}
            
            <div className="h-8 w-px bg-slate-200/60" />

            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-800">{userData?.nombre_completo}</span>
                <span className={`text-[10px] font-semibold text-${accent}-600`}>{userData?.estado === 'VERIFICADO' ? 'Verificado' : userData?.estado?.replace('_', ' ')}</span>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getRoleColor()} text-white flex items-center justify-center font-black text-sm shadow-lg border-2 border-white`}>
                {getInitials(userData?.nombre_completo)}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
