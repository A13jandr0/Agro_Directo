import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Mail, Eye, CheckCircle2, XCircle, Search, AlertCircle, X, ShieldAlert, LogOut, Map as MapIcon } from 'lucide-react';
import MapaCalorSponsor from '../components/MapaCalorSponsor';

const PanelAdminPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rechazoMode, setRechazoMode] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const res = await axios.get('http://localhost:5000/api/admin/verificaciones', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(res.data.usuarios);
    } catch (error) {
      console.error('Error fetching admin data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setRechazoMode(false);
    setMotivo('');
    setIsModalOpen(true);
  };

  const handleAction = async (accion) => {
    if (accion === 'rechazar' && !rechazoMode) {
      setRechazoMode(true);
      return;
    }
    if (accion === 'rechazar' && !motivo.trim()) {
      alert('El motivo es obligatorio para rechazar.');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/verificaciones/${selectedUser.id}`, {
        accion,
        motivo: accion === 'rechazar' ? motivo : undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(`Usuario ${accion === 'aprobar' ? 'aprobado' : 'rechazado'} correctamente.`);
      setIsModalOpen(false);
      setUsuarios(prev => prev.filter(u => u.id !== selectedUser.id));
    } catch (error) {
      console.error('Error en la accion:', error);
      alert('Error al procesar la solicitud.');
    } finally {
      setActionLoading(false);
    }
  };

  const renderDocumentLinks = (urlStr) => {
    if (!urlStr) return <p className="text-sm text-gray-500">No se subieron documentos.</p>;
    const urls = urlStr.split(',');
    return (
      <div className="flex flex-col gap-3 mt-4">
        {urls.map((url, i) => {
          const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)$/) != null;
          return (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
               <a href={`http://localhost:5000${url}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline mb-2 font-semibold">
                 <Eye className="w-5 h-5" /> Abrir Documento {i + 1}
               </a>
               {isImage && (
                 <img src={`http://localhost:5000${url}`} alt="Documento adjunto" className="max-w-full h-auto max-h-64 object-contain border border-gray-100 rounded" />
               )}
            </div>
          )
        })}
      </div>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans">
      {/* Background */}
      <div className="fixed inset-0 dot-pattern opacity-20 pointer-events-none" />
      
      {/* HEADER ADMIN */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-tight">AgroDirecto</h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Admin Panel</span>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl transition-all duration-300">
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        
        <div className="mb-8 animate-slide-up">
          <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Solicitudes de Verificación</h2>
          <p className="text-slate-500 font-medium">Revisa los documentos subidos por los productores y transportistas para activar sus cuentas.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center animate-pulse mb-4">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="w-48 h-2 rounded-full animate-shimmer mb-3" />
            <p className="font-medium text-slate-400 text-sm">Cargando solicitudes...</p>
          </div>
        ) : (
          <div className="card-elevated overflow-hidden animate-slide-up">
            {usuarios.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
                  <ShieldCheck className="w-10 h-10 text-emerald-300" />
                </div>
                <h3 className="text-xl font-black text-slate-900">No hay solicitudes pendientes</h3>
                <p className="text-slate-500 mt-2 font-medium">Todos los usuarios en el sistema han sido verificados.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-400 text-[10px] uppercase font-black tracking-[0.15em] border-b border-slate-100">
                      <th className="px-6 py-4">Usuario</th>
                      <th className="px-6 py-4">Rol</th>
                      <th className="px-6 py-4">Contacto</th>
                      <th className="px-6 py-4">Fecha de Registro</th>
                      <th className="px-6 py-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {usuarios.map(u => (
                      <tr key={u.id} className="table-row-hover group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shrink-0 shadow-lg ${u.rol === 'PRODUCTOR' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'}`}>
                              {u.nombre_completo.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-900">{u.nombre_completo}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${u.rol === 'PRODUCTOR' ? 'badge-success' : 'badge-warning'}`}>
                            {u.rol}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-600 flex flex-col gap-1">
                            <span className="flex items-center gap-1.5 font-medium"><Mail className="w-3.5 h-3.5 text-slate-400" />{u.correo}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                          {new Date(u.fecha_registro).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => handleOpenModal(u)} className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm hover:shadow group">
                            <Eye className="w-4 h-4" /> Revisar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ESTRATEGIA BI - US20 */}
        <div className="mt-12 mb-20 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="mb-6">
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <MapIcon className="w-5 h-5 text-white" />
              </div>
              Inteligencia de Mercado
            </h2>
            <p className="text-slate-500 font-medium">Visualización avanzada de los flujos de producción y concentración de demanda.</p>
          </div>
          <MapaCalorSponsor />
        </div>
      </div>

      {/* MODAL DE REVISIÓN */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4 sm:p-6 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-emerald-600" /> Revisión de Documentos
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-gray-50">
              <div className="mb-6 p-5 bg-white rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-black text-gray-900 text-xl">{selectedUser.nombre_completo}</h3>
                <p className="text-sm text-gray-500 mb-3">{selectedUser.correo} • <span className="font-semibold text-gray-700">{selectedUser.rol}</span></p>
                {selectedUser.documento?.tipo && (
                  <div className="inline-block bg-gray-100 px-3 py-1.5 rounded text-sm font-semibold text-gray-700">
                    Doc Registrado: {selectedUser.documento.tipo} ({selectedUser.documento.numero})
                  </div>
                )}
              </div>

              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-600" /> Evidencia Subida:</h4>
              {renderDocumentLinks(selectedUser.documento?.url)}

              {rechazoMode && (
                <div className="mt-6 bg-red-50 p-5 rounded-xl border border-red-200 shadow-inner">
                  <label className="block text-sm font-bold text-red-900 mb-2">Motivo del rechazo (obligatorio)</label>
                  <textarea 
                    rows="3" 
                    value={motivo} 
                    onChange={e => setMotivo(e.target.value)} 
                    placeholder="Escribe por qué se están rechazando estos documentos (el usuario verá esto)..."
                    className="w-full border border-red-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  />
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-white flex gap-4 justify-end shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              {rechazoMode ? (
                <>
                  <button onClick={() => setRechazoMode(false)} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm">
                    Cancelar
                  </button>
                  <button disabled={actionLoading} onClick={() => handleAction('rechazar')} className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center gap-2 shadow-md disabled:opacity-50">
                    <XCircle className="w-5 h-5" /> Confirmar Rechazo
                  </button>
                </>
              ) : (
                <>
                  <button disabled={actionLoading} onClick={() => handleAction('rechazar')} className="px-6 py-2.5 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50">
                    <XCircle className="w-5 h-5" /> Rechazar
                  </button>
                  <button disabled={actionLoading} onClick={() => handleAction('aprobar')} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 hover:shadow-lg transition-all flex items-center gap-2 shadow-md disabled:opacity-50 transform hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5" /> Aprobar Documentos
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default PanelAdminPage;
