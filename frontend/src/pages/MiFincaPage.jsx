import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Edit2, 
  Save, 
  Info, 
  AlertTriangle,
  Lock,
  ChevronRight
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';

// Fix para el icono de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const LocationMarker = ({ position, setPosition, isDraggable }) => {
  const markerRef = useRef(null);

  useMapEvents({
    click(e) {
      if(isDraggable) {
        setPosition(e.latlng);
      }
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
        }
      },
    }),
    [setPosition]
  );

  return position === null ? null : (
    <Marker 
      draggable={isDraggable} 
      eventHandlers={eventHandlers} 
      position={position} 
      ref={markerRef}
      icon={greenIcon}
    />
  );
};

const MiFincaPage = () => {
  const navigate = useNavigate();
  const [hasLocation, setHasLocation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [position, setPosition] = useState(null); 
  const [userData, setUserData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      const res = await axios.get('http://localhost:5000/api/usuarios/mi-perfil', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      setUserData(data);
      if (data.latitud != null && data.longitud != null) {
        setPosition({ lat: parseFloat(data.latitud), lng: parseFloat(data.longitud) });
        setHasLocation(true);
      } else {
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Error fetching profile", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  const handleSaveLocation = async () => {
    if (!position) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/productor/ubicacion', {
        latitud: position.lat,
        longitud: position.lng
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHasLocation(true);
      setIsEditing(false);
      setToastMsg('Ubicación guardada correctamente');
      setTimeout(() => setToastMsg(''), 3000);
      fetchProfile();
    } catch (error) {
      setToastMsg('Error al guardar la ubicación');
      setTimeout(() => setToastMsg(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const center = position || { lat: -17.7833, lng: -63.1821 };

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/20 shrink-0">
            <MapPin className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ubicación de Mi Finca</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Geolocalización de Producción</p>
          </div>
        </div>

        {!isEditing && hasLocation && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-emerald-500 text-emerald-600 rounded-2xl font-black text-sm shadow-sm hover:bg-emerald-50 transition-all"
          >
            <Edit2 className="w-4 h-4" /> Editar Ubicación
          </button>
        )}
      </div>

      {toastMsg && (
        <div className={`p-4 rounded-2xl border-l-4 font-bold text-sm shadow-md flex items-center gap-3 animate-in slide-in-from-top-4 ${toastMsg.includes('Error') ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-emerald-50 border-emerald-500 text-emerald-700'}`}>
          {toastMsg.includes('Error') ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          {toastMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* INFO COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Estado Actual</h3>
              {hasLocation ? (
                <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <div>
                    <p className="font-black text-sm leading-tight">Ubicación Registrada</p>
                    <p className="text-[10px] font-bold uppercase mt-0.5">Listo para publicar</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                  <AlertTriangle className="w-6 h-6 shrink-0" />
                  <div>
                    <p className="font-black text-sm leading-tight">Sin Ubicación</p>
                    <p className="text-[10px] font-bold uppercase mt-0.5 text-amber-500">Publicación bloqueada</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Coordenadas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Latitud</p>
                  <p className="font-bold text-slate-700">{position?.lat.toFixed(6) || '---'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Longitud</p>
                  <p className="font-bold text-slate-700">{position?.lng.toFixed(6) || '---'}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex gap-3 items-start">
                <Info className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Marca el punto exacto de tu finca en el mapa. Esta ubicación se usará para que los compradores vean qué tan cerca estás.
                </p>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl">
              <h3 className="font-black text-lg mb-2">Guardar Cambios</h3>
              <p className="text-slate-400 text-sm mb-6 font-medium">¿Confirmas que este es el punto exacto de tu producción?</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setIsEditing(false); fetchProfile(); }}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-sm transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveLocation}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MAP COLUMN */}
        <div className="lg:col-span-2 h-[600px] bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm relative z-0">
          {!isEditing && hasLocation && (
            <div className="absolute inset-0 bg-slate-900/5 z-[40] cursor-not-allowed flex items-center justify-center backdrop-blur-[2px]">
               <div className="bg-white/90 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                 <Lock className="w-5 h-5 text-slate-400" />
                 <span className="text-sm font-black text-slate-900 uppercase tracking-tight">Mapa Bloqueado (Pulsa Editar)</span>
               </div>
            </div>
          )}
          <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker position={position} setPosition={setPosition} isDraggable={isEditing} />
          </MapContainer>
        </div>

      </div>
    </div>
  );
};

export default MiFincaPage;
