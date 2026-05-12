import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Store, ShoppingCart, Clock, Bell, MapPin, TrendingUp, ChevronRight,
  Package, Truck, Star, Search, ArrowUpRight, Zap, Heart, Sparkles
} from 'lucide-react';
import CartContext from '../context/CartContext';

const DashboardCompradorPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const { carrito } = useContext(CartContext);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');
        const res = await axios.get('http://localhost:5000/api/usuarios/mi-perfil', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(res.data);
      } catch (error) {
        console.error("Error fetching buyer profile", error);
      }
    };
    fetchProfile();
  }, [navigate]);

  const cartItemCount = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  if (!userData) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center animate-pulse">
            <ShoppingCart className="w-7 h-7 text-blue-400" />
          </div>
          <div className="w-48 h-2 rounded-full animate-shimmer" />
          <p className="text-sm font-medium text-slate-400">Preparando tu panel...</p>
        </div>
      </div>
    );
  }

  const firstName = userData.nombre_completo?.split(' ')[0] || 'Usuario';

  const stats = [
    { label: 'En tu carrito', value: cartItemCount, suffix: 'items', icon: ShoppingCart, gradient: 'from-blue-500 to-indigo-600', bgLight: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: 'Pedidos activos', value: 0, suffix: 'pedidos', icon: Truck, gradient: 'from-violet-500 to-purple-600', bgLight: 'bg-violet-50', textColor: 'text-violet-600' },
    { label: 'Compras totales', value: 0, suffix: 'compras', icon: Package, gradient: 'from-emerald-500 to-teal-600', bgLight: 'bg-emerald-50', textColor: 'text-emerald-600' },
    { label: 'Productores fav.', value: 0, suffix: 'favoritos', icon: Heart, gradient: 'from-rose-500 to-pink-600', bgLight: 'bg-rose-50', textColor: 'text-rose-600' },
  ];

  const quickActions = [
    {
      title: 'Marketplace',
      desc: 'Busca y filtra productos frescos por cercanía desde tu ubicación.',
      icon: Store,
      gradient: 'from-blue-500 to-indigo-600',
      hoverBorder: 'hover:border-blue-300',
      path: '/marketplace'
    },
    {
      title: 'Mi Carrito y Pedidos',
      desc: 'Gestiona tus pedidos y haz seguimiento en tiempo real.',
      icon: ShoppingCart,
      gradient: 'from-violet-500 to-purple-600',
      hoverBorder: 'hover:border-violet-300',
      path: '/carrito'
    },
    {
      title: 'Historial de Compras',
      desc: 'Revisa tus transacciones pasadas y califica productores.',
      icon: Clock,
      gradient: 'from-amber-500 to-orange-600',
      hoverBorder: 'hover:border-amber-300',
      path: '/dashboard/historial'
    },
  ];

  return (
    <div className="p-5 sm:p-8 lg:p-10 space-y-7 max-w-7xl mx-auto">

      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl animate-slide-up">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1729] via-[#131e36] to-[#0d1628]" />
        <div className="absolute top-[-30%] right-[-10%] w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-[80px] animate-float" />
        <div className="absolute bottom-[-20%] left-[-5%] w-[350px] h-[350px] bg-indigo-400/8 rounded-full blur-[60px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 dot-pattern opacity-20" />

        <div className="relative z-10 p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <span className="bg-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.15em] border border-blue-500/20 backdrop-blur-sm">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Panel del Comprador
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight mb-3">
                Hola, {firstName}
              </h1>
              <p className="text-blue-200/50 font-medium max-w-lg text-[15px] leading-relaxed">
                Explora productos frescos directamente de los productores de Santa Cruz. Filtra por cercanía, compara precios y recibe tus pedidos.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={() => navigate('/marketplace')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3.5 rounded-2xl font-bold text-sm transition-all duration-500 flex items-center gap-2.5 shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:-translate-y-0.5 group"
              >
                <Search className="w-4 h-4" />
                Explorar Ofertas
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
              </button>
              {cartItemCount > 0 && (
                <button
                  onClick={() => navigate('/carrito')}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur text-white px-5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center gap-2 border border-white/10"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Carrito ({cartItemCount})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card-elevated p-5 group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 mb-1">{stat.value}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* QUICK ACTIONS */}
      <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-500" /> Acceso rápido
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                onClick={() => navigate(action.path)}
                className={`card-elevated p-6 text-left group ${action.hoverBorder}`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} text-white rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                </div>
                <h3 className="font-black text-slate-900 mb-2">{action.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{action.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ALERTS */}
      <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-black text-slate-900">Novedades para ti</h2>
        </div>
        <div className="space-y-3">
          <div className="card-elevated p-5 flex flex-col sm:flex-row items-start gap-4 group">
            <div className="w-11 h-11 bg-gradient-to-br from-orange-400 to-amber-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-all duration-300">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-slate-900 mb-1">Temporada alta de Achachairú</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Los productores de Porongo y Buena Vista han publicado nuevas ofertas. Reserva antes de que se agoten los lotes.
              </p>
            </div>
            <button
              onClick={() => navigate('/marketplace')}
              className="shrink-0 mt-2 sm:mt-0 sm:self-center text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors group"
            >
              Ver ofertas <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="card-elevated p-5 flex items-start gap-4 group">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-indigo-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-all duration-300">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-black text-slate-900 mb-1">Entregas a domicilio</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Puedes agregar múltiples direcciones de entrega al realizar un pedido: negocio, mercado o domicilio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCompradorPage;
