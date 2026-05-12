import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, LogIn, Sprout, ShoppingBag, Truck, Shield } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ correo: '', contrasena: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formErrors, setFormErrors] = useState({ correo: false, contrasena: false });
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: false }));
    if (errorMsg) setErrorMsg('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
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

      const roleToPath = {
        'PRODUCTOR': '/dashboard/productor',
        'COMPRADOR': '/dashboard/comprador',
        'TRANSPORTISTA': '/dashboard/transportista',
        'ADMINISTRADOR': '/admin/verificaciones'
      };
      setTimeout(() => navigate(roleToPath[usuario.rol] || '/'), 600);
    } catch (error) {
      setIsLoading(false);
      setErrorMsg('Correo o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans">

      {/* LEFT PANEL — Premium visual */}
      <div className="hidden lg:flex w-[55%] flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857]">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-[100px] animate-float" />
          <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] bg-teal-300/8 rounded-full blur-[120px] animate-float" style={{ animationDelay: '3s' }} />
          <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-emerald-200/5 rounded-full blur-[80px] animate-float" style={{ animationDelay: '1.5s' }} />
          {/* Dot pattern */}
          <div className="absolute inset-0 dot-pattern opacity-30" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center flex-1 px-16">
          <div className="max-w-md text-center">
            {/* Logo */}
            <div className="mb-10 animate-slide-up">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto border border-white/20 shadow-2xl shadow-emerald-900/30 animate-pulse-glow">
                <Leaf className="w-10 h-10 text-emerald-300" />
              </div>
            </div>

            <h1 className="text-5xl font-black mb-5 tracking-tight text-white leading-[1.1] animate-slide-up" style={{ animationDelay: '0.1s' }}>
              AgroDirecto
              <span className="block text-2xl font-bold text-emerald-300/70 mt-2">Santa Cruz</span>
            </h1>
            
            <p className="text-lg text-emerald-100/60 leading-relaxed mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Conectando el campo cruceño con el mercado. Sin intermediarios, más justo para todos.
            </p>

            {/* Feature cards */}
            <div className="grid grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              {[
                { icon: Sprout, label: 'Productores', value: '120+', color: 'emerald' },
                { icon: ShoppingBag, label: 'Productos', value: '500+', color: 'teal' },
                { icon: Truck, label: 'Entregas', value: '1.2K', color: 'cyan' },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="bg-white/[0.07] backdrop-blur-xl rounded-2xl p-4 border border-white/[0.1] hover:bg-white/[0.12] transition-all duration-500 group cursor-default">
                    <Icon className="w-5 h-5 text-emerald-400 mb-3 mx-auto group-hover:scale-110 transition-transform duration-300" />
                    <p className="text-2xl font-black text-white mb-0.5">{s.value}</p>
                    <p className="text-[11px] text-emerald-200/50 font-bold uppercase tracking-wider">{s.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 px-16 pb-8">
          <p className="text-emerald-200/30 text-xs text-center">
            &copy; 2026 AgroDirecto Santa Cruz — Todos los derechos reservados
          </p>
        </div>
      </div>

      {/* RIGHT PANEL — Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center bg-[#fafbfc] p-6 sm:p-12 relative">
        {/* Subtle background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50 rounded-full blur-[100px] opacity-40" />
        
        <div className="w-full max-w-[420px] relative z-10">
          
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-10 animate-fade-in">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">AgroDirecto</span>
          </div>

          <div className="animate-slide-up">
            {/* Form card */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-900/[0.04] border border-slate-200/60">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Bienvenido</h2>
                <p className="text-sm text-slate-400 mt-2 font-medium">Ingresa a tu cuenta para continuar</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                
                {/* Correo */}
                <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <label className="block text-[13px] font-bold text-slate-700 mb-2">Correo electrónico</label>
                  <div className={`relative rounded-xl transition-all duration-300 ${focusedField === 'correo' ? 'ring-2 ring-emerald-500/20' : ''}`}>
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className={`w-4 h-4 transition-colors duration-300 ${focusedField === 'correo' ? 'text-emerald-500' : 'text-slate-400'}`} />
                    </div>
                    <input
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('correo')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="ejemplo@correo.com"
                      className={`w-full pl-11 pr-4 py-3.5 border rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 transition-all duration-300 bg-slate-50/50 focus:bg-white ${
                        formErrors.correo ? 'border-red-400 ring-2 ring-red-400/20' : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {formErrors.correo && <span className="text-red-500 text-xs mt-1.5 block font-medium">El correo es obligatorio</span>}
                </div>

                {/* Contraseña */}
                <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
                  <label className="block text-[13px] font-bold text-slate-700 mb-2">Contraseña</label>
                  <div className={`relative rounded-xl transition-all duration-300 ${focusedField === 'contrasena' ? 'ring-2 ring-emerald-500/20' : ''}`}>
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className={`w-4 h-4 transition-colors duration-300 ${focusedField === 'contrasena' ? 'text-emerald-500' : 'text-slate-400'}`} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="contrasena"
                      value={formData.contrasena}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('contrasena')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Tu contraseña segura"
                      className={`w-full pl-11 pr-12 py-3.5 border rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 transition-all duration-300 bg-slate-50/50 focus:bg-white ${
                        formErrors.contrasena ? 'border-red-400 ring-2 ring-red-400/20' : 'border-slate-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-600 transition-colors duration-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formErrors.contrasena && <span className="text-red-500 text-xs mt-1.5 block font-medium">La contraseña es obligatoria</span>}
                </div>

                {/* Forgot */}
                <div className="flex justify-end">
                  <a href="#" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors duration-300">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                {/* Error */}
                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium flex items-center gap-3 animate-scale-bounce">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    {errorMsg}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-bold text-sm transition-all duration-500 shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/30 flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed group hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" /> 
                      Iniciar Sesión
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="mt-8 flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">¿Nuevo aquí?</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              </div>

              {/* Register */}
              <div className="mt-6">
                <Link to="/">
                  <button className="w-full py-3.5 border-2 border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all duration-300 flex items-center justify-center gap-2 group">
                    Crear cuenta gratis
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-6 flex items-center justify-center gap-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Shield className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Datos seguros</span>
              </div>
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <span className="text-[11px] text-slate-400 font-medium">&copy; 2026 AgroDirecto</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
