import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'Productor',
      icon: '🌱',
      title: 'Soy Productor',
      desc: 'Vendo mis cosechas directamente sin intermediarios',
      color: '#1D9E75',
      bgHover: 'hover:border-[#1D9E75]',
      bgSelected: 'bg-green-50 border-[#1D9E75]',
      benefits: [
        'Publica tus productos con fotos',
        'Recibe pagos directos',
        'Gestiona tu inventario'
      ]
    },
    {
      id: 'Comprador',
      icon: '🛒',
      title: 'Soy Comprador',
      desc: 'Compro productos frescos directo del campo',
      color: '#378ADD',
      bgHover: 'hover:border-[#378ADD]',
      bgSelected: 'bg-blue-50 border-[#378ADD]',
      benefits: [
        'Precios sin intermediarios',
        'Productos frescos y de calidad',
        'Seguimiento de tus pedidos'
      ]
    },
    {
      id: 'Transportista',
      icon: '🚚',
      title: 'Soy Transportista',
      desc: 'Transporto productos del campo a la ciudad',
      color: '#BA7517',
      bgHover: 'hover:border-[#BA7517]',
      bgSelected: 'bg-orange-50 border-[#BA7517]',
      benefits: [
        'Encuentra rutas disponibles',
        'Gestiona tus entregas',
        'Ingresos por cada flete'
      ]
    }
  ];

  const handleContinue = () => {
    if (selectedRole) {
      if (selectedRole.id === 'Productor') {
        navigate('/register/productor');
      } else if (selectedRole.id === 'Comprador') {
        navigate('/register/comprador');
      } else if (selectedRole.id === 'Transportista') {
        navigate('/register/transportista');
      } else {
        navigate('/register', { state: { role: selectedRole.id } });
      }
    }
  };

  return (
    <div 
      className="min-h-screen bg-white relative flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: 'radial-gradient(#1D9E75 0.5px, transparent 0.5px)',
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0',
      }}
    >
      {/* Capa blanca semi-transparente para que los puntos sean sutiles */}
      <div className="absolute inset-0 bg-white/90 z-0"></div>

      <div className="relative z-10 w-full max-w-6xl">
        
        {/* Cabecera */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-6">
            <span className="text-4xl">🌱</span>
            <span className="text-3xl font-black text-gray-800 tracking-wider uppercase">AgroDirecto</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">¿Cómo usarás AgroDirecto?</h1>
          <p className="text-xl text-gray-500">Elige tu rol para personalizar tu experiencia en la plataforma.</p>
        </div>

        {/* Tarjetas de Selección */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {roles.map((role) => {
            const isSelected = selectedRole?.id === role.id;
            return (
              <div 
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`
                  relative flex flex-col p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 ease-in-out
                  transform hover:scale-[1.03] hover:shadow-xl
                  ${isSelected ? role.bgSelected + ' shadow-lg scale-[1.02]' : 'border-gray-200 bg-white shadow-sm ' + role.bgHover}
                `}
                style={{ borderWidth: isSelected ? '3px' : '2px' }}
              >
                {/* Check de seleccionado */}
                {isSelected && (
                  <div className="absolute top-4 right-4 bg-white rounded-full p-1 shadow-sm">
                    <svg className="w-6 h-6" style={{ color: role.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                )}

                <div className="text-6xl mb-6 text-center">{role.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">{role.title}</h3>
                <p className="text-gray-600 mb-6 text-center min-h-[48px]">{role.desc}</p>
                
                <div className="border-t border-gray-200 pt-6 mt-auto">
                  <p className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-3">Beneficios clave:</p>
                  <ul className="space-y-3">
                    {role.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: role.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botón de Continuar (Solo aparece si hay selección) */}
        <div className={`flex justify-center transition-opacity duration-500 ${selectedRole ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button 
            onClick={handleContinue}
            className="group px-12 py-4 rounded-full text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-3 transform hover:-translate-y-1"
            style={{ backgroundColor: selectedRole?.color || '#1D9E75' }}
          >
            Continuar como {selectedRole?.id}
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
};

export default RoleSelectionPage;
