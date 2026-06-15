import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  User, CheckCircle2, AlertCircle, Camera, FileText, Upload,
  Mail, Phone, Lock, Save, X, Eye, EyeOff, Loader2, Sparkles, CreditCard, Clock, Check } from
'lucide-react';
import { useToast } from '../context/ToastContext';
import PageShell from '../components/ui/PageShell';

const MiPerfilProductorPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);

  // File Upload State
  const [fileCI, setFileCI] = useState(null);
  const [fileRAU, setFileRAU] = useState(null);

  // QR State
  const [banco, setBanco] = useState('BNB');
  const [titular, setTitular] = useState('');
  const [qrImagePreview, setQrImagePreview] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    nombre_completo: '',
    correo: '',
    celular: '',
    bio: 'Terreno de 50 hectáreas dedicado a la agricultura sostenible y producción orgánica de granos y hortalizas.',
    nombre_finca: '',
    municipio: '',
    provincia: '',
    departamento: 'Santa Cruz'
  });

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    try {
      const res = await axios.get('http://localhost:5000/api/usuarios/mi-perfil', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(res.data);
      setFormData({
        nombre_completo: res.data.nombre_completo || '',
        correo: res.data.correo || '',
        celular: res.data.celular || '',
        bio: res.data.bio || 'Centro de producción familiar con compromiso en calidad y frescura directa.',
        nombre_finca: res.data.nombre_finca || '',
        municipio: res.data.municipio || '',
        provincia: res.data.provincia || '',
        departamento: res.data.departamento || 'Santa Cruz'
      });
    } catch (err) {
      console.error(err);
      toast.error('No se pudieron cargar los datos de tu perfil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    const savedQR = JSON.parse(localStorage.getItem('productorQR'));
    if (savedQR) {
      setBanco(savedQR.banco || 'BNB');
      setTitular(savedQR.titular || '');
      setQrImagePreview(savedQR.qrImageUrl || null);
    }
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (file, field) => {
    if (!file) return;

    if (field === 'ci') {
      setFileCI(file);
    } else if (field === 'rau') {
      setFileRAU(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/productor/perfil', {
        nombre_completo: formData.nombre_completo,
        celular: formData.celular,
        tipo_productor: userData?.tipo_productor || 'Individual',
        anios_experiencia: userData?.anios_experiencia || 5,
        tipo_documento: userData?.tipo_documento || 'CI',
        numero_documento: userData?.numero_documento || '1234567',
        nombre_finca: formData.nombre_finca,
        municipio: formData.municipio,
        provincia: formData.provincia,
        departamento: formData.departamento
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Perfil guardado correctamente');
      fetchProfile();
    } catch (err) {
      toast.error('Error al guardar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadDocs = async () => {
    if (!fileCI && !fileRAU) return;
    setIsUploadingDocs(true);
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      if (fileCI) data.append('documento_ci', fileCI);
      if (fileRAU) data.append('documento_rau', fileRAU);

      await axios.post('http://localhost:5000/api/usuarios/documentos', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Documentos de acreditación subidos para revisión');
      setFileCI(null);
      setFileRAU(null);
      fetchProfile();
    } catch (err) {
      toast.error('Error al subir los documentos');
    } finally {
      setIsUploadingDocs(false);
    }
  };

  const handleQRUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setQrImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSaveQR = () => {
    if (!titular || !qrImagePreview) {
      toast.error('Completá el nombre del titular y subí la imagen de tu QR');
      return;
    }
    localStorage.setItem('productorQR', JSON.stringify({
      banco, titular, qrImageUrl: qrImagePreview
    }));
    toast.success('Datos de cobro guardados exitosamente');
  };

  const getInitials = (name) => {
    if (!name) return 'P';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto" />
      </div>);

  }

  const estado = userData?.estado || 'PENDIENTE_VERIFICACION';
  const isVerified = estado === 'VERIFICADO';
  const isRejected = estado === 'RECHAZADO';
  const isPending = estado === 'PENDIENTE_VERIFICACION' || estado === 'PENDIENTE';

  return (
    <PageShell>
      {/* Header Perfil */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6">
        <div className="relative group shrink-0">
          <div className="w-24 h-24 rounded-full bg-emerald-600 text-white flex items-center justify-center text-3xl font-black border-4 border-emerald-50 shadow-md">
            {getInitials(formData.nombre_completo)}
          </div>
          <button
            type="button"
            className="absolute bottom-0 right-0 bg-white border border-slate-200 p-1.5 rounded-full text-slate-600 hover:text-emerald-600 shadow-md transition-colors"
            title="Cambiar foto de perfil">
            
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center md:text-left flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{formData.nombre_completo}</h2>
            {isVerified ?
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1 rounded-full text-xs font-bold w-fit mx-auto md:mx-0">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verificado
              </span> :
            isRejected ?
            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border-rose-200 px-3 py-1 rounded-full text-xs font-bold w-fit mx-auto md:mx-0">
                <AlertCircle className="w-3.5 h-3.5" /> Rechazado
              </span> :

            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200 px-3 py-1 rounded-full text-xs font-bold w-fit mx-auto md:mx-0">
                <Clock className="w-3.5 h-3.5 animate-pulse" /> Pendiente Verificación
              </span>
            }
          </div>
          <p className="text-sm text-slate-400 mt-1">Finca: {formData.nombre_finca || 'Sin Finca Registrada'} — {formData.municipio}, {formData.departamento}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sección 1: Información Personal (Col Span 2) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Información personal</h3>
            <p className="text-xs text-slate-400 mt-1">Editá tus datos de contacto e información de tu finca</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Nombre completo</label>
                <input
                  type="text"
                  value={formData.nombre_completo}
                  onChange={(e) => handleInputChange('nombre_completo', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Correo electrónico (No editable)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={formData.correo}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed" />
                  
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Celular / Teléfono</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={formData.celular}
                    onChange={(e) => handleInputChange('celular', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                  
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Nombre de la Finca</label>
                <input
                  type="text"
                  value={formData.nombre_finca}
                  onChange={(e) => handleInputChange('nombre_finca', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Biografía / Presentación de la Finca</label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows="3"
                className="w-full px-4 py-3 bg-gray-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
              
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50">
                
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar cambios
              </button>
            </div>
          </form>
        </div>

        {/* Sección 2: Documentos de Verificación */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Verificación</h3>
            <p className="text-xs text-slate-400 mt-1">Subí tus acreditaciones comerciales</p>
          </div>

          {/* Banners informativos según estado */}
          {isPending &&
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 space-y-1.5">
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 animate-pulse" /> Documentación pendiente de revisión
              </h4>
              <p className="text-[11px] text-amber-800/80 leading-normal font-semibold">
                Tus credenciales están siendo revisadas. Puedes subir nuevos archivos si faltaba alguno.
              </p>
            </div>
          }

          {isVerified &&
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold"><Check size={16} className="inline-block mr-1" /> Cuenta verificada</h4>
                <p className="text-[11px] text-emerald-800/80 leading-normal font-semibold mt-1">
                  Tu acreditación está completada. Puedes publicar y vender en el marketplace de AgroDirecto.
                </p>
              </div>
            </div>
          }

          {isRejected &&
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Solicitud rechazada
              </h4>
              <p className="text-[11px] text-rose-800/80 leading-normal font-semibold">
                Motivo: {userData?.motivo_rechazo || 'Acreditaciones inválidas o borrosas. Por favor, subí nuevamente.'}
              </p>
            </div>
          }

          {/* Formulario de carga de documentos si no está verificado */}
          {!isVerified &&
          <div className="space-y-4 pt-2">
              {/* Documento 1: Carnet de Identidad */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600 block">Carnet de Identidad (ambos lados)</span>
                <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileUpload(e.dataTransfer.files[0], 'ci');
                }}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50">
                
                  <input
                  type="file"
                  id="ci-upload"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleFileUpload(e.target.files[0], 'ci')}
                  className="hidden" />
                
                  <label htmlFor="ci-upload" className="cursor-pointer text-center flex flex-col items-center">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-[11px] font-bold text-emerald-600">Subir CI</span>
                  </label>
                </div>
                {fileCI &&
              <div className="text-[10px] text-slate-500 truncate font-semibold bg-slate-100 p-1.5 rounded-lg flex items-center justify-between">
                    <span className="truncate">{fileCI.name}</span>
                    <button type="button" onClick={() => setFileCI(null)} className="text-rose-600 hover:bg-rose-50 p-0.5 rounded"><X className="w-3.5 h-3.5" /></button>
                  </div>
              }
              </div>

              {/* Documento 2: RAU */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600 block">Registro Agrario Único (RAU)</span>
                <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileUpload(e.dataTransfer.files[0], 'rau');
                }}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50">
                
                  <input
                  type="file"
                  id="rau-upload"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleFileUpload(e.target.files[0], 'rau')}
                  className="hidden" />
                
                  <label htmlFor="rau-upload" className="cursor-pointer text-center flex flex-col items-center">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-[11px] font-bold text-emerald-600">Subir RAU</span>
                  </label>
                </div>
                {fileRAU &&
              <div className="text-[10px] text-slate-500 truncate font-semibold bg-slate-100 p-1.5 rounded-lg flex items-center justify-between">
                    <span className="truncate">{fileRAU.name}</span>
                    <button type="button" onClick={() => setFileRAU(null)} className="text-rose-600 hover:bg-rose-50 p-0.5 rounded"><X className="w-3.5 h-3.5" /></button>
                  </div>
              }
              </div>

              {/* Submit Docs */}
              <button
              type="button"
              onClick={handleUploadDocs}
              disabled={isUploadingDocs || !fileCI && !fileRAU}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5">
              
                {isUploadingDocs && <Loader2 className="w-4 h-4 animate-spin" />}
                Enviar acreditaciones
              </button>
            </div>
          }

        </div>

        {/* Sección 3: Datos de Cobro QR (Col Span 3) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" /> Mis datos de cobro
            </h3>
            <p className="text-xs text-slate-400 mt-1">Configurá el QR donde recibirás los pagos de los compradores</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Banco / Billetera</label>
                <select
                  value={banco}
                  onChange={(e) => setBanco(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  
                  <option value="BNB">BNB</option>
                  <option value="Banco Unión">Banco Unión</option>
                  <option value="Tigo Money">Tigo Money</option>
                  <option value="Banco Mercantil">Banco Mercantil</option>
                  <option value="Bisa">Bisa</option>
                  <option value="FIE">FIE</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Nombre del titular</label>
                <input
                  type="text"
                  value={titular}
                  onChange={(e) => setTitular(e.target.value)}
                  placeholder="Ej. Juan Pérez Mamani"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                
              </div>

              <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Tip para subir tu QR
                </h4>
                <p className="text-[11px] text-blue-800/80 leading-normal font-semibold">
                  Abrí tu app bancaria, buscá la opción "Cobrar" o "Mi QR" y sacá una captura de pantalla. Esa imagen es la que debés subir aquí.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-600 block">Mi código QR de cobro</span>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleQRUpload(e.dataTransfer.files[0]);
                }}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 relative overflow-hidden"
                style={{ minHeight: '200px' }}>
                
                <input
                  type="file"
                  id="qr-upload"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => handleQRUpload(e.target.files[0])}
                  className="hidden" />
                
                
                {qrImagePreview ?
                <div className="flex flex-col items-center">
                    <img src={qrImagePreview} alt="QR de cobro" className="w-32 h-32 object-contain border border-slate-200 rounded-xl bg-white p-2 shadow-sm mb-3" />
                    <label htmlFor="qr-upload" className="cursor-pointer text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                      Cambiar foto de QR
                    </label>
                  </div> :

                <label htmlFor="qr-upload" className="cursor-pointer text-center flex flex-col items-center w-full h-full justify-center">
                    <Camera className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm font-bold text-slate-600">Subí la foto de tu QR bancario</span>
                    <span className="text-[10px] text-slate-400 mt-1">PNG, JPG hasta 5MB</span>
                  </label>
                }
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveQR}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2">
                  
                  <Save className="w-4 h-4" />
                  Guardar datos de cobro
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </PageShell>);

};

export default MiPerfilProductorPage;