import { Star, Check } from "lucide-react";import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterProductorPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombreCompleto: '', correo: '', contrasena: '', confirmContrasena: '', celular: '',
    tipoProductor: 'Individual', nombreFinca: '', departamento: 'Santa Cruz', provincia: '', municipio: '', aniosExperiencia: 1,
    tipoDocumento: 'CI', numeroDocumento: '', aceptaTerminos: false, aceptaPrivacidad: false
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const fileInputRef = useRef(null);
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
  const strengthColors = ['bg-gray-200', 'bg-red-500', 'bg-yellow-400', 'bg-green-500'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, file: 'El archivo excede los 5MB' }));
      return;
    }

    setDocumentFile(file);
    if (errors.file) setErrors((prev) => ({ ...prev, file: '' }));

    // Preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setDocumentPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setDocumentPreview(null);
    }
  };

  const handleNext = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.nombreCompleto) newErrors.nombreCompleto = 'Requerido';
      if (!isEmailValid(formData.correo)) newErrors.correo = 'Correo inválido';
      if (strength < 3) newErrors.contrasena = 'Contraseña no cumple requisitos';
      if (formData.contrasena !== formData.confirmContrasena) newErrors.confirmContrasena = 'No coinciden';
      if (!formData.celular) newErrors.celular = 'Requerido';
    } else if (step === 2) {
      if (!formData.nombreFinca) newErrors.nombreFinca = 'Requerido';
      if (!formData.provincia) newErrors.provincia = 'Requerido';
      if (!formData.municipio) newErrors.municipio = 'Requerido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    const newErrors = {};
    if (!formData.numeroDocumento) newErrors.numeroDocumento = 'Requerido';
    if (!formData.aceptaTerminos) newErrors.aceptaTerminos = 'Debe aceptar los términos';
    if (!formData.aceptaPrivacidad) newErrors.aceptaPrivacidad = 'Debe aceptar la privacidad';
    if (!documentFile) newErrors.file = 'Debe subir un documento';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      // 1. Registrar usuario
      const payload = {
        nombre_completo: formData.nombreCompleto,
        correo: formData.correo,
        contrasena: formData.contrasena,
        celular: formData.celular,
        rol: 'PRODUCTOR',
        acepto_terminos: formData.aceptaTerminos,
        acepto_privacidad: formData.aceptaPrivacidad,
        // Perfil
        tipo_productor: formData.tipoProductor,
        nombre_finca: formData.nombreFinca,
        municipio: formData.municipio,
        provincia: formData.provincia,
        departamento: formData.departamento,
        anios_experiencia: parseInt(formData.aniosExperiencia),
        tipo_documento: formData.tipoDocumento,
        numero_documento: formData.numeroDocumento
      };
      const res = await axios.post('http://localhost:5000/api/auth/register', payload);

      const token = res.data.token;
      localStorage.setItem('token', token);

      // 2. Subir documento si hay file
      if (documentFile) {
        const fileData = new FormData();
        fileData.append('documento', documentFile);
        await axios.post('http://localhost:5000/api/upload/document', fileData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      // Éxito, redirigir
      navigate('/dashboard/productor');
    } catch (error) {
      setServerError(error.response?.data?.error || 'Error al registrar');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-8 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      
      {/* HEADER Y BARRA DE PROGRESO */}
      <div className="bg-gray-50 border-b border-gray-200 px-8 py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Registro de Productor Agropecuario</h2>
        
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 z-0"></div>
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-[#1D9E75] z-0 transition-all duration-500" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
          
          {[
          { num: 1, label: 'Tu cuenta', icon: "" },
          { num: 2, label: 'Tu finca', icon: "" },
          { num: 3, label: 'Documentos', icon: "" }].
          map((s) =>
          <div key={s.num} className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${step >= s.num ? 'bg-[#1D9E75] text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>
                {step > s.num ? "" : s.num}
              </div>
              <span className={`mt-2 text-xs font-semibold ${step >= s.num ? 'text-[#1D9E75]' : 'text-gray-400'}`}>{s.label}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-8">
        {serverError && <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200">{serverError}</div>}

        {/* PASO 1 */}
        {step === 1 &&
        <div className="animate-fade-in space-y-5">
            <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2 mb-4"><span className="text-2xl"><Star size={16} className="inline-block mr-1" /></span> Datos de tu cuenta</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo</label>
              <input type="text" name="nombreCompleto" value={formData.nombreCompleto} onChange={handleChange} placeholder="Ej. Juan Flores Vaca" className={`w-full p-3 border rounded focus:ring-1 focus:ring-[#1D9E75] outline-none ${errors.nombreCompleto ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.nombreCompleto && <p className="text-red-500 text-xs mt-1">{errors.nombreCompleto}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                <input type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="correo@ejemplo.com" className={`w-full p-3 border rounded focus:ring-1 focus:ring-[#1D9E75] outline-none ${errors.correo ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Número de Celular</label>
                <input type="text" name="celular" value={formData.celular} onChange={handleChange} placeholder="+591 7XXXXXXX" className={`w-full p-3 border rounded focus:ring-1 focus:ring-[#1D9E75] outline-none ${errors.celular ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.celular && <p className="text-red-500 text-xs mt-1">{errors.celular}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
                <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} placeholder="••••••••" className={`w-full p-3 border rounded focus:ring-1 focus:ring-[#1D9E75] outline-none ${errors.contrasena ? 'border-red-500' : 'border-gray-300'}`} />
                
                {/* Indicador de fortaleza */}
                <div className="mt-2 flex h-1.5 w-full bg-gray-200 rounded overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${strengthColors[strength]}`} style={{ width: `${strength / 3 * 100}%` }}></div>
                </div>
                <div className="flex gap-2 mt-1 text-[10px] sm:text-xs">
                  <span className={hasMinLen ? "text-green-600 font-medium" : "text-gray-400"}><Check size={16} className="inline-block mr-1" /> 8 caracteres</span>
                  <span className={hasUpper ? "text-green-600 font-medium" : "text-gray-400"}><Check size={16} className="inline-block mr-1" /> 1 mayúscula</span>
                  <span className={hasNumber ? "text-green-600 font-medium" : "text-gray-400"}><Check size={16} className="inline-block mr-1" /> 1 número</span>
                </div>
                {errors.contrasena && <p className="text-red-500 text-xs mt-1">{errors.contrasena}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmar Contraseña</label>
                <input type="password" name="confirmContrasena" value={formData.confirmContrasena} onChange={handleChange} placeholder="••••••••" className={`w-full p-3 border rounded focus:ring-1 focus:ring-[#1D9E75] outline-none ${errors.confirmContrasena ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.confirmContrasena && <p className="text-red-500 text-xs mt-1">{errors.confirmContrasena}</p>}
              </div>
            </div>
          </div>
        }

        {/* PASO 2 */}
        {step === 2 &&
        <div className="animate-fade-in space-y-5">
            <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2 mb-4"><span className="text-2xl"><Star size={16} className="inline-block mr-1" /></span> Detalles de tu finca</h3>
            
            <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded flex items-start gap-2 text-sm mb-4">
              <span><Star size={16} className="inline-block mr-1" /></span> <span><strong>Nota:</strong> Podrás marcar la ubicación exacta de tu finca en el mapa interactivo después de completar este registro.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Productor</label>
                <select name="tipoProductor" value={formData.tipoProductor} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded focus:ring-1 focus:ring-[#1D9E75] outline-none bg-white">
                  <option value="Individual">Individual</option>
                  <option value="Asociacion">Asociación</option>
                  <option value="Cooperativa">Cooperativa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de la Unidad Productiva</label>
                <input type="text" name="nombreFinca" value={formData.nombreFinca} onChange={handleChange} placeholder="Ej. Finca El Sol" className={`w-full p-3 border rounded focus:ring-1 focus:ring-[#1D9E75] outline-none ${errors.nombreFinca ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.nombreFinca && <p className="text-red-500 text-xs mt-1">{errors.nombreFinca}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Departamento</label>
                <select name="departamento" value={formData.departamento} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded focus:ring-1 focus:ring-[#1D9E75] outline-none bg-white">
                  <option value="Santa Cruz">Santa Cruz</option>
                  <option value="Cochabamba">Cochabamba</option>
                  <option value="La Paz">La Paz</option>
                  {/* ...otros */}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Provincia</label>
                <input type="text" name="provincia" value={formData.provincia} onChange={handleChange} placeholder="Ej. Obispo Santistevan" className={`w-full p-3 border rounded focus:ring-1 focus:ring-[#1D9E75] outline-none ${errors.provincia ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.provincia && <p className="text-red-500 text-xs mt-1">{errors.provincia}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Municipio</label>
                <input type="text" name="municipio" value={formData.municipio} onChange={handleChange} placeholder="Ej. Montero" className={`w-full p-3 border rounded focus:ring-1 focus:ring-[#1D9E75] outline-none ${errors.municipio ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.municipio && <p className="text-red-500 text-xs mt-1">{errors.municipio}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Años de Experiencia Agrícola</label>
              <div className="flex items-center w-32 border border-gray-300 rounded overflow-hidden">
                <button type="button" onClick={() => setFormData((p) => ({ ...p, aniosExperiencia: Math.max(1, p.aniosExperiencia - 1) }))} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold">-</button>
                <input type="number" readOnly value={formData.aniosExperiencia} className="w-full text-center p-2 outline-none" />
                <button type="button" onClick={() => setFormData((p) => ({ ...p, aniosExperiencia: Math.min(60, p.aniosExperiencia + 1) }))} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold">+</button>
              </div>
            </div>
          </div>
        }

        {/* PASO 3 */}
        {step === 3 &&
        <div className="animate-fade-in space-y-5">
            <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2 mb-4"><span className="text-2xl"><Star size={16} className="inline-block mr-1" /></span> Documentos de Respaldo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Documento</label>
                <select name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded focus:ring-1 focus:ring-[#1D9E75] outline-none bg-white">
                  <option value="CI">Carnet de Identidad</option>
                  <option value="NIT">Registro de Productor / NIT</option>
                  <option value="Certificado">Certificado Comunitario</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Número de Documento</label>
                <input type="text" name="numeroDocumento" value={formData.numeroDocumento} onChange={handleChange} placeholder="Ej. 1234567" className={`w-full p-3 border rounded focus:ring-1 focus:ring-[#1D9E75] outline-none ${errors.numeroDocumento ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.numeroDocumento && <p className="text-red-500 text-xs mt-1">{errors.numeroDocumento}</p>}
              </div>
            </div>

            {/* Zona de carga de archivo */}
            <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors ${errors.file ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            onClick={() => fileInputRef.current?.click()}>
            
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
              
              {!documentFile ?
            <>
                  <div className="text-4xl mb-2 text-gray-400"><Star size={16} className="inline-block mr-1" /><Star size={16} className="inline-block mr-1" /></div>
                  <p className="font-semibold text-gray-700">Haz clic aquí para seleccionar tu documento</p>
                  <p className="text-xs text-gray-500 mt-1">Formatos aceptados: PDF, JPG, PNG (máx. 5MB)</p>
                </> :

            <div className="flex flex-col items-center">
                  {documentPreview ?
              <img src={documentPreview} alt="Preview" className="h-24 object-contain mb-2 rounded shadow-sm" /> :

              <div className="text-4xl mb-2"><Star size={16} className="inline-block mr-1" /></div>
              }
                  <p className="font-semibold text-[#1D9E75]">{documentFile.name}</p>
                  <p className="text-xs text-gray-500">{(documentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button type="button" onClick={(e) => {e.stopPropagation();setDocumentFile(null);setDocumentPreview(null);}} className="text-red-500 text-xs font-bold mt-2 hover:underline">Quitar archivo</button>
                </div>
            }
            </div>
            {errors.file && <p className="text-red-500 text-xs text-center">{errors.file}</p>}

            {/* AVISO FINAL */}
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mt-6 text-sm flex gap-3 items-start">
              <span className="text-xl"><Star size={16} className="inline-block mr-1" /><Star size={16} className="inline-block mr-1" /></span>
              <p>Tu cuenta quedará en estado <strong>'Pendiente de verificación'</strong> hasta que el equipo de AgroDirecto valide tus documentos. Mientras tanto, podrás explorar la plataforma y marcar la ubicación de tu finca en el mapa.</p>
            </div>

            <div className="mt-4 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="aceptaTerminos" checked={formData.aceptaTerminos} onChange={handleChange} className="w-4 h-4 accent-[#1D9E75]" />
                <span className="text-sm text-gray-700">Acepto los <a href="#" className="text-[#1D9E75] hover:underline">Términos y Condiciones</a></span>
              </label>
              {errors.aceptaTerminos && <p className="text-red-500 text-xs ml-6">{errors.aceptaTerminos}</p>}
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="aceptaPrivacidad" checked={formData.aceptaPrivacidad} onChange={handleChange} className="w-4 h-4 accent-[#1D9E75]" />
                <span className="text-sm text-gray-700">Acepto la <a href="#" className="text-[#1D9E75] hover:underline">Política de Privacidad</a></span>
              </label>
              {errors.aceptaPrivacidad && <p className="text-red-500 text-xs ml-6">{errors.aceptaPrivacidad}</p>}
            </div>
          </div>
        }

        {/* BOTONERA */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
          {step > 1 ?
          <button onClick={handlePrev} disabled={isSubmitting} className="px-6 py-2 border border-gray-300 text-gray-600 font-bold rounded hover:bg-gray-50 transition-colors">
              ← Anterior
            </button> :
          <div></div>}
          
          {step < 3 ?
          <button onClick={handleNext} className="px-8 py-2 bg-[#1D9E75] text-white font-bold rounded shadow hover:bg-green-700 transition-colors">
              Siguiente →
            </button> :

          <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-3 bg-[#1D9E75] text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-colors disabled:opacity-70 flex items-center gap-2">
              {isSubmitting ? 'Creando cuenta...' : "Crear mi cuenta de Productor"}
            </button>
          }
        </div>

      </div>
    </div>);

};

export default RegisterProductorPage;