import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Edit2, Save, Info, AlertTriangle, CheckCircle2, Navigation, Loader2, Check
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';
import PageShell from '../components/ui/PageShell';
import { useToast } from '../context/ToastContext';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition, isEditing }) => {
  useMapEvents({
    click(e) {
      if (isEditing) {
        setPosition(e.latlng);
      }
    },
  });

  return position === null ? null : (
    <Marker 
      draggable={isEditing} 
      position={position} 
      eventHandlers={{
        dragend(e) {
          if (isEditing) {
            setPosition(e.target.getLatLng());
          }
        }
      }}
    />
  );
};

const MiFincaPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [position, setPosition] = useState({ lat: -17.3639, lng: -63.2505 }); // Montero, Santa Cruz default
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState(null);

  // Inferred geo locations
  const inferredProvincia = 'Obispo Santistevan';
  const inferredMunicipio = 'Montero';

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      try {
        const res = await axios.get('http://localhost:5000/api/usuarios/mi-perfil', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(res.data);
        if (res.data.latitud && res.data.longitud) {
          setPosition({ 
            lat: parseFloat(res.data.latitud), 
            lng: parseFloat(res.data.longitud) 
          });
        }
      } catch (err) {
        console.error('Error fetching profile in MiFinca:', err);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleSaveLocation = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/productor/ubicacion', {
        latitud: position.lat,
        longitud: position.lng
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Ubicación de tu finca registrada con éxito');
      setIsEditing(false);
    } catch (err) {
      toast.error('No se pudo guardar la ubicación en la base de datos');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta la geolocalización de dispositivo');
      return;
    }
    
    toast.info('Obteniendo coordenadas actuales...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setIsEditing(true);
        toast.success('Ubicación obtenida con éxito. Recordá guardarla.');
      },
      () => {
        toast.error('No se pudo acceder a tu ubicación actual. Permití el acceso de GPS.');
      }
    );
  };

  return (
    <PageShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
            🗺️ Geolocalización
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Mi Finca</h1>
          <p className="text-sm text-slate-400 mt-1">Registrá las coordenadas de tu centro de producción agrícola</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleUseCurrentLocation}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm hover:bg-slate-50"
          >
            <Navigation className="w-4 h-4 text-emerald-600" />
            Usar mi ubicación actual
          </button>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <Edit2 className="w-4 h-4" />
              Actualizar ubicación
            </button>
          ) : (
            <button
              onClick={handleSaveLocation}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar ubicación
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel lateral de geolocalización */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              Ubicación Registrada
            </h3>

            {/* Estado */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-emerald-600 animate-float" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Coordenadas Finca</span>
                  <div className="text-xs font-bold text-slate-600 mt-1">
                    Lat: {position.lat.toFixed(5)} <br />
                    Lng: {position.lng.toFixed(5)}
                  </div>
                </div>
              </div>
            </div>

            {/* Inferred Geo */}
            <div className="space-y-4 border-t border-slate-100 pt-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Provincia inferida</span>
                <span className="text-sm font-extrabold text-slate-800 block mt-0.5">{inferredProvincia}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Municipio inferido</span>
                <span className="text-sm font-extrabold text-slate-800 block mt-0.5">{inferredMunicipio}</span>
              </div>
            </div>

            {/* Guardar Ubicación Button (If editing) */}
            {isEditing && (
              <button
                onClick={handleSaveLocation}
                disabled={isSaving}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-600/10 transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Guardar ubicación
              </button>
            )}

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                Al habilitar el modo de edición y hacer clic sobre cualquier sector del mapa, el marcador se desplazará registrando la nueva parcela de tu finca.
              </p>
            </div>
          </div>
        </div>

        {/* Leaflet map Container (60vh) */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-[60vh] relative z-0">
          <MapContainer center={[position.lat, position.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker position={position} setPosition={setPosition} isEditing={isEditing} />
          </MapContainer>
        </div>
      </div>
    </PageShell>
  );
};

export default MiFincaPage;
