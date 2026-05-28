import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  Leaf,
  MapPin,
  ShieldCheck,
  Truck,
  CreditCard,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import CartContext from '../context/CartContext';

const CarritoPage = () => {
  const navigate = useNavigate();
  const { carrito, actualizarCantidad, eliminarDelCarrito, vaciarCarrito } = useContext(CartContext);

  const getItemId = (item) => item.cosecha_id || item.id;

  const subtotal = carrito.reduce((acc, item) => {
    const price = parseFloat(item.precio_unitario) || 0;
    return acc + price * item.cantidad;
  }, 0);

  // Total a pagar ahora: preventa paga solo el 40%
  const totalPagar = carrito.reduce((acc, item) => {
    const price = parseFloat(item.precio_unitario) || 0;
    const factor = item.es_preventa ? 0.4 : 1;
    return acc + (price * item.cantidad * factor);
  }, 0);

  const anticipoPreventa = carrito.reduce((acc, item) => {
    if (item.es_preventa) {
      const price = parseFloat(item.precio_unitario) || 0;
      return acc + (price * item.cantidad * 0.4);
    }
    return acc;
  }, 0);

  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const [procesando, setProcesando] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  const [showModal, setShowModal] = useState(false);
  const [comprobante, setComprobante] = useState(null);
  const [comprobantePreview, setComprobantePreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setComprobante(file);
      setComprobantePreview(URL.createObjectURL(file));
    }
  };

  const enviarPedido = async () => {
    if (!comprobante) {
      setToastMsg('Sube una foto del comprobante de transferencia.');
      setToastType('error');
      return;
    }

    setProcesando(true);
    try {
      const token = localStorage.getItem('token');
      const items = carrito.map(item => ({
        cosecha_id: item.cosecha_id || item.id,
        cantidad: item.cantidad,
        precio_unitario: parseFloat(item.precio_unitario)
      }));

      const formData = new FormData();
      formData.append('items', JSON.stringify(items));
      formData.append('comprobante', comprobante);

      await axios.post('http://localhost:5000/api/pedidos', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      vaciarCarrito();
      setShowModal(false);
      navigate('/dashboard/comprador');
      alert('Pedido enviado. Espera la confirmacion del productor.');
    } catch (error) {
      setToastMsg(error.response?.data?.error || 'Error al procesar el pedido');
      setToastType('error');
    } finally {
      setProcesando(false);
    }
  };

  if (carrito.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-800 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <div className="bg-white rounded-2xl border border-slate-200 py-16 flex flex-col items-center justify-center text-center px-6">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-5">
            <ShoppingCart className="w-8 h-8 text-slate-300" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Tu carrito esta vacio</h2>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            Explora el marketplace para encontrar productos frescos directamente de los productores.
          </p>
          <button
            onClick={() => navigate('/marketplace')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-600/20"
          >
            Ir al Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">

      {/* NOTIFICACION */}
      {toastMsg && (
        <div className={`fixed bottom-5 right-5 z-50 pl-4 pr-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border max-w-[90vw] ${
          toastType === 'success' ? 'bg-slate-900 text-white border-slate-700' : 'bg-red-600 text-white border-red-500'
        }`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${toastType === 'success' ? 'bg-emerald-500' : 'bg-red-400'}`}>
            {toastType === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          </div>
          <p className="text-sm font-bold truncate">{toastMsg}</p>
        </div>
      )}

      {/* ENCABEZADO */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Mi carrito</h1>
            <p className="text-sm text-slate-500 mt-0.5">{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</p>
          </div>
        </div>
        <button
          onClick={vaciarCarrito}
          className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" /> Vaciar
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">

        {/* LISTA DE PRODUCTOS */}
        <div className="flex-1 min-w-0 space-y-3">
          {carrito.map(item => {
            const itemId = getItemId(item);
            const price = parseFloat(item.precio_unitario) || 0;
            const lineTotal = price * item.cantidad;

            return (
              <div key={itemId} className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3 sm:gap-4">

                {/* IMAGEN */}
                <div
                  onClick={() => navigate('/producto/' + itemId)}
                  className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-xl overflow-hidden shrink-0 cursor-pointer border border-slate-100 flex items-center justify-center"
                >
                  {item.foto_url ? (
                    <img
                      src={`http://localhost:5000${item.foto_url}`}
                      alt={item.nombre_producto}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Leaf className="w-7 h-7 text-slate-200" />
                  )}
                </div>

                {/* INFO */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3
                        onClick={() => navigate('/producto/' + itemId)}
                        className="font-bold text-slate-900 text-sm leading-snug cursor-pointer hover:text-emerald-600 transition-colors line-clamp-2"
                      >
                        {item.nombre_producto}
                      </h3>
                      {/* Badges */}
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {item.cantidad_disponible <= 5 && !item.es_preventa && (
                          <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">Ultimas unidades</span>
                        )}
                        {item.es_preventa && (
                          <span className="text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-bold">Preventa (40% anticipo)</span>
                        )}
                      </div>
                      {item.nombre_finca && (
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{item.nombre_finca}{item.municipio && ` — ${item.municipio}`}</span>
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => eliminarDelCarrito(itemId)}
                      className="text-slate-300 hover:text-red-500 transition-colors shrink-0 p-1"
                      title="Eliminar del carrito"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* PRECIO Y CANTIDAD */}
                  <div className="mt-auto pt-2 flex items-end justify-between gap-3">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => actualizarCantidad(itemId, item.cantidad - 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-9 h-8 flex items-center justify-center font-bold text-slate-800 text-sm border-x border-slate-200 bg-slate-50">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => actualizarCantidad(itemId, item.cantidad + 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-[11px] text-slate-400">Bs. {price.toFixed(2)} / {item.unidad_medida}</p>
                      <p className="text-lg font-black text-slate-900">Bs. {lineTotal.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RESUMEN DE COMPRA */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 sticky top-24 overflow-hidden">

            {/* Encabezado */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <h2 className="font-bold">Resumen de compra</h2>
              </div>
              <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Lista resumida */}
            <div className="p-4 space-y-2 border-b border-slate-100 max-h-44 overflow-y-auto">
              {carrito.map(item => {
                const itemId = getItemId(item);
                const price = parseFloat(item.precio_unitario) || 0;
                return (
                  <div key={itemId} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 truncate max-w-[170px]">{item.nombre_producto} x{item.cantidad}</span>
                    <span className="font-semibold text-slate-800 shrink-0">Bs. {(price * item.cantidad).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            {/* Totales */}
            <div className="p-4 space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Subtotal de productos</span>
                <span className="font-semibold text-slate-800">Bs. {subtotal.toFixed(2)}</span>
              </div>
              {anticipoPreventa > 0 && (
                <div className="flex items-center justify-between text-sm text-violet-600 font-medium bg-violet-50 p-2 rounded-lg">
                  <span>Anticipo preventa (40%)</span>
                  <span>Bs. {anticipoPreventa.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Envio</span>
                <span className="font-medium text-emerald-600">Por coordinar</span>
              </div>
              <hr className="border-slate-100" />
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Total a pagar ahora</span>
                <span className="text-2xl font-black text-emerald-600">Bs. {totalPagar.toFixed(2)}</span>
              </div>
            </div>

            {/* Botones */}
            <div className="px-4 pb-4 space-y-2.5">
              <button
                onClick={() => setShowModal(true)}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Proceder al pago
              </button>
              <button
                onClick={() => navigate('/marketplace')}
                className="w-full h-10 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200"
              >
                Seguir comprando
              </button>
            </div>

            {/* Confianza */}
            <div className="px-4 pb-4">
              <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Compra protegida</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Truck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Coordinacion directa con el productor</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MODAL DE PAGO */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 overflow-hidden shadow-2xl">

            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">Finalizar pago</h3>
                <p className="text-slate-400 text-xs mt-0.5">Escanea el QR y sube tu comprobante</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* QR */}
              <div className="flex flex-col items-center gap-3">
                <div className="bg-white p-3 border-2 border-slate-100 rounded-xl shadow-inner">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=AgroDirectoPayment"
                    alt="Codigo QR de pago"
                    className="w-36 h-36"
                  />
                </div>
                <p className="text-sm font-black text-slate-900">Total a transferir: Bs. {totalPagar.toFixed(2)}</p>
              </div>

              {/* Subir comprobante */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Comprobante de transferencia</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 hover:border-emerald-400 transition-colors bg-slate-50 group">
                  {comprobantePreview ? (
                    <div className="relative">
                      <img src={comprobantePreview} alt="Vista previa" className="h-28 mx-auto rounded-lg shadow-md" />
                      <button
                        onClick={() => { setComprobante(null); setComprobantePreview(null); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-2 cursor-pointer py-3">
                      <CreditCard className="w-9 h-9 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                      <span className="text-sm font-semibold text-slate-500">Toca para subir la captura</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  )}
                </div>
              </div>

              <button
                onClick={enviarPedido}
                disabled={procesando || !comprobante}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-5 h-5" />
                {procesando ? 'Enviando...' : 'Confirmar envio del pedido'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default CarritoPage;
