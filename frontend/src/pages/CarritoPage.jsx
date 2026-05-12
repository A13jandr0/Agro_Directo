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
      setToastMsg('Por favor sube una foto del comprobante de transferencia.');
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
      navigate('/dashboard/comprador'); // O a una pantalla de Mis Pedidos
      alert('¡Pedido enviado! Espera la confirmación del productor.');
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
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-slate-900 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <div className="bg-white rounded-2xl border border-gray-200 py-20 flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
            <ShoppingCart className="w-9 h-9 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Tu carrito está vacío</h2>
          <p className="text-sm text-gray-500 max-w-sm mb-6">
            Explora el marketplace para encontrar productos frescos directamente de los productores.
          </p>
          <button
            onClick={() => navigate('/marketplace')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-600/20"
          >
            Ir al Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">

      {/* TOAST */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 pl-4 pr-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border ${
          toastType === 'success' ? 'bg-slate-900 text-white border-slate-700' : 'bg-red-600 text-white border-red-500'
        }`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${toastType === 'success' ? 'bg-emerald-500' : 'bg-red-400'}`}>
            {toastType === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          </div>
          <p className="text-sm font-bold">{toastMsg}</p>
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Mi Carrito</h1>
            <p className="text-sm text-gray-500 mt-0.5">{totalItems} {totalItems === 1 ? 'producto' : 'productos'} en tu carrito</p>
          </div>
        </div>
        <button
          onClick={vaciarCarrito}
          className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" /> Vaciar
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* LEFT: PRODUCT LIST */}
        <div className="flex-1 min-w-0 space-y-3">
          {carrito.map(item => {
            const itemId = getItemId(item);
            const price = parseFloat(item.precio_unitario) || 0;
            const lineTotal = price * item.cantidad;

            return (
              <div key={itemId} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">

                {/* IMAGE */}
                <div
                  onClick={() => navigate('/producto/' + itemId)}
                  className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 rounded-xl overflow-hidden shrink-0 cursor-pointer border border-gray-100 flex items-center justify-center"
                >
                  {item.foto_url ? (
                    <img
                      src={`http://localhost:5000${item.foto_url}`}
                      alt={item.nombre_producto}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Leaf className="w-8 h-8 text-gray-200" />
                  )}
                </div>

                {/* INFO */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3
                        onClick={() => navigate('/producto/' + itemId)}
                        className="font-bold text-slate-900 leading-snug cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
                      >
                        {item.nombre_producto}
                      </h3>
                      {item.nombre_finca && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {item.nombre_finca}
                          {item.municipio && ` — ${item.municipio}`}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => eliminarDelCarrito(itemId)}
                      className="text-gray-300 hover:text-red-500 transition-colors shrink-0 p-1"
                      title="Eliminar del carrito"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* BOTTOM ROW: Price + Quantity */}
                  <div className="mt-auto pt-3 flex items-end justify-between gap-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => actualizarCantidad(itemId, item.cantidad - 1)}
                        className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 h-9 flex items-center justify-center font-bold text-slate-900 text-sm border-x border-gray-200 bg-gray-50">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => actualizarCantidad(itemId, item.cantidad + 1)}
                        className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">Bs. {price.toFixed(2)} / {item.unidad_medida}</p>
                      <p className="text-lg font-black text-slate-900">Bs. {lineTotal.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: ORDER SUMMARY */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 sticky top-24 overflow-hidden">

            {/* Summary Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <h2 className="font-bold">Resumen de Compra</h2>
              </div>
              <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Line Items Summary */}
            <div className="p-5 space-y-3 border-b border-gray-100 max-h-48 overflow-y-auto">
              {carrito.map(item => {
                const itemId = getItemId(item);
                const price = parseFloat(item.precio_unitario) || 0;
                return (
                  <div key={itemId} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 truncate max-w-[180px]">{item.nombre_producto} x{item.cantidad}</span>
                    <span className="font-semibold text-slate-900 shrink-0">Bs. {(price * item.cantidad).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold text-slate-900">Bs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Envío</span>
                <span className="font-medium text-emerald-600">Por coordinar</span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-2xl font-black text-blue-600">Bs. {subtotal.toFixed(2)}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="px-5 pb-5 space-y-3">
              <button
                onClick={() => setShowModal(true)}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Proceder al Pago
              </button>
              <button
                onClick={() => navigate('/marketplace')}
                className="w-full h-10 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 border border-gray-200"
              >
                Seguir comprando
              </button>
            </div>

            {/* Trust Signals */}
            <div className="px-5 pb-5">
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Compra protegida</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Truck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Coordinación directa con el productor</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MODAL DE PAGO (US12, US13) */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            
            <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black">Finalizar Pago</h3>
                <p className="text-slate-400 text-xs mt-1">Escanea el QR y sube tu comprobante</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* QR Simulation */}
              <div className="flex flex-col items-center gap-3">
                <div className="bg-white p-4 border-2 border-gray-100 rounded-2xl shadow-inner">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=AgroDirectoPayment" 
                    alt="QR Pago"
                    className="w-40 h-40"
                  />
                </div>
                <p className="text-sm font-bold text-slate-900">Total a transferir: Bs. {subtotal.toFixed(2)}</p>
              </div>

              {/* Upload Section */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700">Comprobante de Transferencia</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-blue-400 transition-colors bg-gray-50 group">
                  {comprobantePreview ? (
                    <div className="relative">
                      <img src={comprobantePreview} alt="Preview" className="h-32 mx-auto rounded-lg shadow-md" />
                      <button 
                        onClick={() => { setComprobante(null); setComprobantePreview(null); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-2 cursor-pointer py-4">
                      <CreditCard className="w-10 h-10 text-gray-300 group-hover:text-blue-500 transition-colors" />
                      <span className="text-sm font-semibold text-gray-500">Haz clic para subir la captura</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  )}
                </div>
              </div>

              <button
                onClick={enviarPedido}
                disabled={procesando || !comprobante}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-5 h-5" />
                {procesando ? 'Enviando...' : 'Confirmar Envío de Pedido'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default CarritoPage;
