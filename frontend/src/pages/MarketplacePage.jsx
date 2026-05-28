import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Search, Filter, ShoppingCart, Leaf, CheckCircle2,
  SlidersHorizontal, X, Sparkles, Star, Eye, ArrowUpRight, ArrowDownUp
} from 'lucide-react';
import CartContext from '../context/CartContext';

const MarketplacePage = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [radioKm, setRadioKm] = useState(50);
  const [orden, setOrden] = useState('cercania');
  const [userData, setUserData] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { agregarAlCarrito } = useContext(CartContext);

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        const profileRes = await axios.get('http://localhost:5000/api/usuarios/mi-perfil', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(profileRes.data);
        fetchProductos(profileRes.data.latitud, profileRes.data.longitud, radioKm, token);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const fetchProductos = async (lat, lng, radio, tokenParam) => {
    setLoading(true);
    try {
      const token = tokenParam || localStorage.getItem('token');
      const query = `?radio_km=${radio}&lat_comprador=${lat || ''}&lng_comprador=${lng || ''}`;
      const res = await axios.get(`http://localhost:5000/api/marketplace/productos${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProductos(res.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userData) return;
    const t = setTimeout(() => {
      fetchProductos(userData.latitud, userData.longitud, radioKm);
    }, 400);
    return () => clearTimeout(t);
  }, [radioKm, userData]);

  const handleAgregar = (producto, e) => {
    e.stopPropagation();
    agregarAlCarrito(producto, 1);
    setToastMessage(producto.nombre_producto);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const filteredProducts = productos
    .filter(p => p.nombre_producto.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (orden === 'cercania') return (a.distancia_km || 0) - (b.distancia_km || 0);
      if (orden === 'precio_asc') return a.precio_unitario - b.precio_unitario;
      if (orden === 'precio_desc') return b.precio_unitario - a.precio_unitario;
      return 0;
    });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">

      {/* BANNER DE TEMPORADA */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />
        <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-white/10 rounded-full blur-[60px]" />
        <div className="relative z-10 p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-black mb-1 flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 shrink-0" />
              Temporada de Achachairu
            </h2>
            <p className="text-orange-100/80 font-medium text-sm leading-relaxed">
              Los mejores frutos de Porongo y Buena Vista ya disponibles a precio de temporada.
            </p>
          </div>
          <button
            onClick={() => setSearchQuery('Achachairu')}
            className="bg-white text-orange-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-50 transition-all shadow-lg shrink-0"
          >
            Ver ofertas
          </button>
        </div>
      </div>

      {/* NOTIFICACION AGREGADO AL CARRITO */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white pl-4 pr-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slide-up max-w-[90vw]">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Agregado al carrito</p>
            <p className="text-sm font-bold text-white leading-tight truncate">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* ENCABEZADO Y BUSCADOR */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Marketplace</h1>
            <p className="text-sm text-slate-500 mt-0.5 font-medium">Productos frescos directo del campo</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border transition-all shrink-0 ${showFilters ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20' : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'}`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* PANEL DE FILTROS */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          {/* Filtro de distancia */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Filter className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Radio de busqueda</h3>
              </div>
              <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">{radioKm} km</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[10, 25, 50, 100].map(dist => (
                <button
                  key={dist}
                  onClick={() => setRadioKm(dist)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${radioKm === dist ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'}`}
                >
                  {dist} km
                </button>
              ))}
            </div>
          </div>

          {/* Ordenamiento */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <ArrowDownUp className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-slate-700">Ordenar por</span>
            </div>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="cercania">Mas cercano primero</option>
              <option value="precio_asc">Menor precio</option>
              <option value="precio_desc">Mayor precio</option>
            </select>
          </div>

          {/* Info */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-700 leading-relaxed font-medium">
              Solo se muestran fincas dentro de <span className="font-black">{radioKm} km</span> de tu ubicacion.
            </p>
          </div>
        </div>
      )}

      {/* CONTADOR DE RESULTADOS */}
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium text-slate-500">
          {loading ? 'Buscando...' : `${filteredProducts.length} producto${filteredProducts.length !== 1 ? 's' : ''} encontrado${filteredProducts.length !== 1 ? 's' : ''}`}
        </p>
        {!showFilters && (
          <span className="text-[11px] bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-bold">
            Radio: {radioKm} km
          </span>
        )}
      </div>

      {/* CONTENIDO PRINCIPAL */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="h-44 animate-shimmer" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-20 rounded animate-shimmer" />
                <div className="h-5 w-3/4 rounded animate-shimmer" />
                <div className="h-3 w-1/2 rounded animate-shimmer" />
                <div className="h-9 w-full rounded animate-shimmer mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 py-16 flex flex-col items-center justify-center text-center px-6">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7 text-slate-300" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1">No hay productos en este radio</h3>
          <p className="text-sm text-slate-500 max-w-sm">Intenta ampliar el radio de busqueda o usa otro termino.</p>
          <button
            onClick={() => { setRadioKm(100); setSearchQuery(''); }}
            className="mt-5 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Ampliar a 100 km
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(p => (
            <div
              key={p.cosecha_id}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden group flex flex-col hover:shadow-lg hover:shadow-slate-200/60 transition-all duration-300"
            >
              {/* IMAGEN */}
              <div
                onClick={() => navigate('/producto/' + p.cosecha_id)}
                className="h-44 bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden relative"
              >
                {p.foto_url ? (
                  <img
                    src={`http://localhost:5000${p.foto_url}`}
                    alt={p.nombre_producto}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Leaf className="w-10 h-10 text-slate-200" />
                    <span className="text-[11px] text-slate-300 font-medium">Sin imagen</span>
                  </div>
                )}
                {/* Overlay en hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-3">
                  <div className="w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center shadow-lg">
                    <Eye className="w-4 h-4 text-slate-700" />
                  </div>
                </div>
                {/* Badges de estado */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                  {p.es_preventa ? (
                    <span className="text-[10px] font-bold bg-violet-500 text-white px-2 py-0.5 rounded-md shadow-sm">
                      Preventa
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-md shadow-sm">
                      Disponible
                    </span>
                  )}
                  {p.cantidad_disponible < 5 && (
                    <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-md shadow-sm">
                      Ultimas unidades
                    </span>
                  )}
                </div>
              </div>

              {/* INFORMACION */}
              <div className="p-4 flex-1 flex flex-col gap-2">
                {/* Etiquetas */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {p.distancia_km ? p.distancia_km.toFixed(0) : '?'} km
                  </span>
                </div>

                {/* Nombre */}
                <h3
                  onClick={() => navigate('/producto/' + p.cosecha_id)}
                  className="font-bold text-slate-900 leading-snug cursor-pointer hover:text-emerald-600 transition-colors line-clamp-2 text-sm"
                >
                  {p.nombre_producto}
                </h3>

                {/* Origen */}
                <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
                  {p.nombre_finca} — {p.municipio || 'Santa Cruz'}
                </p>

                {/* Precio y boton */}
                <div className="mt-auto pt-3 border-t border-slate-100 flex items-end justify-between gap-2">
                  <div>
                    <p className="text-xl font-black text-slate-900 leading-none">
                      Bs. {p.precio_unitario}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">por {p.unidad_medida}</p>
                  </div>
                  <button
                    onClick={(e) => handleAgregar(p, e)}
                    className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-emerald-600/20 hover:shadow-xl shrink-0"
                    title="Agregar al carrito"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
