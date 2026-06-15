import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, MapPin, Truck, CheckCircle2, Navigation, FileText, Check, User } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const PanelTransportistaPage = () => {
  const [activeTab, setActiveTab] = useState('pendientes');
  const [solicitudes, setSolicitudes] = useState([]);
  const [viajes, setViajes] = useState([]);
  const [historial, setHistorial] = useState([]);
  const toast = useToast();

  const fetchTab = async (tab) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) return;
    const user = JSON.parse(userStr);
    
    try {
      if (tab === 'pendientes') {
        const res = await axios.get(`http://localhost:5000/api/transportista/${user.id}/solicitudes-pendientes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSolicitudes(res.data);
      } else if (tab === 'en_curso') {
        const res = await axios.get(`http://localhost:5000/api/transportista/${user.id}/viajes-en-curso`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setViajes(res.data);
      } else if (tab === 'historial') {
        const res = await axios.get(`http://localhost:5000/api/transportista/${user.id}/historial`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistorial(res.data);
      }
    } catch (error) {
      console.error(`Error fetching ${tab}:`, error);
    }
  };

  useEffect(() => {
    fetchTab(activeTab);
  }, [activeTab]);

  const navigate = useNavigate();

  const handleAceptarViaje = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/pedidos/${id}/aceptar-viaje`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` }}
      );
      toast.success('Viaje aceptado', 'El pedido ahora está en tránsito. Revisa tus Viajes en Curso.');
      fetchTab('pendientes');
    } catch (error) {
      toast.error('Error', error.response?.data?.error || 'No se pudo aceptar el viaje.');
    }
  };

  const handleMarcarEntregado = async (pedidoId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/pedidos/${pedidoId}/marcar-entregado`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` }}
      );
      toast.success('Entregado', 'El pedido se marcó como entregado.');
      fetchTab('en_curso');
    } catch (error) {
      toast.error('Error', error.response?.data?.error || 'No se pudo marcar como entregado.');
    }
  };

  const renderDestino = (direccionStr) => {
    if (!direccionStr) return 'No indicada';
    try {
      const dirObj = JSON.parse(direccionStr);
      if (dirObj.lat && dirObj.lng) {
        return (
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${dirObj.lat},${dirObj.lng}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline font-bold"
          >
            Abrir en Google Maps
          </a>
        );
      }
    } catch (e) {
      // No es JSON válido, devolver el string crudo
    }
    return direccionStr;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-600" />
            Panel de Transportista
          </h1>
          <p className="text-sm text-slate-500 font-medium">Gestiona tus solicitudes y entregas en curso.</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('pendientes')}
          className={`px-4 py-2 text-sm font-bold rounded-t-lg border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'pendientes' ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> Solicitudes Pendientes
            {solicitudes.length > 0 && <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">{solicitudes.length}</span>}
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('en_curso')}
          className={`px-4 py-2 text-sm font-bold rounded-t-lg border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'en_curso' ? 'border-blue-500 text-blue-700 bg-blue-50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4" /> Viajes en Curso
            {viajes.length > 0 && <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{viajes.length}</span>}
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('historial')}
          className={`px-4 py-2 text-sm font-bold rounded-t-lg border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'historial' ? 'border-slate-800 text-slate-800 bg-slate-100' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Historial
          </div>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        {activeTab === 'pendientes' && (
          <div className="space-y-4">
            {solicitudes.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No hay viajes disponibles en la bolsa en este momento.</p>
            ) : (
              solicitudes.map(sol => (
                <div key={sol.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Carga de {sol.productor_nombre}</h3>
                      <p className="text-sm text-slate-500">Para: {sol.comprador_nombre}</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">Disponible</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-700 block">Origen (Finca)</span>
                        <span className="text-slate-600">{sol.origen}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-700 block">Destino (Comprador)</span>
                        <span className="text-slate-600">{renderDestino(sol.destino)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-center justify-between bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
                    <div className="text-center md:text-left mb-2 md:mb-0">
                      <span className="text-xs font-bold text-slate-500 block">Carga Total</span>
                      <span className="text-sm font-semibold text-slate-800">
                        {sol.cantidad ? `${sol.cantidad} ${sol.unidad_medida || 'unid.'} de ` : ''}{sol.nombre_producto || 'Varios productos'}
                      </span>
                    </div>
                    <div className="text-center md:text-right">
                      <span className="text-xs font-bold text-slate-500 block">Valor del Pedido</span>
                      <span className="text-xl font-black text-slate-900">Bs. {Number(sol.monto_total).toFixed(2)}</span>
                    </div>
                  </div>
                  <button onClick={() => handleAceptarViaje(sol.id)} className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md">
                    Aceptar Viaje
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'en_curso' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {viajes.length === 0 ? (
              <p className="text-slate-500 text-center py-8 col-span-full">No tienes viajes en curso.</p>
            ) : (
              viajes.map(v => (
                <div key={v.id} className="border-2 border-blue-100 rounded-xl p-5 relative overflow-hidden bg-white hover:border-blue-300 transition-colors">
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">EN TRÁNSITO</div>
                  <h3 className="text-lg font-black text-slate-800 mb-2">Viaje #{v.id.substring(0,6).toUpperCase()}</h3>
                  
                  <div className="space-y-3 mb-5">
                    <div className="flex items-start gap-2">
                      <Package className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <span className="font-bold text-slate-700 block">Productos</span>
                        <ul className="text-slate-600 list-disc list-inside">
                          {v.productos.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <span className="font-bold text-slate-700 block">Cliente</span>
                        <span className="text-slate-600">{v.comprador_nombre} ({v.comprador_celular})</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <span className="font-bold text-slate-700 block">Destino</span>
                        <span className="text-slate-600">{renderDestino(v.destino)}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate('/dashboard/transportista/hoja-de-ruta')} 
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
                  >
                    <FileText className="w-5 h-5" />
                    Ver Hoja de Ruta
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'historial' && (
          <div className="space-y-4">
            {historial.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Aún no tienes entregas completadas.</p>
            ) : (
              historial.map(h => (
                <div key={h.id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Pedido #{h.id.substring(0,6).toUpperCase()}</h4>
                      <p className="text-sm text-slate-500">De {h.productor_nombre} a {h.comprador_nombre}</p>
                    </div>
                  </div>
                  <div className="text-right w-full sm:w-auto">
                    <p className="font-bold text-slate-700">Bs. {h.monto_total}</p>
                    <p className="text-xs text-slate-500">{new Date(h.fecha_entrega).toLocaleDateString('es-BO')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PanelTransportistaPage;
