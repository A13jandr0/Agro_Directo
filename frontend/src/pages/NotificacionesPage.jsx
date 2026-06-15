import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bell, Check, CheckCircle2, Sprout, Package, XCircle, AlertTriangle, Sparkles, Info } from 'lucide-react';
import PageShell from '../components/ui/PageShell';
import { useToast } from '../context/ToastContext';

const NotificacionesPage = () => {
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, UNREAD
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const navigate = useNavigate();
  const toast = useToast();

  const fetchNotificaciones = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5000/api/notificaciones', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotificaciones(res.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const handleMarcarComoLeida = async (id, ruta) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/notificaciones/${id}/leer`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
      if (ruta) navigate(ruta);
    } catch (error) {
      console.error('Error al marcar leída', error);
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/notificaciones/leer-todas`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
      toast.success('Todas marcadas como leídas');
    } catch (error) {
      console.error('Error al marcar todas leídas', error);
      toast.error('Error al procesar la solicitud');
    }
  };

  const getRelativeTime = (dateStr) => {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} hr`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-BO');
  };

  const getIconForType = (tipo) => {
    switch(tipo) {
      case 'NUEVO_PRODUCTO_TEMPORADA': return <Sprout className="w-5 h-5 text-emerald-600" />;
      case 'PEDIDO_CREADO':
      case 'PEDIDO_ACTUALIZADO': return <Package className="w-5 h-5 text-blue-600" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-rose-600" />;
      case 'celebration': return <Sparkles className="w-5 h-5 text-emerald-500" />;
      default: return <Info className="w-5 h-5 text-indigo-500" />;
    }
  };

  const filteredNotifs = notificaciones.filter(n => {
    if (activeTab === 'UNREAD') return !n.leida;
    return true;
  });

  const displayNotifs = filteredNotifs.slice(0, paginaActual * 10);

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Bell className="w-8 h-8 text-indigo-600" />
              Mis Notificaciones
            </h1>
            <p className="text-slate-500 font-semibold mt-1">Mantenete al tanto de lo que pasa con tus pedidos y productos.</p>
          </div>
          <button 
            onClick={handleMarcarTodasLeidas}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
          >
            <Check className="w-4 h-4" />
            Marcar todas como leídas
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 px-2 pt-2">
            <button
              onClick={() => { setActiveTab('ALL'); setPaginaActual(1); }}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'ALL' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Todas
            </button>
            <button
              onClick={() => { setActiveTab('UNREAD'); setPaginaActual(1); }}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'UNREAD' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              No leídas
              {notificaciones.filter(n => !n.leida).length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {notificaciones.filter(n => !n.leida).length}
                </span>
              )}
            </button>
          </div>

          {/* List */}
          <div className="p-4 sm:p-6 space-y-3">
            {loading ? (
              <div className="text-center py-10 text-slate-500 font-bold">Cargando notificaciones...</div>
            ) : displayNotifs.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-black text-slate-700">No tenés notificaciones aún</h3>
                <p className="text-sm text-slate-400 font-semibold mt-1">Te avisaremos cuando haya novedades importantes.</p>
              </div>
            ) : (
              <>
                {displayNotifs.map(n => (
                  <div 
                    key={n.id}
                    onClick={() => handleMarcarComoLeida(n.id, n.ruta || (n.cosecha_id ? `/producto/${n.cosecha_id}` : null))}
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${!n.leida ? 'bg-indigo-50/30 border-indigo-100 hover:bg-indigo-50/50' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!n.leida ? 'bg-white shadow-sm border border-indigo-100' : 'bg-slate-50'}`}>
                      {getIconForType(n.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm truncate pr-4 ${!n.leida ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>
                          {n.titulo}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap shrink-0">{getRelativeTime(n.fecha)}</span>
                      </div>
                      <p className={`text-xs line-clamp-2 leading-relaxed ${!n.leida ? 'text-slate-600 font-semibold' : 'text-slate-500'}`}>
                        {n.mensaje}
                      </p>
                    </div>
                    {!n.leida && (
                      <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full shrink-0 mt-3 shadow-sm shadow-indigo-600/40"></div>
                    )}
                  </div>
                ))}

                {displayNotifs.length < filteredNotifs.length && (
                  <div className="text-center pt-4">
                    <button 
                      onClick={() => setPaginaActual(p => p + 1)}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-bold px-6 py-2 rounded-xl hover:bg-indigo-50 transition-colors"
                    >
                      Cargar más
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default NotificacionesPage;
