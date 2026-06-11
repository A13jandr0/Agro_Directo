import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useToast } from './ToastContext';
import { tipoNotificacionToUi, rutaNotificacion } from '../utils/pedidoEstados';

const API = 'http://localhost:5000/api';
let socket;
const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe ser utilizado dentro de un NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isBellShaking, setIsBellShaking] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const prevCountRef = useRef(0);
  const knownIdsRef = useRef(new Set());

  const getRol = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.rol || '';
    } catch {
      return '';
    }
  };

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) return;

      const res = await axios.get(`${API}/notificaciones/${user.id}`, { headers: { Authorization: `Bearer ${token}` } });

      const rol = getRol();
      const mapped = (res.data || []).map((n) => ({
        id: n.id,
        tipo: tipoNotificacionToUi(n.tipo),
        tipoRaw: n.tipo,
        titulo: n.titulo,
        mensaje: n.mensaje,
        fecha: new Date(n.fecha_creacion),
        leida: Boolean(n.leida),
        ruta: rutaNotificacion(n, rol),
        pedido_id: n.pedido_id,
        cosecha_id: n.cosecha_id,
      }));

      const newTotal = mapped.filter(n => !n.leida).length;

      // ... logic toast skipped to avoid duplicating toasts on fetch

      prevCountRef.current = newTotal;
      setUnreadCount(newTotal);
      setNotifications(mapped);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    // Configurar WebSocket
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
        socket = io('http://localhost:5000');
        
        socket.on('connect', () => {
            socket.emit('join_room', user.id);
        });

        socket.on('nueva_notificacion', (n) => {
            const rol = getRol();
            const mappedNotif = {
                id: n.id,
                tipo: tipoNotificacionToUi(n.tipo),
                tipoRaw: n.tipo,
                titulo: n.titulo,
                mensaje: n.mensaje,
                fecha: new Date(n.fecha_creacion),
                leida: Boolean(n.leida),
                ruta: rutaNotificacion(n, rol),
                pedido_id: n.pedido_id,
                cosecha_id: n.cosecha_id,
            };

            setNotifications(prev => [mappedNotif, ...prev]);
            setUnreadCount(prev => {
                const newCount = prev + 1;
                prevCountRef.current = newCount;
                return newCount;
            });
            setIsBellShaking(true);
            setTimeout(() => setIsBellShaking(false), 800);

            // Mostrar toast
            const toastFn = toast[mappedNotif.tipo] || toast.info;
            toastFn(mappedNotif.titulo, mappedNotif.mensaje);
        });

        return () => {
            if (socket) socket.disconnect();
        };
    }
  }, [fetchNotifications, toast]);

  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.put(`${API}/notificaciones/${id}/leer`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || !user.id) return;
    try {
      await axios.put(`${API}/notificaciones/leer-todas/${user.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
      setUnreadCount(0);
      toast.success('Notificaciones leídas', 'Todas tus notificaciones se marcaron como leídas.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isBellShaking,
      isPanelOpen,
      setIsPanelOpen,
      markAsRead,
      markAllAsRead,
      refreshNotifications: fetchNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
