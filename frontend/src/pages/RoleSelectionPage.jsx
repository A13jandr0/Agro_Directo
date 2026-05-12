import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, ArrowRight, Sprout, ShoppingBag, Truck, ShieldCheck, Check, ArrowLeft } from 'lucide-react';

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [isExiting, setIsExiting] = useState(false);

  const roles = [
    {
      id: 'Productor',
      icon: Sprout,
      title: 'Soy Productor',
      desc: 'Vendo mis cosechas directamente sin intermediarios',
      gradient: 'from-emerald-500 to-teal-600',
      bgGlow: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500',
      benefits: ['Publica tus productos con fotos', 'Recibe pagos directos', 'Gestiona tu inventario']
    },
    {
      id: 'Comprador',
      icon: ShoppingBag,
      title: 'Soy Comprador',
      desc: 'Compro productos frescos directo del campo',
      gradient: 'from-blue-500 to-indigo-600',
      bgGlow: 'bg-blue-500/10',
      borderColor: 'border-blue-500',
      benefits: ['Precios sin intermediarios', 'Productos frescos y de calidad', 'Seguimiento de tus pedidos']
    },
    {
      id: 'Transportista',
      icon: Truck,
      title: 'Soy Transportista',
      desc: 'Transporto productos del campo a la ciudad',
      gradient: 'from-amber-500 to-orange-600',
      bgGlow: 'bg-amber-500/10',
      borderColor: 'border-amber-500',
      benefits: ['Encuentra rutas disponibles', 'Gestiona tus entregas', 'Ingresos por cada flete']
    },
    {
      id: 'Administrador',
      icon: ShieldCheck,
      title: 'Administrador',
      desc: 'Gestiono usuarios y apruebo documentos',
      gradient: 'from-slate-600 to-slate-800',
      bgGlow: 'bg-slate-500/10',
      borderColor: 'border-slate-500',
      benefits: ['Aprobar perfiles y documentos', 'Moderación de plataforma', 'Acceso total (Testing)']
    }
  ];

  const handleContinue = () => {
    if (!selectedRole) return;
    setIsExiting(true);
    const routes = { 'Productor': '/register/productor', 'Comprador': '/register/comprador', 'Transportista': '/register/transportista', 'Administrador': '/register/admin' };
    setTimeout(() => navigate(routes[selectedRole.id] || '/register'), 400);
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] relative flex flex-col font-sans">
      {/* Background pattern */}
      <div className="absolute inset-0 dot-pattern opacity-40" />
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />

      {/* Header */}
      <header className="relative z-10 px-8 py-6 flex items-center justify-between animate-fade-in">
        <Link to="/login" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-xl group-hover:shadow-emerald-500/30 transition-all duration-300">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 tracking-tight block leading-tight">AgroDirecto</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Santa Cruz</span>
          </div>
        </Link>
        <Link to="/login" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al login
        </Link>
      </header>

      {/* Main content */}
      <div className={`relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8 transition-all duration-500 ${isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="w-full max-w-5xl">
          
          {/* Title */}
          <div className="text-center mb-12 animate-slide-up">
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
              ¿Cómo usarás <span className="gradient-text">AgroDirecto</span>?
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-lg mx-auto">
              Elige tu rol para personalizar tu experiencia en la plataforma
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12 stagger-children">
            {roles.map((role) => {
              const isSelected = selectedRole?.id === role.id;
              const Icon = role.icon;
              return (
                <div 
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`
                    relative flex flex-col p-7 rounded-2xl cursor-pointer
                    transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                    ${isSelected 
                      ? `bg-white border-2 ${role.borderColor} shadow-xl scale-[1.02]` 
                      : 'bg-white border-2 border-transparent shadow-sm hover:shadow-lg hover:-translate-y-1'
                    }
                  `}
                >
                  {/* Glow effect when selected */}
                  {isSelected && (
                    <div className={`absolute -inset-px ${role.bgGlow} rounded-2xl blur-xl opacity-50 -z-10`} />
                  )}

                  {/* Selected check */}
                  {isSelected && (
                    <div className={`absolute top-4 right-4 w-7 h-7 bg-gradient-to-br ${role.gradient} rounded-full flex items-center justify-center shadow-md animate-scale-bounce`}>
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-14 h-14 bg-gradient-to-br ${role.gradient} rounded-2xl flex items-center justify-center mb-5 shadow-lg transition-all duration-500 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-xl font-black text-slate-900 mb-2">{role.title}</h3>
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed">{role.desc}</p>
                  
                  {/* Benefits */}
                  <div className="border-t border-slate-100 pt-5 mt-auto space-y-3">
                    {role.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${role.gradient} flex items-center justify-center shrink-0`}>
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                        <span className="text-[13px] text-slate-600 font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continue Button */}
          <div className={`flex justify-center transition-all duration-500 ${selectedRole ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <button 
              onClick={handleContinue}
              className={`
                group px-10 py-4 rounded-2xl text-white font-bold text-base
                shadow-xl hover:shadow-2xl transition-all duration-500
                flex items-center gap-3 hover:-translate-y-1 active:translate-y-0
                bg-gradient-to-r ${selectedRole?.gradient || 'from-emerald-500 to-teal-600'}
              `}
            >
              Continuar como {selectedRole?.id}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
