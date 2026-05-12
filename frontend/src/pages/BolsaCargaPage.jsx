import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, MapPin, Package, Navigation, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const BolsaCargaPage = () => {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setUserData(user);
        if (user.estado === 'VERIFICADO') {
            fetchBolsa();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchBolsa = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/pedidos/bolsa', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPedidos(res.data);
        } catch (error) {
            console.error("Error al cargar bolsa de carga:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAceptarRuta = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/pedidos/${id}/aceptar-ruta`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("¡Ruta aceptada! Dirígete a la finca para recoger la carga.");
            navigate('/dashboard/transportista/hoja-de-ruta');
        } catch (error) {
            console.error("Error al aceptar ruta:", error);
            toast.error("Error al aceptar la ruta.");
        }
    };

    if (loading) return <div className="p-10 text-center text-emerald-600 font-bold">Buscando rutas disponibles...</div>;

    if (userData?.estado !== 'VERIFICADO') {
        return (
            <div className="p-20 text-center">
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-10 max-w-2xl mx-auto">
                    <AlertCircle className="mx-auto text-amber-500 w-16 h-16 mb-4" />
                    <h2 className="text-2xl font-black text-amber-900 mb-2">Acceso Restringido</h2>
                    <p className="text-amber-700 font-medium">Debes completar tu verificación para acceder a la Bolsa de Carga.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
            <div className="relative overflow-hidden bg-emerald-900 rounded-3xl p-10 text-white shadow-2xl">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black mb-3 tracking-tight flex items-center gap-4">
                        <Truck className="text-emerald-400" size={40} /> Bolsa de Carga
                    </h1>
                    <p className="text-emerald-100/70 font-medium max-w-xl text-lg">
                        Encuentra pedidos confirmados listos para ser transportados. Acepta una ruta y comienza a ganar.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {pedidos.length === 0 ? (
                    <div className="lg:col-span-2 py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                        <Package className="mx-auto text-slate-200 w-20 h-20 mb-4" />
                        <h3 className="text-xl font-bold text-slate-400">No hay cargas disponibles en este momento</h3>
                        <p className="text-slate-400">Vuelve más tarde o revisa otras zonas.</p>
                    </div>
                ) : (
                    pedidos.map((p) => (
                        <div key={p.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all group border-l-8 border-l-emerald-500">
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ID Pedido: #{p.id.substring(0, 8)}</p>
                                        <h2 className="text-xl font-black text-slate-800">{p.comprador}</h2>
                                    </div>
                                    <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-tighter border border-emerald-100">
                                        Confirmado
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Origen (Recogida)</p>
                                            <p className="font-bold text-slate-700">{p.origen}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <Navigation size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Destino (Entrega)</p>
                                            <p className="font-bold text-slate-700">{p.destino}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl mb-8">
                                    <div className="flex items-center gap-3">
                                        <Package className="text-slate-400" size={18} />
                                        <span className="text-sm font-bold text-slate-600">{p.total_items} productos diferentes</span>
                                    </div>
                                    <ArrowRight className="text-slate-300" />
                                </div>

                                <button 
                                    onClick={() => handleAceptarRuta(p.id)}
                                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
                                >
                                    <Truck size={18} /> Aceptar Ruta y Cargar
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BolsaCargaPage;
