import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ correo: '', contrasena: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formErrors, setFormErrors] = useState({ correo: false, contrasena: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: false }));
    if (errorMsg) setErrorMsg('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validación básica
    const errors = {
      correo: !formData.correo.trim(),
      contrasena: !formData.contrasena.trim()
    };
    
    if (errors.correo || errors.contrasena) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      const { token, usuario } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));

      // Redirección por rol
      const roleToPath = {
        'PRODUCTOR': '/dashboard/productor',
        'COMPRADOR': '/dashboard/comprador',
        'TRANSPORTISTA': '/dashboard/transportista',
        'ADMIN': '/admin'
      };

      const redirectPath = roleToPath[usuario.rol] || '/';
      
      // Simulando carga para que se vea el spinner (1 segundo extra)
      setTimeout(() => {
        navigate(redirectPath);
      }, 1000);

    } catch (error) {
      setIsLoading(false);
      setErrorMsg('Correo o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      
      {/* PANEL IZQUIERDO: IMAGEN/PATTERN (Oculto en móviles) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center relative overflow-hidden" style={{ backgroundColor: '#0F6E56' }}>
        {/* Patrón superpuesto simulando hojas/campo */}
        <div 
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")', backgroundSize: 'cover' }}
        ></div>
        
        <div className="relative z-10 text-center px-12 text-white">
          <div className="text-6xl mb-6">🌱</div>
          <h1 className="text-4xl font-black mb-4 tracking-wider">AGRODIRECTO</h1>
          <p className="text-xl font-light text-green-100">
            Conectando el campo cruceño directamente con el mercado. 
            Sin intermediarios, más justo para todos.
          </p>
        </div>
      </div>

      {/* PANEL DERECHO: FORMULARIO */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6 sm:p-12">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          
          <div className="text-center mb-8">
            <div className="lg:hidden text-4xl mb-2">🌱</div>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Bienvenido de vuelta</h2>
            <p className="text-gray-500 mt-2">Ingresa a tu cuenta de AgroDirecto</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Campo Correo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">✉️</span>
                </div>
                <input 
                  type="email" 
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D9E75] transition-all bg-gray-50 focus:bg-white
                    ${formErrors.correo ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}
                  `}
                />
              </div>
              {formErrors.correo && <span className="text-red-500 text-xs mt-1 block">El correo es obligatorio</span>}
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔒</span>
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D9E75] transition-all bg-gray-50 focus:bg-white
                    ${formErrors.contrasena ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}
                  `}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#1D9E75] transition-colors focus:outline-none"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {formErrors.contrasena && <span className="text-red-500 text-xs mt-1 block">La contraseña es obligatoria</span>}
            </div>

            {/* Olvidaste contraseña */}
            <div className="flex justify-end">
              <a href="#" className="text-sm font-medium text-[#1D9E75] hover:underline">¿Olvidaste tu contraseña?</a>
            </div>

            {/* Error de la API */}
            {errorMsg && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm font-medium animate-fade-in text-center">
                {errorMsg}
              </div>
            )}

            {/* Botón Ingresar */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg text-white font-bold text-lg shadow-md hover:shadow-lg transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#1D9E75' }}
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Ingresar'}
            </button>

          </form>

          {/* Separador */}
          <div className="mt-8 flex items-center justify-center">
            <div className="border-t border-gray-300 w-full"></div>
            <span className="bg-white px-4 text-sm text-gray-500 font-medium">¿No tienes cuenta?</span>
            <div className="border-t border-gray-300 w-full"></div>
          </div>

          {/* Botón Registro */}
          <div className="mt-6">
            <Link to="/">
              <button className="w-full py-3 px-4 border-2 rounded-lg font-bold text-[#1D9E75] hover:bg-green-50 transition-colors" style={{ borderColor: '#1D9E75' }}>
                Regístrate aquí
              </button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
