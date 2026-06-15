import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CheckCircle2, Copy, Upload, Camera, Loader2, Clock, CheckCircle, AlertTriangle, RefreshCcw, Info, Star, Zap } from
'lucide-react';
import { useToast } from '../context/ToastContext';
import PageShell from '../components/ui/PageShell';

const API = 'http://localhost:5000/api';

const PagoQRPage = () => {
  const { pedidoId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);

  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Polling state
  const [pollingIntentos, setPollingIntentos] = useState(0);
  const MAX_INTENTOS = 40; // 40 * 15s = 10 mins
  const [pollingTimeout, setPollingTimeout] = useState(false);

  const cargarPedido = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/pedidos/${pedidoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedido(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar el pedido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedido();
  }, [pedidoId]);

  useEffect(() => {
    if (!pedido || pedido.estado !== 'COMPROBANTE_ENVIADO') return;
    if (pollingTimeout) return;

    if (pollingIntentos >= MAX_INTENTOS) {
      setPollingTimeout(true);
      return;
    }

    const intervalo = setInterval(() => {
      setPollingIntentos((prev) => prev + 1);
      cargarPedido();
    }, 15000);

    return () => clearInterval(intervalo);
  }, [pedido?.estado, pollingIntentos, pollingTimeout]);

  // Check if it just transitioned to PAGADO
  const prevEstadoRef = useRef();
  useEffect(() => {
    if (prevEstadoRef.current === 'COMPROBANTE_ENVIADO' && pedido?.estado === 'PAGADO') {
      toast.success("\xA1Tu pago fue confirmado!");
    }
    prevEstadoRef.current = pedido?.estado;
  }, [pedido?.estado, toast]);

  const handleCopyMonto = () => {
    navigator.clipboard.writeText(Number(pedido?.monto_total).toFixed(2));
    toast.success('Monto copiado al portapapeles');
  };

  const handleReceiptUpload = (file) => {
    if (!file) return;
    setArchivoSeleccionado(file);
    const reader = new FileReader();
    reader.onload = (e) => setReceiptPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleEnviarComprobante = async () => {
    if (!archivoSeleccionado) return;
    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append('comprobante', archivoSeleccionado);

      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/pedidos/${pedidoId}/comprobante`,
        formData,
        { headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          } }
      );

      toast.success("Comprobante enviado. El productor revisar\xE1 tu pago");
      setPollingIntentos(0);
      setPollingTimeout(false);
      await cargarPedido();
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo enviar el comprobante');
    } finally {
      setEnviando(false);
    }
  };

  const handleSimularPago = async () => {
    setEnviando(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API}/pedidos/${pedidoId}/comprobante-demo`,
        {
          comprobante_url: 'https://placehold.co/400x300/e2e8f0/1e293b?text=Comprobante+Demo'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Comprobante enviado (demo). El productor revisar\xE1 tu pago");
      setPollingIntentos(0);
      setPollingTimeout(false);
      await cargarPedido();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al simular pago');
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </PageShell>);

  }

  if (!pedido) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <AlertTriangle className="w-12 h-12 mb-4 text-amber-500" />
          <h2 className="text-xl font-bold text-slate-800">Pedido no encontrado</h2>
          <button onClick={() => navigate('/dashboard/comprador/mis-pedidos')} className="mt-4 text-blue-600 font-semibold hover:underline">Volver a mis pedidos</button>
        </div>
      </PageShell>);

  }

  return (
    <PageShell>
      <div className="max-w-lg mx-auto py-8 px-4 font-inter">
        
        {/* ESTADO 1: PENDIENTE_CONFIRMACION */}
        {(pedido.estado === 'PENDIENTE_CONFIRMACION' || pedido.estado === 'PENDIENTE') &&
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-center relative p-6 space-y-6">
            <div className="flex flex-col items-center">
              <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-xs mb-2">
                ⏳ Esperando tu pago
              </span>
              <h1 className="text-xl font-black text-slate-800">Pedido #{String(pedido.numero_pedido).slice(0, 8)}</h1>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex flex-col items-start gap-2 text-left">
              <p className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                <Star size={16} className="inline-block mr-1" /> Transferí a:
              </p>
              <div>
                <p className="font-bold text-slate-900">{pedido.productor?.nombre_banco}</p>
                <p className="text-sm text-slate-600"><Star size={16} className="inline-block mr-1" /> {pedido.productor?.titular_banco}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-slate-500 font-semibold text-sm text-left">Monto exacto a transferir:</p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-4xl font-black text-[#0d9f6e]">Bs {Number(pedido.monto_total).toFixed(2)}</span>
                <button
                onClick={handleCopyMonto}
                className="p-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors flex items-center gap-1 text-xs font-bold"
                title="Copiar monto">
                
                  <Copy className="w-4 h-4" /> Copiar
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-slate-500 font-semibold text-sm text-left">Escaneá el QR del productor:</p>
              <div className="flex justify-center">
                <div className="border-4 border-emerald-200 rounded-2xl p-3 bg-white inline-block shadow-sm">
                  <img
                  src={pedido.productor?.qr_banco_url || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=AgroDirecto-${pedido.numero_pedido}-Bs${pedido.monto_total}`}
                  alt="QR del Productor"
                  className="w-52 h-52 object-cover rounded-xl" />
                
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-4 text-left">
              <p className="text-slate-600 font-bold text-sm">Después de transferir, subí tu comprobante:</p>
              <div className="border-2 border-dashed border-slate-300 hover:border-[#2563eb] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50">
                <input
                type="file"
                id="receipt-upload"
                accept="image/*"
                onChange={(e) => handleReceiptUpload(e.target.files[0])}
                className="hidden" />
              
                {receiptPreview ?
              <div className="w-full flex items-center justify-between bg-white border border-slate-200 p-2 rounded-xl">
                    <img src={receiptPreview} alt="Comprobante" className="w-12 h-12 object-cover rounded-lg" />
                    <span className="text-xs font-bold text-[#0d9f6e] truncate px-2">Comprobante listo</span>
                    <label htmlFor="receipt-upload" className="cursor-pointer text-[10px] font-bold bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-600">Cambiar</label>
                  </div> :

              <label htmlFor="receipt-upload" className="cursor-pointer text-center flex flex-col items-center w-full py-4">
                    <Camera className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-xs font-bold text-slate-600"><Star size={16} className="inline-block mr-1" /> Arrastrá o hacé click para subir</span>
                  </label>
              }
              </div>
            </div>

            <button
            onClick={handleEnviarComprobante}
            disabled={!archivoSeleccionado || enviando}
            className="w-full bg-[#2563eb] hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2">
            
              {enviando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              Enviar comprobante
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-400 font-semibold">o</span>
              </div>
            </div>

            {/* Simular Pago Button (Always Visible) */}
            <button
            onClick={handleSimularPago}
            disabled={enviando}
            className="w-full bg-white border border-slate-300 text-slate-500 hover:bg-slate-50 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2">
              <Zap size={16} className="inline-block mr-1" /> Simular pago para demo
            
          </button>
          </div>
        }

        {/* ESTADO 2: COMPROBANTE_ENVIADO */}
        {pedido.estado === 'COMPROBANTE_ENVIADO' &&
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-purple-600" />
            </div>
            <h1 className="text-2xl font-black text-slate-800">Comprobante enviado</h1>
            
            <p className="text-slate-600 text-sm">
              Tu comprobante fue enviado a <br />
              <span className="font-bold text-slate-800">{pedido.productor?.nombre_completo}</span>.
            </p>
            <p className="text-slate-600 text-sm">
              Te notificaremos cuando confirme la recepción del pago.
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left space-y-2 mt-6">
              <p className="font-bold text-slate-800 text-sm">Pedido #{String(pedido.numero_pedido).slice(0, 8)}</p>
              <p className="font-black text-[#0d9f6e]">Bs {Number(pedido.monto_total).toFixed(2)}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-purple-500"></span>
                <span className="text-xs font-bold text-purple-700">Estado: Esperando confirmación</span>
              </div>
            </div>

            <button
            onClick={() => navigate('/dashboard/comprador/mis-pedidos')}
            className="w-full bg-[#2563eb] hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all mt-4">
            
              Ver mis pedidos →
            </button>

            {pollingTimeout ?
          <div className="mt-6 bg-amber-50 p-4 rounded-xl border border-amber-200 text-left flex flex-col gap-2">
                <p className="text-xs text-amber-800 font-medium">
                  <Info className="w-4 h-4 inline mr-1 -mt-0.5" />
                  Si ya pagaste, el productor podría tardar en confirmar. Podés revisar el estado en Mis Pedidos.
                </p>
                <button
              onClick={() => {setPollingIntentos(0);setPollingTimeout(false);}}
              className="self-start text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1">
              
                  <RefreshCcw className="w-3.5 h-3.5" /> Reactivar búsqueda automática
                </button>
              </div> :

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-6">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                Verificando estado cada 15s...
              </div>
          }
          </div>
        }

        {/* ESTADO 3: PAGADO o posterior */}
        {['PAGADO', 'PREPARACION', 'LISTO_PARA_DESPACHO', 'EN_CAMINO', 'ENTREGADO', 'FINALIZADO'].includes(pedido.estado) &&
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-[#0d9f6e]" />
            </div>
            <h1 className="text-2xl font-black text-slate-800">¡Pago confirmado!</h1>
            
            <p className="text-slate-600 text-sm">
              <span className="font-bold text-slate-800">{pedido.productor?.nombre_completo}</span> confirmó la recepción de tu pago.
            </p>
            <p className="text-slate-600 text-sm">
              Tu pedido está siendo preparado.
            </p>

            <button
            onClick={() => navigate('/dashboard/comprador/mis-pedidos')}
            className="w-full bg-[#0d9f6e] hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all mt-8">
            
              Ver mis pedidos →
            </button>
          </div>
        }

      </div>
    </PageShell>);

};

export default PagoQRPage;