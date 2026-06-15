import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import { MapPin, Truck, CheckCircle, Navigation, X, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup } from 'react-leaflet';
import L from 'leaflet';

const HojaDeRutaPage = () => {
    const [pedido, setPedido] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [cargaRecogida, setCargaRecogida] = useState(false);
    const sigPad = useRef(null);
    const navigate = useNavigate();

    const [transportistaPos, setTransportistaPos] = useState(null);

    useEffect(() => {
        const watchId = navigator.geolocation.watchPosition(
            (pos) => setTransportistaPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => console.error(err),
            { enableHighAccuracy: true, maximumAge: 5000 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

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
                
                if (res.data.error) {
                     setPedido(null);
                } else {
                     setPedido(res.data.ruta || res.data);
                }
            } catch (error) {
                console.error("Error al obtener ruta actual:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRutaActual();
    }, []);

    const handleClear = () => sigPad.current.clear();

    const handleNotificarCamino = async () => {
        console.log("Objeto pedido actual:", pedido);
        
        const idPedido = pedido?.pedido_id || pedido?.id || pedido?._id;
        
        if (!idPedido) {
            console.error("Error crítico: El ID del pedido es undefined. Revisa la estructura del objeto pedido arriba.");
            toast.error("Error interno: No se pudo identificar el pedido.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/pedidos/${idPedido}/notificar-camino`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCargaRecogida(true);
            toast.success("Notificación enviada al comprador: El transportista va en camino", {
                icon: '🚚',
                style: { background: '#10b981', color: '#fff', fontWeight: 'bold' }
            });
        } catch (error) {
            console.error("Error al notificar camino:", error);
            toast.error("Error al enviar notificación.");
        }
    };

    const handleEntregar = async () => {
        if (sigPad.current.isEmpty()) {
            return toast.error("El comprador debe firmar para confirmar la entrega.");
        }

        const idPedido = pedido?.pedido_id || pedido?.id || pedido?._id;
        if (!idPedido) {
            console.error("Error crítico: El ID del pedido es undefined en handleEntregar.");
            return toast.error("Error interno: No se pudo identificar el pedido para la entrega.");
        }

        try {
            const token = localStorage.getItem('token');
            const canvas = sigPad.current.getTrimmedCanvas();

            canvas.toBlob(async (blob) => {
                const formData = new FormData();
                formData.append('firma', blob, `firma_${idPedido}.png`);

                await axios.put(`http://localhost:5000/api/pedidos/${idPedido}/entregar`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });

                toast.success("Pedido entregado con exito.");
                setShowSignatureModal(false);
                navigate('/dashboard/transportista');
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
                onClick={() => navigate('/dashboard/transportista')}
                className="mt-6 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
            >
                Ir a Bolsa de Carga
            </button>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                <div className="relative w-full h-80 sm:h-96 bg-slate-100 z-0">
                    {(pedido?.latitud && pedido?.longitud) ? (
                        <MapContainer
                            center={transportistaPos || { lat: pedido.latitud, lng: pedido.longitud }}
                            zoom={14}
                            scrollWheelZoom={false}
                            className="w-full h-full"
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {transportistaPos && (
                                <LeafletMarker position={transportistaPos}>
                                    <Popup>Tu ubicación (Transportista)</Popup>
                                </LeafletMarker>
                            )}
                            <LeafletMarker position={{ lat: pedido.latitud, lng: pedido.longitud }}>
                                <Popup>Finca (Origen)</Popup>
                            </LeafletMarker>
                            {pedido?.destino_coords && (
                                <LeafletMarker position={pedido.destino_coords}>
                                    <Popup>Cliente (Destino)</Popup>
                                </LeafletMarker>
                            )}
                        </MapContainer>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-200 text-center px-4">
                            <MapPin className="w-12 h-12 text-slate-400 mb-3" />
                            <p className="text-slate-600 font-bold text-lg">No se encontraron coordenadas para esta ruta</p>
                            <p className="text-slate-400 text-sm mt-1">El GPS no está disponible para el punto de origen o destino.</p>
                        </div>
                    )}

                    {/* Card Flotante Estilo PedidosYa */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-xl p-4 z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-black text-sm">
                          {userData?.nombre_completo?.charAt(0) || 'T'}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">{userData?.nombre_completo || 'Transportista'}</p>
                          <p className="text-xs text-emerald-600 font-bold">
                            {!cargaRecogida ? '🚛 Dirigiéndose a la finca' : '📦 En camino al destino'}
                          </p>
                        </div>
                      </div>
                      {/* Barra de progreso */}
                      <div className="flex items-center gap-2">
                        {['Finca', 'En camino', 'Entregado'].map((step, i) => (
                          <React.Fragment key={step}>
                            <div className={`flex-1 h-1.5 rounded-full ${
                              i === 0 ? 'bg-emerald-500' : 
                              i === 1 && cargaRecogida ? 'bg-emerald-500' : 'bg-slate-200'
                            }`} />
                            {i < 2 && <div className="w-1" />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                </div>

                {/* Timeline Stepper */}
                <div className="p-6 sm:p-8">
                    <div className="relative border-l-4 border-slate-100 ml-5 space-y-12 pb-4">
                        
                        {/* Paso 1: Finca */}
                        <div className="relative">
                            <div className="absolute -left-[26px] top-1 w-12 h-12 bg-emerald-100 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10">
                                <MapPin className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="pl-10">
                                <span className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1 block">Paso 1</span>
                                <h3 className="text-xl font-black text-slate-800">Recojo en Finca</h3>
                                <div className="mt-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <p className="font-black text-lg text-slate-900">{pedido?.finca_nombre || 'Desconocido'}</p>
                                    <p className="text-sm font-bold text-slate-500 mt-1">{pedido?.municipio}, {pedido?.provincia}</p>
                                    <div className="mt-4 pt-4 border-t border-slate-200">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Carga</p>
                                        <div className="space-y-2">
                                            {pedido?.carga_detalle?.map((desc, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm font-bold text-slate-700">
                                                    <span className="text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg w-full">{desc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${pedido?.latitud},${pedido?.longitud}`, '_blank')}
                                        className="mt-5 w-full bg-slate-900 text-white px-4 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Navigation className="w-4 h-4" /> Abrir en Google Maps / Waze
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Paso 2: Transito */}
                        <div className="relative">
                            <div className={`absolute -left-[26px] top-1 w-12 h-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 transition-colors ${cargaRecogida ? 'bg-emerald-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                                <Truck className="w-5 h-5" />
                            </div>
                            <div className="pl-10">
                                <span className={`text-xs font-black uppercase tracking-widest mb-1 block ${cargaRecogida ? 'text-emerald-600' : 'text-blue-600'}`}>Paso 2</span>
                                <h3 className="text-xl font-black text-slate-800">Transporte</h3>
                                <div className="mt-4">
                                    {!cargaRecogida ? (
                                        <button
                                            onClick={handleNotificarCamino}
                                            className="w-full bg-blue-600 text-white px-4 py-4 rounded-xl font-black text-base hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                                        >
                                            <Truck className="w-5 h-5" /> Ya recogí la carga (Notificar al comprador)
                                        </button>
                                    ) : (
                                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3">
                                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                                            <div>
                                                <p className="font-bold text-emerald-800">Notificación enviada</p>
                                                <p className="text-sm text-emerald-600">El comprador sabe que vas en camino.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Paso 3: Entrega */}
                        <div className="relative">
                            <div className={`absolute -left-[26px] top-1 w-12 h-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 transition-colors ${cargaRecogida ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <div className={`pl-10 transition-opacity ${cargaRecogida ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">Paso 3</span>
                                <h3 className="text-xl font-black text-slate-800">Llegada y Entrega</h3>
                                <div className="mt-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <p className="font-black text-lg text-slate-900">{pedido?.comprador_nombre}</p>
                                    <p className="text-sm font-bold text-slate-500 mt-1">{pedido?.ciudad_principal}</p>
                                    <p className="text-sm font-medium text-amber-800 mt-3 bg-amber-100 p-3 rounded-lg border border-amber-200 italic">
                                        "{pedido?.notas || 'Sin notas adicionales'}"
                                    </p>
                                    
                                    <div className="mt-5 pt-5 border-t border-slate-200">
                                        <button
                                            onClick={() => setShowSignatureModal(true)}
                                            className="w-full bg-emerald-600 text-white px-4 py-4 rounded-xl font-black text-base hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-5 h-5" /> Recolectar Firma y Completar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* MODAL DE FIRMA DIGITAL */}
            {showSignatureModal && (
                <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-black text-slate-900">Firma de Recepción</h2>
                            <button onClick={() => setShowSignatureModal(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="bg-blue-50 text-blue-800 p-4 rounded-2xl text-sm font-medium flex gap-3 border border-blue-100">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p>Por favor, pida al comprador <b>{pedido?.comprador_nombre}</b> que firme en el recuadro inferior para confirmar que ha recibido los productos en buen estado.</p>
                            </div>
                            <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-white overflow-hidden shadow-inner">
                                <SignatureCanvas
                                    ref={sigPad}
                                    penColor='#0f172a'
                                    canvasProps={{ width: 500, height: 220, className: 'sigCanvas w-full cursor-crosshair' }}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={handleClear} className="w-1/3 bg-slate-100 text-slate-600 py-3.5 rounded-xl font-bold hover:bg-slate-200 transition-colors">Limpiar</button>
                                <button onClick={handleEntregar} className="w-2/3 bg-emerald-600 text-white py-3.5 rounded-xl font-black hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">Completar Entrega</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HojaDeRutaPage;
