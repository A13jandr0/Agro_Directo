import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, MapPin, Package, Navigation, ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import PollingIndicator from '../components/PollingIndicator';
import { usePolling } from '../hooks/usePolling';

const BolsaCargaPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  const parsearDestino = (destino) => {
    if (!destino) return 'Sin dirección';
    try {
      const obj = JSON.parse(destino);
      if (obj.lat && obj.lng) return `Lat: ${obj.lat.toFixed(4)}, Lng: ${obj.lng.toFixed(4)}`;
      return destino;
    } catch {
      return destino; // ya es string normal
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserData(user);
  }, []);

  const fetchBolsa = async () => {
    if (userData?.estado !== 'VERIFICADO') {
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/pedidos/bolsa', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(res.data);
    } catch (error) {
      console.error('Error al cargar bolsa de carga:', error);
    } finally {
      setLoading(false);
    }
  };

  const { segundosDesdeUpdate } = usePolling(fetchBolsa, 30000, [userData?.estado]);

  const handleAceptarRuta = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/pedidos/${id}/aceptar-ruta`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Carga aceptada. Recog\xE9 la carga en la finca indicada.");
      navigate('/dashboard/transportista/hoja-de-ruta');
    } catch (error) {
      console.error('Error al aceptar ruta:', error);
      toast.error(error.response?.data?.error || 'Error al aceptar la ruta.');
    }
  };

  if (loading) return (
    <div className="p-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-[3px] border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="text-base text-emerald-600 font-bold">Buscando rutas disponibles...</p>
            </div>
        </div>);


  if (userData?.estado !== 'VERIFICADO') {
    return (
      <div className="p-6 sm:p-10">
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 max-w-2xl mx-auto text-center">
                    <AlertCircle className="mx-auto text-amber-500 w-14 h-14 mb-4" />
                    <h2 className="text-2xl font-black text-amber-900 mb-2">Acceso restringido</h2>
                    <p className="text-amber-700 font-medium text-lg">Debes completar tu verificacion para acceder a la Bolsa de Carga.</p>
                </div>
            </div>);

  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* ENCABEZADO */}
            <div className="flex justify-end mb-2">
                <PollingIndicator segundosDesdeUpdate={segundosDesdeUpdate} />
            </div>
            <div className="relative overflow-hidden bg-gradient-to-r from-[#f59e0b] to-[#d97706] rounded-2xl p-6 sm:p-8 text-white shadow-xl">
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                    <h1 className="text-2xl sm:text-3xl font-black mb-2 flex items-center gap-3">
                        <Truck className="text-emerald-300 shrink-0" size={32} /> Bolsa de Carga
                    </h1>
                    <p className="text-emerald-100/70 font-medium text-base max-w-xl">
                        Pedidos confirmados listos para ser transportados. Acepta una ruta y comienza a ganar.
                    </p>
                </div>
            </div>

            {/* LISTADO */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {pedidos.length === 0 ?
        <div className="lg:col-span-2 py-16 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                        <Package className="mx-auto text-slate-200 w-16 h-16 mb-4" />
                        <h3 className="text-xl font-black text-slate-500">No hay cargas disponibles</h3>
                        <p className="text-slate-400 text-base mt-1">Vuelve mas tarde o revisa otras zonas.</p>
                    </div> :

        pedidos.map((p) =>
        <div key={p.id} className="bg-white rounded-2xl shadow-sm border-2 border-slate-200 overflow-hidden hover:shadow-lg transition-all group border-l-8 border-l-emerald-500">
                            <div className="p-5 sm:p-6">
                                <div className="flex justify-between items-start mb-5 gap-3">
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Pedido #{p.id.substring(0, 8)}</p>
                                        <h2 className="text-xl sm:text-2xl font-black text-slate-900">{p.comprador}</h2>
                                    </div>
                                    <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-lg text-xs font-bold uppercase border border-amber-200 shrink-0">
                                        Listo para envío
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors shrink-0">
                                            <MapPin size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Origen (recogida)</p>
                                            <p className="font-black text-lg text-slate-900 truncate">{p.origen}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors shrink-0">
                                            <Navigation size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Destino (entrega)</p>
                                            <p className="font-black text-lg text-slate-900 truncate">{parsearDestino(p.destino)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl mb-5 border border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <Package className="text-slate-400 shrink-0" size={18} />
                                        <span className="text-sm font-bold text-slate-600">{p.total_items} productos</span>
                                    </div>
                                    <ArrowRight className="text-slate-300" />
                                </div>

                                <button
              onClick={() => handleAceptarRuta(p.id)}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-base uppercase tracking-wider shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
              
                                    <Truck size={20} /> Aceptar ruta
                                </button>
                            </div>
                        </div>
        )
        }
            </div>
        </div>);

};

export default BolsaCargaPage;