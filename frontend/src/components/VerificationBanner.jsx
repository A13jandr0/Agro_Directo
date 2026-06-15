import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, XCircle, Upload } from 'lucide-react';

const VerificationBanner = ({ userData }) => {
  if (!userData) return null;
  const rol = userData.rol;
  if (rol !== 'PRODUCTOR' && rol !== 'TRANSPORTISTA') return null;

  const perfilPath = rol === 'PRODUCTOR' ?
  '/dashboard/productor/perfil' :
  '/dashboard/transportista/perfil';

  if (userData.estado === 'PENDIENTE_VERIFICACION') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 flex items-center gap-3 text-amber-800">
        <Clock className="w-5 h-5 shrink-0 animate-pulse text-amber-500" />
        <p className="text-sm font-semibold flex-1">
          ⏳ Cuenta pendiente de verificación. Funciones limitadas hasta ser aprobado.
        </p>
        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-200 text-amber-900 animate-pulse">
          Pendiente
        </span>
      </div>);

  }

  if (userData.estado === 'RECHAZADO') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3 text-rose-800">
        <div className="flex items-start gap-3 flex-1">
          <XCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <div>
            <p className="text-sm font-bold"><XCircle size={16} className="inline-block mr-1" /> Tu cuenta fue rechazada</p>
            {userData.motivo_rechazo &&
            <p className="text-xs font-medium mt-1 text-rose-700">Motivo: {userData.motivo_rechazo}</p>
            }
          </div>
        </div>
        <Link
          to={perfilPath}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0">
          
          <Upload className="w-3.5 h-3.5" /> Subir nuevos documentos
        </Link>
      </div>);

  }

  return null;
};

export default VerificationBanner;