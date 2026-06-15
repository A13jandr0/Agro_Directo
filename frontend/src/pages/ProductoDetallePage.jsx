import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, MapPin, ShoppingCart, Leaf, CheckCircle2,
  Calendar, Package, User, Minus, Plus, Truck, Star,
  Clock, Navigation, ShieldCheck, Info
} from 'lucide-react';
import CartContext from '../context/CartContext';
import PageShell from '../components/ui/PageShell';
import ProductorMapPreview from '../components/ProductorMapPreview';
import { useToast } from '../context/ToastContext';
import { getImageUrl, handleImageError } from '../utils/imageUtils';

const ProductoDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { agregarAlCarritoConVerificacion, carrito, actualizarCantidad } = useContext(CartContext);

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [activeTab, setActiveTab] = useState('Descripcion');
  const [fotoActiva, setFotoActiva] = useState(0);

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/cosechas/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setProducto(res.data);
      } catch (error) {
        console.error(error);
        toast.error('No se pudo cargar la información detallada del producto');
      } finally {
        setLoading(false);
      }
    };
    fetchProducto();
  }, [id]);

  const stockMax = Number(producto?.cantidad_disponible) || 0;

  const handleAgregar = () => {
    if (stockMax <= 0) return;
    const ok = agregarAlCarritoConVerificacion(producto, cantidad);
    if (ok) {
      toast.success(`¡Agregado al carrito: ${cantidad} ${producto.unidad_medida}(s) de ${producto.nombre_producto}!`);
    }
  };

  const handleComprarAhora = () => {
    if (stockMax <= 0) return;
    const ok = agregarAlCarritoConVerificacion(producto, cantidad);
    if (ok) {
      navigate('/carrito');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="text-center py-20 bg-white border rounded-3xl p-8 max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Producto no encontrado</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-xs font-bold text-blue-600 hover:underline">
          Volver atrás
        </button>
      </div>
    );
  }

  const fotos = [producto.foto_url].filter(Boolean);
  const esPreventa = producto.es_preventa;
  const distance = producto.distancia_km || 15;

  return (
    <PageShell>
      {/* Breadcrumb */}
      <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-5 uppercase tracking-wider">
        <Link to="/marketplace" className="hover:text-blue-600">Marketplace</Link>
        <span>&gt;</span>
        <span className="hover:text-blue-600">{producto.categoria}</span>
        <span>&gt;</span>
        <span className="text-slate-700">{producto.nombre_producto}</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLUMNA IZQUIERDA: Galería de fotos */}
          <div className="space-y-4">
            {console.log("Datos de producto:", producto, "URL fotos:", fotos)}
            <div className="aspect-video bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center overflow-hidden relative">
              {fotos.length > 0 ? (
                <>
                  <img 
                    src={getImageUrl(fotos[fotoActiva])} 
                    className="w-full h-full object-cover" 
                    alt={producto.nombre_producto} 
                    onError={handleImageError}
                  />
                  <div className="w-full h-full bg-slate-50 hidden items-center justify-center">
                    <Leaf className="w-16 h-16 text-emerald-200" />
                  </div>
                </>
              ) : (
                <Leaf className="w-16 h-16 text-emerald-200" />
              )}
            </div>
            {fotos.length > 1 && (
              <div className="flex gap-2">
                {fotos.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFotoActiva(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all relative flex items-center justify-center bg-slate-50 ${
                      fotoActiva === idx ? 'border-blue-600' : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <img 
                      src={getImageUrl(url)} 
                      className="w-full h-full object-cover z-10" 
                      alt="" 
                      onError={handleImageError}
                    />
                    <div className="w-full h-full bg-slate-50 hidden items-center justify-center absolute inset-0 z-0">
                      <Leaf className="w-6 h-6 text-emerald-200" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: Detalles de compra */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{producto.nombre_producto}</h1>
              {/* Rating Productor */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <span className="text-xs font-bold text-slate-500">(24 ventas completadas)</span>
              </div>
            </div>

            {/* Precio Unitario */}
            <div>
              <span className="text-3xl font-black text-emerald-600">Bs. {Number(producto.precio_unitario).toFixed(2)}</span>
              <span className="text-sm font-semibold text-slate-400 ml-1">/ {producto.unidad_medida}</span>
            </div>


            {/* Disponibilidad */}
            <div>
              {stockMax > 0 ? (
                <span className="badge bg-emerald-50 text-emerald-700 border-emerald-200 py-1.5 px-3.5 font-bold">
                  En stock — {stockMax} {producto.unidad_medida} disponibles
                </span>
              ) : (
                <span className="badge bg-rose-50 text-rose-700 border-rose-200 py-1.5 px-3.5 font-bold">
                  Agotado
                </span>
              )}
            </div>


            {/* Selector de cantidad */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cantidad:</span>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <button 
                  onClick={() => setCantidad(c => Math.max(c - 1, 1))}
                  className="p-3 text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-black text-slate-800">{cantidad}</span>
                <button 
                  onClick={() => setCantidad(c => Math.min(c + 1, stockMax))}
                  disabled={cantidad >= stockMax}
                  className="p-3 text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Botones Agregar y Comprar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <button
                onClick={handleAgregar}
                disabled={stockMax <= 0}
                className="py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/10 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                Agregar al carrito
              </button>
              <button
                onClick={handleComprarAhora}
                disabled={stockMax <= 0}
                className="py-3.5 bg-[#9b2335] hover:bg-[#7a1c2a] text-white rounded-xl font-bold text-sm shadow-md shadow-rose-900/10 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Comprar ahora
              </button>
            </div>
          </div>
        </div>

        {/* SECCIÓN PRODUCTOR (Glassmorphism) */}
        <div className="mt-10 bg-slate-50 border border-slate-200/60 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-black shrink-0 border border-blue-200">
              {producto.nombre_finca ? producto.nombre_finca.substring(0, 2).toUpperCase() : 'PV'}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-1.5">
                {producto.nombre_finca || 'Productor Verificado'}
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {producto.municipio || 'Montero'}, {producto.provincia || 'Obispo Santistevan'}, {producto.departamento || 'Santa Cruz'}
              </p>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">
                Miembro desde: Mayo 2026
              </span>
            </div>
          </div>

          <div className="text-center md:text-right space-y-2">
            <div className="text-xs font-semibold text-slate-500">
              Distancia estimada: <span className="text-blue-600 font-extrabold">{distance.toFixed(0)} km</span>
            </div>
            <button 
              onClick={() => navigate(`/marketplace?productor_id=${producto.productor_usuario_id}`)}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Ver todos sus productos
            </button>
          </div>
        </div>

        {/* Map Preview */}
        <div className="mt-6 border border-slate-200/60 rounded-3xl overflow-hidden h-64 relative z-0">
          <ProductorMapPreview 
            lat={producto.latitud_productor} 
            lng={producto.longitud_productor} 
            height="100%" 
          />
        </div>

        {/* Tabs inferiores */}
        <div className="mt-10 border-t border-slate-200 pt-8">
          <div className="flex border-b border-slate-100 gap-6">
            {['Descripcion', 'Informacion'].map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`pb-3 text-sm font-bold transition-all border-b-2 ${
                  activeTab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {t === 'Descripcion' ? 'Descripción del producto' : 'Información técnica'}
              </button>
            ))}
          </div>

          <div className="py-6 text-sm font-semibold text-slate-600 leading-relaxed">
            {activeTab === 'Descripcion' ? (
              <p>{producto.descripcion || 'El productor no ha indicado descripciones adicionales.'}</p>
            ) : (
              <div className="max-w-md bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs font-semibold">
                  <tbody className="divide-y divide-slate-200/80 text-slate-700">
                    <tr>
                      <td className="px-4 py-3 bg-slate-100/50 text-slate-400 font-black">Categoría</td>
                      <td className="px-4 py-3">{producto.categoria}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 bg-slate-100/50 text-slate-400 font-black">Unidad</td>
                      <td className="px-4 py-3">{producto.unidad_medida}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 bg-slate-100/50 text-slate-400 font-black">Provincia</td>
                      <td className="px-4 py-3">{producto.provincia || 'Andrés Ibáñez'}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 bg-slate-100/50 text-slate-400 font-black">Método producción</td>
                      <td className="px-4 py-3">Orgánico / Ecológico</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

// Simple loader helper inside file
const Loader2 = ({ className }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const AlertCircle = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

export default ProductoDetallePage;
