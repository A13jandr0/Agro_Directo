import React, { useState, useEffect, useContext } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, Sprout, Package, MapPin, History, User, 
  Bell, LogOut, Menu, X, Check, AlertTriangle, Info, Calendar, XCircle, ShoppingBag,
  Store, ShoppingCart, BarChart3, Settings, Users, ShieldAlert, Sparkles, Leaf, Truck
} from 'lucide-react';
import CartContext from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import VerificationBanner from './VerificationBanner';
import VerificationCelebrationModal from './VerificationCelebrationModal';

const MainLayout = () => {
  const [userData, setUserData] = useState(null);
  const [sidebarBadges, setSidebarBadges] = useState({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('success');
  const prevEstadoRef = React.useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { carrito, conflictoProductor, setConflictoProductor, reemplazarCarrito } = useContext(CartContext);
  const { 
    notifications, 
    unreadCount, 
    isBellShaking, 
    isPanelOpen: isNotifDrawerOpen, 
    setIsPanelOpen: setIsNotifDrawerOpen, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  const fetchProfile = React.useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    try {
      const res = await axios.get('http://localhost:5000/api/usuarios/mi-perfil', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      if (
        prevEstadoRef.current === 'PENDIENTE_VERIFICACION' &&
        data.estado === 'VERIFICADO'
      ) {
        setShowCelebration(true);
      }
      prevEstadoRef.current = data.estado;
      setUserData(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching profile for layout:', error);
    }
  }, [navigate]);

  const fetchBadges = React.useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const rol = userData?.rol;
      if (rol === 'ADMINISTRADOR') {
        const res = await axios.get('http://localhost:5000/api/admin/verificaciones/count', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSidebarBadges({ verificaciones: res.data.total });
      } else {
        const res = await axios.get('http://localhost:5000/api/pedidos/conteos', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSidebarBadges(res.data);
      }
    } catch (err) {
      console.error('Error fetching badges:', err);
    }
  }, [userData?.rol]);

  useEffect(() => {
    fetchProfile();
    const interval = setInterval(fetchProfile, 30000);
    return () => clearInterval(interval);
  }, [fetchProfile]);

  useEffect(() => {
    if (userData?.rol) {
      fetchBadges();
      const interval = setInterval(fetchBadges, 30000);
      return () => clearInterval(interval);
    }
  }, [userData?.rol, fetchBadges]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.info('Sesión cerrada');
    navigate('/login');
  };

  const getRoleLabel = () => {
    const labels = { 'PRODUCTOR': 'Productor', 'COMPRADOR': 'Comprador', 'TRANSPORTISTA': 'Transportista', 'ADMINISTRADOR': 'Administrador' };
    return labels[userData?.rol] || 'Usuario';
  };

  const productorMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/productor' },
    { id: 'cosechas', label: 'Mis Cosechas', icon: Sprout, path: '/dashboard/productor/cosechas' },
    { id: 'pedidos', label: 'Pedidos Recibidos', icon: Package, path: '/dashboard/productor/pedidos' },
    { id: 'ingresos', label: 'Mis Ingresos', icon: History, path: '/dashboard/productor/ingresos' },
    { id: 'finca', label: 'Mi Finca', icon: MapPin, path: '/dashboard/productor/finca' },
    { id: 'perfil', label: 'Mi Perfil', icon: User, path: '/dashboard/productor/perfil' },
  ];

  const compradorMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/comprador' },
    { id: 'marketplace', label: 'Marketplace', icon: Store, path: '/marketplace' },
    { id: 'carrito', label: 'Mi Carrito', icon: ShoppingCart, path: '/carrito' },
    { id: 'pedidos', label: 'Mis Pedidos', icon: Package, path: '/dashboard/comprador/mis-pedidos' },
    { id: 'mapa', label: 'Mapa Productores', icon: MapPin, path: '/dashboard/comprador/mapa' },
    { id: 'perfil', label: 'Mi Perfil', icon: User, path: '/dashboard/comprador/perfil' },
  ];

  const transportistaMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/transportista' },
    { id: 'bolsa', label: 'Bolsa de Cargas', icon: Truck, path: '/dashboard/transportista/bolsa', badgeKey: 'cargas_disponibles' },
    { id: 'ruta', label: 'Mis Rutas', icon: MapPin, path: '/dashboard/transportista/hoja-de-ruta' },
    { id: 'perfil', label: 'Mi Perfil', icon: User, path: '/dashboard/transportista/perfil' },
  ];

  const adminMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/admin' },
    { id: 'verificaciones', label: 'Verificaciones', icon: Users, path: '/dashboard/admin/verificaciones', badgeKey: 'verificaciones' },
    { id: 'pedidos', label: 'Pedidos globales', icon: Package, path: '/dashboard/admin/pedidos' },
    { id: 'bi', label: 'BI/Analytics', icon: BarChart3, path: '/dashboard/admin/bi' },
    { id: 'configuracion', label: 'Configuración', icon: Settings, path: '/dashboard/admin/configuracion' }
  ];

  const menuItems = userData?.rol === 'ADMINISTRADOR'
    ? adminMenu
    : userData?.rol === 'COMPRADOR'
    ? compradorMenu.map((m) => m.id === 'carrito' ? { ...m, badgeCount: carrito.length } : m.id === 'pedidos' ? { ...m, badgeKey: 'pedidos_pendientes' } : m)
    : userData?.rol === 'TRANSPORTISTA'
    ? transportistaMenu
    : productorMenu.map((m) => m.id === 'pedidos' ? { ...m, badgeKey: 'pedidos_pendientes' } : m);

  // Background gradients for sidebar based on role
  const getSidebarBg = () => {
    if (userData?.rol === 'ADMINISTRADOR') return 'from-[#1e293b] to-[#334155]';
    if (userData?.rol === 'COMPRADOR') return 'from-[#2563eb] to-[#1d4ed8]';
    if (userData?.rol === 'TRANSPORTISTA') return 'from-[#f59e0b] to-[#d97706]';
    return 'from-[#0d9f6e] to-[#0b8a5e]';
  };

  const activeNavClass = userData?.rol === 'COMPRADOR' 
    ? 'bg-white/20 text-white font-semibold shadow-md' 
    : 'bg-white/25 text-white shadow-md font-semibold';

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // Colors based on user state
  const isPending = userData?.estado === 'PENDIENTE_VERIFICACION';
  const isRejected = userData?.estado === 'RECHAZADO';
  const isVerified = userData?.estado === 'VERIFICADO' || userData?.estado === 'REGISTRADO';
  const stateLabel = isPending ? 'Pendiente' : isRejected ? 'Rechazado' : isVerified ? 'Verificado' : userData?.estado || '';
  const stateBadgeClass = isPending
    ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
    : isRejected
    ? 'bg-rose-50 text-rose-700 border-rose-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  const getMenuBadge = (item) => {
    if (item.badgeCount > 0) return item.badgeCount;
    if (item.badgeKey && sidebarBadges[item.badgeKey] > 0) return sidebarBadges[item.badgeKey];
    return 0;
  };


  const getRelativeTime = (date) => {
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} hr`;
    return date.toLocaleDateString('es-BO', { day: 'numeric', month: 'short' });
  };

  const getNotifDetails = (tipo) => {
    switch (tipo) {
      case 'success':
        return { border: 'border-l-4 border-l-[#0d9f6e]', icon: <Check className="w-4 h-4 text-[#0d9f6e]" />, iconBg: 'bg-emerald-50' };
      case 'error':
        return { border: 'border-l-4 border-l-[#9b2335]', icon: <XCircle className="w-4 h-4 text-[#9b2335]" />, iconBg: 'bg-rose-50' };
      case 'warning':
        return { border: 'border-l-4 border-l-[#f59e0b]', icon: <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />, iconBg: 'bg-amber-50' };
      case 'celebration':
        return { border: 'border-l-4 border-l-[#0d9f6e]', icon: <Sparkles className="w-4 h-4 text-[#0d9f6e]" />, iconBg: 'bg-emerald-100/50' };
      case 'info':
      default:
        return { border: 'border-l-4 border-l-[#3b82f6]', icon: <Info className="w-4 h-4 text-[#3b82f6]" />, iconBg: 'bg-blue-50' };
    }
  };

  const groupNotificationsByDate = (notifs) => {
    const today = [];
    const thisWeek = [];
    const older = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday.getTime() - 7 * 24 * 3600 * 1000);

    notifs.forEach(n => {
      const d = new Date(n.fecha);
      if (d >= startOfToday) {
        today.push(n);
      } else if (d >= startOfWeek) {
        thisWeek.push(n);
      } else {
        older.push(n);
      }
    });

    return { today, thisWeek, older };
  };

  return (
    <div className="flex h-screen bg-[#f4f6f9] font-sans overflow-hidden text-slate-900">
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR (W-64) */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-64 z-50 
        transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 
        transition-transform duration-300 ease-out 
        flex flex-col
        bg-gradient-to-b ${getSidebarBg()}
        text-white
        shadow-2xl shadow-emerald-950/20
      `}>
        {/* Logo */}
        <div className="h-20 flex items-center gap-3 px-6 shrink-0 border-b border-white/10">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight block">AgroDirecto</span>
            <span className="block text-[10px] font-bold text-emerald-300 uppercase tracking-widest leading-none mt-0.5">Santa Cruz</span>
          </div>
        </div>

        {/* User Card */}
        <div className="mx-4 mt-6 p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-emerald-700 flex items-center justify-center font-black text-sm shadow-md">
              {getInitials(userData?.nombre_completo)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate leading-tight">{userData?.nombre_completo || 'Cargando...'}</p>
              <p className="text-[10px] font-bold text-emerald-200 mt-1 uppercase tracking-wide">{getRoleLabel()}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.id}>
                  <Link 
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      group flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl
                      transition-all duration-200
                      ${isActive
                        ? 'bg-white/25 text-white shadow-md font-semibold'
                        : 'text-emerald-100 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {getMenuBadge(item) > 0 && (
                      <span className={`text-[10px] font-black h-5 min-w-[1.25rem] px-1 rounded-full flex items-center justify-center ${
                        item.id === 'pedidos' ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/25 text-white'
                      }`}>
                        {getMenuBadge(item)}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
            
            {/* Sidebar Notifications Link */}
            <li>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsNotifDrawerOpen(true);
                }}
                className="w-full group flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-all text-left"
              >
                <Bell className="w-4.5 h-4.5 shrink-0" />
                <span className="flex-1">Notificaciones</span>
                {unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-black h-5 px-1.5 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-emerald-600/30">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-emerald-100 hover:text-rose-100 hover:bg-rose-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* HEADER */}
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-6 sm:px-8 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-slate-500 hover:text-emerald-600 p-2 hover:bg-slate-100 rounded-xl transition-all" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plataforma</span>
              <span className="text-sm font-bold text-slate-800">
                {userData?.rol === 'COMPRADOR' ? 'Panel del Comprador' : userData?.rol === 'TRANSPORTISTA' ? 'Panel del Transportista' : 'Panel del Productor'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifDrawerOpen(true)}
              className={`relative p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all ${isBellShaking ? 'animate-shake' : ''}`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            <div className="h-6 w-px bg-slate-200" />

            {/* Profile Info */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-extrabold text-slate-800">{userData?.nombre_completo || 'Cargando...'}</span>
                <span className={`badge text-[10px] py-0 px-2 mt-0.5 border ${stateBadgeClass}`}>
                  {stateLabel}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 border-2 border-emerald-500/20 flex items-center justify-center font-black text-sm shadow-md overflow-hidden shrink-0">
                {getInitials(userData?.nombre_completo)}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT WITH GENEROUS PADDING */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-8 page-enter">
            <VerificationBanner userData={userData} />
            <Outlet context={{ userData, refreshProfile: fetchProfile, refreshBadges: fetchBadges }} />
          </div>
        </main>
      </div>

      {/* NOTIFICATIONS SLIDE-OUT DRAWER */}
      {isNotifDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsNotifDrawerOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative w-96 max-w-full bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in-right">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bell className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-black text-slate-900">Notificaciones</h3>
                {unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} nuevas
                  </span>
                )}
              </div>
              <button 
                onClick={() => setIsNotifDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions & Filters */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtrar por:</span>
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-black text-indigo-600 hover:text-indigo-700 hover:underline transition-all"
                >
                  Marcar todo como leído
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setNotifFilter('ALL')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    notifFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setNotifFilter('UNREAD')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    notifFilter === 'UNREAD' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  No leídas
                </button>
                
                {/* Por tipo dropdown */}
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setNotifFilter('BY_TYPE');
                    setTypeFilter(e.target.value);
                  }}
                  className="px-2.5 py-1 rounded-full text-xs font-bold bg-white text-slate-600 border border-slate-200 focus:outline-none"
                >
                  <option value="success">Éxito</option>
                  <option value="warning">Alerta</option>
                  <option value="info">Info</option>
                  <option value="celebration">Celebración</option>
                </select>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {(() => {
                const filtered = notifications.filter(n => {
                  if (notifFilter === 'UNREAD') return !n.leida;
                  if (notifFilter === 'BY_TYPE') return n.tipo === typeFilter;
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center h-48 text-center p-6 text-slate-400">
                      <Bell className="w-12 h-12 text-slate-300 mb-3" />
                      <h4 className="text-sm font-black text-slate-700">No tenés notificaciones</h4>
                      <p className="text-xs text-slate-400 font-semibold mt-1">Cuando haya actividad, aparecerá aquí.</p>
                    </div>
                  );
                }

                const groups = groupNotificationsByDate(filtered);

                const renderNotifItem = (n) => {
                  const details = getNotifDetails(n.tipo);
                  return (
                    <div 
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        setIsNotifDrawerOpen(false);
                        if (n.ruta) navigate(n.ruta);
                      }}
                      className={`p-4 flex items-start gap-3.5 cursor-pointer hover:bg-slate-50 border border-slate-100/60 rounded-2xl transition-all relative ${details.border} ${
                        !n.leida ? 'bg-indigo-50/10' : ''
                      }`}
                    >
                      {/* Unread Blue dot */}
                      {!n.leida && (
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0 mt-2" />
                      )}
                      
                      {/* Circle Icon */}
                      <div className={`w-8 h-8 rounded-xl ${details.iconBg} flex items-center justify-center shrink-0`}>
                        {details.icon}
                      </div>
                      
                      <div className="flex-grow min-w-0 pr-2">
                        <h4 className="text-xs font-black text-slate-900 tracking-wide">{n.titulo}</h4>
                        <p className="text-[11px] text-slate-600 mt-1 font-semibold leading-relaxed">{n.mensaje}</p>
                        <span className="text-[9px] font-bold text-slate-400 block mt-2">{getRelativeTime(new Date(n.fecha))}</span>
                      </div>
                    </div>
                  );
                };

                return (
                  <>
                    {/* HOY */}
                    {groups.today.length > 0 && (
                      <div className="space-y-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-1">Hoy</span>
                        {groups.today.map(n => renderNotifItem(n))}
                      </div>
                    )}

                    {/* ESTA SEMANA */}
                    {groups.thisWeek.length > 0 && (
                      <div className="space-y-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-1">Esta Semana</span>
                        {groups.thisWeek.map(n => renderNotifItem(n))}
                      </div>
                    )}

                    {/* ANTERIOR */}
                    {groups.older.length > 0 && (
                      <div className="space-y-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-1">Anterior</span>
                        {groups.older.map(n => renderNotifItem(n))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      <VerificationCelebrationModal
        open={showCelebration}
        onClose={() => setShowCelebration(false)}
      />

      {/* MODAL CONFLICTO PRODUCTOR (CARRITO) */}
      {conflictoProductor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setConflictoProductor(null)}></div>
          <div className="bg-white rounded-3xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl border border-slate-100 p-6 space-y-6">
            <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <span className="text-xs font-black uppercase tracking-wider">Conflicto de Productor</span>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 leading-snug">¿Querés reemplazar tu carrito?</h3>
              <p className="text-xs font-semibold text-slate-500 leading-normal">
                Tu carrito tiene productos de <strong className="text-slate-800">{conflictoProductor.productorExistente}</strong>. ¿Querés reemplazarlos con productos de <strong className="text-slate-800">{conflictoProductor.productorNuevo}</strong>?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setConflictoProductor(null)}
                className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-xs transition-colors border border-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  reemplazarCarrito(conflictoProductor.producto, conflictoProductor.cantidad);
                  toast.success('Carrito reemplazado exitosamente');
                }}
                className="flex-1 py-3 bg-[#9b2335] hover:bg-[#7a1c2a] text-white rounded-xl font-bold text-xs transition-colors shadow-lg shadow-rose-950/20"
              >
                Reemplazar carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
