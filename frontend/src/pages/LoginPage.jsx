import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({ correo: '', contrasena: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ correo: '', contrasena: '' });
  const [shake, setShake] = useState(false);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'correo') {
      if (!value) {
        error = 'El correo electrónico es requerido';
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        error = 'Ingresá un correo electrónico válido';
      }
    } else if (name === 'contrasena') {
      if (!value) {
        error = 'La contraseña es requerida';
      } else if (value.length < 8) {
        error = 'La contraseña debe tener al menos 8 caracteres';
      }
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const isEmailValid = validateField('correo', formData.correo);
    const isPassValid = validateField('contrasena', formData.contrasena);

    if (!isEmailValid || !isPassValid) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error('Por favor, corregí los errores en el formulario');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      const { token, usuario } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));

      toast.success(`¡Bienvenido de nuevo, ${usuario.nombre_completo}!`);

      const roleToPath = {
        'PRODUCTOR': '/dashboard/productor',
        'COMPRADOR': '/dashboard/comprador',
        'TRANSPORTISTA': '/dashboard/transportista',
        'ADMINISTRADOR': '/admin/verificaciones'
      };

      setTimeout(() => {
        navigate(roleToPath[usuario.rol] || '/');
      }, 1000);
    } catch (error) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      const errMsg = error.response?.data?.error || 'Credenciales incorrectas. Verificá tu correo y contraseña.';
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans bg-[#f4f6f9]">
      {/* LADO IZQUIERDO — Hero (bg gradiente emerald-700 to-emerald-900) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 text-white p-12">
        {/* Overlay con gradient placeholder verde que simula el campo agrícola boliviano */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/40 to-emerald-800/20 mix-blend-multiply z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 z-0 transform scale-105 transition-transform duration-10000"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1000')" 
          }} 
        />
        
        {/* Patrón de puntos superpuesto (rgba blanco 0.04) */}
        <div className="absolute inset-0 bg-radial-gradient-dots opacity-40 z-10" />

        {/* Floating gradient circles */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-float z-10" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl animate-float z-10" style={{ animationDelay: '2s' }} />

        {/* Top Header */}
        <div className="relative z-20 flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight block">AgroDirecto</span>
            <span className="text-[10px] font-bold tracking-widest text-emerald-300 uppercase">Santa Cruz</span>
          </div>
        </div>

        {/* Central Content */}
        <div className="relative z-20 max-w-md my-auto animate-slide-up">
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight mb-4">
            Conectamos el campo con la ciudad
          </h2>
          <p className="text-emerald-100/80 text-base leading-relaxed mb-10">
            Comprá directamente a productores cruceños y optimizá tu cadena de suministro con precios justos y transporte coordinado.
          </p>

          {/* Estadísticas animadas */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Productores', value: '500+' },
              { label: 'Provincias', value: '12' },
              { label: 'Intermediarios', value: '30% menos' },
            ].map((stat, i) => (
              <div 
                key={i} 
                className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 transition-all hover:bg-white/15 cursor-default group"
              >
                <div className="text-xl font-black text-white group-hover:scale-105 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-[10px] font-bold text-emerald-200/70 uppercase tracking-wide mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-20 text-xs text-emerald-200/50">
          © 2026 AgroDirecto Santa Cruz — Plataforma Agropecuaria Digital Boliviana.
        </div>
      </div>

      {/* LADO DERECHO — Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-16 relative">
        {/* Decorative background blur */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-emerald-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

        <div className={`w-full max-w-md relative z-10 ${shake ? 'animate-shake' : ''}`}>
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">AgroDirecto</span>
          </div>

          <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-900/[0.03] border border-slate-100 animate-slide-up">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight text-[#111827]">Bienvenido de nuevo</h1>
              <p className="text-sm text-slate-400 mt-2">Ingresá con tu cuenta registrada</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Campo Email */}
              <div className="relative group">
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    placeholder="ejemplo@correo.com"
                    className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-200 ${
                      errors.correo ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.correo && (
                  <p className="text-rose-600 text-xs font-semibold mt-1.5 animate-slide-up">
                    {errors.correo}
                  </p>
                )}
              </div>

              {/* Campo Contraseña */}
              <div className="relative group">
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <Lock className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleChange}
                    placeholder="Tus 8 caracteres de seguridad"
                    className={`w-full pl-11 pr-12 py-3.5 bg-gray-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-200 ${
                      errors.contrasena ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
                {errors.contrasena && (
                  <p className="text-rose-600 text-xs font-semibold mt-1.5 animate-slide-up">
                    {errors.contrasena}
                  </p>
                )}
              </div>

              {/* Recordarme + Olvidaste Contraseña */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 focus:ring-offset-0 transition-all cursor-pointer"
                  />
                  <span className="font-semibold text-slate-600">Recordarme</span>
                </label>
                <a 
                  href="#" 
                  className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {/* Botón Ingresar */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3.5 font-bold text-sm shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <span>Ingresar</span>
                )}
              </button>
            </form>

            {/* Separador */}
            <div className="mt-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">o</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Link Registro */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500 font-medium">
                ¿No tenés cuenta?{' '}
                <Link 
                  to="/registro" 
                  className="font-bold text-emerald-600 hover:underline transition-colors"
                >
                  Registrate aquí
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
