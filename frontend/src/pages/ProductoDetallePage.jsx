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
  Truck
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
        console.error('Error fetching product details:', error);
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
          <div className="w-10 h-10 border-[3px] border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-400">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="flex h-full items-center justify-center p-12 text-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Producto no encontrado</h2>
          <p className="text-sm text-gray-500 mb-4">Es posible que haya sido retirado del catálogo.</p>
          <button onClick={() => navigate(-1)} className="text-sm font-semibold text-blue-600 hover:underline">
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  const disponibilidad = new Date(producto.fecha_disponibilidad).toLocaleDateString('es-BO', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">

      {/* TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white pl-4 pr-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Listo</p>
            <p className="text-sm font-bold text-white">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* LEFT - IMAGE */}
          <div className="bg-gray-50 flex items-center justify-center min-h-[300px] lg:min-h-[500px] p-8">
            {producto.foto_url ? (
              <img
                src={`http://localhost:5000${producto.foto_url}`}
                alt={producto.nombre_producto}
                onLoad={() => setImgLoaded(true)}
                className={`max-w-full h-auto max-h-[420px] object-contain rounded-xl transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-300">
                <Leaf className="w-20 h-20" />
                <p className="text-sm font-medium">Sin fotografía</p>
              </div>
            )}
          </div>

          {/* RIGHT - DETAILS */}
          <div className="p-6 sm:p-8 flex flex-col">

            {/* Badges */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {producto.es_preventa ? (
                <span className="text-xs font-bold bg-violet-100 text-violet-700 px-2.5 py-1 rounded-md">
                  Preventa
                </span>
              ) : (
                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md">
                  Disponible ahora
                </span>
              )}
              <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">
                {producto.unidad_medida}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-2">
              {producto.nombre_producto}
            </h1>

            {/* Origin */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{producto.nombre_finca || 'Productor'} — {producto.municipio}, {producto.provincia}</span>
            </div>

            {/* Price */}
            <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
              <p className="text-sm font-medium text-gray-500 mb-1">Precio por {producto.unidad_medida}</p>
              <p className="text-4xl font-black text-slate-900">
                Bs. {producto.precio_unitario}
              </p>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Descripción</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {producto.descripcion || 'El productor no proporcionó una descripción detallada para este producto.'}
              </p>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Package className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Stock</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{producto.cantidad_disponible} {producto.unidad_medida}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Disponibilidad</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{disponibilidad}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <User className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Productor</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{producto.nombre_productor || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Truck className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Envío</span>
                </div>
                <p className="text-sm font-bold text-slate-900">Coordinar</p>
              </div>
            </div>

            {/* ADD TO CART */}
            <div className="mt-auto pt-5 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
              {/* Quantity Selector */}
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shrink-0">
                <button onClick={decrement} className="w-11 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 h-11 flex items-center justify-center font-bold text-slate-900 text-sm border-x border-gray-200">
                  {cantidad}
                </span>
                <button onClick={increment} className="w-11 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Button */}
              <button
                onClick={handleAgregar}
                disabled={producto.cantidad_disponible <= 0}
                className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                Agregar al Carrito — Bs. {(producto.precio_unitario * cantidad).toFixed(2)}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductoDetallePage;
