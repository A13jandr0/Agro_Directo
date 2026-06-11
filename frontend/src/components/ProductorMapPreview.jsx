import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
});

/** Mapa de solo lectura para US23 */
const ProductorMapPreview = ({ lat, lng, height = '220px' }) => {
  if (lat == null || lng == null) {
    return (
      <div className="rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm text-slate-400" style={{ height }}>
        Ubicación del productor no disponible
      </div>
    );
  }

  const center = [Number(lat), Number(lng)];

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 z-0" style={{ height }}>
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} />
      </MapContainer>
    </div>
  );
};

export default ProductorMapPreview;
