import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';
import io from 'socket.io-client';
import ListaNotificaciones from './ListaNotificaciones';
import { useToast } from '../../context/ToastContext';

let socket;

const CampanaNotificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) return;

    const user = JSON.parse(userStr);

    // Initial fetch
    fetchNotificaciones(token, user.id);

    // Connect WebSocket
    socket = io('http://localhost:5000');
    
    socket.on('connect', () => {
      socket.emit('join_room', user.id);
    });

    socket.on('nueva_notificacion', (notificacion) => {
      setNotificaciones(prev => [notificacion, ...prev]);
      setNoLeidas(prev => prev + 1);
      
      // Mostrar toast según el tipo
      if (notificacion.tipo === 'PEDIDO_ENTREGADO' || notificacion.tipo === 'PEDIDO_EN_CAMINO') {
        toast.success(notificacion.titulo, notificacion.mensaje);
      } else {
        toast.info(notificacion.titulo, notificacion.mensaje);
      }
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const fetchNotificaciones = async (token, userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/notificaciones/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotificaciones(res.data);
      setNoLeidas(res.data.filter(n => !n.leida).length);
    } catch (error) {
      console.error('Error fetching notificaciones:', error);
    }
  };

  const handleMarcarLeida = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/notificaciones/${id}/leer`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
      setNoLeidas(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error al marcar leida:', error);
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      await axios.put(`http://localhost:5000/api/notificaciones/leer-todas/${user.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch (error) {
      console.error('Error al marcar todas leidas:', error);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
      >
        <Bell className="w-6 h-6 text-slate-600" />
        {noLeidas > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {noLeidas > 99 ? '99+' : noLeidas}
          </span>
        )}
      </button>

      {isOpen && (
        <ListaNotificaciones 
          notificaciones={notificaciones} 
          onClose={() => setIsOpen(false)}
          onMarcarLeida={handleMarcarLeida}
          onMarcarTodasLeidas={handleMarcarTodasLeidas}
        />
      )}
    </div>
  );
};

export default CampanaNotificaciones;
