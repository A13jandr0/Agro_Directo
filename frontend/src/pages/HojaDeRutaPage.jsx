import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import { MapPin, Truck, CheckCircle, Navigation, X, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const HojaDeRutaPage = () => {
    const [pedido, setPedido] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const sigPad = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRutaActual = async () => {
            try {
                const token = localStorage.getItem('token');
                const user = JSON.parse(localStorage.getItem('user'));
                setUserData(user);

                if (user.estado !== 'VERIFICADO') {
                    setLoading(false);
                    return;
                }

                const res = await axios.get('http://localhost:5000/api/pedidos/transportista/actual', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPedido(res.data);
            } catch (error) {
                console.error("Error al obtener ruta actual:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRutaActual();
    }, []);

    const handleClear = () => sigPad.current.clear();

    const handleEntregar = async () => {
        if (sigPad.current.isEmpty()) {
            return toast.error("El comprador debe firmar para confirmar la entrega.");
        }

        try {
            const token = localStorage.getItem('token');
            const canvas = sigPad.current.getTrimmedCanvas();

            canvas.toBlob(async (blob) => {
                const formData = new FormData();
                formData.append('firma', blob, `firma_${pedido.id}.png`);

                await axios.put(`http://localhost:5000/api/pedidos/${pedido.id}/entregar`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });

                toast.success("Pedido entregado con exito.");
                setShowSignatureModal(false);
                navigate('/dashboard/historial');
            }, 'image/png');

        } catch (error) {
            console.error("Error al entregar pedido:", error);
            toast.error("Error al procesar la entrega.");
        }
    };

    if (loading) return (
        <div className="p-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-[3px] border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="text-base text-emerald-600 font-bold">Cargando hoja de ruta...</p>
            </div>
        </div>
    );

    if (userData?.estado !== 'VERIFICADO') {
        return (
            <div className="p-6 sm:p-10">
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 max-w-2xl mx-auto text-center">
                    <AlertCircle className="mx-auto text-amber-500 w-14 h-14 mb-4" />
                    <h2 className="text-2xl font-black text-amber-900 mb-2">Cuenta pendiente de verificacion</h2>
                    <p className="text-amber-700 font-medium text-lg">Debes ser verificado por un administrador para gestionar rutas y entregas.</p>
                </div>
            </div>
        );
    }

    if (!pedido) return (
        <div className="p-6 sm:p-10 text-center">
            <Truck className="mx-auto text-slate-300 w-16 h-16 mb-4" />
            <h2 className="text-2xl font-black text-slate-800 mb-1">No tienes pedidos en camino</h2>
            <p className="text-slate-500 text-base">Ve a la Bolsa de Carga para aceptar una nueva ruta.</p>
            <button
                onClick={() => navigate('/dashboard/transportista/bolsa')}
                className="mt-6 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
            >
                Ir a Bolsa de Carga
            </button>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                {/* Encabezado */}
                <div className="bg-emerald-600 p-5 sm:p-6 text-white flex flex-wrap justify-between items-center gap-3">
                    <div>
                        <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Pedido en transito</p>
                        <h1 className="text-xl sm:text-2xl font-black mt-0.5">#{pedido.id.substring(0, 8)}</h1>
                    </div>
                    <div className="bg-white/20 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                        <Navigation className="w-4 h-4" /> En camino
                    </div>
                </div>

                <div className="p-5 sm:p-7 space-y-6">
                    {/* INFORMACION LOGISTICA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-3">
                            <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-emerald-600 shrink-0" /> Punto de origen (Finca)
                            </h3>
                            <div className="bg-slate-100 p-5 rounded-xl border-2 border-slate-200">
                                <p className="font-black text-xl text-slate-900">{pedido.nombre_finca}</p>
                                <p className="text-base font-bold text-slate-600 mt-1">{pedido.municipio}, {pedido.provincia}</p>
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${pedido.latitud},${pedido.longitud}`}
                                    target="_blank" rel="noreferrer"
                                    className="inline-flex items-center gap-2 text-emerald-700 text-sm font-bold mt-3 hover:underline bg-emerald-100 px-3 py-1.5 rounded-lg"
                                >
                                    <Navigation className="w-4 h-4" /> Abrir navegacion
                                </a>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> Punto de entrega
                            </h3>
                            <div className="bg-slate-100 p-5 rounded-xl border-2 border-slate-200">
                                <p className="font-black text-xl text-slate-900">{pedido.comprador_nombre}</p>
                                <p className="text-base font-bold text-slate-600 mt-1">{pedido.ciudad_principal}</p>
                                <p className="text-sm font-medium text-amber-800 mt-3 bg-amber-100 p-2.5 rounded-lg border border-amber-200">
                                    "{pedido.notas || 'Sin notas adicionales'}"
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* DETALLE DE CARGA */}
                    <div className="border-t border-slate-200 pt-5">
                        <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest mb-3">Carga a transportar</h3>
                        <div className="space-y-2.5">
                            {pedido.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white p-3.5 rounded-xl border-2 border-slate-100">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                                            <Truck size={18} />
                                        </div>
                                        <span className="font-bold text-slate-800 truncate">{item.nombre_producto}</span>
                                    </div>
                                    <span className="font-black text-emerald-600 shrink-0 ml-2">{item.cantidad} {item.unidad_medida}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ACCIONES */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${pedido.latitud},${pedido.longitud}&destination=${pedido.ciudad_principal}`, '_blank')}
                            className="flex-1 bg-white border-2 border-emerald-600 text-emerald-700 px-6 py-4 rounded-xl font-black text-base transition-all hover:bg-emerald-50 flex items-center justify-center gap-2"
                        >
                            <Navigation className="w-5 h-5" /> Ver ruta completa
                        </button>
                        <button
                            onClick={() => setShowSignatureModal(true)}
                            className="flex-1 bg-emerald-600 text-white px-6 py-4 rounded-xl font-black text-base transition-all hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="w-5 h-5" /> Confirmar entrega
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL DE FIRMA DIGITAL */}
            {showSignatureModal && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
                            <h2 className="text-lg font-black text-slate-900">Firma del comprador</h2>
                            <button onClick={() => setShowSignatureModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <p className="text-sm text-slate-500">Pida al comprador que firme en el recuadro para finalizar la entrega.</p>
                            <div className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                                <SignatureCanvas
                                    ref={sigPad}
                                    penColor='#1e293b'
                                    canvasProps={{ width: 500, height: 200, className: 'sigCanvas w-full' }}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={handleClear} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">Limpiar</button>
                                <button onClick={handleEntregar} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-md">Guardar y finalizar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HojaDeRutaPage;
