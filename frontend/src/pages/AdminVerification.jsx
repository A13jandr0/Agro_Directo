import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, CheckCircle, XCircle, FileText, Eye, X, Loader2, AlertCircle, Users, Clock } from 'lucide-react';

const API = 'http://localhost:5000/api';

const AdminVerification = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchPendingUsers(); }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/admin/verificaciones`);
      setUsers(res.data.usuarios || res.data);
    } catch (error) {
      console.error('Error fetching pending users', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar y buscar
  const filteredUsers = users
    .filter(u => filterRole === 'Todos' || u.rol === filterRole)
    .filter(u => !searchTerm || u.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) || u.correo?.toLowerCase().includes(searchTerm.toLowerCase()));

  const openModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
    setRejectReason('');
    setShowRejectInput(false);
    setActionError('');
    setActionSuccess('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setShowRejectInput(false);
    setRejectReason('');
  };

  const handleAction = async (accion) => {
    setActionError('');
    setActionSuccess('');

    if (accion === 'rechazar' && !rejectReason.trim()) {
      setActionError('El motivo de rechazo es obligatorio.');
      return;
    }

    setProcessing(true);
    try {
      await axios.put(`${API}/admin/verificaciones/${selectedUser.id}`, {
        accion,
        motivo: accion === 'rechazar' ? rejectReason : undefined
      });

      setActionSuccess(`Usuario ${accion === 'aprobar' ? 'aprobado' : 'rechazado'} exitosamente.`);
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));

      setTimeout(() => closeModal(), 1500);
    } catch (error) {
      setActionError(error.response?.data?.error || 'Error al procesar la solicitud.');
    } finally {
      setProcessing(false);
    }
  };

  const getRoleBadge = (rol) => {
    const styles = {
      PRODUCTOR: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      TRANSPORTISTA: 'bg-blue-100 text-blue-800 border-blue-200',
      COMPRADOR: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return (
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${styles[rol] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {rol}
      </span>
    );
  };

  const isImage = (url) => url && /\.(jpeg|jpg|gif|png)$/i.test(url);

  return (
    <div className="max-w-6xl mx-auto mt-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6" />Panel de Verificación</h1>
              <p className="text-gray-300 text-sm mt-1">Gestiona las solicitudes de verificación de usuarios</p>
            </div>
            <div className="bg-amber-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5" />{filteredUsers.length} pendientes
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar por nombre o correo..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="Todos">Todos los roles</option>
              <option value="PRODUCTOR">Productores</option>
              <option value="TRANSPORTISTA">Transportistas</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />Cargando usuarios...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <span className="text-5xl block mb-3">🎉</span>
              <p className="font-medium">No hay usuarios pendientes de verificación.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Usuario</th>
                  <th className="px-6 py-3 text-left">Rol</th>
                  <th className="px-6 py-3 text-left">Documento</th>
                  <th className="px-6 py-3 text-left">Fecha Registro</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{user.nombre_completo}</p>
                      <p className="text-gray-500 text-xs">{user.correo}</p>
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(user.rol)}</td>
                    <td className="px-6 py-4">
                      {user.documento?.url ? (
                        <span className="text-emerald-600 flex items-center gap-1 text-xs font-medium"><FileText className="w-4 h-4" />Adjunto</span>
                      ) : (
                        <span className="text-gray-400 text-xs">Sin documento</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{new Date(user.fecha_registro).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => openModal(user)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 mx-auto">
                        <Eye className="w-4 h-4" />Revisar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header Modal */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-start">
              <div>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Pendiente de Verificación</span>
                <h3 className="text-xl font-bold text-gray-800 mt-2">{selectedUser.nombre_completo}</h3>
                <p className="text-gray-500 text-sm">{selectedUser.correo} · {selectedUser.celular}</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
            </div>

            {/* Body Modal */}
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="block text-[10px] text-gray-400 uppercase font-bold">Rol</span>{getRoleBadge(selectedUser.rol)}</div>
                <div><span className="block text-[10px] text-gray-400 uppercase font-bold">Registro</span>
                  <span className="text-sm font-medium text-gray-700">{new Date(selectedUser.fecha_registro).toLocaleString()}</span>
                </div>
                {selectedUser.documento?.finca && (
                  <div><span className="block text-[10px] text-gray-400 uppercase font-bold">Finca</span>
                    <span className="text-sm font-medium text-gray-700">{selectedUser.documento.finca}</span>
                  </div>
                )}
                {selectedUser.documento?.placa && (
                  <div><span className="block text-[10px] text-gray-400 uppercase font-bold">Placa</span>
                    <span className="text-sm font-medium text-gray-700">{selectedUser.documento.placa}</span>
                  </div>
                )}
              </div>

              {/* Documento Subido */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2 text-sm flex items-center gap-1"><FileText className="w-4 h-4" />Documento Subido</h4>
                <div className="bg-gray-50 rounded-xl p-4 min-h-[120px] flex items-center justify-center border border-gray-200">
                  {!selectedUser.documento?.url ? (
                    <span className="text-gray-400 text-sm">El usuario no ha subido documento aún.</span>
                  ) : isImage(selectedUser.documento.url) ? (
                    <img src={`http://localhost:5000${selectedUser.documento.url}`} alt="Documento" className="max-h-48 object-contain rounded-lg" />
                  ) : (
                    <a href={`http://localhost:5000${selectedUser.documento.url}`} target="_blank" rel="noreferrer"
                      className="text-blue-600 hover:underline flex flex-col items-center gap-2">
                      <FileText className="w-10 h-10" />Ver Documento
                    </a>
                  )}
                </div>
              </div>

              {/* Mensajes */}
              {actionError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />{actionError}
                </div>
              )}
              {actionSuccess && (
                <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm font-bold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />{actionSuccess}
                </div>
              )}

              {/* Input de rechazo (aparece al hacer clic en Rechazar) */}
              {showRejectInput && !actionSuccess && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Motivo de rechazo <span className="text-red-500">*</span></label>
                  <textarea className="w-full border border-red-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm" rows="3"
                    placeholder="Describa el motivo del rechazo (obligatorio)..."
                    value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
                </div>
              )}

              {/* Botones de Acción */}
              {!actionSuccess && (
                <div className="flex gap-3 pt-2">
                  {!showRejectInput ? (
                    <>
                      <button onClick={() => handleAction('aprobar')} disabled={processing}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50">
                        {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                        Aprobar
                      </button>
                      <button onClick={() => setShowRejectInput(true)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2">
                        <XCircle className="w-5 h-5" />Rechazar
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setShowRejectInput(false); setRejectReason(''); setActionError(''); }}
                        className="flex-1 border border-gray-300 text-gray-600 font-bold py-3 rounded-xl transition hover:bg-gray-50">
                        Cancelar
                      </button>
                      <button onClick={() => handleAction('rechazar')} disabled={processing}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50">
                        {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                        Confirmar Rechazo
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerification;
