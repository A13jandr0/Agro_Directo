import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Clock, CheckCircle2, Truck, ShieldCheck, MapPin } from 'lucide-react';

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
        console.error('Error fetching orders:', error);
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

  if (loading) return <div className="p-12 text-center text-gray-500">Cargando tus pedidos...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-slate-900">Mis Compras</h1>
      
      {pedidos.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
          Aún no has realizado ninguna compra.
        </div>
      ) : (
        <div className="space-y-6">
          {pedidos.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Pedido #{p.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500">{new Date(p.fecha_pedido).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    p.estado === 'ENTREGADO' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {p.estado}
                  </span>
                </div>

                {/* Timeline (US14) */}
                <div className="flex items-center justify-between relative mb-8 px-4">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
                  {[
                    { id: 'PENDIENTE', label: 'Pendiente', icon: Clock },
                    { id: 'CONFIRMADO', label: 'Confirmado', icon: CheckCircle2 },
                    { id: 'EN_CAMINO', label: 'En Camino', icon: Truck },
                    { id: 'ENTREGADO', label: 'Entregado', icon: ShieldCheck }
                  ].map((step, idx) => {
                    const status = getStepStatus(p.estado, step.id);
                    const Icon = step.icon;
                    return (
                      <div key={idx} className="relative z-10 flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                          status === 'completed' ? 'bg-blue-600 border-blue-100 text-white' : 'bg-white border-gray-50 text-gray-300'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-bold mt-2 ${status === 'completed' ? 'text-blue-600' : 'text-gray-300'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Productos */}
                <div className="space-y-4">
                  {p.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl">
                      <div className="w-12 h-12 bg-white rounded-lg overflow-hidden shrink-0 border border-gray-100">
                        {item.foto_url && <img src={`http://localhost:5000${item.foto_url}`} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">{item.nombre_producto}</p>
                        <p className="text-xs text-gray-500">{item.cantidad} unidades x Bs. {item.precio_unitario}</p>
                      </div>
                    </div>
                  ))}
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
