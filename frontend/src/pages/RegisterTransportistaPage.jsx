import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterTransportistaPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    nombreCompleto: '', correo: '', contrasena: '', confirmContrasena: '', celular: '',
    tipoTransporte: '', capacidadCargaKg: 1000, zonaOperacion: '', descripcionVehiculo: '',
    numeroLicencia: '', placaVehiculo: '',
    aceptaTerminos: false, aceptaPrivacidad: false
  });
  
  const [docs, setDocs] = useState({
    licencia: { file: null, preview: null },
    soat: { file: null, preview: null },
    registro: { file: null, preview: null }
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validaciones
  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const hasMinLen = formData.contrasena.length >= 8;
  const hasUpper = /[A-Z]/.test(formData.contrasena);
  const hasNumber = /\d/.test(formData.contrasena);
  
  const getPasswordStrength = () => {
    let score = 0;
    if (hasMinLen) score++;
    if (hasUpper) score++;
    if (hasNumber) score++;
    return score;
  };
  const strength = getPasswordStrength();
  const strengthColors = ['bg-gray-200', 'bg-red-500', 'bg-yellow-400', 'bg-orange-500'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({...prev, [`file_${docType}`]: 'El archivo excede 5MB'}));
      return;
    }
    
    if (errors[`file_${docType}`]) setErrors(prev => ({ ...prev, [`file_${docType}`]: '' }));

    // Preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocs(prev => ({ ...prev, [docType]: { file, preview: reader.result } }));
      };
      reader.readAsDataURL(file);
    } else {
      setDocs(prev => ({ ...prev, [docType]: { file, preview: null } }));
    }
  };

  const removeFile = (docType, e) => {
    e.stopPropagation();
    setDocs(prev => ({ ...prev, [docType]: { file: null, preview: null } }));
  };

  const fileInputs = {
    licencia: useRef(null),
    soat: useRef(null),
    registro: useRef(null)
  };

  const handleNext = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.nombreCompleto) newErrors.nombreCompleto = 'Requerido';
      if (!isEmailValid(formData.correo)) newErrors.correo = 'Correo inválido';
      if (strength < 3) newErrors.contrasena = 'Contraseña débil';
      if (formData.contrasena !== formData.confirmContrasena) newErrors.confirmContrasena = 'No coinciden';
      if (!formData.celular) newErrors.celular = 'Requerido';
    } else if (step === 2) {
      if (!formData.tipoTransporte) newErrors.tipoTransporte = 'Requerido';
      if (!formData.zonaOperacion) newErrors.zonaOperacion = 'Requerido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setStep(prev => prev + 1);
  };

  const handlePrev = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    const newErrors = {};
    if (!formData.numeroLicencia) newErrors.numeroLicencia = 'Requerido';
    if (!formData.placaVehiculo) newErrors.placaVehiculo = 'Requerido';
    if (!docs.licencia.file) newErrors.file_licencia = 'La licencia es obligatoria';
    if (!docs.soat.file) newErrors.file_soat = 'El SOAT es obligatorio';
    if (!formData.aceptaTerminos) newErrors.aceptaTerminos = 'Requerido';
    if (!formData.aceptaPrivacidad) newErrors.aceptaPrivacidad = 'Requerido';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      const payload = { 
        nombre_completo: formData.nombreCompleto,
        correo: formData.correo,
        contrasena: formData.contrasena,
        celular: formData.celular,
        rol: 'TRANSPORTISTA',
        acepto_terminos: formData.aceptaTerminos,
        acepto_privacidad: formData.aceptaPrivacidad,
        // Perfil
        tipo_transporte: formData.tipoTransporte,
        capacidad_carga_kg: parseFloat(formData.capacidadCargaKg),
        zona_operacion: formData.zonaOperacion,
        numero_licencia: formData.numeroLicencia,
        placa_vehiculo: formData.placaVehiculo,
        tipo_documento_subido: 'Licencia' // Default para el primer documento
      };
      const res = await axios.post('http://localhost:5000/api/auth/register', payload);
      
      const token = res.data.token;
      localStorage.setItem('token', token);

      // Subimos solo el documento principal (licencia) por simplicidad de API actual
      if (docs.licencia.file) {
        const fileData = new FormData();
        fileData.append('documento', docs.licencia.file);
        await axios.post('http://localhost:5000/api/upload/document', fileData, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      // Redirige a su dashboard logístico
      navigate('/dashboard/transportista'); 
    } catch (error) {
      setServerError(error.response?.data?.error || 'Error al registrar');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      
      {/* HEADER */}
      <div className="bg-[#BA7517] text-white px-8 py-8 relative overflow-hidden">
        {/* CSS Animation para camión */}
        <style>
          {`
            @keyframes drive {
              0% { transform: translateX(-150px); opacity: 0; }
              20% { opacity: 1; }
              80% { opacity: 1; }
              100% { transform: translateX(100vw); opacity: 0; }
            }
            .animate-drive { animation: drive 10s linear infinite; }
          `}
        </style>
        
        <div className="absolute top-4 left-0 w-full overflow-hidden opacity-20 pointer-events-none">
          <div className="animate-drive text-6xl">🚚</div>
        </div>

        <div className="relative z-10 text-center">
          <h2 className="text-3xl font-black tracking-tight mb-2">Únete a la red logística de AgroDirecto</h2>
          <p className="text-orange-100 font-medium">Más viajes, mejores tarifas y pagos seguros.</p>
        </div>
      </div>

      {/* BARRA DE PROGRESO */}
      <div className="bg-gray-50 border-b border-gray-200 px-8 py-4">
        <div className="flex justify-between items-center relative max-w-md mx-auto">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 z-0"></div>
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-[#BA7517] z-0 transition-all duration-500" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
          
          {[
            { num: 1, label: 'Tu cuenta' },
            { num: 2, label: 'Tu vehículo' },
            { num: 3, label: 'Documentos' }
          ].map(s => (
            <div key={s.num} className="relative z-10 flex flex-col items-center bg-gray-50 px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${step >= s.num ? 'bg-[#BA7517] text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span className={`mt-1 text-[10px] font-bold uppercase ${step >= s.num ? 'text-[#BA7517]' : 'text-gray-400'}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-8">
        {serverError && <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200">{serverError}</div>}

        {/* PASO 1 */}
        {step === 1 && (
          <div className="animate-fade-in space-y-5 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-700 mb-6 text-center">Datos Personales</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo</label>
              <input type="text" name="nombreCompleto" value={formData.nombreCompleto} onChange={handleChange} placeholder="Ej. Carlos Mendoza" className={`w-full p-3 border rounded focus:ring-1 focus:ring-[#BA7517] outline-none ${errors.nombreCompleto ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.nombreCompleto && <p className="text-red-500 text-xs mt-1">{errors.nombreCompleto}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                <input type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="correo@ejemplo.com" className={`w-full p-3 border rounded focus:ring-1 focus:ring-[#BA7517] outline-none ${errors.correo ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Número de Celular</label>
                <input type="text" name="celular" value={formData.celular} onChange={handleChange} placeholder="+591 7XXXXXXX" className={`w-full p-3 border rounded focus:ring-1 focus:ring-[#BA7517] outline-none ${errors.celular ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.celular && <p className="text-red-500 text-xs mt-1">{errors.celular}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
                <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} placeholder="••••••••" className={`w-full p-3 border rounded focus:ring-1 focus:ring-[#BA7517] outline-none ${errors.contrasena ? 'border-red-500' : 'border-gray-300'}`} />
                
                {/* Indicador de fortaleza */}
                <div className="mt-2 flex h-1.5 w-full bg-gray-200 rounded overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${strengthColors[strength]}`} style={{ width: `${(strength / 3) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmar Contraseña</label>
                <input type="password" name="confirmContrasena" value={formData.confirmContrasena} onChange={handleChange} placeholder="••••••••" className={`w-full p-3 border rounded focus:ring-1 focus:ring-[#BA7517] outline-none ${errors.confirmContrasena ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.confirmContrasena && <p className="text-red-500 text-xs mt-1">{errors.confirmContrasena}</p>}
              </div>
            </div>
          </div>
        )}

        {/* PASO 2 */}
        {step === 2 && (
          <div className="animate-fade-in space-y-6">
            <h3 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">Detalles del Vehículo</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Tipo de Transporte</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { id: 'Camión', icon: '🚛', label: 'Camión' },
                  { id: 'Camioneta', icon: '🚐', label: 'Camioneta' },
                  { id: 'Moto', icon: '🏍️', label: 'Moto' },
                  { id: 'Otro', icon: '📦', label: 'Otro' }
                ].map(tipo => (
                  <div 
                    key={tipo.id}
                    onClick={() => { setFormData(p => ({...p, tipoTransporte: tipo.id})); setErrors(p => ({...p, tipoTransporte: ''})) }}
                    className={`border-2 p-4 rounded-xl cursor-pointer text-center transition-all ${formData.tipoTransporte === tipo.id ? 'border-[#BA7517] bg-orange-50 shadow-sm' : 'border-gray-200 hover:border-orange-300'}`}
                  >
                    <div className="text-4xl mb-2">{tipo.icon}</div>
                    <div className="font-bold text-gray-800 text-sm">{tipo.label}</div>
                  </div>
                ))}
              </div>
              {errors.tipoTransporte && <p className="text-red-500 text-xs mt-1">{errors.tipoTransporte}</p>}
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Capacidad de Carga</label>
                <span className="font-black text-[#BA7517]">{formData.capacidadCargaKg} Kg</span>
              </div>
              <input 
                type="range" 
                name="capacidadCargaKg" 
                min="0" max="10000" step="500" 
                value={formData.capacidadCargaKg} 
                onChange={handleChange}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-[#BA7517]" 
              />
              <p className="text-sm font-bold text-gray-500 mt-2 text-right">= {(formData.capacidadCargaKg / 1000).toFixed(1)} toneladas</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Zona de Operación Principal</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'Local', icon: '📍', label: 'Local', desc: 'Dentro de la ciudad' },
                  { id: 'Regional', icon: '🗺️', label: 'Regional', desc: 'A municipios cercanos' },
                  { id: 'Departamental', icon: '🌐', label: 'Departamental', desc: 'Todo Santa Cruz' }
                ].map(zona => (
                  <div 
                    key={zona.id}
                    onClick={() => { setFormData(p => ({...p, zonaOperacion: zona.id})); setErrors(p => ({...p, zonaOperacion: ''})) }}
                    className={`border p-4 rounded-lg cursor-pointer transition-all ${formData.zonaOperacion === zona.id ? 'border-[#BA7517] ring-1 ring-[#BA7517] bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{zona.icon}</span>
                      <span className="font-bold text-gray-800">{zona.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{zona.desc}</p>
                  </div>
                ))}
              </div>
              {errors.zonaOperacion && <p className="text-red-500 text-xs mt-1">{errors.zonaOperacion}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción del vehículo (Opcional)</label>
              <textarea 
                name="descripcionVehiculo" 
                value={formData.descripcionVehiculo} 
                onChange={handleChange} 
                rows="2"
                placeholder="Ej. Camión refrigerado de 5 toneladas con capacidad para carga frágil." 
                className="w-full p-3 border border-gray-300 rounded focus:ring-1 focus:ring-[#BA7517] outline-none"
              ></textarea>
            </div>
          </div>
        )}

        {/* PASO 3 */}
        {step === 3 && (
          <div className="animate-fade-in space-y-6">
            <h3 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">Documentación Requerida</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nº Licencia de Conducir</label>
                <input type="text" name="numeroLicencia" value={formData.numeroLicencia} onChange={handleChange} placeholder="Ej. 1234567-SC" className={`w-full p-3 border rounded focus:ring-1 focus:ring-[#BA7517] outline-none ${errors.numeroLicencia ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.numeroLicencia && <p className="text-red-500 text-xs mt-1">{errors.numeroLicencia}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Placa del Vehículo</label>
                <input type="text" name="placaVehiculo" value={formData.placaVehiculo} onChange={handleChange} placeholder="Ej. 1234-ABC" className={`w-full p-3 border rounded focus:ring-1 focus:ring-[#BA7517] outline-none uppercase ${errors.placaVehiculo ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.placaVehiculo && <p className="text-red-500 text-xs mt-1">{errors.placaVehiculo}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* ZONAS DE CARGA */}
              {[
                { id: 'licencia', label: 'Licencia de Conducir', req: true },
                { id: 'soat', label: 'SOAT Vigente', req: true },
                { id: 'registro', label: 'RUAT / Registro', req: false }
              ].map(doc => (
                <div key={doc.id}>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                    {doc.label} {doc.req && <span className="text-red-500">*</span>}
                  </label>
                  <div 
                    onClick={() => fileInputs[doc.id].current?.click()}
                    className={`h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-2 cursor-pointer transition-colors relative overflow-hidden group
                      ${errors[`file_${doc.id}`] ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:bg-orange-50 hover:border-orange-300'}`}
                  >
                    <input type="file" ref={fileInputs[doc.id]} onChange={(e) => handleFileChange(e, doc.id)} accept=".jpg,.jpeg,.png,.pdf" className="hidden" />
                    
                    {!docs[doc.id].file ? (
                      <div className="text-center">
                        <span className="text-2xl text-gray-400 group-hover:text-[#BA7517]">📄</span>
                        <p className="text-xs text-gray-500 mt-2">Clic para subir</p>
                      </div>
                    ) : docs[doc.id].preview ? (
                      <>
                        <img src={docs[doc.id].preview} alt="preview" className="w-full h-full object-cover rounded opacity-80" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => removeFile(doc.id, e)} className="text-white bg-red-500 rounded-full w-8 h-8 flex items-center justify-center shadow">✕</button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center relative z-10 w-full px-2">
                        <span className="text-2xl text-[#BA7517]">📑</span>
                        <p className="text-[10px] font-bold text-[#BA7517] truncate w-full mt-1">{docs[doc.id].file.name}</p>
                        <button onClick={(e) => removeFile(doc.id, e)} className="text-red-500 text-xs font-bold mt-1">Quitar</button>
                      </div>
                    )}
                  </div>
                  {errors[`file_${doc.id}`] && <p className="text-red-500 text-[10px] mt-1 text-center">{errors[`file_${doc.id}`]}</p>}
                </div>
              ))}
            </div>

            {/* AVISO IMPORTANTE */}
            <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-lg mt-6 flex items-start gap-3">
              <span className="text-2xl mt-1">🔒</span>
              <p className="text-sm">Tu cuenta estará en revisión de seguridad hasta que validemos tu licencia y los documentos del vehículo. <strong>Esto suele tardar de 24 a 48 horas hábiles.</strong></p>
            </div>

            <div className="pt-4 space-y-2 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="aceptaTerminos" checked={formData.aceptaTerminos} onChange={handleChange} className="w-4 h-4 accent-[#BA7517]" />
                <span className="text-sm text-gray-700">Acepto los <a href="#" className="text-[#BA7517] hover:underline">Términos y Condiciones</a></span>
              </label>
              {errors.aceptaTerminos && <p className="text-red-500 text-xs ml-6">{errors.aceptaTerminos}</p>}
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="aceptaPrivacidad" checked={formData.aceptaPrivacidad} onChange={handleChange} className="w-4 h-4 accent-[#BA7517]" />
                <span className="text-sm text-gray-700">Acepto la <a href="#" className="text-[#BA7517] hover:underline">Política de Privacidad</a></span>
              </label>
              {errors.aceptaPrivacidad && <p className="text-red-500 text-xs ml-6">{errors.aceptaPrivacidad}</p>}
            </div>
          </div>
        )}

        {/* BOTONERA */}
        <div className="mt-8 flex justify-between items-center">
          {step > 1 ? (
            <button onClick={handlePrev} disabled={isSubmitting} className="px-6 py-2 border border-gray-300 text-gray-600 font-bold rounded hover:bg-gray-50 transition-colors">
              ← Anterior
            </button>
          ) : <div></div>}
          
          {step < 3 ? (
            <button onClick={handleNext} className="px-8 py-3 bg-[#BA7517] text-white font-bold rounded shadow hover:bg-orange-700 transition-colors">
              Siguiente →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-3 bg-[#BA7517] text-white font-bold rounded-lg shadow-lg hover:bg-orange-700 transition-colors disabled:opacity-70 flex items-center gap-2">
              {isSubmitting ? 'Enviando...' : 'Registrarme como Transportista ✓'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default RegisterTransportistaPage;
