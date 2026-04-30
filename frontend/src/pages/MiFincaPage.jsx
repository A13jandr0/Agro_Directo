import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, LayoutDashboard, Sprout, PlusCircle, ShoppingBag, MapPin, BarChart2, User, Settings, LogOut, 
  Menu, CheckCircle2, AlertCircle, Edit2, Save, Info, AlertTriangle
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

// Icono verde personalizado
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Componente para manejar clics en el mapa
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Estados de Finca
  const [hasLocation, setHasLocation] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [position, setPosition] = useState(null); // { lat, lng }
  
  const [formData, setFormData] = useState({
    nombreReferencia: '',
    municipio: 'Montero', // pre-cargado
    provincia: 'Obispo Santistevan', // pre-cargado
    descripcionAcceso: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const menuItems = [
    { id: 'dashboard', label: 'Mi Dashboard', icon: LayoutDashboard, path: '/dashboard/productor' },
    { id: 'cosechas', label: 'Mis Cosechas', icon: Sprout, path: '/dashboard/productor/cosechas' },
    { id: 'publicar', label: 'Publicar Producto', icon: PlusCircle, path: '#' },
    { id: 'pedidos', label: 'Mis Pedidos', icon: ShoppingBag, path: '/dashboard/productor/pedidos' },
    { id: 'finca', label: 'Mi Finca', icon: MapPin, path: '/dashboard/productor/finca', active: true },
    { id: 'ingresos', label: 'Mis Ingresos', icon: BarChart2, path: '/dashboard/productor/ingresos' },
    { id: 'perfil', label: 'Mi Perfil', icon: User, path: '/dashboard/productor/perfil' },
    { id: 'configuracion', label: 'Configuración', icon: Settings, path: '#' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSaveLocation = async () => {
    if (!position) return;
    
    setIsSaving(true);
    try {
      // Simulación de API si no existe el endpoint backend todavía
      // await axios.put('/api/producer/location', {
      //   latitud: position.lat,
      //   longitud: position.lng,
      //   nombre_referencia: formData.nombreReferencia
      // });
      
      // Simulamos la respuesta exitosa tras 1 segundo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasLocation(true);
      setIsEditing(false);
      
      setToastMsg('Ubicación guardada correctamente');
      setTimeout(() => setToastMsg(''), 3000);
    } catch (error) {
      console.error(error);
      setToastMsg('Error al guardar la ubicación');
      setTimeout(() => setToastMsg(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f9fafb] font-sans overflow-hidden">
      
      {/* OVERLAY PARA MÓVIL */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* SIDEBAR FIJO */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-[240px] bg-[#0F6E56] text-white z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none shrink-0`}>
        <div className="h-16 flex items-center gap-2 px-6 border-b border-white/10 shrink-0">
          <Leaf className="w-6 h-6 text-white" />
          <span className="text-xl font-bold tracking-wider">AgroDirecto</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button 
                    onClick={() => item.path !== '#' && navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${item.active ? 'bg-white/15 border-l-[3px] border-white text-white' : 'text-white/80 hover:bg-white/5 hover:text-white border-l-[3px] border-transparent'}`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-white/10 p-4 shrink-0">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-2 py-2 text-sm font-medium text-red-200 hover:text-red-100 hover:bg-white/5 rounded transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* TOAST MESSAGE */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-[100] bg-[#1D9E75] text-white px-6 py-3 rounded-lg shadow-lg font-medium animate-fade-in-down flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {toastMsg}
        </div>
      )}

      {/* ÁREA PRINCIPAL (2 COLUMNAS) */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER */}
        <header className="h-[64px] bg-white shadow-sm flex items-center justify-between px-4 sm:px-6 z-10 shrink-0 lg:hidden">
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-[#1D9E75]" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-[#1a1a1a]">Mi Finca</h1>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-64px)] lg:h-screen overflow-hidden">
          
          {/* PANEL IZQUIERDO (380px) */}
          <div className="w-full lg:w-[380px] bg-white shadow-lg z-10 flex flex-col overflow-y-auto shrink-0 border-r border-gray-100 h-full">
            
            <div className="p-6 pb-0 mb-4 hidden lg:block">
              <h1 className="text-2xl font-bold text-[#1a1a1a] flex items-center gap-2">
                <MapPin className="w-6 h-6 text-[#1D9E75]" />
                Mi Finca
              </h1>
            </div>

            <div className="p-6 space-y-6 flex-1">
              
              {/* ESTADO DE LA FINCA */}
              <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4">
                <h3 className="text-sm font-bold text-[#1a1a1a] mb-3 uppercase tracking-wider text-gray-500">Estado de Ubicación</h3>
                
                {hasLocation ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[#1D9E75] bg-[#E1F5EE] px-3 py-2 rounded-lg w-fit">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Ubicación registrada</span>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded font-mono text-xs text-gray-600">
                      Lat: {position?.lat.toFixed(6)} | Lng: {position?.lng.toFixed(6)}
                    </div>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="text-sm font-semibold text-[#6b7280] hover:text-[#1a1a1a] flex items-center gap-1.5 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Modificar ubicación
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-yellow-700 bg-yellow-100 px-3 py-2 rounded-lg w-fit">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Sin ubicación</span>
                    </div>
                    <p className="text-sm text-gray-500">Haz clic en el mapa interactivo a la derecha para marcar el punto exacto de tu finca.</p>
                  </div>
                )}
              </div>

              {/* ALERTA IMPORTANTE */}
              {!hasLocation && (
                <div className="bg-[#FEE2E2] border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                  <AlertTriangle className="w-5 h-5 text-[#991B1B] shrink-0 mt-0.5" />
                  <p className="text-[#991B1B] text-xs font-medium leading-relaxed">Sin ubicación registrada no podrás publicar productos en la plataforma.</p>
                </div>
              )}

              {/* FORMULARIO DE FINCA */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Nombre de referencia</label>
                  <input 
                    type="text" 
                    value={formData.nombreReferencia}
                    onChange={(e) => setFormData({...formData, nombreReferencia: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Ej. Finca El Paraíso - Sector Norte" 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] disabled:bg-gray-50 disabled:text-gray-500" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Municipio</label>
                    <input type="text" value={formData.municipio} onChange={(e) => setFormData({...formData, municipio: e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] disabled:bg-gray-50 disabled:text-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Provincia</label>
                    <input type="text" value={formData.provincia} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Descripción del acceso</label>
                  <textarea 
                    rows="2" 
                    value={formData.descripcionAcceso}
                    onChange={(e) => setFormData({...formData, descripcionAcceso: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Ej. A 2km del desvío principal, camino de tierra" 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] resize-none disabled:bg-gray-50 disabled:text-gray-500"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Coordenadas capturadas</label>
                  <div className="w-full px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm font-mono text-gray-600 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {position ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}` : 'Esperando selección...'}
                  </div>
                </div>

                {isEditing && (
                  <button 
                    onClick={handleSaveLocation}
                    disabled={!position || isSaving}
                    className="w-full bg-[#1D9E75] text-white py-2.5 rounded-lg font-bold text-sm hover:bg-[#0F6E56] transition-colors shadow-sm flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Guardar ubicación de finca
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* INSTRUCCIONES */}
              {isEditing && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                    <Info className="w-4 h-4" />
                    Instrucciones
                  </h4>
                  <ol className="list-decimal pl-4 text-xs text-gray-600 space-y-1.5 marker:text-gray-400 marker:font-bold">
                    <li>Haz clic en el mapa para marcar tu finca</li>
                    <li>Ajusta el marcador arrastrándolo si es necesario</li>
                    <li>Verifica las coordenadas capturadas</li>
                    <li>Guarda tu ubicación</li>
                  </ol>
                </div>
              )}

            </div>
          </div>

          {/* MAPA INTERACTIVO (Flex-1) */}
          <div className="flex-1 relative h-full min-h-[400px] bg-gray-200 lg:h-auto z-0">
            <MapContainer 
              center={position || [-17.7834, -63.1821]} // Santa Cruz de la Sierra por defecto
              zoom={10} 
              scrollWheelZoom={true}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} setPosition={setPosition} isDraggable={isEditing} />
            </MapContainer>
            
            {/* Overlay informativo en el mapa */}
            {!position && isEditing && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200 font-semibold text-sm text-[#1a1a1a] flex items-center gap-2 pointer-events-none">
                <MapPin className="w-4 h-4 text-[#1D9E75] animate-bounce" />
                Haz clic en cualquier punto para iniciar
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default MiFincaPage;
