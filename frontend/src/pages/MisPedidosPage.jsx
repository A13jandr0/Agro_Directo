import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Clock, CheckCircle2, Truck, ShieldCheck, MapPin, CreditCard } from 'lucide-react';

const MisPedidosPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/pedidos/comprador', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPedidos(res.data);
      } catch (error) {
        console.error('Error al cargar pedidos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  const getStepStatus = (estado, step) => {
    const states = ['PENDIENTE', 'CONFIRMADO', 'EN_CAMINO', 'ENTREGADO'];
    const currentIndex = states.indexOf(estado);
    const stepIndex = states.indexOf(step);
    if (currentIndex >= stepIndex) return 'completed';
    return 'pending';
  };

  if (loading) return (
    <div className="p-12 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-[3px] border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400 font-medium">Cargando tus pedidos...</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Mis compras</h1>
        <p className="text-sm text-slate-500 mt-0.5">Historial y seguimiento de tus pedidos</p>
      </div>

      {pedidos.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-slate-200">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">Sin compras todavia</h3>
          <p className="text-sm text-slate-400">Tus pedidos apareceran aqui cuando realices una compra.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {pedidos.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-5 sm:p-6">
                {/* Encabezado del pedido */}
                <div className="flex flex-wrap justify-between items-start mb-5 gap-3">
                  <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Pedido #{p.id.slice(0, 8)}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{new Date(p.fecha_pedido).toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    p.estado === 'ENTREGADO' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {p.estado}
                  </span>
                </div>

                {/* Linea de tiempo */}
                <div className="flex items-center justify-between relative mb-6 px-2 sm:px-4">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
                  {[
                    { id: 'PENDIENTE', label: 'Pendiente', icon: Clock },
                    { id: 'CONFIRMADO', label: 'Confirmado', icon: CheckCircle2 },
                    { id: 'EN_CAMINO', label: 'En camino', icon: Truck },
                    { id: 'ENTREGADO', label: 'Entregado', icon: ShieldCheck }
                  ].map((step, idx) => {
                    const status = getStepStatus(p.estado, step.id);
                    const Icon = step.icon;
                    return (
                      <div key={idx} className="relative z-10 flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center border-4 transition-colors ${
                          status === 'completed' ? 'bg-emerald-600 border-emerald-100 text-white' : 'bg-white border-slate-100 text-slate-300'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-bold mt-1.5 hidden sm:block ${status === 'completed' ? 'text-emerald-600' : 'text-slate-300'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Productos del pedido */}
                <div className="space-y-2.5">
                  {p.items.map((item, i) => {
                    const esPreventa = item.es_preventa;
                    const fechaDisponible = item.fecha_disponibilidad ? new Date(item.fecha_disponibilidad) : null;
                    const yaDisponible = fechaDisponible && new Date() >= fechaDisponible;
                    const mostrarPagarSaldo = esPreventa && yaDisponible && p.estado !== 'ENTREGADO';

                    return (
                      <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                        <div className="w-11 h-11 bg-white rounded-lg overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center">
                          {item.foto_url ? (
                            <img src={`http://localhost:5000${item.foto_url}`} className="w-full h-full object-cover" alt={item.nombre_producto} />
                          ) : (
                            <Package className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-slate-800 truncate">{item.nombre_producto}</p>
                            {esPreventa && (
                              <span className="text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-bold shrink-0">Preventa</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{item.cantidad} unidades x Bs. {item.precio_unitario}</p>
                        </div>
                        {mostrarPagarSaldo && (
                          <div className="shrink-0 flex flex-col items-end gap-1">
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Ya disponible
                            </span>
                            <button className="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg shadow-sm transition-colors flex items-center gap-1">
                              <CreditCard className="w-3 h-3" /> Pagar saldo
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisPedidosPage;
