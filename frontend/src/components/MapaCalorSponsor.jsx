import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Map as MapIcon, Home, ShoppingCart, Info } from 'lucide-react';
import L from 'leaflet';

// Corregir iconos de Leaflet por defecto en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapaCalorSponsor = () => {
    const [mapData, setMapData] = useState({ origen: [], destino: [] });
    const [loading, setLoading] = useState(true);

    // Centro de Santa Cruz, Bolivia
    const center = [-17.7833, -63.1821];

    useEffect(() => {
        const fetchMapData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/bi/admin/heatmap', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (response.ok) {
                    setMapData(result);
                }
            } catch (error) {
                console.error("Error al cargar datos del mapa:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMapData();
    }, []);

    if (loading) return <div className="h-[600px] flex items-center justify-center">Cargando Mapa Estratégico...</div>;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <MapIcon className="text-blue-600" /> Mapa de Flujo Comercial AgroDirecto
                    </h2>
                    <p className="text-gray-500 text-sm">Visualización de origen de producción vs. demanda en ciudades</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-xs">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Producción (Fincas)
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="w-3 h-3 rounded-full bg-orange-500"></span> Demanda (Ciudades)
                    </div>
                </div>
            </div>

            <div className="h-[600px] rounded-xl overflow-hidden border border-gray-200">
                <MapContainer center={center} zoom={8} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    <LayersControl position="topright">
                        <LayersControl.Overlay checked name="Origen: Producción">
                            <React.Fragment>
                                {mapData.origen.map((finca, idx) => (
                                    <Circle
                                        key={`origen-${idx}`}
                                        center={[finca.lat, finca.lng]}
                                        pathOptions={{ fillColor: '#10b981', color: '#059669', weight: 1, fillOpacity: 0.6 }}
                                        radius={Math.sqrt(finca.volumen_produccion) * 500} // Escalar según volumen
                                    >
                                        <Popup>
                                            <div className="p-2">
                                                <h3 className="font-bold text-emerald-700 flex items-center gap-1">
                                                    <Home size={14} /> {finca.nombre_finca}
                                                </h3>
                                                <p className="text-sm">Producción despachada: <b>{finca.volumen_produccion} unidades</b></p>
                                            </div>
                                        </Popup>
                                    </Circle>
                                ))}
                            </React.Fragment>
                        </LayersControl.Overlay>

                        <LayersControl.Overlay checked name="Destino: Demanda">
                            <React.Fragment>
                                {/* Nota: Para destinos usamos marcadores en las ciudades principales ya que no tenemos GPS exacto de compradores */}
                                {mapData.destino.map((zona, idx) => {
                                    // Coordenadas aproximadas para ciudades principales de Santa Cruz
                                    const coords = {
                                        'Santa Cruz de la Sierra': [-17.7833, -63.1821],
                                        'Montero': [-17.3411, -63.2505],
                                        'Warnes': [-17.5145, -63.1672],
                                        'La Guardia': [-17.8906, -63.3278],
                                        'Cotoca': [-17.7533, -62.9961]
                                    };
                                    const pos = coords[zona.zona] || center;

                                    return (
                                        <Circle
                                            key={`destino-${idx}`}
                                            center={pos}
                                            pathOptions={{ fillColor: '#f97316', color: '#ea580c', weight: 1, fillOpacity: 0.4 }}
                                            radius={zona.total_pedidos * 1000} // Escalar según pedidos
                                        >
                                            <Popup>
                                                <div className="p-2">
                                                    <h3 className="font-bold text-orange-700 flex items-center gap-1">
                                                        <ShoppingCart size={14} /> {zona.zona}
                                                    </h3>
                                                    <p className="text-sm">Total Pedidos: <b>{zona.total_pedidos}</b></p>
                                                    <p className="text-sm">Valor de Mercado: <b>Bs. {zona.total_valor.toLocaleString()}</b></p>
                                                </div>
                                            </Popup>
                                        </Circle>
                                    );
                                })}
                            </React.Fragment>
                        </LayersControl.Overlay>
                    </LayersControl>
                </MapContainer>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 p-4 rounded-lg flex items-start gap-3">
                    <Info className="text-emerald-600 mt-1" size={18} />
                    <p className="text-xs text-emerald-800">
                        Los círculos verdes indican el volumen de despacho desde las fincas. A mayor radio, mayor cantidad de producto suministrado al sistema.
                    </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg flex items-start gap-3">
                    <Info className="text-orange-600 mt-1" size={18} />
                    <p className="text-xs text-orange-800">
                        Los círculos naranjas representan focos de demanda en áreas urbanas. Permiten identificar zonas con potencial de expansión logística.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MapaCalorSponsor;
