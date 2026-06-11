import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ShoppingCart, Minus, Plus, Trash2, ArrowLeft, Leaf, MapPin,
  ShieldCheck, Truck, CreditCard, X, CheckCircle2, AlertTriangle,
  ArrowRight, ShieldAlert, Check, Calendar, FileText, Sparkles, Loader2
} from 'lucide-react';

import CartContext from '../context/CartContext';
import PageShell from '../components/ui/PageShell';
import { useToast } from '../context/ToastContext';

const CarritoPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    carrito,
    actualizarCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
    lastStockWarning,
    clearStockWarning
  } = useContext(CartContext);

  // Steps: 'CARRITO' | 'CONFIRMACION' | 'PAGO_QR'
  const [step, setStep] = useState('CARRITO');
  
  // Delivery details form
  const [modalidadEntrega, setModalidadEntrega] = useState('retiro');
  const [direccion, setDireccion] = useState('');
  const [notas, setNotas] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  
  // Checkout process states
  const [pedidoId, setPedidoId] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [pagoSimuladoExitoso, setPagoSimuladoExitoso] = useState(false);
  const [loadingPago, setLoadingPago] = useState(false);
  const [timelineState, setTimelineState] = useState(0); // 0: creado, 1: pagado, 2: preparando, 3: en camino, 4: entregado

  useEffect(() => {
    if (lastStockWarning) {
      toast.error('No hay más stock disponible para ese producto.');
      clearStockWarning();
    }
  }, [lastStockWarning, clearStockWarning, toast]);

  // If cart is empty and we are not in the payment simulation step, redirect or show empty cart
  if (carrito.length === 0 && step !== 'PAGO_QR') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <button onClick={() => navigate('/marketplace')} className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-slate-800 transition-colors mb-8">
          <ArrowLeft className="w-4.5 h-4.5" /> Volver al Marketplace
        </button>
        <div className="bg-white rounded-3xl border border-slate-200/60 py-16 flex flex-col items-center justify-center text-center px-6 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-5 border border-blue-100">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Tu carrito está vacío</h2>
          <p className="text-xs text-slate-400 max-w-xs mb-6 font-semibold">
            Explorá el marketplace para encontrar productos frescos directamente de los productores.
          </p>
          <button
            onClick={() => navigate('/marketplace')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-md shadow-blue-600/10"
          >
            Ir al Marketplace
          </button>
        </div>
      </div>
    );
  }

  // Calculations
  const subtotal = carrito.reduce((acc, item) => {
    const price = parseFloat(item.precio_unitario) || 0;
    return acc + price * item.cantidad;
  }, 0);

  const tienePreventas = carrito.some(item => item.es_preventa);
  
  // Preventas ask for 50% prepayment as per requirements:
  // "Si preventa: desglose 'Anticipo (50%): Bs X' + 'Saldo restante: Bs X'"
  const anticipoPreventa = carrito.reduce((acc, item) => {
    if (item.es_preventa) {
      const price = parseFloat(item.precio_unitario) || 0;
      return acc + (price * item.cantidad * 0.5);
    }
    return acc;
  }, 0);

  const totalInmediato = carrito.reduce((acc, item) => {
    if (!item.es_preventa) {
      const price = parseFloat(item.precio_unitario) || 0;
      return acc + (price * item.cantidad);
    }
    return acc;
  }, 0);

  const totalPagarAhora = totalInmediato + anticipoPreventa;
  const saldoRestante = subtotal - totalPagarAhora;

  // Producer info (single producer constraint ensures all items are from the same farmer)
  const productor = carrito[0] || {};
  const nombreProductor = productor.nombre_finca || 'Productor AgroDirecto';

  // Proceed from Cart list to confirmation details
  const handleProcederConfirmacion = () => {
    setStep('CONFIRMACION');
  };

  // Confirm order and create database record, then move to QR payment page
  const handleConfirmarPedido = async () => {
    if (modalidadEntrega === 'envio' && !direccion.trim()) {
      toast.error('Por favor, ingresá una dirección de entrega para el envío.');
      return;
    }
    if (!aceptaTerminos) {
      toast.error('Deberás aceptar los términos de compra para continuar.');
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

      const payloadModalidad = modalidadEntrega === 'retiro' ? 'RETIRO_FINCA' : 'ENVIO_DOMICILIO';
      const payloadDireccion = modalidadEntrega === 'retiro' ? 'Retiro en finca' : direccion;

      // Create simulated or real order
      const res = await axios.post('http://localhost:5000/api/pedidos', {
        items,
        modalidad_entrega: payloadModalidad,
        direccion_entrega: payloadDireccion,
        notas_adicionales: notas,
        monto_total: subtotal
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Retrieve created order code
      const generatedId = res.data.pedido_id || res.data.id || String(Math.floor(100000 + Math.random() * 900000));
      setPedidoId(generatedId);
      
      // Clear cart
      vaciarCarrito();

      sessionStorage.setItem('ultimoPedido', JSON.stringify({
        pedidoId: generatedId,
        monto: totalPagarAhora,
        productorNombre: nombreProductor,
        modalidadEntrega: payloadModalidad
      }));

      const pedidoRef = res.data.pedido_ref || generatedId;
      toast.success(`✅ Pedido ${typeof pedidoRef === 'string' && pedidoRef.startsWith('#') ? pedidoRef : ''} creado`);

      navigate(`/dashboard/comprador/pago-qr/${generatedId}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Error al confirmar tu pedido.');
    } finally {
      setProcesando(false);
    }
  };

  // Simulate payment workflow
  const handleSimularPagoExitoso = () => {
    setLoadingPago(true);
    setTimeout(() => {
      setLoadingPago(false);
      setPagoSimuladoExitoso(true);
      setTimelineState(1); // Pago recibido
      toast.success('🎉 ¡Pago registrado! Tu pedido está confirmado');
      
      // Update pedido status in backend asynchronously
      const token = localStorage.getItem('token');
      if (pedidoId && token) {
        axios.put(`http://localhost:5000/api/pedidos/${pedidoId}/estado`, {
          estado: 'PAGADO'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => console.error('Error updating status:', err));
      }
    }, 2000);
  };

  return (
    <PageShell>
      {/* STEPPER COMPRADOR */}
      <div className="flex items-center justify-between max-w-xl mx-auto mb-10">
        {[
          { id: 'CARRITO', label: '1. Carrito' },
          { id: 'CONFIRMACION', label: '2. Confirmación' },
          { id: 'PAGO_QR', label: '3. Pago QR' }
        ].map((s, idx) => {
          const isActive = step === s.id;
          const isDone = (step === 'CONFIRMACION' && idx === 0) || (step === 'PAGO_QR' && idx < 2);
          
          return (
            <React.Fragment key={s.id}>
              {idx > 0 && <div className={`h-0.5 flex-1 mx-2 ${isDone ? 'bg-blue-400' : 'bg-gray-200'}`} />}
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-black transition-all ${
                  isActive ? 'bg-blue-600 text-white' : isDone ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {isDone ? <Check className="w-3.5 h-3.5" /> : (idx + 1)}
                </div>
                <span className={`text-xs font-black transition-all ${
                  isActive ? 'text-blue-700' : isDone ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {s.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* STEP 1: CARRITO */}
      {step === 'CARRITO' && (
        <div className="animate-fade-in space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Mi Carrito</h1>
            <button
              onClick={vaciarCarrito}
              className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Vaciar carrito
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* List left (2/3) */}
            <div className="lg:col-span-2 space-y-4">
              {carrito.map((item) => {
                const itemId = item.cosecha_id || item.id;
                const price = parseFloat(item.precio_unitario) || 0;
                const itemSubtotal = price * item.cantidad;

                return (
                  <div key={itemId} className="bg-white rounded-2xl border border-blue-100 shadow-[0_1px_3px_rgba(59,130,246,0.08)] p-5 flex gap-4 hover:shadow-md transition-all animate-slide-up">
                    {/* Mini photo */}
                    <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                      {item.foto_url ? (
                        <img
                          src={`http://localhost:5000${item.foto_url}`}
                          alt={item.nombre_producto}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Leaf className="w-8 h-8 text-blue-200" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-grow flex flex-col justify-between min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-sm">{item.nombre_producto}</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{item.categoria}</p>
                          
                          {/* Preventa badge */}
                          {item.es_preventa && (
                            <div className="mt-2 space-y-1">
                              <span className="inline-flex items-center bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-2 py-0.5 text-[9px] font-black">
                                Preventa — Anticipo 50%
                              </span>
                              <p className="text-[10px] text-amber-600 font-semibold leading-tight">
                                * Pagarás el 50% ahora y el saldo restante al coordinar la entrega.
                              </p>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => eliminarDelCarrito(itemId)}
                          className="text-slate-300 hover:text-red-500 p-1 transition-colors shrink-0"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Quantity & subtotal */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-3">
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1">
                          <button
                            onClick={() => actualizarCantidad(itemId, item.cantidad - 1)}
                            className="text-blue-600 font-bold text-lg hover:text-blue-800 w-6 text-center"
                          >
                            −
                          </button>
                          <span className="font-semibold text-gray-800 min-w-[20px] text-center">{item.cantidad}</span>
                          <button
                            onClick={() => actualizarCantidad(itemId, item.cantidad + 1)}
                            disabled={item.cantidad >= (Number(item.cantidad_disponible) || 9999)}
                            className="text-blue-600 font-bold text-lg hover:text-blue-800 w-6 text-center disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-bold block">Bs. {price.toFixed(2)} / {item.unidad_medida}</span>
                          <span className="font-extrabold text-slate-800 text-sm block">Subtotal: Bs. {itemSubtotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sticky summary right (1/3) */}
            <div className="lg:col-span-1">
              <div className="bg-slate-50 backdrop-blur-md border border-blue-100 rounded-3xl p-6 shadow-[0_1px_3px_rgba(59,130,246,0.08)] space-y-6 sticky top-24">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base font-black text-slate-800">Resumen del pedido</h2>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1">Conexión directa sin intermediarios</p>
                </div>

                {/* Subtotals per item */}
                <div className="space-y-3">
                  {carrito.map(item => (
                    <div key={item.cosecha_id || item.id} className="flex justify-between items-center text-xs text-slate-500">
                      <span className="truncate max-w-[150px]">{item.nombre_producto} x{item.cantidad}</span>
                      <span className="font-bold text-slate-700">Bs. {(parseFloat(item.precio_unitario) * item.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <hr className="border-slate-100" />

                {/* Total */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-t border-blue-100 pt-3 mt-3">
                    <span className="font-bold text-gray-800 text-sm">TOTAL</span>
                    <span className="text-2xl font-black text-emerald-600">Bs. {subtotal.toFixed(2)}</span>
                  </div>

                  {tienePreventas && (
                    <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-blue-700 font-bold">
                        <span>Anticipo (50%):</span>
                        <span>Bs. {anticipoPreventa.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500 font-semibold">
                        <span>Saldo restante:</span>
                        <span>Bs. {saldoRestante.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Producer info */}
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {nombreProductor.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-800">
                      {nombreProductor}
                    </p>
                    <p className="text-xs text-blue-600">
                      Productor verificado ✓
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleProcederConfirmacion}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    Confirmar Pedido →
                  </button>
                  <button
                    onClick={() => navigate('/marketplace')}
                    className="w-full border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl py-2.5 text-sm font-semibold transition-colors block text-center"
                  >
                    Seguir comprando
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: CONFIRMACION */}
      {step === 'CONFIRMACION' && (
        <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => setStep('CARRITO')} className="text-slate-400 hover:text-slate-800 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Confirmá tu Pedido</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Form Left */}
            <div className="md:col-span-2 space-y-6">
              {/* Resumen readonly */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" /> Detalle de compra
                </h3>
                <div className="divide-y divide-slate-50">
                  {carrito.map(item => (
                    <div key={item.cosecha_id || item.id} className="py-3 flex justify-between items-center text-xs font-semibold text-slate-700">
                      <span>{item.nombre_producto} (x{item.cantidad} {item.unidad_medida})</span>
                      <span className="font-extrabold text-slate-900">Bs. {(parseFloat(item.precio_unitario) * item.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery info */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-5">
                <h3 className="text-base font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-600" /> ¿Cómo querés recibir tu pedido?
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tarjeta 1: Retiro */}
                  <label className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative ${
                    modalidadEntrega === 'retiro' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-300'
                  }`}>
                    <input
                      type="radio"
                      name="modalidadEntrega"
                      value="retiro"
                      checked={modalidadEntrega === 'retiro'}
                      onChange={() => setModalidadEntrega('retiro')}
                      className="sr-only"
                    />
                    <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                      GRATIS
                    </div>
                    <div className="text-lg mb-1">🚗</div>
                    <h4 className="text-sm font-bold text-slate-900">Retiro en finca</h4>
                    <p className="text-xs text-slate-500 font-medium mb-3">Voy yo a buscar el pedido</p>
                    
                    <div className="text-xs space-y-1.5 font-semibold text-slate-700">
                      <p className="flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        Finca {nombreProductor} — Montero, Obispo Santistevan
                      </p>
                      <p className="text-emerald-700 mt-2">
                        <a href="https://maps.google.com/?q=-17.33,-63.26" target="_blank" rel="noreferrer" className="underline hover:text-emerald-800">
                          Ver ubicación en mapa →
                        </a>
                      </p>
                    </div>
                  </label>

                  {/* Tarjeta 2: Envío */}
                  <label className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative ${
                    modalidadEntrega === 'envio' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}>
                    <input
                      type="radio"
                      name="modalidadEntrega"
                      value="envio"
                      checked={modalidadEntrega === 'envio'}
                      onChange={() => setModalidadEntrega('envio')}
                      className="sr-only"
                    />
                    <div className="text-lg mb-1">🚚</div>
                    <h4 className="text-sm font-bold text-slate-900">Envío a domicilio</h4>
                    <p className="text-xs text-slate-500 font-medium mb-3">Un transportista lleva tu pedido</p>
                    
                    <div className="text-xs space-y-1.5 font-semibold text-slate-700">
                      <p className="flex items-center gap-1">
                        <span className="text-lg">💰</span> Costo coordinado con transportista
                      </p>
                      <p className="flex items-center gap-1">
                        <span className="text-lg">⏱️</span> Tiempo estimado: 1-3 días
                      </p>
                    </div>
                  </label>
                </div>

                {modalidadEntrega === 'envio' && (
                  <div className="space-y-2 mt-4 animate-slide-up">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Dirección de entrega *</label>
                    <input
                      type="text"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      placeholder="Ej: Av. Cañoto #345, barrio..."
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="space-y-2 mt-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Notas especiales para el productor</label>
                  <textarea
                    rows="3"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Ej. 'Por favor embalar en cajas separadas', 'Llamar antes de salir', etc."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Sticky summary right */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-md space-y-6 sticky top-24">
                <div>
                  <h3 className="text-base font-black text-slate-800">Total a abonar</h3>
                  <hr className="my-2 border-slate-100" />
                </div>

                <div className="space-y-3 text-xs">
                  {carrito.map(item => (
                    <div key={item.cosecha_id || item.id} className="flex justify-between items-center text-slate-500">
                      <span className="truncate max-w-[140px]">{item.nombre_producto} x{item.cantidad}</span>
                      <span className="font-bold text-slate-700">Bs. {(parseFloat(item.precio_unitario) * item.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Entrega:</span>
                    <span className="font-bold text-slate-700">
                      {modalidadEntrega === 'retiro' ? 'Retiro en finca' : 'A coordinar'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Costo envío:</span>
                    <span className="font-bold text-emerald-600">
                      {modalidadEntrega === 'retiro' ? 'GRATIS' : 'A coordinar'}
                    </span>
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-extrabold text-slate-800">TOTAL:</span>
                    <span className="text-xl font-black text-slate-800">Bs. {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-extrabold text-slate-800">A pagar hoy:</span>
                    <span className="text-2xl font-black text-emerald-600">Bs. {totalPagarAhora.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                  <label className="flex items-start gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={aceptaTerminos}
                      onChange={(e) => setAceptaTerminos(e.target.checked)}
                      className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] font-semibold text-slate-600 group-hover:text-slate-800 transition-colors leading-tight">
                      Acepto los términos de compra y la coordinación directa con el productor.
                    </span>
                  </label>
                </div>

                <button
                  onClick={handleConfirmarPedido}
                  disabled={procesando || !aceptaTerminos || (modalidadEntrega === 'envio' && !direccion.trim())}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-4 rounded-xl font-bold text-xs transition-all shadow-md flex justify-center items-center gap-2"
                >
                  {procesando && <Loader2 className="w-4 h-4 animate-spin" />}
                  {procesando ? 'Procesando...' : 'Confirmar y proceder al Pago →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </PageShell>
  );
};

export default CarritoPage;
