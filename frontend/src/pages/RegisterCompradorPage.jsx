import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterCompradorPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    nombreCompleto: '', correo: '', contrasena: '', confirmContrasena: '', celular: '',
    tipoComprador: '', nombreNegocio: '', ciudadPrincipal: '', 
    aceptaTerminos: false, aceptaPrivacidad: false
  });
  
  const [categorias, setCategorias] = useState([]);
  
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lista de categorías
  const categoriasDisponibles = [
    { id: 'Verduras', label: '🍅 Verduras' },
    { id: 'Frutas', label: '🍎 Frutas' },
    { id: 'Granos', label: '🌽 Granos' },
    { id: 'Carne', label: '🥩 Carne' },
    { id: 'Lacteos', label: '🥛 Lácteos' },
    { id: 'Hierbas', label: '🌿 Hierbas' }
  ];

  const handleCategoriaToggle = (id) => {
    setCategorias(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  // Validaciones y Fortaleza
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
  const strengthColors = ['bg-gray-200', 'bg-red-500', 'bg-yellow-400', 'bg-blue-500']; // Azul en lugar de verde

  // Contador de campos
  const countCompletedFields = () => {
    const fieldsToCount = ['nombreCompleto', 'correo', 'contrasena', 'celular', 'tipoComprador', 'ciudadPrincipal'];
    return fieldsToCount.filter(field => formData[field].trim() !== '').length;
  };
  const totalFields = 6;
  const completedFields = countCompletedFields();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleNext = () => {
    const newErrors = {};
    if (!formData.nombreCompleto) newErrors.nombreCompleto = 'Requerido';
    if (!isEmailValid(formData.correo)) newErrors.correo = 'Correo inválido';
    if (strength < 3) newErrors.contrasena = 'Contraseña no cumple requisitos';
    if (formData.contrasena !== formData.confirmContrasena) newErrors.confirmContrasena = 'No coinciden';
    if (!formData.celular) newErrors.celular = 'Requerido';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!formData.tipoComprador) newErrors.tipoComprador = 'Seleccione una opción';
    if (!formData.ciudadPrincipal) newErrors.ciudadPrincipal = 'Seleccione una ciudad';
    if (['Negocio', 'Empresa'].includes(formData.tipoComprador) && !formData.nombreNegocio) {
      newErrors.nombreNegocio = 'Requerido para negocios/empresas';
    }
    if (!formData.aceptaTerminos) newErrors.aceptaTerminos = 'Debe aceptar los términos';
    if (!formData.aceptaPrivacidad) newErrors.aceptaPrivacidad = 'Debe aceptar la privacidad';

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
        rol: 'COMPRADOR',
        acepto_terminos: formData.aceptaTerminos,
        acepto_privacidad: formData.aceptaPrivacidad,
        // Perfil
        tipo_comprador: formData.tipoComprador === 'Persona' ? 'Persona natural' : formData.tipoComprador,
        nombre_negocio: formData.nombreNegocio || null,
        ciudad_principal: formData.ciudadPrincipal
      };
      const res = await axios.post('http://localhost:5000/api/auth/register', payload);
      
      const token = res.data.token;
      localStorage.setItem('token', token);

      // Simulamos dashboard/comprador 
      navigate('/dashboard/comprador'); 
    } catch (error) {
      setServerError(error.response?.data?.error || 'Error al registrar');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-8 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      
      {/* HEADER */}
      <div className="bg-[#378ADD] text-white px-8 py-6 text-center relative overflow-hidden">
        {/* Pattern sutil */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black tracking-tight mb-2">Regístrate en menos de 2 minutos</h2>
          <p className="text-blue-100">Accede a cientos de productores locales sin intermediarios.</p>
        </div>
      </div>

      {/* BARRA DE PROGRESO Y CONTADOR */}
      <div className="bg-gray-50 border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white ${step >= 1 ? 'bg-[#378ADD]' : 'bg-gray-300'}`}>1</div>
            <span className={`text-sm font-bold ${step >= 1 ? 'text-[#378ADD]' : 'text-gray-500'}`}>Tu cuenta</span>
          </div>
          <div className="w-8 flex items-center"><div className="w-full h-0.5 bg-gray-300"></div></div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white ${step >= 2 ? 'bg-[#378ADD]' : 'bg-gray-300'}`}>2</div>
            <span className={`text-sm font-bold ${step >= 2 ? 'text-[#378ADD]' : 'text-gray-500'}`}>Preferencias</span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500 font-bold uppercase mb-1">Progreso</p>
          <p className="text-sm font-semibold text-[#378ADD]">{completedFields} de {totalFields} campos completados</p>
        </div>
      </div>

      <div className="p-8">
        {serverError && <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200">{serverError}</div>}

        {/* PASO 1 */}
        {step === 1 && (
          <div className="animate-fade-in space-y-5">
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo</label>
              <input type="text" name="nombreCompleto" value={formData.nombreCompleto} onChange={handleChange} placeholder="Ej. Ana Belén Paz" className={`w-full p-3 border rounded focus:ring-1 focus:ring-[#378ADD] outline-none ${errors.nombreCompleto ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.nombreCompleto && <p className="text-red-500 text-xs mt-1">{errors.nombreCompleto}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                <input type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="correo@ejemplo.com" className={`w-full p-3 border rounded focus:ring-1 focus:ring-[#378ADD] outline-none ${errors.correo ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Número de Celular</label>
                <input type="text" name="celular" value={formData.celular} onChange={handleChange} placeholder="+591 7XXXXXXX" className={`w-full p-3 border rounded focus:ring-1 focus:ring-[#378ADD] outline-none ${errors.celular ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.celular && <p className="text-red-500 text-xs mt-1">{errors.celular}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
                <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} placeholder="••••••••" className={`w-full p-3 border rounded focus:ring-1 focus:ring-[#378ADD] outline-none ${errors.contrasena ? 'border-red-500' : 'border-gray-300'}`} />
                
                {/* Indicador de fortaleza */}
                <div className="mt-2 flex h-1.5 w-full bg-gray-200 rounded overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${strengthColors[strength]}`} style={{ width: `${(strength / 3) * 100}%` }}></div>
                </div>
                <div className="flex gap-2 mt-1 text-[10px] sm:text-xs">
                  <span className={hasMinLen ? "text-blue-600 font-medium" : "text-gray-400"}>✓ 8 caracteres</span>
                  <span className={hasUpper ? "text-blue-600 font-medium" : "text-gray-400"}>✓ 1 mayúscula</span>
                  <span className={hasNumber ? "text-blue-600 font-medium" : "text-gray-400"}>✓ 1 número</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmar Contraseña</label>
                <input type="password" name="confirmContrasena" value={formData.confirmContrasena} onChange={handleChange} placeholder="••••••••" className={`w-full p-3 border rounded focus:ring-1 focus:ring-[#378ADD] outline-none ${errors.confirmContrasena ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.confirmContrasena && <p className="text-red-500 text-xs mt-1">{errors.confirmContrasena}</p>}
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button onClick={handleNext} className="px-8 py-3 bg-[#378ADD] text-white font-bold rounded-lg shadow hover:bg-blue-600 transition-colors">
                Continuar a Preferencias →
              </button>
            </div>
          </div>
        )}

        {/* PASO 2 */}
        {step === 2 && (
          <div className="animate-fade-in space-y-6">
            
            {/* VENTAJA VISIBLE */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center gap-3">
              <span className="text-[#378ADD] text-2xl">✓</span>
              <p className="text-blue-800 text-sm font-medium">Los compradores tienen acceso inmediato a la plataforma. No necesitas esperar ningún proceso de verificación.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">¿Qué tipo de comprador eres?</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'Persona', icon: '👤', label: 'Persona Natural' },
                  { id: 'Negocio', icon: '🏪', label: 'Negocio Local' },
                  { id: 'Empresa', icon: '🏢', label: 'Empresa / Mayorista' }
                ].map(tipo => (
                  <div 
                    key={tipo.id}
                    onClick={() => { setFormData(p => ({...p, tipoComprador: tipo.id})); setErrors(p => ({...p, tipoComprador: ''})) }}
                    className={`border-2 p-4 rounded-xl cursor-pointer text-center transition-all ${formData.tipoComprador === tipo.id ? 'border-[#378ADD] bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    <div className="text-3xl mb-2">{tipo.icon}</div>
                    <div className="font-bold text-gray-800">{tipo.label}</div>
                  </div>
                ))}
              </div>
              {errors.tipoComprador && <p className="text-red-500 text-xs mt-1">{errors.tipoComprador}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {['Negocio', 'Empresa'].includes(formData.tipoComprador) && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Negocio</label>
                  <input type="text" name="nombreNegocio" value={formData.nombreNegocio} onChange={handleChange} placeholder="Ej. Verdulería Doña María" className={`w-full p-3 border rounded focus:ring-1 focus:ring-[#378ADD] outline-none ${errors.nombreNegocio ? 'border-red-500' : 'border-gray-300'}`} />
                  {errors.nombreNegocio && <p className="text-red-500 text-xs mt-1">{errors.nombreNegocio}</p>}
                </div>
              )}
              
              <div className={formData.tipoComprador === 'Persona' || !formData.tipoComprador ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ciudad Principal</label>
                <select name="ciudadPrincipal" value={formData.ciudadPrincipal} onChange={handleChange} className={`w-full p-3 border rounded focus:ring-1 focus:ring-[#378ADD] outline-none bg-white ${errors.ciudadPrincipal ? 'border-red-500' : 'border-gray-300'}`}>
                  <option value="">Selecciona una ciudad...</option>
                  <option value="Santa Cruz de la Sierra">Santa Cruz de la Sierra</option>
                  <option value="Montero">Montero</option>
                  <option value="Warnes">Warnes</option>
                  <option value="La Guardia">La Guardia</option>
                  <option value="Cotoca">Cotoca</option>
                  <option value="El Torno">El Torno</option>
                </select>
                {errors.ciudadPrincipal && <p className="text-red-500 text-xs mt-1">{errors.ciudadPrincipal}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">¿Qué productos te interesan? <span className="text-gray-400 font-normal">(Opcional)</span></label>
              <div className="flex flex-wrap gap-2">
                {categoriasDisponibles.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoriaToggle(cat.id)}
                    className={`px-4 py-2 rounded-full border text-sm transition-colors ${categorias.includes(cat.id) ? 'bg-[#378ADD] text-white border-[#378ADD]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#378ADD]'}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 space-y-2 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="aceptaTerminos" checked={formData.aceptaTerminos} onChange={handleChange} className="w-4 h-4 accent-[#378ADD]" />
                <span className="text-sm text-gray-700">Acepto los <a href="#" className="text-[#378ADD] hover:underline">Términos y Condiciones</a></span>
              </label>
              {errors.aceptaTerminos && <p className="text-red-500 text-xs ml-6">{errors.aceptaTerminos}</p>}
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="aceptaPrivacidad" checked={formData.aceptaPrivacidad} onChange={handleChange} className="w-4 h-4 accent-[#378ADD]" />
                <span className="text-sm text-gray-700">Acepto la <a href="#" className="text-[#378ADD] hover:underline">Política de Privacidad</a></span>
              </label>
              {errors.aceptaPrivacidad && <p className="text-red-500 text-xs ml-6">{errors.aceptaPrivacidad}</p>}
            </div>

            <div className="mt-8 flex justify-between items-center pt-2">
              <button onClick={() => setStep(1)} disabled={isSubmitting} className="text-gray-500 font-bold hover:text-gray-700">
                ← Volver
              </button>
              
              <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-3 bg-[#378ADD] text-white font-bold rounded-lg shadow-lg hover:bg-blue-600 transition-colors disabled:opacity-70 flex items-center gap-2">
                {isSubmitting ? 'Creando...' : '¡Empezar a comprar! 🚀'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RegisterCompradorPage;
