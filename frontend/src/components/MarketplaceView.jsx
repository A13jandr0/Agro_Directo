import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, MapPin, SlidersHorizontal, Leaf, Calendar, Package } from 'lucide-react';

const MarketplaceView = () => {
  const [productos, setProductos] = useState([]);
  const [radioKm, setRadioKm] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Coordenadas simuladas para el comprador (Centro de Santa Cruz)
  const latComprador = -17.7833;
  const lngComprador = -63.1821;

  const fetchProductos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
        const response = await axios.get(
          `http://localhost:5000/api/marketplace/productos?lat_comprador=${latComprador}&lng_comprador=${lngComprador}&radio_km=${radioKm}`
        );
      setProductos(response.data);
    } catch (err) {
      setError('Error al cargar los productos del marketplace.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [radioKm]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  const handleSliderChange = (e) => {
    setRadioKm(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar: Filtros */}
      <aside className="w-full md:w-80 bg-white border-r border-gray-200 p-6 shadow-sm z-10 flex-shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <Leaf className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Filtros</h2>
        </div>

        <div className="space-y-8">
          {/* Filtro de Distancia */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                Cercanía Máxima
              </label>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                {radioKm} km
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="200"
              step="1"
              value={radioKm}
              onChange={handleSliderChange}
              onMouseUp={fetchProductos} // Recargar al soltar el slider para no saturar el server
              onTouchEnd={fetchProductos}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
              <span>1 km</span>
              <span>200 km</span>
            </div>
            <p className="text-xs text-gray-500 mt-3 italic">
              Buscando fincas en un radio de {radioKm}km desde tu ubicación.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content: Cuadrícula de Productos */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Marketplace AgroDirecto</h1>
            <p className="text-gray-500 mt-1">Descubre productos frescos directamente de los productores.</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none shadow-sm text-sm"
            />
          </div>
        </header>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : productos.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No hay productos en este radio</h3>
            <p className="text-gray-500 mt-2">Intenta ampliar la distancia máxima de búsqueda en los filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos.map((prod) => (
              <div key={prod.cosecha_id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col">
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  {prod.foto_url ? (
                    <img 
                      src={`http://localhost:5000${prod.foto_url}`} 
                      alt={prod.nombre_producto} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex justify-center items-center">
                      <Leaf className="w-12 h-12 text-emerald-200" />
                    </div>
                  )}
                  
                  {/* Badge Preventa/Stock */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full shadow-sm ${prod.es_preventa ? 'bg-purple-500 text-white' : 'bg-emerald-500 text-white'}`}>
                      {prod.es_preventa ? 'Preventa' : 'Stock'}
                    </span>
                  </div>

                  {/* Badge Distancia Espacial */}
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-gray-800 flex items-center gap-1 shadow-sm border border-white/20">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      A {prod.distancia_km.toFixed(1)} km
                    </div>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                      {prod.nombre_producto}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <span>{prod.nombre_finca}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{prod.municipio}</span>
                  </div>

                  <div className="mt-auto flex items-end justify-between">
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-0.5">Precio</p>
                      <p className="text-lg font-black text-emerald-600">
                        {prod.precio_unitario} Bs <span className="text-sm font-medium text-gray-400">/ {prod.unidad_medida}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-medium mb-0.5">Disponible</p>
                      <p className="text-sm font-bold text-gray-700">{prod.cantidad_disponible}</p>
                    </div>
                  </div>
                  
                  <button className="w-full mt-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-semibold py-2.5 rounded-xl transition-colors text-sm border border-emerald-100">
                    Contactar Productor
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MarketplaceView;
