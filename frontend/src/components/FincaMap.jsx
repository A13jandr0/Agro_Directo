import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Save, Edit3, AlertTriangle, CheckCircle2, Loader2, Ban } from 'lucide-react';

// Arreglar iconos de Leaflet en React
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon, iconRetinaUrl: iconRetina, shadowUrl: iconShadow,
  iconSize: [25, 41], iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const API = 'http://localhost:5000/api';

// Capturador de clics en el mapa
const LocationMarker = ({ position, setPosition, isEditing }) => {
  useMapEvents({
    click(e) {
      if (isEditing) setPosition(e.latlng);
    },
  });
  return position ? <Marker position={position} /> : null;
};

const FincaMap = ({ savedLat = null, savedLng = null }) => {
  const [position, setPosition] = useState(savedLat && savedLng ? { lat: savedLat, lng: savedLng } : null);
  const [isEditing, setIsEditing] = useState(!savedLat || !savedLng);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const defaultCenter = [-17.7834, -63.1821]; // Santa Cruz

  useEffect(() => {
    if (savedLat && savedLng) {
      setPosition({ lat: savedLat, lng: savedLng });
      setIsEditing(false);
    }
  }, [savedLat, savedLng]);

  const handleSaveLocation = async () => {
    if (!position) {
      setStatusMessage({ text: 'Haz clic en el mapa para seleccionar un punto.', type: 'error' });
      return;
    }
    setSaving(true);
    setStatusMessage({ text: 'Guardando ubicación...', type: 'info' });
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/productor/ubicacion`, {
        latitud: position.lat,
        longitud: position.lng
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatusMessage({ text: '¡Ubicación guardada correctamente!', type: 'success' });
      setIsEditing(false);

      // Actualizar localStorage para que el dashboard no muestre la alerta de GPS
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        storedUser.latitud = position.lat;
        storedUser.longitud = position.lng;
        localStorage.setItem('user', JSON.stringify(storedUser));
      } catch (_) {}
    } catch (error) {
      setStatusMessage({
        text: error.response?.data?.error || 'Error al guardar. Verifica que estés dentro de Santa Cruz.',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublishProducts = () => {
    if (!position || isEditing) {
      setIsPublishing(true);
      setTimeout(() => setIsPublishing(false), 4000);
    } else {
      alert('¡Redirigiendo al panel de publicación de productos!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-lg mt-8 border-t-4 border-emerald-600">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-emerald-700 flex items-center gap-2">
            <MapPin className="w-6 h-6" />Ubicación de Finca
          </h2>
          <p className="text-gray-500 text-sm">Marca en el mapa el lugar exacto de tu producción en Santa Cruz.</p>
        </div>
        <button onClick={handlePublishProducts}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition flex items-center gap-2">
          Ir a Publicar Productos
        </button>
      </div>

      {/* ALERTA GPS REQUERIDO (US02) */}
      {isPublishing && (!position || isEditing) && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center gap-3 animate-pulse">
          <Ban className="w-8 h-8 text-red-500 flex-shrink-0" />
          <div>
            <h4 className="text-red-800 font-bold">¡Acción Bloqueada!</h4>
            <p className="text-red-700 text-sm">No puedes publicar productos sin haber registrado y guardado la geolocalización de tu finca.</p>
          </div>
        </div>
      )}

      {/* Mensajes de estado */}
      {statusMessage.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
          statusMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' :
          statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          'bg-emerald-50 text-emerald-600 border border-emerald-200'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
           statusMessage.type === 'error' ? <AlertTriangle className="w-5 h-5" /> :
           <Loader2 className="w-5 h-5 animate-spin" />}
          {statusMessage.text}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Mapa Leaflet */}
        <div className="w-full md:w-2/3 h-96 rounded-xl overflow-hidden border-2 border-gray-200 shadow-inner relative z-0">
          <MapContainer center={position || defaultCenter} zoom={position ? 14 : 10}
            style={{ height: '100%', width: '100%' }} className="z-0">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} isEditing={isEditing} />
          </MapContainer>
        </div>

        {/* Panel lateral */}
        <div className="w-full md:w-1/3 flex flex-col bg-gray-50 p-5 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Coordenadas GPS</h3>
          <div className="mb-4 flex-grow">
            {position ? (
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-xs uppercase font-semibold">Latitud</span>
                  <span className="font-mono text-sm text-gray-800 font-bold">{position.lat.toFixed(6)}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-500 text-xs uppercase font-semibold">Longitud</span>
                  <span className="font-mono text-sm text-gray-800 font-bold">{position.lng.toFixed(6)}</span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 p-4 rounded-lg text-center text-gray-400 text-sm h-full flex items-center justify-center border border-dashed border-gray-300">
                <MapPin className="w-5 h-5 mr-2" />Haz clic en el mapa
              </div>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-3">
            {isEditing ? (
              <button onClick={handleSaveLocation} disabled={saving}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? 'Guardando...' : 'Guardar Ubicación'}
              </button>
            ) : (
              <button onClick={() => { setIsEditing(true); setStatusMessage({ text: '', type: '' }); }}
                className="w-full py-3 text-gray-700 bg-white border border-gray-300 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition flex items-center justify-center gap-2">
                <Edit3 className="w-5 h-5" />Editar Ubicación
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FincaMap;
