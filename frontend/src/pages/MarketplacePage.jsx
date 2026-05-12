import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Search, Filter, ShoppingCart, Leaf, CheckCircle2,
  SlidersHorizontal, X, Sparkles, Star, Eye, ArrowUpRight
} from 'lucide-react';
import CartContext from '../context/CartContext';

const MarketplacePage = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [radioKm, setRadioKm] = useState(50);
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
      console.error('Error fetching products:', error);
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

  const filteredProducts = productos.filter(p =>
    p.nombre_producto.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-6">

      {/* SEASON BANNER (US08) */}
      <div className="relative overflow-hidden rounded-3xl animate-slide-up">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 animate-gradient" />
        <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-white/10 rounded-full blur-[60px] animate-float" />
        <div className="absolute bottom-[-40%] left-[-5%] w-[200px] h-[200px] bg-yellow-300/10 rounded-full blur-[40px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="relative z-10 p-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black mb-1.5 flex items-center gap-2 text-white">
              <Sparkles className="w-6 h-6" />
              Temporada de Achachairú
            </h2>
            <p className="text-orange-50/80 font-medium text-sm">
              Los mejores frutos de Porongo y Buena Vista ya están disponibles. Aprovecha los precios de temporada.
            </p>
          </div>
          <button 
            onClick={() => setSearchQuery('Achachairú')}
            className="bg-white text-orange-600 px-7 py-3 rounded-2xl font-bold text-sm hover:bg-orange-50 transition-all duration-300 shadow-xl hover:-translate-y-0.5 shrink-0"
          >
            Ver ofertas
          </button>
        </div>
      </div>

      {/* TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white pl-4 pr-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slide-up">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Agregado al carrito</p>
            <p className="text-sm font-bold text-white leading-tight">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Marketplace</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Productos frescos directos del campo cruceño</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-xl border transition-all duration-300 shrink-0 ${showFilters ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600'}`}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <div className="card-elevated p-6 animate-scale-bounce">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Filter className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-black text-slate-900 text-sm">Filtro por cercanía</h3>
            </div>
            <span className="text-sm font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-xl">{radioKm} km</span>
          </div>
          <input
            type="range" min="5" max="100" step="5"
            value={radioKm}
            onChange={e => setRadioKm(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-bold">
            <span>5 km</span><span>50 km</span><span>100 km</span>
          </div>
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
            <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed font-medium">
              Solo se muestran fincas ubicadas dentro de <span className="font-black">{radioKm} km</span> de distancia desde tu ubicación.
            </p>
          </div>
        </div>
      )}

      {/* RESULTS COUNT */}
      <div className="flex items-center gap-3 animate-fade-in">
        <p className="text-sm font-medium text-slate-500">
          {loading ? 'Buscando...' : `${filteredProducts.length} producto${filteredProducts.length !== 1 ? 's' : ''} encontrado${filteredProducts.length !== 1 ? 's' : ''}`}
        </p>
        {!showFilters && (
          <span className="text-[11px] bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full font-bold">
            Radio: {radioKm} km
          </span>
        )}
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="h-48 animate-shimmer" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-20 rounded animate-shimmer" />
                <div className="h-5 w-3/4 rounded animate-shimmer" />
                <div className="h-3 w-1/2 rounded animate-shimmer" />
                <div className="h-8 w-full rounded animate-shimmer mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="card-elevated !border-dashed !border-2 py-20 flex flex-col items-center justify-center text-center px-6 animate-fade-in">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-5">
            <Sparkles className="w-7 h-7 text-slate-300" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-2">No hay productos en este radio</h3>
          <p className="text-sm text-slate-500 max-w-sm">Prueba ampliar el radio o buscar con otro término.</p>
          <button
            onClick={() => { setRadioKm(200); setSearchQuery(''); }}
            className="mt-6 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Ampliar a 200 km
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger-children">
          {filteredProducts.map(p => (
            <div
              key={p.cosecha_id}
              className="card-elevated overflow-hidden group flex flex-col"
            >
              {/* IMAGE */}
              <div
                onClick={() => navigate('/producto/' + p.cosecha_id)}
                className="h-48 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center cursor-pointer overflow-hidden relative"
              >
                {p.foto_url ? (
                  <img
                    src={`http://localhost:5000${p.foto_url}`}
                    alt={p.nombre_producto}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Leaf className="w-10 h-10 text-slate-200" />
                    <span className="text-[11px] text-slate-300 font-medium">Sin imagen</span>
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-end p-3">
                  <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg">
                    <Eye className="w-4 h-4 text-slate-700" />
                  </div>
                </div>
              </div>

              {/* INFO */}
              <div className="p-5 flex-1 flex flex-col gap-2.5">
                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg flex items-center gap-1 uppercase tracking-wider">
                    <MapPin className="w-3 h-3" /> {p.distancia_km.toFixed(0)} km
                  </span>
                  {p.es_preventa ? (
                    <span className="text-[10px] font-black bg-violet-100 text-violet-700 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      Preventa
                    </span>
                  ) : (
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      Disponible
                    </span>
                  )}
                </div>

                {/* Name */}
                <h3
                  onClick={() => navigate('/producto/' + p.cosecha_id)}
                  className="font-black text-slate-900 leading-snug cursor-pointer hover:text-blue-600 transition-colors duration-300 line-clamp-2"
                >
                  {p.nombre_producto}
                </h3>

                {/* Origin */}
                <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
                  {p.nombre_finca} — {p.municipio || 'Santa Cruz'}
                </p>

                {/* Price + Action */}
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-2xl font-black text-slate-900 leading-none">
                      Bs. {p.precio_unitario}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">por {p.unidad_medida}</p>
                  </div>
                  <button
                    onClick={(e) => handleAgregar(p, e)}
                    className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 shrink-0"
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
