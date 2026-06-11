import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Package, Clock, CheckCircle2, Truck, ShieldCheck, CreditCard,
  Bell, X, Upload, AlertCircle, Eye, ShoppingBag, XCircle, RefreshCw, FileText
} from 'lucide-react';
import PageShell from '../components/ui/PageShell';
import PollingIndicator from '../components/PollingIndicator';
import { usePolling } from '../hooks/usePolling';
import { getEstadoPedido, formatPedidoRef } from '../utils/pedidoEstados';
import { useToast } from '../context/ToastContext';

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

const MisPedidosPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prevHash, setPrevHash] = useState('');
  const [activeTab, setActiveTab] = useState('Todos'); // Todos | Pendientes | En preparación | En camino | Entregados | Cancelados

  // Filters
  const [filtroFecha, setFiltroFecha] = useState('fecha_pedido');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Modal uploading balance receipt
  const [pedidoSaldo, setPedidoSaldo] = useState(null);
  const [comprobanteSaldo, setComprobanteSaldo] = useState(null);
  const [comprobantePreview, setComprobantePreview] = useState(null);
  const [pagandoSaldo, setPagandoSaldo] = useState(false);
  const [errorSaldo, setErrorSaldo] = useState('');

  // Detailed view modal
  const [pedidoDetalle, setPedidoDetalle] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const params = {};
      if (fechaDesde) params.desde = fechaDesde;
      if (fechaHasta) params.hasta = fechaHasta;
      if (filtroFecha) params.filtro_fecha = filtroFecha;

      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get('http://localhost:5000/api/pedidos/comprador', { headers, params });
      const data = res.data;
      const hash = data.map((p) => `${p.id}:${p.estado}`).join('|');
      if (prevHash && hash !== prevHash) {
        data.forEach((p) => {
          const old = pedidos.find((o) => o.id === p.id);
          if (old && old.estado !== p.estado) {
            if (p.estado === 'PAGADO') toast.success('✅ Pago verificado', `Tu pedido ${formatPedidoRef(p.id)} fue confirmado.`);
            if (p.estado === 'EN_CAMINO') toast.info('🚛 En camino', `Tu pedido va con ${p.transportista_nombre || 'el transportista'}.`);
            if (p.estado === 'ENTREGADO') toast.celebration('📦 Entregado', '¡Tu pedido fue entregado!');
          }
        });
      }
      setPrevHash(hash);
      setPedidos(data);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      if (loading) toast.error('No se pudieron cargar tus pedidos.');
    } finally {
      setLoading(false);
    }
  };

  const { segundosDesdeUpdate, refrescar } = usePolling(fetchData, 30000);

  const handleFileSaldo = (e) => {
    const file = e.target.files[0];
    if (file) {
      setComprobanteSaldo(file);
      setComprobantePreview(URL.createObjectURL(file));
      setErrorSaldo('');
    }
  };

  const handlePagarSaldo = async () => {
    if (!comprobanteSaldo) {
      setErrorSaldo('Por favor, cargá el comprobante de transferencia.');
      return;
    }
    setPagandoSaldo(true);
    setErrorSaldo('');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('comprobante_saldo', comprobanteSaldo);
      
      await axios.put(
        `http://localhost:5000/api/pedidos/${pedidoSaldo.id}/pagar-saldo`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      
      toast.success('¡Comprobante de saldo enviado con éxito!');
      setPedidoSaldo(null);
      setComprobanteSaldo(null);
      setComprobantePreview(null);
      await fetchData();
    } catch (err) {
      setErrorSaldo(err.response?.data?.error || 'No se pudo registrar el pago del saldo.');
      toast.error('Error al enviar el comprobante de saldo.');
    } finally {
      setPagandoSaldo(false);
    }
  };

  const getStatusBadge = (estado) => {
    const info = getEstadoPedido(estado, 'COMPRADOR');
    return (
      <span className={`rounded-full px-3 py-1 text-xs font-semibold border uppercase tracking-wide ${info.class}`}>
        {info.label}
      </span>
    );
  };

  // Filter based on active tab
  const filteredPedidos = pedidos.filter(p => {
    if (activeTab === 'Todos') return true;
    if (activeTab === 'Pendientes') return p.estado === 'PENDIENTE' || p.estado === 'PENDIENTE_CONFIRMACION' || p.estado === 'PENDIENTE_SALDO' || p.estado === 'COMPROBANTE_ENVIADO';
    if (activeTab === 'En preparación') return p.estado === 'CONFIRMADO' || p.estado === 'PAGADO' || p.estado === 'EN_PREPARACION' || p.estado === 'LISTO_PARA_DESPACHO';
    if (activeTab === 'En camino') return p.estado === 'EN_CAMINO';
    if (activeTab === 'Entregados') return p.estado === 'ENTREGADO';
    if (activeTab === 'Cancelados') return p.estado === 'RECHAZADO' || p.estado === 'CANCELADO';
    return true;
  });

  return (
    <PageShell>
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <span className="inline-flex bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold">
            📋 Mis Compras
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Mis Pedidos</h1>
          <p className="text-sm text-slate-400 mt-1">Historial completo, preventas y estados de envío</p>
        </div>
        <div className="flex items-center gap-3">
          <PollingIndicator segundosDesdeUpdate={segundosDesdeUpdate} />
          <button
            onClick={() => fetchData()}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-blue-600 transition-colors shadow-sm"
            title="Actualizar pedidos"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Date Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-end gap-4 mb-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Filtrar por</label>
          <select 
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-sm font-semibold rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="fecha_pedido">Fecha de Creación</option>
            <option value="fecha_actualizacion">Fecha de Actualización</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Desde</label>
          <input 
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-sm font-semibold rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Hasta</label>
          <input 
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-sm font-semibold rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-indigo-500"
          />
        </div>
        <button 
          onClick={() => fetchData()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          Aplicar Filtros
        </button>
        {(fechaDesde || fechaHasta) && (
          <button 
            onClick={() => {
              setFechaDesde('');
              setFechaHasta('');
              setTimeout(fetchData, 100);
            }}
            className="text-slate-500 hover:text-rose-600 text-xs font-bold transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {['Todos', 'Pendientes', 'En preparación', 'En camino', 'Entregados', 'Cancelados'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === t ? 'border-indigo-600 text-indigo-600 font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-[3px] border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-400 font-bold">Cargando tus compras...</p>
        </div>
      ) : filteredPedidos.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/60 py-16 flex flex-col items-center justify-center text-center px-6 shadow-sm max-w-lg mx-auto">
          <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-5">
            <Package className="w-7 h-7 text-slate-300" />
          </div>
          <h2 className="text-base font-extrabold text-slate-800">No hay pedidos en esta sección</h2>
          <p className="text-xs text-slate-400 max-w-xs mt-2 font-semibold">
            Tus pedidos correspondientes a este estado aparecerán aquí cuando compres en el marketplace.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPedidos.map((p) => {
            const date = new Date(p.fecha_pedido).toLocaleDateString('es-BO', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            // Get first product for card preview
            const firstItem = p.items?.[0] || {};
            const itemCount = p.items?.length || 0;
            const extraCount = itemCount - 1;

            const isPendingSaldo = p.estado === 'PENDIENTE_SALDO' || p.requiere_pago_saldo;

            return (
              <div
                key={p.id}
                className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200"
              >
                <div>
                  <div className="flex justify-between items-start border-b border-slate-50 pb-3 mb-4">
                    <div>
                      <span className="text-[10px] font-black text-indigo-600 tracking-wider block">PEDIDO #{p.id.slice(0, 8).toUpperCase()}</span>
                      <span className="text-[10px] font-bold text-slate-400 mt-0.5 block">{date}</span>
                    </div>
                    {getStatusBadge(p.estado)}
                  </div>

                  {/* Product preview info */}
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                      {firstItem.foto_url ? (
                        <img src={`http://localhost:5000${firstItem.foto_url}`} className="w-full h-full object-cover" alt={firstItem.nombre_producto} />
                      ) : (
                        <Leaf className="w-6 h-6 text-indigo-200" />
                      )}
                    </div>
                    <div className="min-w-0 flex-grow">
                      <span className="text-xs font-black text-slate-800 truncate block">
                        {firstItem.nombre_producto} {extraCount > 0 ? `y ${extraCount} más` : ''}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                        Productor: {p.nombre_finca || 'AgroDirecto Farmer'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-5">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Total Pedido</span>
                    <span className="text-base font-black text-slate-800">Bs. {Number(p.monto_total || p.total || 0).toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPedidoDetalle(p)}
                      className="px-3 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ver detalle
                    </button>

                    {isPendingSaldo && (
                      <button
                        onClick={() => setPedidoSaldo(p)}
                        className="px-3.5 py-2 bg-[#9b2335] hover:bg-[#7a1c2a] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-900/10 flex items-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Pagar Saldo
                      </button>
                    )}
                  </div>
                </div>

                {p.estado === 'PENDIENTE' && p.motivo_rechazo_pago && (
                  <div className="mt-4 bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">⚠️ Problema con tu comprobante</p>
                        <p className="text-xs text-rose-700 mt-1">El productor indicó: <span className="italic font-medium">"{p.motivo_rechazo_pago}"</span></p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/dashboard/comprador/pago-qr/${p.id}`)}
                      className="mt-2 w-full py-2 bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                    >
                      📸 Subir nuevo comprobante
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL */}
      {pedidoDetalle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPedidoDetalle(null)}></div>
          <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 overflow-hidden shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Detalle del Pedido</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">ID: #{pedidoDetalle.id.toUpperCase()}</p>
              </div>
              <button onClick={() => setPedidoDetalle(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Status & Date */}
              <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Fecha</span>
                  <span className="text-xs font-black text-slate-700">
                    {new Date(pedidoDetalle.fecha_pedido).toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide text-right">Estado</span>
                  <div className="mt-0.5">{getStatusBadge(pedidoDetalle.estado)}</div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-800 block uppercase tracking-wider">Productos comprados</span>
                <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {pedidoDetalle.items?.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-extrabold text-slate-800 block">{item.nombre_producto}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {item.cantidad} {item.unidad_medida} x Bs. {Number(item.precio_unitario).toFixed(2)}
                        </span>
                      </div>
                      <span className="font-black text-slate-800">
                        Bs. {(Number(item.precio_unitario) * Number(item.cantidad)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total calculations */}
              <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-bold">Bs. {Number(pedidoDetalle.monto_total || 0).toFixed(2)}</span>
                </div>
                {Number(pedidoDetalle.monto_saldo_pendiente) > 0 && (
                  <>
                    <div className="flex justify-between text-blue-600 bg-blue-50 p-2 rounded-xl">
                      <span>Anticipo Pagado (50%):</span>
                      <span className="font-bold">Bs. {Number(pedidoDetalle.monto_pagado_anticipo || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Saldo Restante Pendiente:</span>
                      <span className="font-bold">Bs. {Number(pedidoDetalle.monto_saldo_pendiente || 0).toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-100 pt-2">
                  <span>Monto Total:</span>
                  <span className="text-emerald-600">Bs. {Number(pedidoDetalle.monto_total || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery info */}
              <div className="bg-slate-50/60 rounded-2xl p-4 border border-slate-100 space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Dirección de Entrega</span>
                <p className="text-xs font-semibold text-slate-600 leading-normal">{pedidoDetalle.direccion_entrega || 'No indicada'}</p>
                {pedidoDetalle.notas_adicionales && (
                  <>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mt-2">Notas Especiales</span>
                    <p className="text-xs font-semibold text-slate-500 italic">"{pedidoDetalle.notas_adicionales}"</p>
                  </>
                )}
              </div>

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
                        {formatearFechaHora(pedidoDetalle.fecha_pedido)}
                      </span>
                    </div>
                  </div>

                  {/* Comprobante enviado */}
                  <div className="relative">
                    <div className={`absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${pedidoDetalle.fecha_comprobante || ['COMPROBANTE_ENVIADO', 'PAGADO', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO_PARA_DESPACHO', 'EN_CAMINO', 'ENTREGADO'].includes(pedidoDetalle.estado) ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <div>
                      <h5 className={`font-bold ${pedidoDetalle.fecha_comprobante || ['COMPROBANTE_ENVIADO', 'PAGADO', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO_PARA_DESPACHO', 'EN_CAMINO', 'ENTREGADO'].includes(pedidoDetalle.estado) ? 'text-slate-800' : 'text-slate-400'}`}>Comprobante enviado</h5>
                      {pedidoDetalle.fecha_comprobante && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {formatearFechaHora(pedidoDetalle.fecha_comprobante)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pago confirmado */}
                  <div className="relative">
                    <div className={`absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${pedidoDetalle.fecha_pago || ['PAGADO', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO_PARA_DESPACHO', 'EN_CAMINO', 'ENTREGADO'].includes(pedidoDetalle.estado) ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <div>
                      <h5 className={`font-bold ${pedidoDetalle.fecha_pago || ['PAGADO', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO_PARA_DESPACHO', 'EN_CAMINO', 'ENTREGADO'].includes(pedidoDetalle.estado) ? 'text-emerald-600' : 'text-slate-400'}`}>Pago confirmado</h5>
                      {pedidoDetalle.fecha_pago && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {formatearFechaHora(pedidoDetalle.fecha_pago)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pedido entregado */}
                  <div className="relative">
                    <div className={`absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${pedidoDetalle.fecha_entrega || pedidoDetalle.estado === 'ENTREGADO' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <div>
                      <h5 className={`font-bold ${pedidoDetalle.fecha_entrega || pedidoDetalle.estado === 'ENTREGADO' ? 'text-slate-800' : 'text-slate-400'}`}>Pedido entregado</h5>
                      {pedidoDetalle.fecha_entrega && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {formatearFechaHora(pedidoDetalle.fecha_entrega)}
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD BALANCE COMPROBANTE MODAL */}
      {pedidoSaldo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPedidoSaldo(null)}></div>
          <div className="bg-white rounded-3xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Subir Comprobante de Saldo</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Pedido #{pedidoSaldo.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <button onClick={() => setPedidoSaldo(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black uppercase tracking-wider text-[10px]">Saldo Pendiente</h4>
                  <p className="font-semibold text-amber-800 mt-1">
                    La cosecha ya está disponible. Por favor transferí el saldo restante para confirmar el envío.
                  </p>
                </div>
              </div>

              {/* Amount to pay */}
              <div className="flex justify-between items-center bg-slate-50 p-4 border border-slate-100 rounded-2xl">
                <span className="text-xs font-bold text-slate-500">Monto a pagar saldo:</span>
                <span className="text-lg font-black text-rose-600">Bs. {Number(pedidoSaldo.monto_saldo_pendiente).toFixed(2)}</span>
              </div>

              {errorSaldo && (
                <div className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl flex gap-2 border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errorSaldo}
                </div>
              )}

              {/* Drag and drop mock file selector */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">Comprobante de Transferencia</label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 hover:border-indigo-400 transition-colors bg-slate-50/50 relative">
                  {comprobantePreview ? (
                    <div className="relative">
                      <img src={comprobantePreview} alt="Vista previa" className="h-32 mx-auto rounded-xl shadow-md border" />
                      <button
                        onClick={() => { setComprobanteSaldo(null); setComprobantePreview(null); }}
                        className="absolute -top-2.5 -right-2.5 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-2.5 cursor-pointer py-4">
                      <Upload className="w-8 h-8 text-slate-300" />
                      <span className="text-xs font-bold text-slate-500">Haz clic para arrastrar y soltar</span>
                      <span className="text-[10px] text-slate-400">PDF, JPG o PNG hasta 10MB</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileSaldo} />
                    </label>
                  )}
                </div>
              </div>

              {/* Submit button */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setPedidoSaldo(null)}
                  className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-xs transition-colors border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePagarSaldo}
                  disabled={pagandoSaldo || !comprobanteSaldo}
                  className="flex-grow flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-emerald-600/10"
                >
                  {pagandoSaldo ? 'Enviando...' : 'Enviar comprobante'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default MisPedidosPage;
