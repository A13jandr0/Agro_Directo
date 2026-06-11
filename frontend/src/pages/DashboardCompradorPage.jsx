import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Store, ShoppingCart, Clock, Bell, MapPin, TrendingUp, ChevronRight,
  Package, Truck, Search, ArrowUpRight, Wallet, CheckCircle2, AlertCircle,
  Leaf, Calendar
} from 'lucide-react';
import CartContext from '../context/CartContext';
import PageShell from '../components/ui/PageShell';
import MetricCard from '../components/ui/MetricCard';
import { useToast } from '../context/ToastContext';

// Categorías populares con gradientes e íconos grandes
const POPULAR_CATEGORIES = [
  { id: 'Frutas', label: 'Frutas 🍎', gradient: 'from-orange-400 to-amber-500', icon: '🍎' },
  { id: 'Verduras', label: 'Verduras 🥬', gradient: 'from-emerald-400 to-teal-500', icon: '🥬' },
  { id: 'Granos', label: 'Granos 🌾', gradient: 'from-yellow-400 to-amber-600', icon: '🌾' },
  { id: 'Tubérculos', label: 'Tubérculos 🥔', gradient: 'from-amber-600 to-amber-800', icon: '🥔' },
  { id: 'Carnes', label: 'Carnes 🥩', gradient: 'from-red-400 to-rose-600', icon: '🥩' },
  { id: 'Lácteos', label: 'Lácteos 🥛', gradient: 'from-blue-300 to-indigo-500', icon: '🥛' }
];

const DashboardCompradorPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { carrito } = useContext(CartContext);

  const [userData, setUserData] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  
  // Productos mock para carruseles
  const [nearbyProducts, setNearbyProducts] = useState([
    { id: '101', nombre: 'Soya Grano de Oro', precio: 120, unidad: 'Quintal', distancia: 2.4, foto_url: null, productor: 'Asociación Montero' },
    { id: '102', nombre: 'Tomate Santa Cruz', precio: 28, unidad: 'Caja', distancia: 4.8, foto_url: null, productor: 'Finca El Sol' },
    { id: '103', nombre: 'Yuca Harinosa', precio: 14, unidad: 'Arroba', distancia: 8.1, foto_url: null, productor: 'Hacienda Warnes' }
  ]);

  const [preventas, setPreventas] = useState([
    { id: '201', nombre: 'Achachairú Dulce', precio: 35, unidad: 'Caja', diasRestantes: 5, foto_url: null, productor: 'Huerta Florida' },
    { id: '202', nombre: 'Papa Harinosa', precio: 18, unidad: 'Arroba', diasRestantes: 3, foto_url: null, productor: 'Vallegrande Agrícola' }
  ]);

  useEffect(() => {
    const loadDashboard = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [perfilRes, pedidosRes, marketplaceRes] = await Promise.all([
          axios.get('http://localhost:5000/api/usuarios/mi-perfil', { headers }),
          axios.get('http://localhost:5000/api/pedidos/comprador', { headers }).catch(() => ({ data: [] })),
          axios.get('http://localhost:5000/api/marketplace/productos', { headers }).catch(() => ({ data: [] }))
        ]);
        
        setUserData(perfilRes.data);
        setPedidos(pedidosRes.data || []);
        
        const marketplaceProducts = marketplaceRes.data || [];
        if (marketplaceProducts.length > 0) {
          // Filtrar preventas reales y productos cercanos
          const realPreventas = marketplaceProducts
            .filter(p => p.es_preventa)
            .map(p => ({
              id: p.cosecha_id || p.id,
              nombre: p.nombre_producto,
              precio: Number(p.precio_unitario),
              unidad: p.unidad_medida,
              diasRestantes: 5, // Default mock days
              foto_url: p.foto_url,
              productor: p.nombre_finca || 'Productor Verificado'
            }));
          if (realPreventas.length > 0) setPreventas(realPreventas);

          const realNearby = marketplaceProducts
            .filter(p => !p.es_preventa)
            .map((p, idx) => ({
              id: p.cosecha_id || p.id,
              nombre: p.nombre_producto,
              precio: Number(p.precio_unitario),
              unidad: p.unidad_medida,
              distancia: Number((idx * 2.3 + 1.2).toFixed(1)),
              foto_url: p.foto_url,
              productor: p.nombre_finca || 'Productor Verificado'
            }));
          if (realNearby.length > 0) setNearbyProducts(realNearby);
        }

      } catch (error) {
        console.error('Error al cargar panel de comprador:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [navigate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const selectCategory = (catId) => {
    navigate(`/marketplace?category=${catId}`);
  };

  const getStatusBadge = (estado) => {
    const states = {
      PENDIENTE: 'bg-amber-50 text-amber-700 border-amber-200 rounded-full px-3 py-1 text-xs font-semibold border',
      PENDIENTE_CONFIRMACION: 'bg-amber-50 text-amber-700 border-amber-200 rounded-full px-3 py-1 text-xs font-semibold border',
      CONFIRMADO: 'bg-blue-50 text-blue-700 border-blue-200 rounded-full px-3 py-1 text-xs font-semibold border',
      COMPROBANTE_ENVIADO: 'bg-purple-50 text-purple-700 border-purple-200 rounded-full px-3 py-1 text-xs font-semibold border',
      RECHAZADO: 'bg-rose-50 text-rose-700 border-rose-200 rounded-full px-3 py-1 text-xs font-semibold border',
      ENVIADO: 'bg-sky-50 text-sky-700 border-sky-200 rounded-full px-3 py-1 text-xs font-semibold border',
      ENTREGADO: 'bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full px-3 py-1 text-xs font-semibold border',
      PAGADO: 'bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full px-3 py-1 text-xs font-semibold border'
    };
    return (
      <span className={`uppercase tracking-wide ${states[estado] || 'bg-gray-50 text-gray-600 rounded-full px-3 py-1 text-xs font-semibold border'}`}>
        {estado}
      </span>
    );
  };

  const cartItemCount = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  if (loading || !userData) {
    return (
      <div className="flex h-full items-center justify-center py-24 page-canvas">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
            <Store className="w-6 h-6 text-blue-600 animate-pulse" />
          </div>
          <p className="text-slate-500 font-medium text-sm">Cargando ofertas y pedidos...</p>
        </div>
      </div>
    );
  }

  const firstName = userData.nombre_completo?.split(' ')[0] || 'Comprador';

  return (
    <PageShell>
      {/* Hero Bienvenida & Barra de Búsqueda Prominente */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 shadow-sm bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 text-white p-8 sm:p-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-2xl space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Hola, {firstName} 👋
            </h1>
            <p className="text-indigo-100 text-sm mt-2 font-medium">
              ¿Qué buscás hoy? Adquirí alimentos frescos directamente desde el chaco cruceño.
            </p>
          </div>

          {/* Input Grande de Búsqueda */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-xl group">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Buscar tomates, papas, mangos..."
              className="w-full pl-12 pr-28 py-3.5 bg-white text-slate-800 rounded-2xl text-sm font-semibold outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all border-none"
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Buscar
            </button>
          </form>

          {/* Chips de Categorías */}
          <div className="flex flex-wrap gap-2 pt-2">
            {['Frutas', 'Verduras', 'Granos', 'Tubérculos', 'Carnes'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => selectCategory(cat)}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold border border-white/10 transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards de Categorías Populares (Grid 2x3 con íconos grandes) */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-[#111827] tracking-tight">Categorías populares</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {POPULAR_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => selectCategory(cat.id)}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                {cat.icon}
              </div>
              <span className="text-xs font-bold text-slate-800 mt-3">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sección Cerca tuyo (Scroll horizontal) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[#111827] tracking-tight">Cerca de tu ubicación</h2>
          <Link to="/marketplace" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Ver todas <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
          {nearbyProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => navigate(`/producto/${prod.id}`)}
              className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm min-w-[240px] sm:min-w-[260px] snap-start hover:shadow-md cursor-pointer transition-all flex flex-col justify-between shrink-0"
            >
              <div>
                <div className="h-32 bg-slate-100 rounded-xl relative overflow-hidden flex items-center justify-center mb-4">
                  {prod.foto_url ? (
                    <img src={`http://localhost:5000${prod.foto_url}`} className="w-full h-full object-cover" alt={prod.nombre} />
                  ) : (
                    <Leaf className="w-8 h-8 text-emerald-200" />
                  )}
                  {/* Distance badge */}
                  <span className="absolute top-2 left-2 bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-lg text-[9px] font-black flex items-center gap-1 shadow-sm">
                    <MapPin className="w-3 h-3" />
                    {prod.distancia} km
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-800 text-sm truncate">{prod.nombre}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-bold">{prod.productor}</p>
              </div>
              <div className="flex items-end justify-between mt-4 pt-3 border-t border-slate-50">
                <span className="text-base font-black text-emerald-600">Bs. {prod.precio} / {prod.unidad}</span>
                <span className="text-[10px] font-bold text-indigo-600">Comprar direct</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sección Preventas disponibles (Countdown) */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-[#111827] tracking-tight">Preventas disponibles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {preventas.map((prod) => (
            <div
              key={prod.id}
              onClick={() => navigate(`/producto/${prod.id}`)}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6 text-indigo-600 animate-float" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">{prod.nombre}</h4>
                  <p className="text-[10px] text-slate-400 font-bold">{prod.productor}</p>
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-lg text-[9px] font-black mt-2">
                    Disponible en {prod.diasRestantes} días
                  </span>
                </div>
              </div>
              <span className="text-lg font-black text-slate-900 shrink-0 ml-4">
                Bs. {prod.precio} / {prod.unidad}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pedidos recientes */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[#111827] tracking-tight">Mis pedidos recientes</h2>
          <Link to="/dashboard/comprador/mis-pedidos" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Ver historial completo <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pedidos.length === 0 ? (
          <p className="text-slate-400 text-xs py-4 text-center font-semibold">No tenés pedidos registrados todavía.</p>
        ) : (
          <div className="divide-y divide-slate-50">
            {pedidos.slice(0, 3).map((ped) => (
              <div key={ped.id} className="py-3.5 flex items-center justify-between text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <span className="font-black text-slate-800">Pedido #{ped.id?.slice(0, 6).toUpperCase()}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {new Date(ped.fecha_pedido).toLocaleDateString('es-BO')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-extrabold text-slate-900">Bs. {Number(ped.monto_total).toFixed(2)}</span>
                  {getStatusBadge(ped.estado)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default DashboardCompradorPage;
