import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import { MapPin, Truck, CheckCircle, Navigation, X, CreditCard } from 'lucide-react';
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
            return toast.error("Por favor, el comprador debe firmar para confirmar la entrega.");
        }

        try {
            const token = localStorage.getItem('token');
            const canvas = sigPad.current.getTrimmedCanvas();
            
            // Convertir canvas a Blob para enviar vía Multer
            canvas.toBlob(async (blob) => {
                const formData = new FormData();
                formData.append('firma', blob, `firma_${pedido.id}.png`);

                await axios.put(`http://localhost:5000/api/pedidos/${pedido.id}/entregar`, formData, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });

                toast.success("¡Pedido entregado con éxito!");
                setShowSignatureModal(false);
                navigate('/dashboard/historial');
            }, 'image/png');

        } catch (error) {
            console.error("Error al entregar pedido:", error);
            toast.error("Error al procesar la entrega.");
        }
    };

    if (loading) return <div className="p-10 text-center text-emerald-600 font-bold">Cargando Hoja de Ruta...</div>;

    if (userData?.estado !== 'VERIFICADO') {
        return (
            <div className="p-20 text-center">
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-10 max-w-2xl mx-auto">
                    <AlertCircle className="mx-auto text-amber-500 w-16 h-16 mb-4" />
                    <h2 className="text-2xl font-black text-amber-900 mb-2">Cuenta Pendiente de Verificación</h2>
                    <p className="text-amber-700 font-medium">Debes ser verificado por un administrador para poder gestionar rutas y entregas.</p>
                </div>
            </div>
        );
    }

    if (!pedido) return (
        <div className="p-20 text-center">
            <Truck className="mx-auto text-gray-300 w-20 h-20 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">No tienes pedidos en camino</h2>
            <p className="text-gray-500">Ve a la Bolsa de Carga para aceptar una nueva ruta.</p>
            <button 
                onClick={() => navigate('/dashboard/transportista/bolsa')}
                className="mt-6 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700"
            >
                Ir a Bolsa de Carga
            </button>
        </div>
    );

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-emerald-600 p-6 text-white flex justify-between items-center">
                    <div>
                        <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Pedido en Tránsito</p>
                        <h1 className="text-2xl font-black">#{pedido.id.substring(0, 8)}</h1>
                    </div>
                    <div className="bg-white/20 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                        <Navigation className="w-4 h-4" /> En Camino
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* INFO LOGÍSTICA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> Punto de Origen (Finca)
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="font-bold text-gray-800">{pedido.nombre_finca}</p>
                                <p className="text-sm text-gray-500">{pedido.municipio}, {pedido.provincia}</p>
                                <a 
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${pedido.latitud},${pedido.longitud}`} 
                                    target="_blank" rel="noreferrer"
                                    className="inline-flex items-center gap-2 text-emerald-600 text-sm font-bold mt-3 hover:underline"
                                >
                                    Abrir Navegación a Finca
                                </a>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Punto de Entrega
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="font-bold text-gray-800">{pedido.comprador_nombre}</p>
                                <p className="text-sm text-gray-500">{pedido.ciudad_principal}</p>
                                <p className="text-xs text-gray-400 mt-1 italic">"{pedido.notas || 'Sin notas adicionales'}"</p>
                            </div>
                        </div>
                    </div>

                    {/* DETALLE DE CARGA */}
                    <div className="border-t pt-8">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Carga a Transportar</h3>
                        <div className="space-y-3">
                            {pedido.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                                            <Truck size={20} />
                                        </div>
                                        <span className="font-bold text-gray-700">{item.nombre_producto}</span>
                                    </div>
                                    <span className="font-black text-emerald-600">{item.cantidad} {item.unidad_medida}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ACCIONES */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <button 
                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${pedido.latitud},${pedido.longitud}&destination=${pedido.ciudad_principal}`, '_blank')}
                            className="flex-1 bg-white border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-2xl font-black transition-all hover:bg-emerald-50 flex items-center justify-center gap-3"
                        >
                            <Navigation className="w-5 h-5" /> Ver Ruta Completa
                        </button>
                        <button 
                            onClick={() => setShowSignatureModal(true)}
                            className="flex-1 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black transition-all hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-3"
                        >
                            <CheckCircle className="w-5 h-5" /> Confirmar Entrega
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL DE FIRMA DIGITAL */}
            {showSignatureModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-xl font-black text-gray-800">Firma del Comprador</h2>
                            <button onClick={() => setShowSignatureModal(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-500 mb-4">Por favor, pida al comprador que firme en el recuadro inferior para finalizar la entrega.</p>
                            <div className="border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 overflow-hidden">
                                <SignatureCanvas 
                                    ref={sigPad}
                                    penColor='#1e293b'
                                    canvasProps={{ width: 500, height: 200, className: 'sigCanvas w-full' }} 
                                />
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button onClick={handleClear} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200">Limpiar</button>
                                <button onClick={handleEntregar} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700">Guardar y Finalizar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HojaDeRutaPage;
