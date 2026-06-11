import React from 'react';
import { Check, CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ListaNotificaciones = ({ notificaciones, onClose, onMarcarLeida, onMarcarTodasLeidas }) => {
  const navigate = useNavigate();

  const handleNotificacionClick = (notificacion) => {
    if (!notificacion.leida) {
      onMarcarLeida(notificacion.id);
    }
    
    // Redirigir según tipo
    if (notificacion.pedido_id) {
      // Intentar navegar a historial (el componente de cada vista se encarga de mostrarlo)
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const rol = JSON.parse(userStr).rol;
        if (rol === 'COMPRADOR') navigate('/dashboard/comprador/mis-pedidos');
        else if (rol === 'PRODUCTOR') navigate('/dashboard/productor/pedidos');
        else if (rol === 'TRANSPORTISTA') navigate('/dashboard/transportista');
      }
    }
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden flex flex-col max-h-[500px]">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <h3 className="font-bold text-slate-800">Notificaciones</h3>
        <div className="flex items-center gap-2">
          {notificaciones.some(n => !n.leida) && (
            <button 
              onClick={onMarcarTodasLeidas}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Marcar todas
            </button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {notificaciones.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm font-semibold">
            No tienes notificaciones
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notificaciones.map((notif) => (
              <div 
                key={notif.id} 
                onClick={() => handleNotificacionClick(notif)}
                className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors flex gap-3 ${!notif.leida ? 'bg-blue-50/30' : ''}`}
              >
                {!notif.leida && (
                  <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm ${!notif.leida ? 'font-bold text-slate-800' : 'font-semibold text-slate-600'}`}>
                    {notif.titulo}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {notif.mensaje}
                  </p>
                  <span className="text-[10px] font-bold text-slate-400 mt-2 block">
                    {new Date(notif.fecha_creacion).toLocaleString('es-BO')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaNotificaciones;
