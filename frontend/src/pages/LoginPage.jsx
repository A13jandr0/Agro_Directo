import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen flex w-full font-sans" style={{ backgroundColor: '#060f07' }}>

      {/* PANEL IZQUIERDO */}
      <div className="hidden lg:flex w-[52%] relative flex-col overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=1920&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060f07]/95 via-[#060f07]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060f07]/80 via-transparent to-[#060f07]/30" />

        <div className="relative z-10 flex flex-col h-full p-12">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#16a34a22', border: '1px solid #16a34a44' }}>
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-white text-base font-black tracking-tight block leading-none">AgroDirecto</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 block mt-0.5">Santa Cruz · Bolivia</span>
            </div>
          </div>

          <div className="my-auto max-w-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8" style={{ backgroundColor: '#16a34a18', border: '1px solid #16a34a30' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Plataforma agropecuaria</span>
            </div>
            <h1 className="text-[2.8rem] font-black text-white leading-[1.08] tracking-tight mb-6">
              Del campo<br />
              <span className="text-emerald-400">a tu mesa.</span>
            </h1>
            <p className="text-[14px] text-white/50 leading-relaxed font-medium max-w-[300px]">
              Conectamos productores bolivianos directamente con compradores, eliminando intermediarios y asegurando precios justos.
            </p>
          </div>

          <div className="flex items-center gap-6">
            {[{ value: '500+', label: 'Productores' }, { value: '12', label: 'Provincias' }, { value: '0', label: 'Intermediarios' }].map((s, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-2xl font-black text-white leading-none">{s.value}</span>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-wide mt-1">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PANEL DERECHO */}
      <div className="flex-1 flex items-center justify-center p-8 relative" style={{ backgroundColor: '#060f07' }}>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #16a34a08 0%, transparent 70%)' }}
        />

        <div className={`w-full max-w-[380px] relative z-10 ${shake ? 'animate-shake' : ''}`}>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#16a34a22', border: '1px solid #16a34a44' }}>
              <Leaf className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-white text-base font-black tracking-tight">AgroDirecto</span>
          </div>

          <div className="mb-9">
            <h2 className="text-[28px] font-black text-white tracking-tight leading-tight">Iniciar sesión</h2>
            <p className="text-[13px] text-white/35 mt-2 font-medium">Ingresá con tu cuenta registrada en AgroDirecto</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-[12px] font-bold text-white/50 uppercase tracking-widest mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={`w-4 h-4 ${errors.correo ? 'text-rose-400' : 'text-white/20'}`} />
                </div>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com"
                  className={`w-full pl-11 pr-4 py-3.5 text-[13px] font-medium text-white placeholder-white/20 rounded-xl outline-none transition-all ${
                    errors.correo
                      ? 'border border-rose-500/50 focus:ring-1 focus:ring-rose-500/30'
                      : 'border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20'
                  }`}
                  style={{ backgroundColor: '#ffffff08', caretColor: '#16a34a' }}
                />
              </div>
              {errors.correo && (
                <p className="text-rose-400 text-[11px] font-semibold mt-1.5">{errors.correo}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-[12px] font-bold text-white/50 uppercase tracking-widest mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`w-4 h-4 ${errors.contrasena ? 'text-rose-400' : 'text-white/20'}`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres"
                  className={`w-full pl-11 pr-12 py-3.5 text-[13px] font-medium text-white placeholder-white/20 rounded-xl outline-none transition-all ${
                    errors.contrasena
                      ? 'border border-rose-500/50 focus:ring-1 focus:ring-rose-500/30'
                      : 'border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20'
                  }`}
                  style={{ backgroundColor: '#ffffff08', caretColor: '#16a34a' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/20 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.contrasena && (
                <p className="text-rose-400 text-[11px] font-semibold mt-1.5">{errors.contrasena}</p>
              )}
            </div>

            {/* Recordarme + Olvidé */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded text-emerald-600 border-white/20 focus:ring-0 cursor-pointer"
                  style={{ backgroundColor: '#ffffff08' }}
                />
                <span className="text-[12px] font-semibold text-white/35">Recordarme</span>
              </label>
              <a href="#" className="text-[12px] font-bold text-emerald-500 hover:text-emerald-400 transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-all duration-200 mt-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.backgroundColor = '#15803d'; }}
              onMouseLeave={e => { if (!isLoading) e.currentTarget.style.backgroundColor = '#16a34a'; }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <span>Ingresar</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px" style={{ backgroundColor: '#ffffff0a' }} />
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">o</span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#ffffff0a' }} />
          </div>

          <p className="text-center text-[13px] text-white/30 font-medium">
            ¿No tenés cuenta?{' '}
            <Link to="/registro" className="font-bold text-emerald-500 hover:text-emerald-400 transition-colors">
              Registrate aquí
            </Link>
          </p>

          <p className="text-center text-[10px] text-white/15 font-medium mt-10">
            © 2026 AgroDirecto · Santa Cruz, Bolivia
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
