import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  MapPin,
  ShoppingCart,
  Leaf,
  CheckCircle2,
  Calendar,
  Package,
  User,
  Minus,
  Plus,
  Truck,
  Star,
  Clock
} from 'lucide-react';
import CartContext from '../context/CartContext';

const ProductoDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [toastMessage, setToastMessage] = useState('');
  const [imgLoaded, setImgLoaded] = useState(false);

  const { agregarAlCarrito } = useContext(CartContext);

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/cosechas/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducto(res.data);
      } catch (error) {
        console.error('Error al cargar detalle del producto:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducto();
  }, [id]);

  const handleAgregar = () => {
    agregarAlCarrito(producto, cantidad);
    setToastMessage('Producto agregado al carrito');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const increment = () => setCantidad(prev => Math.min(prev + 1, producto?.cantidad_disponible || 99));
  const decrement = () => setCantidad(prev => Math.max(prev - 1, 1));

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="flex h-full items-center justify-center p-12 text-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Producto no encontrado</h2>
          <p className="text-sm text-slate-500 mb-4">Es posible que haya sido retirado del catalogo.</p>
          <button onClick={() => navigate(-1)} className="text-sm font-semibold text-emerald-600 hover:underline">
            Volver atras
          </button>
        </div>
      </div>
    );
  }

  const disponibilidad = new Date(producto.fecha_disponibilidad).toLocaleDateString('es-BO', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const esPreventa = producto.es_preventa;
  const diasParaDisponible = esPreventa
    ? Math.max(1, Math.ceil((new Date(producto.fecha_disponibilidad) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">

      {/* NOTIFICACION */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white pl-4 pr-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 max-w-[90vw]">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400 font-medium">Listo</p>
            <p className="text-sm font-bold text-white truncate">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* BOTON VOLVER */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-900 transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* IZQUIERDA - IMAGEN */}
          <div className="bg-slate-50 flex items-center justify-center min-h-[280px] lg:min-h-[480px] p-6 sm:p-8">
            {producto.foto_url ? (
              <img
                src={`http://localhost:5000${producto.foto_url}`}
                alt={producto.nombre_producto}
                onLoad={() => setImgLoaded(true)}
                className={`max-w-full h-auto max-h-[400px] object-contain rounded-xl transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-300">
                <Leaf className="w-16 h-16" />
                <p className="text-sm font-medium">Sin fotografia</p>
              </div>
            )}
          </div>

          {/* DERECHA - DETALLES */}
          <div className="p-5 sm:p-7 flex flex-col">

            {/* Etiquetas */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {esPreventa ? (
                <span className="text-xs font-bold bg-violet-100 text-violet-700 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Preventa — Disponible en {diasParaDisponible} dias
                </span>
              ) : (
                <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg">
                  Disponible ahora
                </span>
              )}
              {producto.cantidad_disponible < 5 && (
                <span className="text-xs font-bold bg-red-100 text-red-600 px-2.5 py-1 rounded-lg">
                  Ultimas unidades
                </span>
              )}
              <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg">
                {producto.unidad_medida}
              </span>
            </div>

            {/* Titulo */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-2">
              {producto.nombre_producto}
            </h1>

            {/* Origen */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{producto.nombre_finca || 'Productor'} — {producto.municipio}, {producto.provincia}</span>
            </div>

            {/* Precio */}
            <div className="bg-emerald-50 rounded-xl p-4 mb-5 border border-emerald-100">
              <p className="text-sm font-medium text-emerald-700 mb-0.5">Precio por {producto.unidad_medida}</p>
              <p className="text-3xl sm:text-4xl font-black text-emerald-800">
                Bs. {producto.precio_unitario}
              </p>
            </div>

            {/* Descripcion */}
            <div className="mb-5">
              <h3 className="text-sm font-bold text-slate-800 mb-1.5">Descripcion</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {producto.descripcion || 'El productor no proporciono una descripcion detallada para este producto.'}
              </p>
            </div>

            {/* Informacion del producto */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Package className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">Stock disponible</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{producto.cantidad_disponible} {producto.unidad_medida}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">Fecha disponible</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{disponibilidad}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <User className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">Productor</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{producto.nombre_productor || 'No disponible'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Truck className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">Envio</span>
                </div>
                <p className="text-sm font-bold text-slate-800">A coordinar</p>
              </div>
            </div>

            {/* AGREGAR AL CARRITO */}
            <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              {/* Selector de cantidad */}
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden shrink-0">
                <button onClick={decrement} className="w-11 h-11 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 h-11 flex items-center justify-center font-bold text-slate-900 text-sm border-x border-slate-200 bg-slate-50">
                  {cantidad}
                </span>
                <button onClick={increment} className="w-11 h-11 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Boton agregar */}
              <button
                onClick={handleAgregar}
                disabled={producto.cantidad_disponible <= 0}
                className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                Agregar al carrito — Bs. {(producto.precio_unitario * cantidad).toFixed(2)}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductoDetallePage;
