import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Search, Calendar, MapPin, Eye, ArrowLeft, RefreshCw, ShoppingBag } from 'lucide-react';
import PageShell from '../components/ui/PageShell';
import { useToast } from '../context/ToastContext';

const AdminPedidosPage = () => {
  const toast = useToast();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Fetching all orders globally (simulated or real admin route)
      const res = await axios.get('http://localhost:5000/api/pedidos/comprador', {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => ({ data: [] }));
      
      setPedidos(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Error al obtener pedidos globales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const getStatusBadge = (estado) => {
    const states = {
      PENDIENTE: 'bg-amber-50 text-amber-700 border-amber-200',
      CONFIRMADO: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      EN_CAMINO: 'bg-blue-50 text-blue-700 border-blue-200',
      ENTREGADO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      RECHAZADO: 'bg-rose-50 text-rose-700 border-rose-200',
      CANCELADO: 'bg-slate-100 text-slate-600 border-slate-200'
    };
    return (
      <span className={`badge uppercase text-[10px] font-black border ${states[estado] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
        {estado}
      </span>
    );
  };

  const filtered = pedidos.filter(p => 
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.nombre_finca && p.nombre_finca.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <PageShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-bold">
            📦 Pedidos Globales
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Monitoreo de Pedidos</h1>
          <p className="text-sm text-slate-400 mt-1">Supervisá todas las órdenes activas y finalizadas en AgroDirecto</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por ID o productor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-56"
            />
          </div>
          <button
            onClick={fetchPedidos}
            className="p-2 border border-slate-200 bg-white text-slate-500 rounded-xl hover:text-blue-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-[3px] border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-400 font-bold">Cargando transacciones...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/60 py-16 flex flex-col items-center justify-center text-center px-6 shadow-sm max-w-lg mx-auto">
          <ShoppingBag className="w-10 h-10 text-slate-300 mb-4" />
          <h3 className="text-base font-extrabold text-slate-800">No se encontraron pedidos</h3>
          <p className="text-xs text-slate-400 mt-2 font-semibold">
            Actualmente no hay pedidos registrados o que coincidan con la búsqueda.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] text-slate-400 uppercase font-black tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">ID Pedido</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Finca Productora</th>
                  <th className="px-6 py-4">Monto total</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-indigo-600 font-black">#{p.id.substring(0, 8).toUpperCase()}</td>
                    <td className="px-6 py-4 font-bold text-slate-500">
                      {new Date(p.fecha_pedido).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">{p.nombre_finca || 'Productor AgroDirecto'}</td>
                    <td className="px-6 py-4 text-slate-900 font-black">Bs. {Number(p.monto_total || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">{getStatusBadge(p.estado)}</td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 border transition-all inline-flex items-center gap-1 text-[10px] font-black uppercase">
                        <Eye className="w-3.5 h-3.5" /> Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default AdminPedidosPage;
