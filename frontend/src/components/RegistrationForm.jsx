import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const roles = [
  {
    id: 'Productor',
    icon: '🌾',
    title: 'Productor',
    desc: 'Agricultor, asociación o cooperativa.'
  },
  {
    id: 'Comprador',
    icon: '🛒',
    title: 'Comprador',
    desc: 'Mayorista, supermercado o individual.'
  },
  {
    id: 'Transportista',
    icon: '🚚',
    title: 'Transportista',
    desc: 'Dueño de camiones o flotas de envío.'
  }
];

const RegistrationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [step, setStep] = useState(location.state?.role ? 2 : 1);
  const [selectedRole, setSelectedRole] = useState(location.state?.role || '');
  
  const [formData, setFormData] = useState({
    nombreCompleto: '', correo: '', contrasena: '', celular: '',
    aceptaTerminos: false, aceptaPrivacidad: false,
    
    // Productor
    tipoProductor: '', nombreFinca: '', municipio: '', provincia: 'Andrés Ibáñez', aniosExperiencia: '', tipoDocumento: '', numeroDocumento: '',
    
    // Comprador
    tipoComprador: '', nombreNegocio: '', ciudadPrincipal: '',
    
    // Transportista
    tipoTransporte: '', capacidadCargaKg: '', zonaOperacion: '', numeroLicencia: '', placaVehiculo: ''
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Validaciones en tiempo real
  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const hasMinLen = formData.contrasena.length >= 8;
  const hasUpper = /[A-Z]/.test(formData.contrasena);
  const hasNumber = /\d/.test(formData.contrasena);
  const isPassValid = hasMinLen && hasUpper && hasNumber;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    // Limpiar error al escribir
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.nombreCompleto) newErrors.nombreCompleto = 'El nombre es obligatorio';
    if (!isEmailValid(formData.correo)) newErrors.correo = 'Formato de correo inválido';
    if (!isPassValid) newErrors.contrasena = 'La contraseña no cumple los requisitos';
    if (!formData.celular) newErrors.celular = 'El celular es obligatorio';
    if (!formData.aceptaTerminos) newErrors.aceptaTerminos = 'Debe aceptar los términos';
    if (!formData.aceptaPrivacidad) newErrors.aceptaPrivacidad = 'Debe aceptar la privacidad';

    if (selectedRole === 'Productor') {
      if (!formData.tipoProductor) newErrors.tipoProductor = 'Seleccione tipo';
      if (!formData.nombreFinca) newErrors.nombreFinca = 'Finca obligatoria';
      if (!formData.municipio) newErrors.municipio = 'Municipio obligatorio';
      if (!formData.aniosExperiencia) newErrors.aniosExperiencia = 'Requerido';
      if (!formData.tipoDocumento) newErrors.tipoDocumento = 'Requerido';
      if (!formData.numeroDocumento) newErrors.numeroDocumento = 'Requerido';
    } else if (selectedRole === 'Comprador') {
      if (!formData.tipoComprador) newErrors.tipoComprador = 'Seleccione tipo';
      if (!formData.ciudadPrincipal) newErrors.ciudadPrincipal = 'Ciudad obligatoria';
    } else if (selectedRole === 'Transportista') {
      if (!formData.tipoTransporte) newErrors.tipoTransporte = 'Seleccione tipo';
      if (!formData.capacidadCargaKg) newErrors.capacidadCargaKg = 'Capacidad obligatoria';
      if (!formData.zonaOperacion) newErrors.zonaOperacion = 'Zona obligatoria';
      if (!formData.numeroLicencia) newErrors.numeroLicencia = 'Licencia obligatoria';
      if (!formData.placaVehiculo) newErrors.placaVehiculo = 'Placa obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    
    setServerError('');
    
    try {
      const payload = { ...formData, rol: selectedRole };
      
      const response = await axios.post('http://localhost:5000/api/auth/register', payload);
      
      setSuccessMsg('¡Registro exitoso! Redirigiendo...');
      
      // Guardar token y redirigir
      localStorage.setItem('token', response.data.token);
      
      setTimeout(() => {
        if (selectedRole === 'Productor') navigate('/mapa');
        else if (selectedRole === 'Comprador') navigate('/');
        else navigate('/admin');
      }, 2000);
      
    } catch (error) {
      setServerError(error.response?.data?.error || 'Error de conexión con el servidor');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8 border-t-4" style={{ borderColor: '#1D9E75' }}>
      <h2 className="text-3xl font-bold text-center mb-2" style={{ color: '#1D9E75' }}>Únete a AgroDirecto</h2>
      <p className="text-gray-500 text-center mb-8">El marketplace agropecuario líder en Santa Cruz</p>

      {serverError && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm text-center border border-red-200">{serverError}</div>}
      {successMsg && <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm text-center border border-green-200">{successMsg}</div>}

      {step === 1 && (
        <div className="animate-fade-in">
          <h3 className="text-lg font-semibold mb-6 text-gray-700">Paso 1: ¿Qué rol desempeñas?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map(role => (
              <div 
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center flex flex-col items-center
                  ${selectedRole === role.id ? 'border-[#1D9E75] bg-green-50 shadow-md' : 'border-gray-200 hover:border-green-300'}`}
                style={{ borderColor: selectedRole === role.id ? '#1D9E75' : '' }}
              >
                <div className="text-5xl mb-3">{role.icon}</div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">{role.title}</h4>
                <p className="text-xs text-gray-500">{role.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-end">
            <button 
              onClick={() => setStep(2)} 
              disabled={!selectedRole}
              className="px-6 py-2 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
              style={{ backgroundColor: '#1D9E75' }}
            >
              Continuar →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="animate-fade-in">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Datos Personales ({selectedRole})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <input type="text" name="nombreCompleto" placeholder="Nombre Completo *" value={formData.nombreCompleto} onChange={handleChange} 
                className={`w-full p-3 border rounded focus:outline-none focus:ring-1 focus:ring-[#1D9E75] ${errors.nombreCompleto ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.nombreCompleto && <span className="text-red-500 text-xs mt-1">{errors.nombreCompleto}</span>}
            </div>
            
            <div>
              <input type="text" name="celular" placeholder="Número de Celular *" value={formData.celular} onChange={handleChange} 
                className={`w-full p-3 border rounded focus:outline-none focus:ring-1 focus:ring-[#1D9E75] ${errors.celular ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.celular && <span className="text-red-500 text-xs mt-1">{errors.celular}</span>}
            </div>

            <div>
              <input type="email" name="correo" placeholder="Correo Electrónico *" value={formData.correo} onChange={handleChange} 
                className={`w-full p-3 border rounded focus:outline-none focus:ring-1 focus:ring-[#1D9E75] ${errors.correo ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.correo && <span className="text-red-500 text-xs mt-1">{errors.correo}</span>}
            </div>

            <div>
              <input type="password" name="contrasena" placeholder="Contraseña *" value={formData.contrasena} onChange={handleChange} 
                className={`w-full p-3 border rounded focus:outline-none focus:ring-1 focus:ring-[#1D9E75] ${errors.contrasena ? 'border-red-500' : 'border-gray-300'}`} />
              <div className="flex gap-2 mt-2 text-xs">
                <span className={hasMinLen ? "text-green-600" : "text-gray-400"}>✓ 8 chars</span>
                <span className={hasUpper ? "text-green-600" : "text-gray-400"}>✓ Mayúscula</span>
                <span className={hasNumber ? "text-green-600" : "text-gray-400"}>✓ Número</span>
              </div>
              {errors.contrasena && <span className="text-red-500 text-xs">{errors.contrasena}</span>}
            </div>
          </div>

          {/* CAMPOS ESPECÍFICOS */}
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Información Específica</h3>
          
          {selectedRole === 'Productor' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded">
              <div>
                <select name="tipoProductor" value={formData.tipoProductor} onChange={handleChange} className={`w-full p-3 border rounded bg-white ${errors.tipoProductor ? 'border-red-500' : 'border-gray-300'}`}>
                  <option value="">Tipo de Productor *</option><option value="Individual">Individual</option><option value="Asociacion">Asociación</option><option value="Cooperativa">Cooperativa</option>
                </select>
                {errors.tipoProductor && <span className="text-red-500 text-xs mt-1">{errors.tipoProductor}</span>}
              </div>
              <div>
                <input type="text" name="nombreFinca" placeholder="Nombre de la Finca *" value={formData.nombreFinca} onChange={handleChange} className={`w-full p-3 border rounded ${errors.nombreFinca ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.nombreFinca && <span className="text-red-500 text-xs mt-1">{errors.nombreFinca}</span>}
              </div>
              <div>
                <input type="text" name="municipio" placeholder="Municipio *" value={formData.municipio} onChange={handleChange} className={`w-full p-3 border rounded ${errors.municipio ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.municipio && <span className="text-red-500 text-xs mt-1">{errors.municipio}</span>}
              </div>
              <div>
                <input type="number" name="aniosExperiencia" placeholder="Años de Experiencia *" value={formData.aniosExperiencia} onChange={handleChange} className={`w-full p-3 border rounded ${errors.aniosExperiencia ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.aniosExperiencia && <span className="text-red-500 text-xs mt-1">{errors.aniosExperiencia}</span>}
              </div>
              <div>
                <select name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange} className={`w-full p-3 border rounded bg-white ${errors.tipoDocumento ? 'border-red-500' : 'border-gray-300'}`}>
                  <option value="">Tipo Documento *</option><option value="CI">Carnet (CI)</option><option value="NIT">NIT</option>
                </select>
                {errors.tipoDocumento && <span className="text-red-500 text-xs mt-1">{errors.tipoDocumento}</span>}
              </div>
              <div>
                <input type="text" name="numeroDocumento" placeholder="Número de Documento *" value={formData.numeroDocumento} onChange={handleChange} className={`w-full p-3 border rounded ${errors.numeroDocumento ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.numeroDocumento && <span className="text-red-500 text-xs mt-1">{errors.numeroDocumento}</span>}
              </div>
            </div>
          )}

          {selectedRole === 'Comprador' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded">
              <div>
                <select name="tipoComprador" value={formData.tipoComprador} onChange={handleChange} className={`w-full p-3 border rounded bg-white ${errors.tipoComprador ? 'border-red-500' : 'border-gray-300'}`}>
                  <option value="">Tipo de Comprador *</option><option value="Persona">Persona Individual</option><option value="Negocio">Negocio Pequeño</option><option value="Empresa">Empresa</option>
                </select>
                {errors.tipoComprador && <span className="text-red-500 text-xs mt-1">{errors.tipoComprador}</span>}
              </div>
              <div>
                <input type="text" name="nombreNegocio" placeholder="Nombre del Negocio (Opcional)" value={formData.nombreNegocio} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded" />
              </div>
              <div>
                <input type="text" name="ciudadPrincipal" placeholder="Ciudad Principal *" value={formData.ciudadPrincipal} onChange={handleChange} className={`w-full p-3 border rounded ${errors.ciudadPrincipal ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.ciudadPrincipal && <span className="text-red-500 text-xs mt-1">{errors.ciudadPrincipal}</span>}
              </div>
            </div>
          )}

          {selectedRole === 'Transportista' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded">
              <div>
                <select name="tipoTransporte" value={formData.tipoTransporte} onChange={handleChange} className={`w-full p-3 border rounded bg-white ${errors.tipoTransporte ? 'border-red-500' : 'border-gray-300'}`}>
                  <option value="">Tipo de Vehículo *</option><option value="Camion">Camión</option><option value="Camioneta">Camioneta</option><option value="Moto">Moto</option><option value="Otro">Otro</option>
                </select>
                {errors.tipoTransporte && <span className="text-red-500 text-xs mt-1">{errors.tipoTransporte}</span>}
              </div>
              <div>
                <input type="number" name="capacidadCargaKg" placeholder="Capacidad de Carga (Kg) *" value={formData.capacidadCargaKg} onChange={handleChange} className={`w-full p-3 border rounded ${errors.capacidadCargaKg ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.capacidadCargaKg && <span className="text-red-500 text-xs mt-1">{errors.capacidadCargaKg}</span>}
              </div>
              <div>
                <select name="zonaOperacion" value={formData.zonaOperacion} onChange={handleChange} className={`w-full p-3 border rounded bg-white ${errors.zonaOperacion ? 'border-red-500' : 'border-gray-300'}`}>
                  <option value="">Zona de Operación *</option><option value="Local">Local (Ciudad)</option><option value="Regional">Regional</option><option value="Departamental">Departamental</option>
                </select>
                {errors.zonaOperacion && <span className="text-red-500 text-xs mt-1">{errors.zonaOperacion}</span>}
              </div>
              <div>
                <input type="text" name="numeroLicencia" placeholder="N° de Licencia *" value={formData.numeroLicencia} onChange={handleChange} className={`w-full p-3 border rounded ${errors.numeroLicencia ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.numeroLicencia && <span className="text-red-500 text-xs mt-1">{errors.numeroLicencia}</span>}
              </div>
              <div>
                <input type="text" name="placaVehiculo" placeholder="Placa del Vehículo *" value={formData.placaVehiculo} onChange={handleChange} className={`w-full p-3 border rounded ${errors.placaVehiculo ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.placaVehiculo && <span className="text-red-500 text-xs mt-1">{errors.placaVehiculo}</span>}
              </div>
            </div>
          )}

          {/* TÉRMINOS */}
          <div className="mb-6 bg-gray-50 p-4 rounded">
            <label className="flex items-start mb-2 cursor-pointer">
              <input type="checkbox" name="aceptaTerminos" checked={formData.aceptaTerminos} onChange={handleChange} className="mt-1 mr-3 h-4 w-4" style={{ accentColor: '#1D9E75' }} />
              <span className="text-sm text-gray-700">Acepto los términos y condiciones de uso de AgroDirecto.</span>
            </label>
            {errors.aceptaTerminos && <p className="text-red-500 text-xs ml-7 mb-2">{errors.aceptaTerminos}</p>}
            
            <label className="flex items-start cursor-pointer">
              <input type="checkbox" name="aceptaPrivacidad" checked={formData.aceptaPrivacidad} onChange={handleChange} className="mt-1 mr-3 h-4 w-4" style={{ accentColor: '#1D9E75' }} />
              <span className="text-sm text-gray-700">Acepto la política de tratamiento de datos personales y privacidad.</span>
            </label>
            {errors.aceptaPrivacidad && <p className="text-red-500 text-xs ml-7">{errors.aceptaPrivacidad}</p>}
          </div>

          <div className="flex justify-between items-center mt-8">
            <button type="button" onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-700 font-medium">← Cambiar Rol</button>
            <button type="submit" className="px-8 py-3 text-white font-bold rounded-lg shadow-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: '#1D9E75' }}>
              Registrarme
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RegistrationForm;
