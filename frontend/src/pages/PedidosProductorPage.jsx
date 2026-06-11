import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Package, CheckCircle2, XCircle, Clock, User, Leaf, AlertCircle,
  Truck, ShieldCheck, Eye, Download, Info, Check, X, Loader2, Inbox
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import FocusModal from '../components/ui/FocusModal';
import PageShell from '../components/ui/PageShell';
import PollingIndicator from '../components/PollingIndicator';
import { usePolling } from '../hooks/usePolling';
import { getEstadoPedido, formatPedidoRef } from '../utils/pedidoEstados';

const formatearFechaHora = (fecha) => {
  if (!fecha) return null;
  return new Date(fecha).toLocaleString('es-BO', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const PedidosProductorPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prevPedidosHash, setPrevPedidosHash] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos'); // Todos | Pendientes | Confirmados | En camino | Entregados
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [reportProblemMode, setReportProblemMode] = useState(false);
  const [problemDescription, setProblemDescription] = useState('');

  const fetchPedidos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      const res = await axios.get('http://localhost:5000/api/pedidos/productor', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Aseguramos estructura de items
      const data = res.data.map(p => ({
        ...p,
        items: p.items || [
          {
            detalle_id: p.id + '-1',
            nombre_producto: p.nombre_producto || 'Cosecha AgroDirecto',
            cantidad: p.cantidad || 1,
            unidad_medida: p.unidad_medida || 'Kg',
            precio_unitario: p.precio_unitario || p.monto_total || 0,
            es_preventa: p.es_preventa || false,
            foto_url: p.foto_url
          }
        ]
      }));
      const hash = data.map((p) => `${p.id}:${p.estado}`).join('|');
      if (prevPedidosHash && hash !== prevPedidosHash) {
        const nuevos = data.filter((p) =>
          p.estado === 'COMPROBANTE_ENVIADO' &&
          !pedidos.some((old) => old.id === p.id && old.estado === 'COMPROBANTE_ENVIADO')
        );
        nuevos.forEach((p) => {
          toast.warning('📸 Comprobante recibido', `Revisá el pago del pedido ${formatPedidoRef(p.id)}`);
        });
      }
      setPrevPedidosHash(hash);
      setPedidos(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (loading) toast.error('No se pudo cargar la lista de pedidos');
    } finally {
      setLoading(false);
    }
  };

  const { segundosDesdeUpdate } = usePolling(fetchPedidos, 30000);

  const handleConfirmar = async (pedidoId) => {
    setActionLoading(pedidoId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/pedidos/${pedidoId}/confirmar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('💰 Pago confirmado. Pedido en preparación.');
      fetchPedidos();
      if (selectedPedido?.id === pedidoId) setIsModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al confirmar el pedido');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRechazar = async (pedidoId) => {
    setActionLoading(pedidoId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/pedidos/${pedidoId}/rechazar`, {
        motivo_rechazo: problemDescription,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Problema reportado al comprador');
      fetchPedidos();
      if (selectedPedido?.id === pedidoId) setIsModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al rechazar el pedido');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmarPago = async (pedidoId) => {
    setActionLoading(pedidoId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/pedidos/${pedidoId}/confirmar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('💰 Pago confirmado. Pedido en preparación.');
      fetchPedidos();
      if (selectedPedido?.id === pedidoId) setIsModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al confirmar el pago');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReportarProblema = async (pedidoId) => {
    if (!problemDescription.trim()) {
      toast.error('Por favor describí el problema');
      return;
    }
    setActionLoading(pedidoId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/pedidos/${pedidoId}/rechazar`, {
        motivo_rechazo: problemDescription,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Problema reportado al comprador');
      setReportProblemMode(false);
      setProblemDescription('');
      setIsModalOpen(false);
      fetchPedidos();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al reportar el problema');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDespachar = async (pedidoId) => {
    setActionLoading(pedidoId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/pedidos/${pedidoId}/estado`, { estado: 'LISTO_PARA_DESPACHO' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Pedido marcado como listo para despacho');
      fetchPedidos();
      if (selectedPedido?.id === pedidoId) setIsModalOpen(false);
    } catch (error) {
      toast.error('Error al despachar el pedido');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (estado) => {
    const s = getEstadoPedido(estado, 'PRODUCTOR');
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${s.class}`}>
        {s.label}
      </span>
    );
  };

  const getComprobanteUrl = (url) => {
    if (!url) return null;
    // Fix retro-compatible para registros viejos guardados como /uploads/comprobante-...
    let parsedUrl = url;
    if (parsedUrl.includes('/uploads/comprobante-')) {
      parsedUrl = parsedUrl.replace('/uploads/', '/documentos/');
    }
    return parsedUrl.startsWith('http') ? parsedUrl : `http://localhost:5000${parsedUrl.startsWith('/') ? '' : '/'}${parsedUrl}`;
  };

  const openDetailModal = (pedido) => {
    setSelectedPedido(pedido);
    setIsModalOpen(true);
  };

  const filteredPedidos = pedidos.filter(p => {
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Por confirmar') return ['PENDIENTE_CONFIRMACION', 'COMPROBANTE_ENVIADO'].includes(p.estado);
    if (activeFilter === 'Pagados') return p.estado === 'PAGADO';
    if (activeFilter === 'Listos') return p.estado === 'LISTO_PARA_DESPACHO';
    if (activeFilter === 'En camino') return p.estado === 'EN_CAMINO';
    if (activeFilter === 'Entregados') return p.estado === 'ENTREGADO';
    return true;
  });

  return (
    <PageShell>
      {/* Header */}
      <div>
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
          📦 Gestión de pedidos
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Pedidos Recibidos</h1>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-400 mt-1">Confirmá ventas, gestioná preventas y marcá despachos a transportistas</p>
          <PollingIndicator segundosDesdeUpdate={segundosDesdeUpdate} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto hide-scrollbar">
        {['Todos', 'Por confirmar', 'Pagados', 'Listos', 'En camino', 'Entregados'].map(filter => {
          const count = pedidos.filter(p => {
            if (filter === 'Todos') return true;
            if (filter === 'Por confirmar') return ['PENDIENTE_CONFIRMACION', 'COMPROBANTE_ENVIADO'].includes(p.estado);
            if (filter === 'Pagados') return p.estado === 'PAGADO';
            if (filter === 'Listos') return p.estado === 'LISTO_PARA_DESPACHO';
            if (filter === 'En camino') return p.estado === 'EN_CAMINO';
            if (filter === 'Entregados') return p.estado === 'ENTREGADO';
            return false;
          }).length;
          
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-3 text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                activeFilter === filter 
                  ? 'border-b-2 border-emerald-600 text-emerald-700 font-semibold' 
                  : 'text-gray-500 hover:text-gray-700 font-medium'
              }`}
            >
              <span>{filter}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeFilter === filter ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Order List / Table */}
      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto" />
        </div>
      ) : filteredPedidos.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/60 p-16 text-center max-w-lg mx-auto shadow-sm">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-black text-slate-800">No hay pedidos</h3>
          <p className="text-xs text-slate-400 mt-2 font-semibold">
            No hay pedidos en esta categoría
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-semibold">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                    <th className="px-6 py-4"># Pedido</th>
                    <th className="px-6 py-4">Comprador</th>
                    <th className="px-6 py-4">Producto</th>
                    <th className="px-4 py-4 text-center">Cant</th>
                    <th className="px-6 py-4 text-center">Total Bs</th>
                    <th className="px-6 py-4 text-center">Estado</th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredPedidos.map(p => {
                    const total = p.items.reduce((acc, it) => acc + (Number(it.precio_unitario) * Number(it.cantidad)), 0);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">#{p.id?.slice(0, 6).toUpperCase()}</td>
                        <td className="px-6 py-4">{p.nombre_comprador || p.comprador || 'Comprador'}</td>
                        <td className="px-6 py-4 max-w-xs truncate">{p.items[0]?.nombre_producto}</td>
                        <td className="px-4 py-4 text-center">{p.items[0]?.cantidad} {p.items[0]?.unidad_medida}</td>
                        <td className="px-6 py-4 text-center font-black text-slate-900">Bs. {total.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">{getStatusBadge(p.estado)}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-400">
                          {new Date(p.fecha_pedido).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => openDetailModal(p)}
                            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all"
                          >
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden space-y-4">
            {filteredPedidos.map(p => {
              const total = p.items.reduce((acc, it) => acc + (Number(it.precio_unitario) * Number(it.cantidad)), 0);
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="font-bold text-slate-900 text-sm">#{p.id?.slice(0, 6).toUpperCase()}</span>
                    <span className="text-xs font-semibold text-slate-400">{new Date(p.fecha_pedido).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">{p.nombre_comprador || p.comprador || 'Comprador'}</h3>
                    <p className="text-xs text-slate-500 mt-1">{p.items[0]?.nombre_producto} — {p.items[0]?.cantidad} {p.items[0]?.unidad_medida}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-black text-slate-900 text-sm">Bs. {total.toFixed(2)}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-end">
                        {getStatusBadge(p.estado)}
                        {['PAGADO', 'LISTO_PARA_DESPACHO', 'EN_CAMINO', 'ENTREGADO'].includes(p.estado) && p.fecha_pago && (
                          <p className="text-[10px] text-gray-400 mt-1 font-semibold">
                            💰 Pagado el {formatearFechaHora(p.fecha_pago)}
                          </p>
                        )}
                      </div>
                      <button 
                        onClick={() => openDetailModal(p)}
                        className="px-3.5 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold"
                      >
                        Ver
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* MODAL DETALLE PEDIDO */}
      {selectedPedido && (
        <FocusModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Detalle de Pedido #${selectedPedido.id?.slice(0, 6).toUpperCase()}`}
          subtitle={`Gestioná y visualizá los datos de este pedido`}
          icon={Package}
          footer={
            <div className="flex justify-end gap-3 w-full">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cerrar
              </button>

              {(selectedPedido.estado === 'PAGADO' || selectedPedido.estado === 'CONFIRMADO') && (
                <button
                  onClick={() => handleDespachar(selectedPedido.id)}
                  className="px-5 py-2.5 bg-[#0d9f6e] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Marcar como listo para despacho
                </button>
              )}
            </div>
          }
        >
          <div className="space-y-6">
            {/* Info Comprador */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 space-y-3">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Información del comprador
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <span className="text-slate-400 block">Nombre completo</span>
                  <span className="text-slate-800 font-bold text-sm mt-0.5 block">
                    {selectedPedido.nombre_comprador || selectedPedido.comprador || 'Comprador'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Celular / Teléfono</span>
                  <span className="text-slate-800 mt-0.5 block">
                    {selectedPedido.comprador_celular || selectedPedido.celular || '—'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Ciudad</span>
                  <span className="text-slate-800 mt-0.5 block">
                    {selectedPedido.ciudad || 'Santa Cruz de la Sierra'}
                  </span>
                </div>
              </div>
            </div>

            {/* Detalle Producto con foto */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Productos</h4>
              {selectedPedido.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center bg-white border border-slate-200/60 p-4 rounded-2xl">
                  <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.foto_url ? (
                      <img src={`http://localhost:5000${item.foto_url}`} className="w-full h-full object-cover" alt={item.nombre_producto} />
                    ) : (
                      <Leaf className="w-6 h-6 text-emerald-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-extrabold text-slate-800 text-sm truncate">{item.nombre_producto}</h5>
                    <p className="text-xs text-slate-400 mt-1">
                      {item.cantidad} {item.unidad_medida} x Bs. {Number(item.precio_unitario).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-slate-900 block">
                      Bs. {(Number(item.precio_unitario) * Number(item.cantidad)).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Si es preventa: sección "Anticipo recibido: 50% — Saldo pendiente: 50%" */}
            {selectedPedido.items.some(i => i.es_preventa) && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-2 text-blue-900">
                <h4 className="text-xs font-black uppercase tracking-wider">Detalles de Preventa (Pago fraccionado)</h4>
                <div className="flex justify-between text-xs font-bold mt-1">
                  <span>Anticipo recibido (50%):</span>
                  <span>Bs. {(selectedPedido.monto_total / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span>Saldo pendiente (50%):</span>
                  <span>Bs. {(selectedPedido.monto_total / 2).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Comprobante de pago (Si el estado es COMPROBANTE_ENVIADO o PAGADO, o si ya existe una URL de comprobante) */}
            {(selectedPedido.estado === 'COMPROBANTE_ENVIADO' || selectedPedido.estado === 'PAGADO' || selectedPedido.comprobante_url) && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    📸 Comprobante de pago enviado
                  </h4>
                  {selectedPedido.estado === 'COMPROBANTE_ENVIADO' && selectedPedido.fecha_actualizacion && (
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(selectedPedido.fecha_actualizacion).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  )}
                </div>
                
                <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white h-40 flex items-center justify-center shadow-inner">
                  {selectedPedido.comprobante_url ? (
                    <>
                      <img 
                        src={getComprobanteUrl(selectedPedido.comprobante_url)} 
                        className="w-full h-full object-cover" 
                        alt="Comprobante de pago"
                      />
                      <a 
                        href={getComprobanteUrl(selectedPedido.comprobante_url)} 
                        target="_blank" 
                        rel="noreferrer"
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-bold gap-2 cursor-pointer"
                      >
                        <Eye className="w-5 h-5" /> Ver comprobante completo
                      </a>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs font-semibold">Comprobante no disponible</span>
                    </div>
                  )}
                </div>

                {selectedPedido.estado === 'COMPROBANTE_ENVIADO' && !reportProblemMode && (
                  <div className="pt-2 space-y-3">
                    <p className="text-sm font-bold text-slate-700 text-center">¿Recibiste el pago?</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleConfirmarPago(selectedPedido.id)}
                        disabled={actionLoading === selectedPedido.id}
                        className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-all"
                      >
                        ✓ Sí, recibí el pago
                      </button>
                      <button 
                        onClick={() => setReportProblemMode(true)}
                        className="py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5"
                      >
                        ✗ No recibí
                      </button>
                    </div>
                  </div>
                )}

                {reportProblemMode && (
                  <div className="pt-2 space-y-3 border-t border-slate-200 mt-4">
                    <p className="text-sm font-bold text-slate-800">Describí el problema</p>
                    <textarea 
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none"
                      rows="3"
                      placeholder="Ej. El monto enviado no coincide, o el comprobante es falso..."
                      value={problemDescription}
                      onChange={(e) => setProblemDescription(e.target.value)}
                    ></textarea>
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => setReportProblemMode(false)}
                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={() => handleReportarProblema(selectedPedido.id)}
                        className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-rose-700"
                      >
                        Reportar problema
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Historial de estados (Timeline vertical) */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Historial del pedido</h4>
              <div className="relative border-l-2 border-slate-100 ml-3 pl-6 space-y-4 text-xs font-semibold">
                
                {/* Pedido realizado */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                  <div>
                    <h5 className="font-bold text-slate-800">Pedido realizado</h5>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {formatearFechaHora(selectedPedido.fecha_pedido)}
                    </span>
                  </div>
                </div>

                {/* Comprobante enviado */}
                <div className="relative">
                  <div className={`absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${selectedPedido.fecha_comprobante || ['COMPROBANTE_ENVIADO', 'PAGADO', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO_PARA_DESPACHO', 'EN_CAMINO', 'ENTREGADO'].includes(selectedPedido.estado) ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  <div>
                    <h5 className={`font-bold ${selectedPedido.fecha_comprobante || ['COMPROBANTE_ENVIADO', 'PAGADO', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO_PARA_DESPACHO', 'EN_CAMINO', 'ENTREGADO'].includes(selectedPedido.estado) ? 'text-slate-800' : 'text-slate-400'}`}>Comprobante enviado</h5>
                    {selectedPedido.fecha_comprobante && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {formatearFechaHora(selectedPedido.fecha_comprobante)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Pago confirmado */}
                <div className="relative">
                  <div className={`absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${selectedPedido.fecha_pago || ['PAGADO', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO_PARA_DESPACHO', 'EN_CAMINO', 'ENTREGADO'].includes(selectedPedido.estado) ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  <div>
                    <h5 className={`font-bold ${selectedPedido.fecha_pago || ['PAGADO', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO_PARA_DESPACHO', 'EN_CAMINO', 'ENTREGADO'].includes(selectedPedido.estado) ? 'text-emerald-600' : 'text-slate-400'}`}>Pago confirmado</h5>
                    {selectedPedido.fecha_pago && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {formatearFechaHora(selectedPedido.fecha_pago)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Pedido entregado */}
                <div className="relative">
                  <div className={`absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${selectedPedido.fecha_entrega || selectedPedido.estado === 'ENTREGADO' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  <div>
                    <h5 className={`font-bold ${selectedPedido.fecha_entrega || selectedPedido.estado === 'ENTREGADO' ? 'text-slate-800' : 'text-slate-400'}`}>Pedido entregado</h5>
                    {selectedPedido.fecha_entrega && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {formatearFechaHora(selectedPedido.fecha_entrega)}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </FocusModal>
      )}
    </PageShell>
  );
};

export default PedidosProductorPage;
