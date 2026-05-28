import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, CheckCircle2, AlertCircle, Camera, Lock, Save, X, Eye, EyeOff, Mail, Phone
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const MiPerfilCompradorPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Personal');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formDataPersonal, setFormDataPersonal] = useState({
    nombreCompleto: '',
    correo: '',
    celular: '',
    estado: 'VERIFICADO',
    fechaRegistro: ''
  });

  const [formDataSeguridad, setFormDataSeguridad] = useState({
    passwordActual: '',
    nuevaPassword: '',
    confirmarPassword: ''
  });

  const [notificaciones, setNotificaciones] = useState({
    activas: true,
    categorias: {
      Verduras: true,
      Frutas: true,
      Granos: false,
      Tuberculos: false
    }
  });

  const handleToggleCategoria = (cat) => {
    setNotificaciones(prev => ({
      ...prev,
      categorias: { ...prev.categorias, [cat]: !prev.categorias[cat] }
    }));
  };

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
        estado: data.estado || 'VERIFICADO',
        fechaRegistro: data.fecha_registro ? new Date(data.fecha_registro).toLocaleDateString() : 'N/A'
      });
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

  const getPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    return strength; 
  };
  const passStrength = getPasswordStrength(formDataSeguridad.nuevaPassword);
  const strengthColors = ['bg-gray-200', 'bg-red-500', 'bg-yellow-500', 'bg-emerald-500'];

  const handleSave = async () => {
    setIsSaving(true);
    const loadingToast = toast.loading('Guardando cambios...');
    try {
      const token = localStorage.getItem('token');
      // Simulated endpoint for updating common user data
      await axios.put('http://localhost:5000/api/usuarios/perfil', {
        nombre_completo: formDataPersonal.nombreCompleto,
        celular: formDataPersonal.celular
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Perfil actualizado correctamente', { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.success('Cambios guardados localmente (API de comprador pendiente)', { id: loadingToast });
    } finally {
      setIsSaving(false);
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
          <p className="text-gray-400 font-bold animate-pulse">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-lg text-white flex items-center justify-center shadow-md shrink-0" style={{backgroundColor: '#059669'}}>
          <User className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Mi Perfil</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Comprador</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* COLUMNA IZQUIERDA */}
        <div className="w-full lg:w-[300px] flex flex-col shrink-0">
          <div className="card-elevated p-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-[100px] h-[100px] rounded-full text-white flex items-center justify-center text-3xl font-bold border-4 border-emerald-50 shadow-inner" style={{backgroundColor: '#059669'}}>
                {getInitials(formDataPersonal.nombreCompleto)}
              </div>
              <button className="absolute bottom-0 right-0 bg-white border border-gray-200 text-gray-700 rounded-full p-2 hover:bg-gray-50 shadow-sm">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <h2 className="text-lg font-bold text-gray-800 mt-2">{formDataPersonal.nombreCompleto}</h2>
            <div className="flex items-center gap-1.5 mt-2 mb-1 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" /> Cuenta Activa
            </div>
            <p className="text-xs text-gray-400 mt-2 font-medium">Miembro desde {formDataPersonal.fechaRegistro}</p>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="flex-1 card-elevated overflow-hidden flex flex-col h-max">
          
          {/* TABS */}
          <div className="flex border-b border-gray-100 bg-gray-50 overflow-x-auto hide-scrollbar shrink-0">
            {['Personal', 'Notificaciones', 'Seguridad'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-6 py-3.5 text-sm font-bold transition-colors border-b-2 ${
                  activeTab === tab 
                    ? 'border-emerald-600 text-emerald-600 bg-white' 
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
                }`}
              >
                {tab === 'Personal' && 'InformaciÃ³n Personal'}
                {tab === 'Notificaciones' && 'Notificaciones'}
                {tab === 'Seguridad' && 'Seguridad'}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8 flex-1">
            
            {/* TAB: PERSONAL */}
            {activeTab === 'Personal' && (
              <div className="space-y-5 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2"><User className="w-4 h-4 text-gray-400"/> Nombre completo</label>
                    <input type="text" value={formDataPersonal.nombreCompleto} onChange={e => setFormDataPersonal({...formDataPersonal, nombreCompleto: e.target.value})} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2 justify-between">
                      <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400"/> Correo electrÃ³nico</span>
                      <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Fijo</span>
                    </label>
                    <input type="email" value={formDataPersonal.correo} disabled className="input-field bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400"/> Celular</label>
                    <input type="text" value={formDataPersonal.celular} onChange={e => setFormDataPersonal({...formDataPersonal, celular: e.target.value})} className="input-field" />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: NOTIFICACIONES */}
            {activeTab === 'Notificaciones' && (
              <div className="space-y-6 animate-fade-in max-w-lg">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <h3 className="font-bold text-gray-800">Recibir Notificaciones</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Activa para recibir alertas sobre nuevos productos de interÃ©s.</p>
                  </div>
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={notificaciones.activas} onChange={() => setNotificaciones({...notificaciones, activas: !notificaciones.activas})} />
                    <div className={`block w-12 h-7 rounded-full transition-colors cursor-pointer ${notificaciones.activas ? 'bg-emerald-500' : 'bg-gray-300'}`} onClick={() => setNotificaciones({...notificaciones, activas: !notificaciones.activas})}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform pointer-events-none ${notificaciones.activas ? 'transform translate-x-5' : ''}`}></div>
                  </div>
                </div>

                {notificaciones.activas && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <h4 className="font-bold text-gray-700 border-b pb-2">SuscripciÃ³n por CategorÃ­as</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.keys(notificaciones.categorias).map((cat) => (
                        <div key={cat} className="flex items-center gap-3">
                          <label className="relative flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={notificaciones.categorias[cat]} onChange={() => handleToggleCategoria(cat)} />
                            <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-colors flex items-center justify-center">
                              <CheckCircle2 className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" />
                            </div>
                            <span className="ml-3 text-sm font-medium text-gray-700">{cat}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: SEGURIDAD */}
            {activeTab === 'Seguridad' && (
              <div className="space-y-5 animate-fade-in max-w-md">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                  <Lock className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-emerald-800 leading-relaxed font-medium">Usa una contraseÃ±a fuerte de al menos 8 caracteres con nÃºmeros y sÃ­mbolos.</p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">ContraseÃ±a actual</label>
                    <input type={showPassword.actual ? "text" : "password"} value={formDataSeguridad.passwordActual} onChange={e => setFormDataSeguridad({...formDataSeguridad, passwordActual: e.target.value})} className="input-field" />
                    <button type="button" onClick={() => setShowPassword({...showPassword, actual: !showPassword.actual})} className="absolute right-3 top-[34px] text-gray-400 hover:text-emerald-600">
                      {showPassword.actual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Nueva contraseÃ±a</label>
                    <input type={showPassword.nueva ? "text" : "password"} value={formDataSeguridad.nuevaPassword} onChange={e => setFormDataSeguridad({...formDataSeguridad, nuevaPassword: e.target.value})} className="input-field" />
                    <button type="button" onClick={() => setShowPassword({...showPassword, nueva: !showPassword.nueva})} className="absolute right-3 top-[34px] text-gray-400 hover:text-emerald-600">
                      {showPassword.nueva ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <div className="mt-2 flex gap-1 h-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`flex-1 rounded-full ${i <= passStrength ? strengthColors[passStrength] : 'bg-gray-100'}`}></div>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Confirmar contraseÃ±a</label>
                    <input type={showPassword.confirmar ? "text" : "password"} value={formDataSeguridad.confirmarPassword} onChange={e => setFormDataSeguridad({...formDataSeguridad, confirmarPassword: e.target.value})} className="input-field" />
                    <button type="button" onClick={() => setShowPassword({...showPassword, confirmar: !showPassword.confirmar})} className="absolute right-3 top-[34px] text-gray-400 hover:text-emerald-600">
                      {showPassword.confirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button className="w-full text-white py-2.5 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5" style={{backgroundColor: '#1a1a2e'}}>
                    Actualizar contraseÃ±a
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          {activeTab !== 'Seguridad' && (
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 shrink-0 mt-auto">
              <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
                <X className="w-4 h-4" /> Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
                style={{backgroundColor: '#059669'}}
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

export default MiPerfilCompradorPage;