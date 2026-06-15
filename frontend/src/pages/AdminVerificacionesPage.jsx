import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ShieldAlert, Mail, Eye, CheckCircle2, XCircle, Search, AlertCircle, X,
  Calendar, Check, ShieldCheck, User, Sparkles, FileText, CheckSquare, Square } from
'lucide-react';
import PageShell from '../components/ui/PageShell';
import PollingIndicator from '../components/PollingIndicator';
import { usePolling } from '../hooks/usePolling';
import { useToast } from '../context/ToastContext';

const AdminVerificacionesPage = () => {
  const toast = useToast();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Pendientes'); // Pendientes | Verificados | Rechazados

  // Review Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDocIndex, setActiveDocIndex] = useState(0);

  // Validation Checklist states
  const [chkIdentidad, setChkIdentidad] = useState(false);
  const [chkDatos, setChkDatos] = useState(false);
  const [chkIdVigencia, setChkIdVigencia] = useState(false);

  // Rejection mode
  const [rechazoMode, setRechazoMode] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/verificaciones', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter out users from request
      setUsuarios(res.data.usuarios || []);
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      toast.error('Error al cargar la lista de solicitudes.');
    } finally {
      setLoading(false);
    }
  };

  const { segundosDesdeUpdate } = usePolling(fetchUsuarios, 30000);

  const handleOpenReview = (user) => {
    setSelectedUser(user);
    setChkIdentidad(false);
    setChkDatos(false);
    setChkIdVigencia(false);
    setRechazoMode(false);
    setMotivoRechazo('');
    setActiveDocIndex(0);
    setIsModalOpen(true);
  };

  const handleAction = async (accion) => {
    if (accion === 'aprobar' && (!chkIdentidad || !chkDatos || !chkIdVigencia)) {
      toast.error('Deberás marcar todos los puntos del checklist antes de aprobar.');
      return;
    }

    if (accion === 'rechazar' && !rechazoMode) {
      setRechazoMode(true);
      return;
    }

    if (accion === 'rechazar' && !motivoRechazo.trim()) {
      toast.error('El motivo de rechazo es obligatorio.');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/verificaciones/${selectedUser.id}`, {
        accion,
        motivo: accion === 'rechazar' ? motivoRechazo : undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (accion === 'aprobar') {
        toast.success("Usuario verificado. Se le notific\xF3.");
        // Update user state locally
        setUsuarios((prev) => prev.map((u) => u.id === selectedUser.id ? { ...u, estado: 'VERIFICADO' } : u));
      } else {
        toast.success('Usuario notificado del rechazo');
        setUsuarios((prev) => prev.map((u) => u.id === selectedUser.id ? { ...u, estado: 'RECHAZADO' } : u));
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Error al procesar la solicitud.');
    } finally {
      setActionLoading(false);
    }
  };

  const getDocumentUrls = (user) => {
    const rawUrl = user.documento?.url || user.url_documento || null;
    if (!rawUrl) return [];
    return rawUrl.
    split(',').
    map((url) => url.trim()).
    filter(Boolean);
  };

  // Document list builder based on role
  const getDocumentList = (user) => {
    const urls = getDocumentUrls(user);

    if (user.rol === 'PRODUCTOR') {
      return [
      { label: 'Cédula de Identidad (CI)', url: urls[0] || null },
      { label: 'Registro Ambiental Único (RAU)', url: urls[1] || null }];

    }

    return [
    { label: 'Cédula de Identidad (CI)', url: urls[0] || null },
    { label: 'Licencia de Conducir', url: urls[1] || null },
    { label: 'SOAT Vigente', url: urls[2] || null }];

  };

  const renderDocumentPreview = (url) => {
    if (!url) {
      return (
        <div className="text-center space-y-2">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <span className="text-xs font-bold text-slate-400 block">Documento no disponible</span>
          <span className="text-[10px] text-slate-400/80 max-w-xs block leading-relaxed font-semibold">
            El usuario aún no subió este archivo o el documento no existe.
          </span>
        </div>);

    }

    const externalUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
    const isPdf = externalUrl.toLowerCase().endsWith('.pdf');

    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
        {isPdf ?
        <iframe
          src={externalUrl}
          title="Documento PDF"
          className="w-full h-full border border-slate-200 rounded-3xl" /> :


        <img
          src={externalUrl}
          alt="Documento adjunto"
          className="max-w-full max-h-full object-contain" />

        }
        <a
          href={externalUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-bold text-indigo-600 hover:underline">
          
          Abrir documento en una nueva pestaña
        </a>
      </div>);

  };

  // Counts based on tab category
  // If user state matches: VERIFICADO -> Verificados, RECHAZADO -> Rechazados, otherwise -> Pendientes
  const pendientesCount = usuarios.filter((u) => u.estado !== 'VERIFICADO' && u.estado !== 'RECHAZADO').length;
  const verificadosCount = usuarios.filter((u) => u.estado === 'VERIFICADO').length;
  const rechazadosCount = usuarios.filter((u) => u.estado === 'RECHAZADO').length;

  const currentList = usuarios.filter((u) => {
    // Search query matching
    const matchesSearch = u.nombre_completo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.correo.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'Pendientes') return u.estado !== 'VERIFICADO' && u.estado !== 'RECHAZADO';
    if (activeTab === 'Verificados') return u.estado === 'VERIFICADO';
    if (activeTab === 'Rechazados') return u.estado === 'RECHAZADO';
    return true;
  });

  return (
    <PageShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex bg-red-50 text-red-700 border border-red-100 px-3 py-1 rounded-full text-xs font-bold items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            Verificaciones
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Solicitudes de Verificación</h1>
          <p className="text-sm text-slate-400 mt-1">Revisá y activá las credenciales de productores y transportistas asociados</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <PollingIndicator segundosDesdeUpdate={segundosDesdeUpdate} />
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-60" />
            
        </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto pb-1 hide-scrollbar">
        {[
        { id: 'Pendientes', label: 'Pendientes', count: pendientesCount, badgeColor: 'bg-red-500 text-white' },
        { id: 'Verificados', label: 'Verificados', count: verificadosCount, badgeColor: 'bg-emerald-500 text-white' },
        { id: 'Rechazados', label: 'Rechazados', count: rechazadosCount, badgeColor: 'bg-slate-400 text-white' }].
        map((t) =>
        <button
          key={t.id}
          onClick={() => setActiveTab(t.id)}
          className={`pb-3 px-2 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
          activeTab === t.id ? 'border-indigo-600 text-indigo-600 font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-600'}`
          }>
          
            <span>{t.label}</span>
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${t.badgeColor}`}>
              {t.count}
            </span>
          </button>
        )}
      </div>

      {/* Grid List */}
      {loading ?
      <div className="py-24 text-center">
          <div className="w-10 h-10 border-[3px] border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-400 font-bold">Cargando solicitudes...</p>
        </div> :
      currentList.length === 0 ?
      <div className="bg-white rounded-3xl border border-slate-200/60 py-16 flex flex-col items-center justify-center text-center px-6 shadow-sm max-w-lg mx-auto">
          <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-5">
            <UserCheck className="w-7 h-7 text-slate-300" />
          </div>
          <h2 className="text-base font-extrabold text-slate-800">No hay solicitudes en esta sección</h2>
          <p className="text-xs text-slate-400 max-w-xs mt-2 font-semibold">
            Los registros del sistema aparecerán aquí cuando requieran revisión de credenciales.
          </p>
        </div> :

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentList.map((u) => {
          const docs = getDocumentList(u);
          const isPending = u.estado !== 'VERIFICADO' && u.estado !== 'RECHAZADO';

          return (
            <div
              key={u.id}
              className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
              
                <div>
                  <div className="flex items-center gap-3 border-b border-slate-50 pb-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-sm shrink-0 ${
                  u.rol === 'PRODUCTOR' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'}`
                  }>
                      {u.nombre_completo.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-slate-800 text-sm truncate">{u.nombre_completo}</h4>
                      <span className="text-[10px] text-slate-400 font-bold block truncate">{u.correo}</span>
                    </div>
                  </div>

                  {/* Badges & dates */}
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-4">
                    <span className={`badge ${
                  u.rol === 'PRODUCTOR' ?
                  'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  'bg-amber-50 text-amber-700 border-amber-200'}`
                  }>
                      {u.rol}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(u.fecha_registro).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Documents checklist preview */}
                  <div className="space-y-2.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Documentación Adjunta</span>
                    {docs.map((doc, idx) =>
                  <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-600 truncate max-w-[160px]">{doc.label}</span>
                        <span className="badge bg-blue-50 text-blue-700 border-blue-100 py-0.5 px-2 text-[9px] font-black">
                          Recibido
                        </span>
                      </div>
                  )}
                  </div>
                </div>

                <div className="border-t border-slate-50 pt-4 mt-5 flex justify-end">
                  {isPending ?
                <button
                  onClick={() => handleOpenReview(u)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5">
                  
                      <Eye className="w-4 h-4" /> Revisar y Validar
                    </button> :

                <div className="flex items-center gap-1.5 text-xs font-bold">
                      {u.estado === 'VERIFICADO' ?
                  <span className="text-emerald-600 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Verificado
                        </span> :

                  <span className="text-rose-600 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4" /> Rechazado
                        </span>
                  }
                    </div>
                }
                </div>
              </div>);

        })}
        </div>
      }

      {/* DOCUMENT REVIEW MODAL */}
      {isModalOpen && selectedUser &&
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-4xl relative z-10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Validación de Credenciales</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{selectedUser.nombre_completo} · {selectedUser.rol}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split layout in Modal: Left Doc viewer, Right Checklist & Actions */}
            <div className="flex-grow overflow-y-auto grid grid-cols-1 md:grid-cols-2">
              
              {/* Left Side: Document View */}
              <div className="p-6 bg-slate-50 border-r border-slate-100 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Documentos del Solicitante</span>
                  <div className="flex gap-2">
                    {getDocumentList(selectedUser).map((doc, idx) =>
                  <button
                    key={idx}
                    onClick={() => setActiveDocIndex(idx)}
                    className={`px-3 py-2 text-[10px] font-bold rounded-xl border transition-all ${
                    activeDocIndex === idx ?
                    'bg-indigo-600 text-white border-indigo-600 shadow-sm' :
                    'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`
                    }>
                    
                        {idx === 0 ? 'Doc 1: CI' : idx === 1 ? selectedUser.rol === 'PRODUCTOR' ? 'Doc 2: RAU' : 'Doc 2: Licencia' : 'Doc 3: SOAT'}
                      </button>
                  )}
                  </div>
                </div>

                {/* Main Doc Image embed or mockup placeholder */}
                <div className="aspect-video bg-white border border-slate-200/80 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner p-4 relative min-h-[200px]">
                  {renderDocumentPreview(getDocumentList(selectedUser)[activeDocIndex]?.url)}
                </div>

                <div className="text-[10px] text-slate-400 font-semibold text-center italic">
                  Presiona los botones superiores para cambiar de documento
                </div>
              </div>

              {/* Right Side: Checklist Validation & Confirmations */}
              <div className="p-6 space-y-6 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Validation Checklist */}
                  <div className="space-y-3">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Puntos de Verificación</span>
                    
                    <div className="space-y-3">
                      {/* Point 1 */}
                      <label className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 cursor-pointer select-none">
                        <button
                        onClick={() => setChkIdentidad(!chkIdentidad)}
                        className="shrink-0 text-indigo-600 mt-0.5">
                        
                          {chkIdentidad ? <CheckSquare className="w-5 h-5 fill-indigo-50 text-indigo-600" /> : <Square className="w-5 h-5 text-slate-300" />}
                        </button>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Identidad legible</span>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-semibold leading-normal">
                            La foto de perfil, cédula de identidad y firmas son nítidas.
                          </p>
                        </div>
                      </label>

                      {/* Point 2 */}
                      <label className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 cursor-pointer select-none">
                        <button
                        onClick={() => setChkDatos(!chkDatos)}
                        className="shrink-0 text-indigo-600 mt-0.5">
                        
                          {chkDatos ? <CheckSquare className="w-5 h-5 fill-indigo-50 text-indigo-600" /> : <Square className="w-5 h-5 text-slate-300" />}
                        </button>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Datos coinciden con registro</span>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-semibold leading-normal">
                            El nombre, CI/RAU y número de teléfono coinciden plenamente.
                          </p>
                        </div>
                      </label>

                      {/* Point 3 */}
                      <label className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 cursor-pointer select-none">
                        <button
                        onClick={() => setChkIdVigencia(!chkIdVigencia)}
                        className="shrink-0 text-indigo-600 mt-0.5">
                        
                          {chkIdVigencia ? <CheckSquare className="w-5 h-5 fill-indigo-50 text-indigo-600" /> : <Square className="w-5 h-5 text-slate-300" />}
                        </button>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Documento vigente</span>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-semibold leading-normal">
                            Las fechas de expedición y SOAT no están vencidas.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Rejection reason if active */}
                  {rechazoMode &&
                <div className="space-y-2 animate-fade-in">
                      <label className="block text-xs font-black text-rose-600 uppercase tracking-wider">Motivo de Rechazo *</label>
                      <textarea
                    rows="3"
                    value={motivoRechazo}
                    onChange={(e) => setMotivoRechazo(e.target.value)}
                    placeholder="Describí los motivos específicos de la desaprobación..."
                    className="w-full px-4 py-3 bg-rose-50/20 border border-rose-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none text-slate-800" />
                  
                    </div>
                }
                </div>

                {/* Confirmations */}
                <div className="flex gap-3 border-t border-slate-100 pt-4">
                  {rechazoMode ?
                <>
                      <button
                    onClick={() => setRechazoMode(false)}
                    className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-xs border border-slate-200">
                    
                        Cancelar
                      </button>
                      <button
                    onClick={() => handleAction('rechazar')}
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-rose-900/10">
                    
                        Confirmar Rechazo
                      </button>
                    </> :

                <>
                      <button
                    onClick={() => handleAction('rechazar')}
                    disabled={actionLoading}
                    className="flex-1 py-3 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5">
                    
                        <XCircle className="w-4 h-4" /> Rechazar
                      </button>
                      <button
                    onClick={() => handleAction('aprobar')}
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-1.5">
                    
                        <CheckCircle2 className="w-4 h-4" /> Aprobar
                      </button>
                    </>
                }
                </div>
              </div>

            </div>
          </div>
        </div>
      }
    </PageShell>);

};

export default AdminVerificacionesPage;