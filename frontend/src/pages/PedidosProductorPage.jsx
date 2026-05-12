import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Leaf,
  AlertCircle,
  Truck,
  ShieldCheck
} from 'lucide-react';

const PedidosProductorPage = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' | 'error'
  const [actionLoading, setActionLoading] = useState(null); // pedido_id being processed

  const fetchPedidos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      const res = await axios.get('http://localhost:5000/api/pedidos/productor', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleConfirmar = async (pedidoId) => {
    setActionLoading(pedidoId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/pedidos/${pedidoId}/confirmar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Pedido confirmado e inventario actualizado', 'success');
      fetchPedidos();
    } catch (error) {
      const msg = error.response?.data?.error || 'Error al confirmar el pedido';
      showToast(msg, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRechazar = async (pedidoId) => {
    setActionLoading(pedidoId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/pedidos/${pedidoId}/rechazar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Pedido rechazado', 'success');
      fetchPedidos();
    } catch (error) {
      const msg = error.response?.data?.error || 'Error al rechazar el pedido';
      showToast(msg, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusConfig = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return { label: 'Pendiente', color: 'bg-amber-100 text-amber-700', icon: Clock };
      case 'CONFIRMADO':
        return { label: 'Confirmado', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 };
      case 'RECHAZADO':
        return { label: 'Rechazado', color: 'bg-red-100 text-red-700', icon: XCircle };
      case 'ENVIADO':
        return { label: 'Enviado', color: 'bg-blue-100 text-blue-700', icon: Truck };
      case 'ENTREGADO':
        return { label: 'Entregado', color: 'bg-emerald-100 text-emerald-700', icon: ShieldCheck };
      default:
        return { label: estado, color: 'bg-gray-100 text-gray-600', icon: Package };
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-gray-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-400">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">

      {/* TOAST */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 pl-4 pr-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border ${
          toastType === 'success'
            ? 'bg-slate-900 text-white border-slate-700'
            : 'bg-red-600 text-white border-red-500'
        }`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            toastType === 'success' ? 'bg-emerald-500' : 'bg-red-400'
          }`}>
            {toastType === 'success'
              ? <CheckCircle2 className="w-4 h-4 text-white" />
              : <AlertCircle className="w-4 h-4 text-white" />
            }
          </div>
          <p className="text-sm font-bold">{toastMessage}</p>
        </div>
      )}

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Mis Pedidos</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gestiona las solicitudes de compra que reciben tus productos.</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Pendientes', value: pedidos.filter(p => p.estado === 'PENDIENTE').length, color: 'text-amber-600 bg-amber-50 border-amber-100' },
          { label: 'Confirmados', value: pedidos.filter(p => p.estado === 'CONFIRMADO').length, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
          { label: 'Rechazados', value: pedidos.filter(p => p.estado === 'RECHAZADO').length, color: 'text-red-600 bg-red-50 border-red-100' },
          { label: 'Total', value: pedidos.length, color: 'text-slate-600 bg-gray-50 border-gray-200' },
        ].map((s, i) => (
          <div key={i} className={`rounded-xl p-4 border ${s.color}`}>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-xs font-medium opacity-70 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {pedidos.length === 0 && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 py-20 flex flex-col items-center justify-center text-center px-6">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
            <Package className="w-7 h-7 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Sin pedidos todavía</h3>
          <p className="text-sm text-gray-500 max-w-sm">Cuando un comprador adquiera tus productos, los pedidos aparecerán aquí para que los gestiones.</p>
        </div>
      )}

      {/* PEDIDOS LIST */}
      <div className="space-y-4">
        {pedidos.map(pedido => {
          const statusConfig = getStatusConfig(pedido.estado);
          const StatusIcon = statusConfig.icon;
          const total = pedido.items.reduce((acc, it) => acc + (it.precio_unitario * it.cantidad), 0);
          const isProcessing = actionLoading === pedido.id;

          return (
            <div key={pedido.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">

              {/* Order Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{pedido.comprador_nombre}</p>
                    <p className="text-xs text-gray-400">{pedido.comprador_correo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 font-medium">
                    {new Date(pedido.fecha_pedido).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md ${statusConfig.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {statusConfig.label}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-50">
                {pedido.items.map(item => (
                  <div key={item.detalle_id} className="px-5 py-3 flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
                      {item.foto_url ? (
                        <img src={`http://localhost:5000${item.foto_url}`} alt={item.nombre_producto} className="w-full h-full object-cover" />
                      ) : (
                        <Leaf className="w-5 h-5 text-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{item.nombre_producto}</p>
                      <p className="text-xs text-gray-400">{item.cantidad} {item.unidad_medida} x Bs. {item.precio_unitario}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-slate-900 text-sm">Bs. {(item.precio_unitario * item.cantidad).toFixed(2)}</p>
                      <p className="text-[11px] text-gray-400">Stock: {item.stock_actual}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="text-sm text-gray-500">Total del pedido: </span>
                  <span className="text-lg font-black text-slate-900">Bs. {total.toFixed(2)}</span>
                </div>

                {pedido.estado === 'PENDIENTE' && (
                  <div className="flex gap-2">
                    {pedido.comprobante_url && (
                      <button
                        onClick={() => window.open(`http://localhost:5000${pedido.comprobante_url}`, '_blank')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" /> Comprobante
                      </button>
                    )}
                    <button
                      onClick={() => handleRechazar(pedido.id)}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg font-semibold text-sm hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" /> Rechazar
                    </button>
                    <button
                      onClick={() => handleConfirmar(pedido.id)}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Confirmar
                    </button>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PedidosProductorPage;
