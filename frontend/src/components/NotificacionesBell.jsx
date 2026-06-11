import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bell, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const NotificacionesBell = () => {
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const panelRef = useRef(null);
  const prevCountRef = useRef(null);

  const fetchNotificaciones = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      const [listRes, countRes] = await Promise.all([
        axios.get('http://localhost:5000/api/notificaciones', { headers }),
        axios.get('http://localhost:5000/api/notificaciones/no-leidas/count', { headers }),
      ]);
      const total = countRes.data.total || 0;
      const latest = listRes.data[0];

      if (prevCountRef.current !== null && total > prevCountRef.current && latest?.titulo) {
        toast(latest.mensaje, {
          icon: '🌾',
          duration: 5000,
        });
      }
      prevCountRef.current = total;

      setNotificaciones(listRes.data.slice(0, 8));
      setNoLeidas(total);
    } catch (err) {
      console.error('Error cargando notificaciones US08:', err);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
    const interval = setInterval(fetchNotificaciones, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    if (abierto) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [abierto]);

  const marcarLeida = async (id, cosechaId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/notificaciones/${id}/leida`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotificaciones();
      if (cosechaId) navigate(`/producto/${cosechaId}`);
      setAbierto(false);
    } catch (err) {
      console.error(err);
    }
  };

  const marcarTodas = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/notificaciones/leer-todas', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotificaciones();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-emerald-600 transition-colors"
        title="Alertas de temporada"
      >
        <Bell className="w-5 h-5" />
        {noLeidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-violet-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-violet-50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-black text-slate-800">Temporada</span>
            </div>
            {noLeidas > 0 && (
              <button type="button" onClick={marcarTodas} className="text-[10px] font-bold text-violet-600 hover:underline">
                Marcar todas leídas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <p className="p-6 text-sm text-slate-400 text-center">Sin alertas de temporada por ahora.</p>
            ) : (
              notificaciones.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => marcarLeida(n.id, n.cosecha_id)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.leida ? 'bg-violet-50/50' : ''}`}
                >
                  <p className="text-xs font-black text-violet-700">{n.titulo}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{n.mensaje}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(n.fecha_creacion).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </button>
              ))
            )}
          </div>

          <div className="p-3 border-t border-slate-100 bg-slate-50">
            <button
              type="button"
              onClick={() => { navigate('/dashboard/comprador/perfil'); setAbierto(false); }}
              className="w-full text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              Configurar categorías de interés
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificacionesBell;
