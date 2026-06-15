import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function RoleCard({ icon: Icon, title, description, color, features, registerPath }) {
  const navigate = useNavigate();

  const colorMap = {
    emerald: {
      border: 'border-emerald-100 hover:border-emerald-300',
      iconBg: 'bg-emerald-100',
      iconText: 'text-emerald-600',
      glow: 'hover:shadow-emerald-200/50',
      btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20',
      featureDot: 'bg-emerald-500',
    },
    blue: {
      border: 'border-blue-100 hover:border-blue-300',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      glow: 'hover:shadow-blue-200/50',
      btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20',
      featureDot: 'bg-blue-500',
    },
    amber: {
      border: 'border-amber-100 hover:border-amber-300',
      iconBg: 'bg-amber-100',
      iconText: 'text-amber-600',
      glow: 'hover:shadow-amber-200/50',
      btn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20',
      featureDot: 'bg-amber-500',
    },
  };

  const c = colorMap[color] || colorMap.emerald;

  return (
    <div className={`bg-white p-8 rounded-3xl shadow-xl border ${c.border} ${c.glow} hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 group flex flex-col`}>
      <div className={`w-16 h-16 ${c.iconBg} ${c.iconText} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 mb-6 leading-relaxed">{description}</p>
      
      {features && (
        <ul className="space-y-2.5 mb-8 flex-grow">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
              <span className={`w-1.5 h-1.5 rounded-full ${c.featureDot} flex-shrink-0`} />
              {f}
            </li>
          ))}
        </ul>
      )}
      
      <button
        onClick={() => navigate(registerPath || '/registro')}
        className={`w-full py-3.5 rounded-xl text-white font-bold text-sm ${c.btn} shadow-lg transition-all flex items-center justify-center gap-2 mt-auto group-hover:shadow-xl`}
      >
        Registrarme como {title.slice(0, -1)}
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
