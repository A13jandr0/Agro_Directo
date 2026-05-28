import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, LayoutDashboard, Sprout, PlusCircle, ShoppingBag, MapPin, BarChart2, User, Settings, LogOut, 
  Menu, Bell, CheckCircle2, AlertCircle, Camera, Star, Package, Calendar, TrendingUp, FileText, Upload,
  Mail, Phone, Lock, Save, X, Eye, EyeOff
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const MiPerfilProductorPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Personal');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para Documentos
  const [fileCI, setFileCI] = useState(null);
  const [fileRAU, setFileRAU] = useState(null);
  const [hasCI, setHasCI] = useState(false);
  const [hasRAU, setHasRAU] = useState(false);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);

  // Estados de Formulario - Personal
  const [formDataPersonal, setFormDataPersonal] = useState({
    nombreCompleto: '',
    correo: '',
    celular: '',
    tipoProductor: 'Individual',
    aniosExperiencia: 0,
    tipoDocumento: 'CI',
    numeroDocumento: '',
    estado: 'Pendiente_Verificacion',
    fechaRegistro: ''
  });

  // Estados de Formulario - Finca
  const [formDataFinca, setFormDataFinca] = useState({
    nombreFinca: '',
    departamento: 'Santa Cruz',
    provincia: '',
    municipio: '',
    descripcionFinca: 'Terreno de 50 hectáreas dedicado a la agricultura sostenible y producción orgánica de granos y hortalizas.'
  });

  // Estados de Formulario - Seguridad
  const [formDataSeguridad, setFormDataSeguridad] = useState({
    passwordActual: '',
    nuevaPassword: '',
    confirmarPassword: ''
  });

  const [showPassword, setShowPassword] = useState({
    actual: false,
    nueva: false,
    confirmar: false
  });

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      const res = await axios.get('http://localhost:5000/api/usuarios/mi-perfil', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      
      setFormDataPersonal({
        nombreCompleto: data.nombre_completo || '',
        correo: data.correo || '',
        celular: data.celular || '',
        tipoProductor: data.tipo_productor || 'Individual',
        aniosExperiencia: data.anios_experiencia || 0,
        tipoDocumento: data.tipo_documento || 'CI',
        numeroDocumento: data.numero_documento || '',
        estado: data.estado || 'Pendiente_Verificacion',
        fechaRegistro: data.fecha_registro ? new Date(data.fecha_registro).toLocaleDateString() : 'N/A'
      });

      setFormDataFinca({
        nombreFinca: data.nombre_finca || '',
        departamento: data.departamento || 'Santa Cruz',
        provincia: data.provincia || '',
        municipio: data.municipio || '',
        descripcionFinca: 'Terreno dedicado a la agricultura sostenible y producción de granos y hortalizas.'
      });

      if (data.url_documento) {
        if (data.url_documento.includes('documento_ci')) setHasCI(true);
        if (data.url_documento.includes('documento_rau')) setHasRAU(true);
      }
    } catch (error) {
      console.error("Error fetching profile", error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        toast.error("Error al cargar los datos del perfil");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  // Cálculo de fortaleza de contraseña
  const getPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    return strength; 
  };
  const passStrength = getPasswordStrength(formDataSeguridad.nuevaPassword);
  const strengthColors = ['bg-gray-200', 'bg-red-500', 'bg-yellow-500', 'bg-green-500'];

  const handleSave = async () => {
    setIsSaving(true);
    const loadingToast = toast.loading('Guardando cambios...');
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/productor/perfil', {
        nombre_completo: formDataPersonal.nombreCompleto,
        celular: formDataPersonal.celular,
        tipo_productor: formDataPersonal.tipoProductor,
        anios_experiencia: formDataPersonal.aniosExperiencia,
        tipo_documento: formDataPersonal.tipoDocumento,
        numero_documento: formDataPersonal.numeroDocumento,
        nombre_finca: formDataFinca.nombreFinca,
        municipio: formDataFinca.municipio,
        provincia: formDataFinca.provincia,
        departamento: formDataFinca.departamento
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Perfil actualizado correctamente', { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar el perfil', { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadDocumentos = async () => {
    if (!fileCI && !fileRAU) return;
    setIsUploadingDocs(true);
    const loadingToast = toast.loading('Subiendo documentos...');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      if (fileCI) formData.append('documento_ci', fileCI);
      if (fileRAU) formData.append('documento_rau', fileRAU);

      await axios.post('http://localhost:5000/api/usuarios/documentos', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      toast.success('Documentos enviados correctamente', { id: loadingToast });
      setFileCI(null);
      setFileRAU(null);
      await fetchProfile();
    } catch (error) {
      console.error(error);
      toast.error('Error al subir los documentos', { id: loadingToast });
    } finally {
      setIsUploadingDocs(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold animate-pulse">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/20 shrink-0">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mi Perfil</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Configuración de Cuenta y Seguridad</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* COLUMNA IZQUIERDA (320px) */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 shrink-0">
              
              {/* Card de Perfil */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-[120px] h-[120px] rounded-full bg-[#1D9E75] text-white flex items-center justify-center text-4xl font-bold border-4 border-[#E1F5EE]">
                    {getInitials(formDataPersonal.nombreCompleto)}
                  </div>
                  <button className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-white border border-gray-200 text-[#1a1a1a] rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold hover:bg-gray-50 shadow-sm whitespace-nowrap">
                    <Camera className="w-3.5 h-3.5" /> Cambiar foto
                  </button>
                </div>
                
                <h2 className="text-xl font-bold text-[#1a1a1a] mt-4">{formDataPersonal.nombreCompleto}</h2>
                {formDataPersonal.estado === 'VERIFICADO' ? (
                  <div className="flex items-center gap-1.5 mt-1.5 mb-4 text-[#1D9E75] bg-[#E1F5EE] px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" /> Verificado
                  </div>
                ) : formDataPersonal.estado === 'PENDIENTE_VERIFICACION' ? (
                  <div className="flex items-center gap-1.5 mt-1.5 mb-4 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" /> Pendiente de Verificación
                  </div>
                ) : formDataPersonal.estado === 'RECHAZADO' ? (
                  <div className="flex items-center gap-1.5 mt-1.5 mb-4 text-red-700 bg-red-50 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" /> Rechazado
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mt-1.5 mb-4 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" /> {formDataPersonal.estado || 'Registrado'}
                  </div>
                )}
                
                <div className="w-full space-y-2 text-sm text-[#6b7280] bg-gray-50 p-3 rounded-lg text-left">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-gray-400" /> <span className="truncate">{formDataFinca.nombreFinca}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" /> <span className="truncate">{formDataFinca.municipio}, {formDataFinca.departamento}</span>
                  </div>
                </div>
              </div>

              {/* Card de Calificación */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
                <div className="flex gap-1 mb-2 text-[#F59E0B]">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className={`w-6 h-6 ${star === 5 ? 'fill-gray-200 text-gray-200' : 'fill-current'}`} />
                  ))}
                </div>
                <h3 className="text-3xl font-bold text-[#1a1a1a]">4.8 <span className="text-lg text-gray-400 font-medium">/ 5.0</span></h3>
                <p className="text-xs text-[#6b7280] mt-1">Basado en 18 calificaciones</p>
              </div>

              {/* Estadísticas Rápidas */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-sm font-bold text-[#1a1a1a] mb-4 uppercase tracking-wider text-gray-500">Resumen de Actividad</h3>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0"><Package className="w-4 h-4" /></div>
                    <span className="text-sm text-[#1a1a1a] font-medium">34 ventas completadas</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 shrink-0"><Calendar className="w-4 h-4" /></div>
                    <span className="text-sm text-[#1a1a1a] font-medium">Miembro desde marzo 2024</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500 shrink-0"><Sprout className="w-4 h-4" /></div>
                    <span className="text-sm text-[#1a1a1a] font-medium">7 productos activos</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0"><TrendingUp className="w-4 h-4" /></div>
                    <span className="text-sm text-[#1a1a1a] font-medium">Bs. 8,450 en ventas totales</span>
                  </li>
                </ul>
              </div>

              {/* Card de Documentos */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-[#1D9E75]" />
                  <h3 className="text-sm font-bold text-[#1a1a1a] uppercase tracking-wider text-gray-500">Mis documentos</h3>
                </div>
                
                {hasCI && hasRAU ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-emerald-800 font-bold text-sm">Documentos enviados</h4>
                      <p className="text-emerald-700 text-xs mt-1">Tus documentos han sido subidos y están en revisión por el administrador.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-100 rounded-lg">
                          <span className="text-xs font-semibold text-[#1a1a1a]">Carnet de Identidad</span>
                          {fileCI || hasCI ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-yellow-500" />}
                        </div>
                        {!hasCI && (
                          <label className="flex items-center gap-2 p-2 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors">
                            <Upload className="w-4 h-4 text-gray-400" />
                            <span className="text-[10px] text-gray-500 font-medium truncate">{fileCI ? fileCI.name : 'Subir CI (.pdf/.jpg)'}</span>
                            <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFileCI(e.target.files[0])} />
                          </label>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-100 rounded-lg">
                          <span className="text-xs font-semibold text-[#1a1a1a]">RAU (Registro Agropecuario)</span>
                          {fileRAU || hasRAU ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-yellow-500" />}
                        </div>
                        {!hasRAU && (
                          <label className="flex items-center gap-2 p-2 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors">
                            <Upload className="w-4 h-4 text-gray-400" />
                            <span className="text-[10px] text-gray-500 font-medium truncate">{fileRAU ? fileRAU.name : 'Subir RAU (.pdf/.jpg)'}</span>
                            <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFileRAU(e.target.files[0])} />
                          </label>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={handleUploadDocumentos}
                      disabled={isUploadingDocs || (!fileCI && !fileRAU)}
                      className="w-full bg-[#1a1a1a] border border-gray-200 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-black transition-colors text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                      {isUploadingDocs ? 'Subiendo...' : <><Upload className="w-4 h-4" /> Enviar documentos</>}
                    </button>
                  </>
                )}
              </div>

            </div>

            {/* COLUMNA DERECHA (Formulario de edición) */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-max">
              
              {/* TABS DE EDICIÓN */}
              <div className="flex border-b border-gray-100 bg-gray-50/50 overflow-x-auto hide-scrollbar shrink-0">
                {['Personal', 'Finca', 'Seguridad'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap px-6 py-4 text-sm font-bold transition-colors border-b-2 ${
                      activeTab === tab 
                        ? 'border-[#1D9E75] text-[#1D9E75] bg-white' 
                        : 'border-transparent text-[#6b7280] hover:text-[#1a1a1a] hover:bg-gray-100/50'
                    }`}
                  >
                    {tab === 'Personal' && 'Información personal'}
                    {tab === 'Finca' && 'Información de la finca'}
                    {tab === 'Seguridad' && 'Seguridad'}
                  </button>
                ))}
              </div>

              {/* CONTENIDO DEL TAB */}
              <div className="p-6 md:p-8 flex-1">
                
                {/* TAB: PERSONAL */}
                {activeTab === 'Personal' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5 flex items-center gap-2"><User className="w-4 h-4 text-gray-400"/> Nombre completo</label>
                        <input type="text" value={formDataPersonal.nombreCompleto} onChange={e => setFormDataPersonal({...formDataPersonal, nombreCompleto: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5 flex items-center gap-2 justify-between">
                          <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400"/> Correo electrónico</span>
                          <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">No editable</span>
                        </label>
                        <input type="email" value={formDataPersonal.correo} disabled className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5 flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400"/> Número de celular</label>
                        <input type="text" value={formDataPersonal.celular} onChange={e => setFormDataPersonal({...formDataPersonal, celular: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Tipo de productor</label>
                        <select value={formDataPersonal.tipoProductor} onChange={e => setFormDataPersonal({...formDataPersonal, tipoProductor: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] bg-white">
                          <option>Individual</option>
                          <option>Asociación</option>
                          <option>Cooperativa</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Años de experiencia</label>
                        <input type="number" value={formDataPersonal.aniosExperiencia} onChange={e => setFormDataPersonal({...formDataPersonal, aniosExperiencia: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Tipo doc.</label>
                          <select value={formDataPersonal.tipoDocumento} onChange={e => setFormDataPersonal({...formDataPersonal, tipoDocumento: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] bg-white">
                            <option>CI</option>
                            <option>NIT</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Número doc.</label>
                          <input type="text" value={formDataPersonal.numeroDocumento} onChange={e => setFormDataPersonal({...formDataPersonal, numeroDocumento: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: FINCA */}
                {activeTab === 'Finca' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5 flex items-center gap-2"><Leaf className="w-4 h-4 text-gray-400"/> Nombre de la finca</label>
                      <input type="text" value={formDataFinca.nombreFinca} onChange={e => setFormDataFinca({...formDataFinca, nombreFinca: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Departamento</label>
                        <select value={formDataFinca.departamento} onChange={e => setFormDataFinca({...formDataFinca, departamento: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] bg-white">
                          <option>Santa Cruz</option>
                          <option>La Paz</option>
                          <option>Cochabamba</option>
                          <option>Beni</option>
                          <option>Pando</option>
                          <option>Oruro</option>
                          <option>Potosí</option>
                          <option>Tarija</option>
                          <option>Chuquisaca</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Provincia</label>
                        <input type="text" value={formDataFinca.provincia} onChange={e => setFormDataFinca({...formDataFinca, provincia: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Municipio</label>
                        <input type="text" value={formDataFinca.municipio} onChange={e => setFormDataFinca({...formDataFinca, municipio: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Descripción de la finca</label>
                      <textarea rows="4" value={formDataFinca.descripcionFinca} onChange={e => setFormDataFinca({...formDataFinca, descripcionFinca: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] resize-none" placeholder="Cuéntanos más sobre tu producción..." />
                    </div>
                  </div>
                )}

                {/* TAB: SEGURIDAD */}
                {activeTab === 'Seguridad' && (
                  <div className="space-y-6 animate-fade-in max-w-md">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                      <Lock className="w-5 h-5 text-emerald-500 mt-0.5" />
                      <p className="text-xs text-emerald-700 leading-relaxed font-medium">Recomendamos usar una contraseña fuerte que combine letras, números y símbolos para mayor seguridad.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="relative">
                        <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Contraseña actual</label>
                        <input type={showPassword.actual ? "text" : "password"} value={formDataSeguridad.passwordActual} onChange={e => setFormDataSeguridad({...formDataSeguridad, passwordActual: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" />
                        <button type="button" onClick={() => setShowPassword({...showPassword, actual: !showPassword.actual})} className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600">
                          {showPassword.actual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Nueva contraseña</label>
                        <input type={showPassword.nueva ? "text" : "password"} value={formDataSeguridad.nuevaPassword} onChange={e => setFormDataSeguridad({...formDataSeguridad, nuevaPassword: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" />
                        <button type="button" onClick={() => setShowPassword({...showPassword, nueva: !showPassword.nueva})} className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600">
                          {showPassword.nueva ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        
                        {/* Indicador de fuerza */}
                        <div className="mt-2 flex gap-1 h-1">
                          {[1, 2, 3].map(i => (
                            <div key={i} className={`flex-1 rounded-full ${i <= passStrength ? strengthColors[passStrength] : 'bg-gray-100'}`}></div>
                          ))}
                        </div>
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Confirmar contraseña</label>
                        <input type={showPassword.confirmar ? "text" : "password"} value={formDataSeguridad.confirmarPassword} onChange={e => setFormDataSeguridad({...formDataSeguridad, confirmarPassword: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" />
                        <button type="button" onClick={() => setShowPassword({...showPassword, confirmar: !showPassword.confirmar})} className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600">
                          {showPassword.confirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <button className="w-full bg-[#1a1a1a] text-white py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-black transition-colors">
                        Actualizar contraseña
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* FOOTER DE ACCIONES GLOBAL */}
              {activeTab !== 'Seguridad' && (
                <div className="p-6 md:p-8 pt-0 border-t border-gray-100 bg-gray-50/30 flex items-center justify-end gap-3 shrink-0 mt-auto">
                  <button className="px-5 py-2.5 bg-white border border-gray-200 text-[#1a1a1a] rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-[#1D9E75] text-white rounded-lg text-sm font-bold hover:bg-[#0F6E56] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Guardar cambios
                  </button>
                </div>
              )}

      </div>
    </div>
  </div>
);
};

export default MiPerfilProductorPage;
