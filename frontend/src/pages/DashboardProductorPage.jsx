import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sprout, Plus, ShoppingBag, MapPin, AlertTriangle, DollarSign, Package,
  Wallet, Star, ArrowUpRight, Clock, TrendingUp, ChevronRight,
  TrendingDown, Eye, ShieldAlert, ArrowRight
} from 'lucide-react';
import axios from 'axios';
import PageShell from '../components/ui/PageShell';
import MetricCard from '../components/ui/MetricCard';
import { useToast } from '../context/ToastContext';
import { getImageUrl, handleImageError } from '../utils/imageUtils';

const DashboardProductorPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [preciosComparativa, setPreciosComparativa] = useState([
    { producto: 'Tomate', tuPrecio: 25.00, precioAbasto: 28.50 },
    { producto: 'Papa', tuPrecio: 19.00, precioAbasto: 18.00 },
    { producto: 'Zanahoria', tuPrecio: 14.00, precioAbasto: 15.50 },
    { producto: 'Cebolla', tuPrecio: 20.00, precioAbasto: 22.00 }
  ]);

  const [metricas, setMetricas] = useState({
    ventasMesCount: 12,
    ventasMesTrend: '↑ 14%',
    ventasMesTrendUp: true,
    cosechasActivas: 0,
    pedidosPendientes: 0,
    ingresosMesBs: 0
  });

  useEffect(() => {
    const loadDashboard = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [perfilRes, catalogoRes, pedidosRes, metricasRes] = await Promise.all([
          axios.get('http://localhost:5000/api/usuarios/mi-perfil', { headers }),
          axios.get('http://localhost:5000/api/cosechas/mi-catalogo', { headers }),
          axios.get('http://localhost:5000/api/pedidos/productor', { headers }).catch(() => ({ data: [] })),
          axios.get('http://localhost:5000/api/productores/metricas', { headers }).catch(() => ({ data: { ingresos_mes: 0 } }))
        ]);

        setUserData(perfilRes.data);
        const catalogo = catalogoRes.data || [];
        const pedidosData = pedidosRes.data || [];
        const ingresosMes = metricasRes.data.ingresos_mes || 0;

        // Calcular métricas
        const cosechasActivas = catalogo.filter(c => c.estado_publicacion === 'Activo' || !c.es_preventa).length;
        const pendingOrders = pedidosData.filter(p => p.estado === 'PENDIENTE' || p.estado === 'PENDIENTE_CONFIRMACION');

        setMetricas({
          ventasMesCount: pedidosData.filter(p => p.estado === 'ENTREGADO' || p.estado === 'CONFIRMADO').length,
          ventasMesTrend: '↑ 18%',
          ventasMesTrendUp: true,
          cosechasActivas,
          pedidosPendientes: pendingOrders.length,
          ingresosMesBs: ingresosMes
        });

        // Formatear cosechas recientes
        setProductos(
          catalogo.slice(0, 3).map(c => ({
            id: c.id,
            nombre: c.nombre_producto,
            categoria: c.categoria,
            precio: c.precio_unitario,
            stock: c.cantidad_disponible,
            unidad: c.unidad_medida,
            es_preventa: c.es_preventa,
            foto_url: c.foto_url,
            estado: c.es_preventa ? 'Preventa' : (c.cantidad_disponible <= 0 ? 'Agotado' : 'Activo')
          }))
        );

        // Formatear pedidos urgentes/pendientes
        setPedidos(
          pedidosData.map(p => {
            const diasDiff = Math.floor((Date.now() - new Date(p.fecha_pedido).getTime()) / (1000 * 60 * 60 * 24));
            let urgencia = 'SEMANA'; // HOY o SEMANA
            if (diasDiff === 0 || p.estado === 'PENDIENTE') {
              urgencia = 'HOY';
            }
            return {
              id: p.id,
              comprador: p.nombre_comprador || 'Comprador AgroDirecto',
              producto: p.detalles?.[0]?.nombre_producto || 'Cosechas Varias',
              cantidad: p.detalles?.[0]?.cantidad || 1,
              unidad: p.detalles?.[0]?.unidad_medida || 'Kg',
              estado: p.estado || 'PENDIENTE',
              urgencia
            };
          })
        );

      } catch (error) {
        console.error('Error al cargar panel de productor:', error);
        toast.error('No se pudo cargar la información del dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-24 page-canvas">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
            <Sprout className="w-6 h-6 text-emerald-600 animate-pulse" />
          </div>
          <p className="text-slate-500 font-medium text-sm">Cargando métricas de producción...</p>
        </div>
      </div>
    );
  }

  const isPendingVerification = userData?.estado === 'PENDIENTE_VERIFICACION' || userData?.estado === 'PENDIENTE';

  // --- LOGS AGREGADOS PARA DEPURACIÓN ---
  console.log("--- RENDERING DASHBOARD PRODUCTOR ---");
  console.log("1. Métricas calculadas desde el backend:", metricas);
  console.log("2. Pedidos pendientes mapeados:", pedidos);
  console.log("3. Productos recientes (catálogo):", productos);
  console.log("4. (No hay gráficos de Recharts en este componente)");
  // --------------------------------------

  const renderBadge = (estado) => {
    const styles = {
      Activo: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Preventa: 'bg-blue-50 text-blue-700 border-blue-200',
      Agotado: 'bg-rose-50 text-rose-700 border-rose-200',
      PENDIENTE: 'bg-amber-50 text-amber-700 border-amber-200',
      CONFIRMADO: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    return (
      <span className={`badge ${styles[estado] || 'bg-gray-50 text-gray-600'}`}>
        {estado}
      </span>
    );
  };

  return (
    <PageShell>
      {/* Banner de Verificación Pendiente */}
      {isPendingVerification && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse-glow">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-amber-500 text-white rounded-xl flex items-center justify-center relative shrink-0">
              <ShieldAlert className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-amber-500 animate-ping" />
            </div>
            <div>
              <h3 className="font-extrabold text-amber-900 flex items-center gap-2">
                ⏳ Cuenta en revisión
              </h3>
              <p className="text-sm text-amber-800/80 mt-1 font-semibold">
                Tu cuenta está en revisión. Podés explorar la plataforma pero no publicar nuevas cosechas hasta ser verificado.
              </p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/dashboard/productor/perfil')}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-md shadow-amber-600/10"
          >
            Subir documentos
          </button>
        </div>
      )}

      {/* Grid de 4 Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
        <MetricCard
          label="Total Ventas del Mes"
          value={metricas.ventasMesCount}
          icon={ShoppingBag}
          accent="emerald"
          trend={metricas.ventasMesTrend}
          trendUp={metricas.ventasMesTrendUp}
        />
        <MetricCard
          label="Cosechas Activas"
          value={metricas.cosechasActivas}
          icon={Sprout}
          accent="violet"
        />
        <MetricCard
          label="Pedidos Pendientes"
          value={metricas.pedidosPendientes}
          icon={Package}
          accent="rose"
          sublabel={metricas.pedidosPendientes > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-rose-600 font-extrabold animate-pulse">
              ● Confirmación requerida
            </span>
          ) : 'Al día'}
        />
        <MetricCard
          label="Ingresos del Mes"
          value={`Bs. ${metricas.ingresosMesBs.toLocaleString('es-BO')}`}
          icon={Wallet}
          accent="amber"
        />
      </div>

      {/* Sección Pedidos Urgentes */}
      {pedidos.filter(p => p.estado === 'PENDIENTE' || p.estado === 'PENDIENTE_CONFIRMACION').length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-[#111827] tracking-tight">Pedidos urgentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pedidos
              .filter(p => p.estado === 'PENDIENTE' || p.estado === 'PENDIENTE_CONFIRMACION')
              .slice(0, 2)
              .map((p) => (
                <div 
                  key={p.id}
                  className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between ${
                    p.urgencia === 'HOY' ? 'border-l-4 border-l-rose-500' : 'border-l-4 border-l-amber-500'
                  }`}
                >
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">{p.comprador}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {p.producto} — {p.cantidad} {p.unidad}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wide">
                      <Clock className="w-3 h-3" />
                      {p.urgencia === 'HOY' ? 'Responder hoy' : 'Esta semana'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {renderBadge(p.estado)}
                    <button 
                      onClick={() => navigate('/dashboard/productor/pedidos')}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors border border-slate-200"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Sección Cosechas y Comparador */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mis Últimas Cosechas (Col Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-[#111827] tracking-tight">Mis últimas cosechas</h2>
            <Link 
              to="/dashboard/productor/cosechas" 
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Ver todo el catálogo <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {productos.length === 0 ? (
              <div className="sm:col-span-3 bg-white border border-slate-200/60 rounded-3xl p-8 text-center text-slate-400">
                <Sprout className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <span className="text-sm font-semibold">No tenés cosechas publicadas</span>
              </div>
            ) : (
              productos.map((prod) => (
                <div 
                  key={prod.id} 
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col group hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
                >
                  <div className="h-32 bg-slate-100 relative">
                    {prod.foto_url ? (
                      <>
                        <img 
                          src={getImageUrl(prod.foto_url)} 
                          className="w-full h-full object-cover z-10 relative" 
                          alt={prod.nombre} 
                          onError={handleImageError}
                        />
                        <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50 hidden items-center justify-center absolute inset-0 z-0">
                          <Sprout className="w-10 h-10 text-emerald-200" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                        <Sprout className="w-10 h-10 text-emerald-200" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">{renderBadge(prod.estado)}</div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm truncate">{prod.nombre}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{prod.categoria}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm font-bold text-slate-900">Bs. {prod.precio} / {prod.unidad}</span>
                      <span className="text-[10px] font-bold text-slate-500">Stock: {prod.stock}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Comparador de Precios del Abasto */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-[#111827] tracking-tight">Comparador de precios del Abasto</h2>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-5 space-y-4">
            <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
              <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-800 leading-normal font-semibold">
                Monitoreá los precios del Mercado de Abasto de Santa Cruz y mantenete competitivo.
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="py-2.5">Producto</th>
                    <th className="py-2.5 text-center">Tu Precio</th>
                    <th className="py-2.5 text-center">Abasto</th>
                    <th className="py-2.5 text-right">Diferencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {preciosComparativa.map((p, i) => {
                    const diff = ((p.tuPrecio - p.precioAbasto) / p.precioAbasto) * 100;
                    const diffLabel = diff > 0 ? `+${diff.toFixed(0)}%` : `${diff.toFixed(0)}%`;
                    const diffColor = diff > 0 ? 'text-rose-600' : 'text-emerald-600';
                    return (
                      <tr key={i}>
                        <td className="py-3 font-bold text-slate-800">{p.producto}</td>
                        <td className="py-3 text-center">Bs. {p.tuPrecio.toFixed(2)}</td>
                        <td className="py-3 text-center">Bs. {p.precioAbasto.toFixed(2)}</td>
                        <td className={`py-3 text-right font-black ${diffColor}`}>{diffLabel}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Botón flotante "+" verde en la esquina inferior derecha */}
      <button
        onClick={() => !isPendingVerification && navigate('/dashboard/productor/cosechas')}
        disabled={isPendingVerification}
        title={isPendingVerification ? 'Debes estar verificado para publicar' : 'Publicar nueva cosecha'}
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-2xl flex items-center justify-center z-40 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed group"
      >
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </PageShell>
  );
};

export default DashboardProductorPage;
