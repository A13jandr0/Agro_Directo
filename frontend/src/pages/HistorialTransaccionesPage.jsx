import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Download, Search, Filter } from 'lucide-react';

const HistorialTransaccionesPage = () => {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const userData = JSON.parse(localStorage.getItem('user'));
                setUser(userData);

                if (userData.rol !== 'COMPRADOR' && userData.estado !== 'VERIFICADO') {
                    setLoading(false);
                    return;
                }

                const res = await axios.get('http://localhost:5000/api/historial', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistorial(res.data);
            } catch (error) {
                console.error("Error al cargar historial:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getRoleColumns = () => {
        if (!user) return [];
        switch (user.rol) {
            case 'PRODUCTOR': return ['ID Pedido', 'Vendido a', 'Fecha', 'Monto Recibido'];
            case 'COMPRADOR': return ['ID Pedido', 'Comprado a', 'Fecha', 'Monto Pagado'];
            case 'TRANSPORTISTA': return ['ID Pedido', 'Ruta (De/A)', 'Fecha Entrega', 'Monto Carga'];
            default: return ['ID Pedido', 'Detalle', 'Fecha', 'Monto'];
        }
    };

    if (loading) return <div className="p-10 text-center text-emerald-600 font-bold">Cargando Historial...</div>;

    if (user?.rol !== 'COMPRADOR' && user?.estado !== 'VERIFICADO') {
        return (
            <div className="p-20 text-center">
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-10 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-black text-amber-900 mb-2">Acceso Denegado</h2>
                    <p className="text-amber-700 font-medium">Debes estar verificado para acceder al historial de transacciones.</p>
                </div>
            </div>
        );
    }

    const columns = getRoleColumns();

    return (
        <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Clock className="text-emerald-600" /> Historial de Transacciones
                    </h1>
                    <p className="text-slate-500 font-medium">Registro detallado de tus operaciones finalizadas en AgroDirecto.</p>
                </div>
                <button className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-all">
                    <Download size={18} /> Exportar PDF
                </button>
            </div>

            {/* BUSCADOR Y FILTROS */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar por ID, nombre o fecha..." 
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                </div>
                <button className="bg-white border border-slate-200 p-3 rounded-2xl text-slate-500 hover:bg-slate-50">
                    <Filter size={20} />
                </button>
            </div>

            {/* TABLA DE RESULTADOS */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-slate-400 text-[11px] uppercase font-black tracking-widest border-b border-slate-100">
                                {columns.map((col, idx) => (
                                    <th key={idx} className="px-8 py-5">{col}</th>
                                ))}
                                <th className="px-8 py-5 text-right">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {historial.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5 font-mono text-xs text-slate-400">
                                        #{item.id.substring(0, 8)}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="font-bold text-slate-800">
                                            {user.rol === 'PRODUCTOR' ? item.comprador : 
                                             user.rol === 'COMPRADOR' ? item.productor : 
                                             `${item.productor} → ${item.comprador}`}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-sm text-slate-500 font-medium">
                                        {new Date(item.fecha_pedido).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="font-black text-slate-900">
                                            Bs. {(item.monto_total || item.monto_carga).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-emerald-100">
                                            {item.estado}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {historial.length === 0 && (
                    <div className="py-20 text-center">
                        <Clock className="mx-auto text-slate-200 w-16 h-16 mb-4" />
                        <p className="text-slate-400 font-bold">No se encontraron transacciones finalizadas.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistorialTransaccionesPage;
