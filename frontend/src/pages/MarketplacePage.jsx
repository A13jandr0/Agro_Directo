import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  MapPin, Search, Filter, ShoppingCart, Leaf, CheckCircle2,
  SlidersHorizontal, X, Sparkles, Star, Eye, ArrowUpRight, ArrowDownUp, Check, Minus, Plus, Loader2 } from
'lucide-react';
import CartContext from '../context/CartContext';
import PageShell from '../components/ui/PageShell';
import { useToast } from '../context/ToastContext';
import { getImageUrl, handleImageError } from '../utils/imageUtils';

const SANTA_CRUZ_PROVINCES = [
'Andrés Ibáñez',
'Obispo Santistevan',
'Warnes',
'Ichilo',
'Sara',
'Chiquitos',
'Cordillera',
'Vallegrande'];


const MarketplacePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const productorIdFiltro = searchParams.get('productor_id');
  const { carrito, agregarAlCarritoConVerificacion, actualizarCantidad, eliminarDelCarrito } = useContext(CartContext);

  // States
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [maxPrice, setMaxPrice] = useState(500);
  const [maxDistance, setMaxDistance] = useState(200);
  const [modalidad, setModalidad] = useState('Todos'); // Todos | Inmediata | Preventas
  const [selectedProvinces, setSelectedProvinces] = useState([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const latComprador = -17.7833;
  const lngComprador = -63.1821;

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/marketplace/productos', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          lat_comprador: latComprador,
          lng_comprador: lngComprador,
          radio_km: 200 // Obtener todos hasta 200km para filtrar dinámicamente en el frontend
        }
      });
      const data = res.data || [];
      const knownIds = JSON.parse(sessionStorage.getItem('marketplace_known_ids') || '[]');
      const currentIds = data.map((p) => p.cosecha_id);
      const nuevos = currentIds.filter((id) => !knownIds.includes(id)).length;
      if (knownIds.length > 0 && nuevos > 0) {
        toast.info("Productos nuevos", `Hay ${nuevos} producto${nuevos > 1 ? 's' : ''} nuevo${nuevos > 1 ? 's' : ''} desde tu última visita`);
      }
      sessionStorage.setItem('marketplace_known_ids', JSON.stringify(currentIds));
      setProductos(data);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar productos del marketplace');
    } finally {
      setLoading(false);
    }
  };

  // Checkbox handlers
  const handleCategoryChange = (cat) => {
    setSelectedCategories((prev) =>
    prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleProvinceChange = (prov) => {
    setSelectedProvinces((prev) =>
    prev.includes(prov) ? prev.filter((p) => p !== prov) : [...prev, prov]
    );
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setMaxPrice(500);
    setMaxDistance(200);
    setModalidad('Todos');
    setSelectedProvinces([]);
    setVerifiedOnly(false);
    setSearchVal('');
    toast.info('Filtros limpiados');
  };

  const getCartQuantity = (prodId) => {
    const item = carrito.find((it) => (it.cosecha_id || it.id) === prodId);
    return item ? item.cantidad : 0;
  };

  // Filter logic in memory
  const filteredProducts = productos.filter((p) => {
    const matchesSearch = p.nombre_producto.toLowerCase().includes(searchVal.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.categoria);
    const matchesPrice = Number(p.precio_unitario) <= maxPrice;

    const distance = p.distancia_km !== null && p.distancia_km !== undefined ?
    parseFloat(p.distancia_km) :
    Number.POSITIVE_INFINITY;
    const matchesDistance = Number.isFinite(distance) ?
    distance <= maxDistance :
    maxDistance >= 200;

    const matchesModalidad = modalidad === 'Todos' ||
    modalidad === 'Inmediata' && !p.es_preventa ||
    modalidad === 'Preventas' && p.es_preventa;

    // En el mockup se asume provincia y verificación
    const province = p.provincia || 'Andrés Ibáñez';
    const matchesProvince = selectedProvinces.length === 0 || selectedProvinces.includes(province);

    // Verificación
    const matchesVerified = !verifiedOnly || p.productor_verificado || true;

    const matchesProductor = !productorIdFiltro ||
    String(p.productor_id) === String(productorIdFiltro) ||
    String(p.perfil_productor_id) === String(productorIdFiltro);

    return matchesSearch && matchesCategory && matchesPrice && matchesDistance && matchesModalidad && matchesProvince && matchesVerified && matchesProductor;
  });

  const productorNombreFiltro = productorIdFiltro ?
  filteredProducts.length > 0 ? filteredProducts[0].nombre_finca || filteredProducts[0].nombre_productor || 'Productor' : 'Productor' :
  null;

  return (
    <PageShell>
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
            <Star size={16} className="inline-block mr-1" /><Star size={16} className="inline-block mr-1" /> Catálogo Abierto
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Marketplace</h1>
          <p className="text-sm text-slate-400 mt-1">
            {productorIdFiltro ?
            `${filteredProducts.length} productos de ${productorNombreFiltro}` :
            `${filteredProducts.length} productos disponibles cerca tuyo`}
          </p>
        </div>

        {/* Search & Toggle Filters Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar tomate, papa, maíz..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400" />
            
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border transition-all shrink-0 ${
            showFilters ?
            'bg-blue-600 text-white border-blue-600 shadow-md' :
            'bg-white text-slate-500 border-slate-200 hover:text-blue-600'}`
            }>
            
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {productorIdFiltro &&
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 my-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-700"><Star size={16} className="inline-block mr-1" /> Mostrando productos de: {productorNombreFiltro}</span>
          </div>
          <button
          onClick={() => navigate('/marketplace')}
          className="text-blue-600 text-sm underline hover:text-blue-800">
          
            Quitar filtro ×
          </button>
        </div>
      }

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Panel de filtros (sidebar izquierdo colapsable) */}
        <div className={`${showFilters ? 'block' : 'hidden lg:block'} lg:col-span-1 space-y-6 animate-fade-in`}>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Filtros Avanzados</h3>
              <button onClick={resetFilters} className="text-xs font-extrabold text-blue-600 hover:underline">
                Limpiar todo
              </button>
            </div>

            {/* Categorías Checkboxes */}
            {!productorIdFiltro &&
            <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categorías</h4>
                <div className="space-y-2">
                  {[
                { id: 'Verduras', label: "Verduras" },
                { id: 'Frutas', label: "Frutas" },
                { id: 'Granos', label: "Granos" },
                { id: 'Tubérculos', label: "Tub\xE9rculos" }].
                map((c) =>
                <label key={c.id} className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
                      <input
                    type="checkbox"
                    checked={selectedCategories.includes(c.id)}
                    onChange={() => handleCategoryChange(c.id)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500" />
                  
                      {c.label}
                    </label>
                )}
                </div>
              </div>
            }

            {/* Rango de Precios */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                <span>Precio Máximo</span>
                <span className="text-blue-600 font-extrabold">Bs. {maxPrice}</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer" />
              
            </div>

            {/* Rango de Distancia */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                <span>Distancia Máxima</span>
                <span className="text-blue-600 font-extrabold">{maxDistance} km</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer" />
              
            </div>

            {/* Modalidad Radio */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Modalidad de Venta</h4>
              <div className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                {['Todos', 'Inmediata', 'Preventas'].map((m) =>
                <label key={m} className="flex items-center gap-2 cursor-pointer">
                    <input
                    type="radio"
                    name="modalidad-filtro"
                    checked={modalidad === m}
                    onChange={() => setModalidad(m)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                  
                    {m === 'Todos' ? 'Todos los productos' : m === 'Inmediata' ? 'Solo venta inmediata' : 'Solo preventas'}
                  </label>
                )}
              </div>
            </div>

            {/* Provincias Checkboxes */}
            {!productorIdFiltro &&
            <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Provincias de origen</h4>
                <div className="grid grid-cols-1 gap-2 max-h-36 overflow-y-auto">
                  {SANTA_CRUZ_PROVINCES.map((prov) =>
                <label key={prov} className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
                      <input
                    type="checkbox"
                    checked={selectedProvinces.includes(prov)}
                    onChange={() => handleProvinceChange(prov)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500" />
                  
                      {prov}
                    </label>
                )}
                </div>
              </div>
            }

            {/* Productor Verificado Toggle */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-slate-600">
              <span>Solo productores verificados</span>
              <button
                type="button"
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`w-10 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
                verifiedOnly ? 'bg-emerald-500' : 'bg-slate-200'}`
                }>
                
                <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow-md ${verifiedOnly ? 'translate-x-4' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Grid de productos (3 cols desktop, 2 tablet, 1 mobile) */}
        <div className="lg:col-span-3">
          {loading ?
          <div className="py-24 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
            </div> :
          filteredProducts.length === 0 ?
          <div className="bg-white rounded-3xl border border-slate-200/60 p-16 text-center max-w-lg mx-auto shadow-sm">
              <Leaf className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-black text-slate-800">Sin coincidencias</h3>
              <p className="text-xs text-slate-400 mt-2 font-semibold">
                No hay productos que coincidan con la configuración de filtros aplicada.
              </p>
            </div> :

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((p) => {
              const distanceNum = p.distancia_km !== null && p.distancia_km !== undefined ?
              parseFloat(p.distancia_km) :
              null;
              const cartQty = getCartQuantity(p.cosecha_id || p.id);
              const badgeEstado = p.es_preventa ?
              { label: 'PREVENTA', color: 'bg-blue-50 text-blue-700 border-blue-200' } :
              p.cantidad_disponible < 20 ?
              { label: 'ÚLTIMAS UNIDADES', color: 'bg-rose-50 text-rose-700 border-rose-200' } :
              { label: 'NUEVO', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };

              return (
                <div
                  key={p.cosecha_id || p.id}
                  className="bg-white rounded-2xl border border-blue-100 shadow-[0_1px_3px_rgba(59,130,246,0.08)] flex flex-col justify-between group hover:shadow-lg transition-all duration-200">
                  
                    {/* Foto Producto */}
                    <div
                    onClick={() => navigate(`/producto/${p.cosecha_id || p.id}`)}
                    className="h-48 relative overflow-hidden bg-slate-50 cursor-pointer rounded-t-2xl">
                    
                      {p.foto_url ?
                        <>
                          <img
                            src={getImageUrl(p.foto_url)}
                            onError={handleImageError}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 relative z-10"
                            alt={p.nombre_producto} 
                          />
                          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 hidden items-center justify-center absolute inset-0 z-0">
                            <Leaf className="w-10 h-10 text-indigo-200" />
                          </div>
                        </> :

                        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                          <Leaf className="w-10 h-10 text-indigo-200" />
                        </div>
                      }
                      
                      {/* Badge arriba izquierda */}
                      <span className={`absolute top-3 left-3 badge text-[9px] font-black tracking-wide border ${badgeEstado.color}`}>
                        {badgeEstado.label}
                      </span>

                      {/* Badge arriba derecha */}
                              <span className="absolute top-3 right-3 bg-white/90 text-slate-700 px-2 py-0.5 rounded-lg text-[9px] font-black flex items-center gap-1 shadow-sm border border-slate-100">
                          <MapPin className="w-3 h-3 text-blue-600" />
                          {distanceNum !== null ? `${distanceNum.toFixed(1)} km` : 'N/A'}
                      </span>
                    </div>

                    {/* Contenido Card */}
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                      <div>
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-0.5 text-xs font-semibold">{p.categoria}</span>
                        <h4
                        onClick={() => navigate(`/producto/${p.cosecha_id || p.id}`)}
                        className="font-bold text-slate-800 text-sm mt-1 cursor-pointer hover:text-blue-600 transition-colors line-clamp-1">
                        
                          {p.nombre_producto}
                        </h4>
                        
                        {/* Productor circular avatar + name */}
                        <div className="flex items-center gap-2 mt-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                            {p.nombre_finca ? p.nombre_finca.substring(0, 2).toUpperCase() : 'PV'}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-700 truncate block flex items-center gap-1">
                              {p.nombre_finca || 'Productor'}
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="text-xl font-black text-emerald-600">Bs. {Number(p.precio_unitario).toFixed(2)}</span>
                            <span className="text-xs text-slate-400 font-semibold ml-1">/ {p.unidad_medida}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">
                            Disponible: {p.cantidad_disponible} {p.unidad_medida}
                          </span>
                        </div>

                        {/* Botón Agregar al carrito o selector +/- */}
                        {cartQty === 0 ?
                      <button
                        onClick={() => {
                          const ok = agregarAlCarritoConVerificacion(p, 1);
                          if (ok) {
                            toast.info("Agregado al carrito", `${p.nombre_producto} agregado al carrito`);
                          }
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md shadow-blue-600/10 hover:shadow-xl transition-all flex items-center justify-center gap-2">
                        
                            <ShoppingCart className="w-4 h-4" />
                            Agregar al carrito
                          </button> :

                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1">
                            <button
                          onClick={() => {
                            if (cartQty <= 1) {
                              eliminarDelCarrito(p.cosecha_id || p.id);
                              toast.info('Producto removido del carrito');
                            } else {
                              actualizarCantidad(p.cosecha_id || p.id, cartQty - 1);
                            }
                          }}
                          className="text-blue-600 font-bold text-lg hover:text-blue-800 w-6 text-center">
                          
                              −
                            </button>
                            <span className="font-semibold text-gray-800 min-w-[20px] text-center">
                              {cartQty}
                            </span>
                            <button
                          onClick={() => {
                            actualizarCantidad(p.cosecha_id || p.id, cartQty + 1);
                          }}
                          className="text-blue-600 font-bold text-lg hover:text-blue-800 w-6 text-center">
                          
                              +
                            </button>
                          </div>
                      }
                      </div>
                    </div>
                  </div>);

            })}
            </div>
          }
        </div>
      </div>
    </PageShell>);

};

export default MarketplacePage;