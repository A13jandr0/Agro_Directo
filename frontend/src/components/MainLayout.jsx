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
    { id: 'comparador', label: 'Comparador', icon: BarChart3, path: '/comparador' },
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
    ? compradorMenu.map((m) => m.id === 'carrito' ? { ...m, badgeCount: (carrito?.length || 0) } : m.id === 'pedidos' ? { ...m, badgeKey: 'pedidos_pendientes' } : m)
    : userData?.rol === 'TRANSPORTISTA'
    ? transportistaMenu
    : productorMenu.map((m) => m.id === 'pedidos' ? { ...m, badgeKey: 'pedidos_pendientes' } : m);

  // ─── SOLO DISEÑO: paleta por rol ───────────────────────────────────────────
  const roleTheme = {
    PRODUCTOR: {
      sidebar: 'bg-[#0a2e1a]',
      accent: '#16a34a',
      accentLight: '#bbf7d0',
      activeBg: 'bg-[#16a34a]/20',
      activeText: 'text-[#86efac]',
      hoverBg: 'hover:bg-white/5',
      avatarBg: 'bg-[#16a34a]',
      dot: 'bg-[#4ade80]',
      label: 'Panel del Productor',
    },
    COMPRADOR: {
      sidebar: 'bg-[#0d1f3c]',
      accent: '#3b82f6',
      accentLight: '#bfdbfe',
      activeBg: 'bg-[#3b82f6]/20',
      activeText: 'text-[#93c5fd]',
      hoverBg: 'hover:bg-white/5',
      avatarBg: 'bg-[#3b82f6]',
      dot: 'bg-[#60a5fa]',
      label: 'Panel del Comprador',
    },
    TRANSPORTISTA: {
      sidebar: 'bg-[#1c1400]',
      accent: '#f59e0b',
      accentLight: '#fde68a',
      activeBg: 'bg-[#f59e0b]/20',
      activeText: 'text-[#fcd34d]',
      hoverBg: 'hover:bg-white/5',
      avatarBg: 'bg-[#f59e0b]',
      dot: 'bg-[#fbbf24]',
      label: 'Panel del Transportista',
    },
    ADMINISTRADOR: {
      sidebar: 'bg-[#0f172a]',
      accent: '#6366f1',
      accentLight: '#c7d2fe',
      activeBg: 'bg-[#6366f1]/20',
      activeText: 'text-[#a5b4fc]',
      hoverBg: 'hover:bg-white/5',
      avatarBg: 'bg-[#6366f1]',
      dot: 'bg-[#818cf8]',
      label: 'Panel de Administración',
    },
  };

  const theme = roleTheme[userData?.rol] || roleTheme.PRODUCTOR;

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const isPending = userData?.estado === 'PENDIENTE_VERIFICACION';
  const isRejected = userData?.estado === 'RECHAZADO';
  const isVerified = userData?.estado === 'VERIFICADO' || userData?.estado === 'REGISTRADO';
  const stateLabel = isPending ? 'Pendiente' : isRejected ? 'Rechazado' : isVerified ? 'Verificado' : userData?.estado || '';
  const stateBadgeClass = isPending
    ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
    : isRejected
    ? 'bg-rose-50 text-rose-700 border border-rose-200'
    : 'bg-emerald-50 text-emerald-700 border border-emerald-200';

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
        return { border: 'border-l-2 border-l-emerald-400', icon: <Check className="w-3.5 h-3.5 text-emerald-600" />, iconBg: 'bg-emerald-50' };
      case 'error':
        return { border: 'border-l-2 border-l-rose-400', icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />, iconBg: 'bg-rose-50' };
      case 'warning':
        return { border: 'border-l-2 border-l-amber-400', icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />, iconBg: 'bg-amber-50' };
      case 'celebration':
        return { border: 'border-l-2 border-l-emerald-400', icon: <Sparkles className="w-3.5 h-3.5 text-emerald-600" />, iconBg: 'bg-emerald-50' };
      case 'info':
      default:
        return { border: 'border-l-2 border-l-blue-400', icon: <Info className="w-3.5 h-3.5 text-blue-600" />, iconBg: 'bg-blue-50' };
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
      if (d >= startOfToday) today.push(n);
      else if (d >= startOfWeek) thisWeek.push(n);
      else older.push(n);
    });
    return { today, thisWeek, older };
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden text-slate-900">

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-60 z-50
        transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-out
        flex flex-col
        ${theme.sidebar}
        border-r border-white/5
      `}>

        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 shrink-0 border-b border-white/5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: theme.accent + '22', border: `1px solid ${theme.accent}44` }}
          >
            <Leaf className="w-4 h-4" style={{ color: theme.accent }} />
          </div>
          <div>
            <span className="text-white text-sm font-black tracking-tight block leading-none">AgroDirecto</span>
            <span className="text-[9px] font-bold uppercase tracking-widest mt-0.5 block" style={{ color: theme.accent }}>Santa Cruz</span>
          </div>
        </div>

        {/* User Card */}
        <div className="mx-3 mt-4 p-3 rounded-xl border border-white/8 bg-white/4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white shrink-0"
              style={{ backgroundColor: theme.accent }}
            >
              {getInitials(userData?.nombre_completo)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-white truncate leading-tight">{userData?.nombre_completo || '—'}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: theme.accent }}>{getRoleLabel()}</p>
            </div>
            {/* online dot */}
            <span className={`w-2 h-2 rounded-full shrink-0 ${theme.dot}`} />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {/* Menu label */}
          <p className="text-[9px] font-black uppercase tracking-widest text-white/25 px-3 mb-3">Menú</p>
          <ul className="space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      group flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold rounded-lg
                      transition-all duration-150
                      ${isActive
                        ? `${theme.activeBg} ${theme.activeText}`
                        : `text-white/50 ${theme.hoverBg} hover:text-white/90`
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? '' : 'opacity-60 group-hover:opacity-100'}`} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {getMenuBadge(item) > 0 && (
                      <span className={`text-[10px] font-black h-4.5 min-w-[1.1rem] px-1 rounded-full flex items-center justify-center ${
                        item.id === 'pedidos' ? 'bg-rose-500 text-white' : 'text-white/80'
                      }`}
                        style={item.id !== 'pedidos' ? { backgroundColor: theme.accent + '55' } : {}}
                      >
                        {getMenuBadge(item)}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}

            {/* Notifications */}
            <li>
              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsNotifDrawerOpen(true); }}
                className={`w-full group flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold rounded-lg text-white/50 ${theme.hoverBg} hover:text-white/90 transition-all text-left`}
              >
                <Bell className="w-4 h-4 shrink-0 opacity-60 group-hover:opacity-100" />
                <span className="flex-1 truncate">Notificaciones</span>
                {unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-black h-4.5 px-1.5 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <div className="flex-grow flex flex-col min-w-0">

        {/* HEADER */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-5 sm:px-7 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile burger */}
            <button
              className="lg:hidden text-slate-400 hover:text-slate-700 p-1.5 hover:bg-slate-100 rounded-lg transition-all"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb style title */}
            <div className="flex items-center gap-2">
              <div
                className="w-1.5 h-5 rounded-full shrink-0"
                style={{ backgroundColor: theme.accent }}
              />
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none">Plataforma</span>
                <span className="text-sm font-bold text-slate-800 block leading-tight mt-0.5">{theme.label}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Bell */}
            <button
              onClick={() => setIsNotifDrawerOpen(true)}
              className={`relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all ${isBellShaking ? 'animate-shake' : ''}`}
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span
                  className="absolute top-1 right-1 w-2 h-2 rounded-full border-2 border-white"
                  style={{ backgroundColor: theme.accent }}
                />
              )}
            </button>

            <div className="h-5 w-px bg-slate-200" />

            {/* Profile */}
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[13px] font-bold text-slate-800 leading-tight">{userData?.nombre_completo || '—'}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${stateBadgeClass}`}>
                  {stateLabel}
                </span>
              </div>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white shrink-0"
                style={{ backgroundColor: theme.accent }}
              >
                {getInitials(userData?.nombre_completo)}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-7">
          <div className="max-w-7xl mx-auto space-y-6 page-enter">
            <VerificationBanner userData={userData} />
            <Outlet context={{ userData, refreshProfile: fetchProfile, refreshBadges: fetchBadges }} />
          </div>
        </main>
      </div>

      {/* ── NOTIFICATIONS DRAWER ────────────────────────────────────────── */}
      {isNotifDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]"
            onClick={() => setIsNotifDrawerOpen(false)}
          />

          <div className="relative w-88 max-w-full bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in-right border-l border-slate-100">

            {/* Drawer header */}
            <div className="h-14 flex items-center justify-between px-5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-500" />
                <span className="text-[14px] font-black text-slate-900">Notificaciones</span>
                {unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-700 transition-colors"
                >
                  Marcar todo
                </button>
                <button
                  onClick={() => setIsNotifDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 shrink-0">
              {['ALL', 'UNREAD'].map(f => (
                <button
                  key={f}
                  onClick={() => setNotifFilter(f)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                    notifFilter === f
                      ? 'text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                  style={notifFilter === f ? { backgroundColor: theme.accent } : {}}
                >
                  {f === 'ALL' ? 'Todas' : 'No leídas'}
                </button>
              ))}
              <select
                value={typeFilter}
                onChange={(e) => { setNotifFilter('BY_TYPE'); setTypeFilter(e.target.value); }}
                className="ml-auto px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border-0 focus:outline-none cursor-pointer"
              >
                <option value="success">Éxito</option>
                <option value="warning">Alerta</option>
                <option value="info">Info</option>
                <option value="celebration">Celebración</option>
              </select>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {(() => {
                const filtered = notifications.filter(n => {
                  if (notifFilter === 'UNREAD') return !n.leida;
                  if (notifFilter === 'BY_TYPE') return n.tipo === typeFilter;
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center h-52 text-center p-6">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                        <Bell className="w-5 h-5 text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-600">Sin notificaciones</p>
                      <p className="text-xs text-slate-400 mt-1">Cuando haya actividad, aparecerá aquí.</p>
                    </div>
                  );
                }

                const groups = groupNotificationsByDate(filtered);

                const renderNotifItem = (n) => {
                  const details = getNotifDetails(n.tipo);
                  return (
                    <div
                      key={n.id}
                      onClick={() => { markAsRead(n.id); setIsNotifDrawerOpen(false); if (n.ruta) navigate(n.ruta); }}
                      className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors ${details.border} ${!n.leida ? 'bg-blue-50/30' : ''}`}
                    >
                      <div className={`w-7 h-7 rounded-lg ${details.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                        {details.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-slate-900 leading-snug">{n.titulo}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{n.mensaje}</p>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-1">{getRelativeTime(new Date(n.fecha))}</span>
                      </div>
                      {!n.leida && (
                        <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: theme.accent }} />
                      )}
                    </div>
                  );
                };

                const Section = ({ label, items }) => items.length === 0 ? null : (
                  <div>
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                    </div>
                    {items.map(n => renderNotifItem(n))}
                  </div>
                );

                return (
                  <>
                    <Section label="Hoy" items={groups.today} />
                    <Section label="Esta semana" items={groups.thisWeek} />
                    <Section label="Anterior" items={groups.older} />
                  </>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 shrink-0">
              <button
                onClick={() => { setIsNotifDrawerOpen(false); navigate('/notificaciones'); }}
                className="w-full py-2.5 rounded-xl text-[12px] font-bold border transition-colors"
                style={{ borderColor: theme.accent + '44', color: theme.accent }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.accent + '11'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Ver todas las notificaciones
              </button>
            </div>
          </div>
        </div>
      )}

      <VerificationCelebrationModal
        open={showCelebration}
        onClose={() => setShowCelebration(false)}
      />

      {/* ── MODAL CONFLICTO CARRITO ──────────────────────────────────────── */}
      {conflictoProductor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setConflictoProductor(null)} />
          <div className="bg-white rounded-2xl w-full max-w-sm relative z-10 shadow-2xl border border-slate-100 overflow-hidden">

            {/* Modal header */}
            <div className="bg-amber-50 border-b border-amber-100 px-5 py-4 flex items-center gap-2.5">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-700">Conflicto en el carrito</span>
            </div>

            <div className="p-5 space-y-3">
              <h3 className="text-[15px] font-extrabold text-slate-900 leading-snug">¿Reemplazar el carrito?</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Tu carrito tiene productos de <strong className="text-slate-700">{conflictoProductor.productorExistente}</strong>. ¿Querés reemplazarlos con productos de <strong className="text-slate-700">{conflictoProductor.productorNuevo}</strong>?
              </p>
            </div>

            <div className="px-5 pb-5 flex items-center gap-2.5">
              <button
                onClick={() => setConflictoProductor(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-[13px] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => { reemplazarCarrito(conflictoProductor.producto, conflictoProductor.cantidad); toast.success('Carrito reemplazado'); }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-[13px] transition-colors"
              >
                Reemplazar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
