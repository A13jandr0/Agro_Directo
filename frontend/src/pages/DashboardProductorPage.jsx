import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sprout, PlusCircle, ShoppingBag, MapPin, AlertTriangle, DollarSign, Package, 
  Star, Upload, Edit2, Trash2, Lock, ArrowUpRight, TrendingUp, Clock, 
  BarChart3, Eye, ChevronRight, Zap
} from 'lucide-react';
import axios from 'axios';
import DashboardVentasProductor from '../components/DashboardVentasProductor';

const DashboardProductorPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(true);

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
        console.error("Error fetching dashboard profile", error);
        setServerError(error.response?.data?.error || 'Error al cargar datos del perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const [metricas] = useState({
    ingresosMes: '2,450',
    pedidosActivos: 3,
    productosPublicados: 7,
    calificacionPromedio: 4.8
  });

  const [productos] = useState([
    { id: 1, nombre: 'Soya Grano de Oro', categoria: 'Granos', precio: 120, stock: 50, estado: 'Activo' },
    { id: 2, nombre: 'Tomate Santa Cruz', categoria: 'Hortalizas', precio: 45, stock: 15, estado: 'Agotado' },
    { id: 3, nombre: 'Maíz Amarillo Duro', categoria: 'Granos', precio: 95, stock: 200, estado: 'Activo' },
    { id: 4, nombre: 'Sorgo Forrajero', categoria: 'Cereales', precio: 80, stock: 120, estado: 'Activo' },
  ]);

  const [pedidos] = useState([
    { id: 'PD-001', comprador: 'Supermercados Ketal', producto: '20 qq - Soya Grano', fecha: 'Hoy', monto: '2,400', estado: 'Pendiente' },
    { id: 'PD-002', comprador: 'Maria Lopez', producto: '5 cajas - Tomate', fecha: 'Ayer', monto: '225', estado: 'Pagado' },
    { id: 'PD-003', comprador: 'Agroindustrias Norte', producto: '50 qq - Maíz Amarillo', fecha: '25 Abr', monto: '4,750', estado: 'Enviado' },
  ]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center animate-pulse">
            <Sprout className="w-7 h-7 text-emerald-400" />
          </div>
          <div className="w-48 h-2 rounded-full animate-shimmer" />
          <p className="text-slate-400 font-medium text-sm">Preparando tu panel...</p>
        </div>
      </div>
    );
  }

  const canPublish = userData?.estado === 'VERIFICADO' && userData?.latitud != null && userData?.longitud != null;

  const renderBadge = (estado) => {
    const styles = {
      'Activo': 'badge-success', 'Pagado': 'badge-success', 'Entregado': 'badge-success',
      'Agotado': 'badge-danger', 'Pendiente': 'badge-warning', 'Enviado': 'badge-info',
    };
    return <span className={`badge ${styles[estado] || 'badge-neutral'}`}>{estado.toUpperCase()}</span>;
  };

  const metricCards = [
    { label: 'Ingresos del Mes', value: `Bs. ${metricas.ingresosMes}`, icon: DollarSign, gradient: 'from-emerald-500 to-teal-600', bgLight: 'bg-emerald-50', trend: '+12.5%', trendColor: 'text-emerald-600' },
    { label: 'Pedidos Activos', value: metricas.pedidosActivos, icon: Package, gradient: 'from-emerald-500 to-indigo-600', bgLight: 'bg-emerald-50', trend: 'Hoy', trendColor: 'text-emerald-600' },
    { label: 'Cosechas Online', value: metricas.productosPublicados, icon: Sprout, gradient: 'from-violet-500 to-purple-600', bgLight: 'bg-violet-50', trend: 'Catálogo', trendColor: 'text-violet-600' },
    { label: 'Reputación', value: metricas.calificacionPromedio, icon: Star, gradient: 'from-amber-500 to-orange-600', bgLight: 'bg-amber-50', trend: 'Excelente', trendColor: 'text-amber-600' }
  ];

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-7">
      
      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl animate-slide-up">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c1f17] via-[#0f2a1d] to-[#0a1f14]" />
        {/* Animated orbs */}
        <div className="absolute top-[-40%] right-[-10%] w-[400px] h-[400px] bg-emerald-500/15 rounded-full blur-[80px] animate-float" />
        <div className="absolute bottom-[-30%] left-[-5%] w-[300px] h-[300px] bg-teal-400/10 rounded-full blur-[60px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 dot-pattern opacity-20" />
        
        <div className="relative z-10 p-8 sm:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <span className="bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.15em] border border-emerald-500/20 backdrop-blur-sm">
                  <Zap className="w-3 h-3 inline mr-1" />
                  Resumen General
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight text-white leading-tight">
                Hola, {userData?.nombre_completo?.split(' ')[0] || 'Productor'}
              </h1>
              <p className="text-emerald-200/50 font-medium max-w-lg text-[15px] leading-relaxed">
                Tu finca está produciendo {metricas.productosPublicados} tipos de cosechas este mes. 
                {metricas.pedidosActivos > 0 ? ` Tienes ${metricas.pedidosActivos} pedidos pendientes por gestionar.` : ' No tienes pedidos pendientes hoy.'}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => canPublish ? navigate('/dashboard/productor/cosechas') : null}
                disabled={!canPublish}
                className="px-7 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl font-bold text-sm transition-all duration-500 shadow-xl shadow-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/30 flex items-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed group hover:-translate-y-0.5"
              >
                {canPublish ? <PlusCircle className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                Publicar Cosecha
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ALERTS */}
      <div className="space-y-3 stagger-children">
        {serverError && (
          <div className="card-elevated p-4 flex items-center gap-3 text-rose-700 bg-rose-50 border-rose-200">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold">{serverError}</p>
          </div>
        )}
        {userData?.estado === 'PENDIENTE_VERIFICACION' && (
          <div className="card-elevated !border-amber-200 bg-amber-50/50 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-black text-amber-900">Verificación Requerida</h3>
                <p className="text-sm text-amber-700 mt-1 font-medium">Sube tus documentos para activar la publicación de productos.</p>
              </div>
            </div>
            <button onClick={() => navigate('/dashboard/productor/perfil')} className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 transition-all duration-300 hover:-translate-y-0.5">
              Subir Ahora
            </button>
          </div>
        )}
        {(userData?.latitud == null || userData?.longitud == null) && (
          <div className="card-elevated !border-slate-200 bg-slate-50/50 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-700 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-black text-slate-900">Ubicación de Finca</h3>
                <p className="text-sm text-slate-600 mt-1 font-medium">Registra tu ubicación exacta para que los compradores te encuentren.</p>
              </div>
            </div>
            <button onClick={() => navigate('/dashboard/productor/finca')} className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              Configurar Mapa
            </button>
          </div>
        )}
      </div>

      {/* BI DASHBOARD */}
      <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <DashboardVentasProductor />
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        {metricCards.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="card-elevated p-6 group">
              <div className="flex justify-between items-start mb-5">
                <div className={`w-12 h-12 bg-gradient-to-br ${m.gradient} rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-[11px] font-black px-2.5 py-1 rounded-lg ${m.bgLight} ${m.trendColor} uppercase tracking-wider`}>
                  {m.trend}
                </span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-1">{m.value}</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">{m.label}</p>
            </div>
          );
        })}
      </div>

      {/* MAIN DATA SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* PRODUCTOS TABLE */}
        <div className="xl:col-span-2 card-elevated overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              Mis Productos
            </h2>
            <Link to="/dashboard/productor/cosechas" className="text-[11px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-[0.1em] flex items-center gap-1 group">
              Ver Catálogo <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 text-slate-400 text-[10px] uppercase font-black tracking-[0.15em]">
                  <th className="px-7 py-4">Producto</th>
                  <th className="px-5 py-4 text-center">Precio</th>
                  <th className="px-5 py-4 text-center">Stock</th>
                  <th className="px-5 py-4 text-center">Estado</th>
                  <th className="px-7 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productos.map(prod => (
                  <tr key={prod.id} className="table-row-hover group">
                    <td className="px-7 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-emerald-500 border border-emerald-100 shrink-0 group-hover:shadow-md transition-all duration-300">
                           <Sprout className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{prod.nombre}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{prod.categoria}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-5 text-center">
                      <span className="font-black text-slate-900 text-sm">Bs. {prod.precio}</span>
                    </td>
                    <td className="px-5 py-5 text-center">
                      <span className="font-bold text-slate-500 text-sm">{prod.stock} qq</span>
                    </td>
                    <td className="px-5 py-5 text-center">{renderBadge(prod.estado)}</td>
                    <td className="px-7 py-5 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-300"><Edit2 className="w-4 h-4" /></button>
                        <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-300"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PEDIDOS SIDEBAR */}
        <div className="card-elevated overflow-hidden flex flex-col animate-slide-in-right" style={{ animationDelay: '0.25s' }}>
          <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              Pedidos
            </h2>
            <Link to="/dashboard/productor/pedidos" className="text-[11px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-[0.1em] flex items-center gap-1 group">
              Gestionar <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="p-4 flex-1 space-y-3">
            {pedidos.map(pedido => (
              <div key={pedido.id} className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-sm transition-all duration-300 cursor-pointer group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 border border-slate-100 group-hover:border-emerald-200 transition-colors duration-300">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm leading-tight">{pedido.comprador}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-wider">{pedido.fecha}</p>
                    </div>
                  </div>
                  <p className="font-black text-emerald-600">Bs. {pedido.monto}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-500 truncate pr-4">{pedido.producto}</p>
                  {renderBadge(pedido.estado)}
                </div>
              </div>
            ))}
          </div>
          <div className="p-5 bg-slate-50/50 border-t border-slate-100">
            <button 
              onClick={() => navigate('/dashboard/productor/pedidos')}
              className="w-full py-3 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow"
            >
              Ver todos los pedidos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardProductorPage;
