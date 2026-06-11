import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Search, Star, Navigation, Mail } from 'lucide-react';
import { Map } from '../components/ui/mapcn-marker-popup';

function calcularDistanciaKm(lat1, lng1, lat2, lng2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const defaultBuyerLocation = {
  latitud: -17.7833,
  longitud: -63.1821
};

function MapaProductoresPage() {
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducerId, setSelectedProducerId] = useState(null);

  useEffect(() => {
    const fetchProducers = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await axios.get('http://localhost:5000/api/marketplace/productores');
        setProducers(res.data || []);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los productores. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducers();
  }, []);

  const producersWithDistance = useMemo(() => {
    return producers.map((producer) => {
      const distancia = typeof producer.distancia_km === 'number'
        ? producer.distancia_km
        : calcularDistanciaKm(
            defaultBuyerLocation.latitud,
            defaultBuyerLocation.longitud,
            producer.latitud,
            producer.longitud
          );

      return {
        ...producer,
        distance: Math.round(distancia * 10) / 10,
        productos: Array.isArray(producer.productos) ? producer.productos : []
      };
    });
  }, [producers]);

  const filteredProducers = useMemo(() => {
    return producersWithDistance.filter((producer) =>
      producer.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producer.productos.some((product) => product.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, producersWithDistance]);

  const mapMarkers = useMemo(() => {
    return filteredProducers.map((producer) => ({
      id: producer.productor_id,
      coordinates: [producer.longitud, producer.latitud],
      title: producer.nombre_finca,
      description: `${producer.nombre} · ${producer.provincia}`,
      color: producer.productor_id === selectedProducerId ? '#059669' : '#0d9f6e'
    }));
  }, [filteredProducers, selectedProducerId]);

  const handleMarkerClick = (markerData) => {
    setSelectedProducerId(markerData.id);
  };

  return (
    <div className="flex h-screen bg-[#f4f6f9] font-inter">
      <div className="w-96 h-full overflow-y-auto border-r border-gray-200 bg-white flex flex-col shadow-sm z-10 relative">
        <div className="p-6 sticky top-0 bg-white border-b border-gray-100 z-20">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Productores Cercanos</h1>
          <p className="text-sm text-gray-500 mb-4">Encuentra productores verificados en tu zona.</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre o producto..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0d9f6e] focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4 space-y-4">
          {loading ? (
            <div className="py-10 text-center text-gray-500">Cargando productores...</div>
          ) : error ? (
            <div className="py-10 text-center text-red-600">{error}</div>
          ) : filteredProducers.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No se encontraron productores coincidiendo con tu búsqueda.</div>
          ) : (
            filteredProducers.map((producer) => (
              <div
                key={producer.productor_id}
                onClick={() => setSelectedProducerId(producer.productor_id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${selectedProducerId === producer.productor_id ? 'border-[#0d9f6e] bg-emerald-50 ring-1 ring-[#0d9f6e]' : 'border-gray-100 bg-white hover:border-[#0d9f6e]/50 hover:shadow-md hover:-translate-y-1'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{producer.nombre_finca}</h3>
                    <p className="text-sm text-gray-500">{producer.nombre}</p>
                  </div>
                  <span className="bg-emerald-100 text-[#0d9f6e] px-2 py-1 rounded-full text-xs font-semibold">Verificado</span>
                </div>

                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                    <span className="font-medium">{producer.productos.length} productos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{producer.distance.toFixed(1)} km</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {producer.productos.slice(0, 4).map((product) => (
                      <span key={product} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">{product}</span>
                    ))}
                  </div>
                </div>

                {selectedProducerId === producer.productor_id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between gap-2">
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex-1">
                      <Mail className="w-4 h-4" />
                      Contactar
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0d9f6e] text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors flex-1">
                      <Navigation className="w-4 h-4" />
                      Ver Catálogo
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 relative bg-gray-200">
        <Map
          center={[defaultBuyerLocation.longitud, defaultBuyerLocation.latitud]}
          zoom={11}
          markers={mapMarkers}
          onMarkerClick={handleMarkerClick}
          className="w-full h-full"
        />

        <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-xl shadow-md z-10 font-semibold text-sm text-gray-700 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#0d9f6e]" />
          Santa Cruz de la Sierra, Bolivia
        </div>
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-red-500">
          <h1 className="text-2xl font-bold">Error en el Mapa</h1>
          <pre className="mt-4 p-4 bg-red-50 rounded text-sm overflow-auto">
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function MapaProductoresPageWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <MapaProductoresPage />
    </ErrorBoundary>
  );
}
