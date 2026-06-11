import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Store, Truck, ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import ScrollExpandMedia from '../components/ui/scroll-expansion-hero';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f4f6f9] text-slate-800 font-inter">
      {/* Absolute top navbar for quick access before scrolling */}
      <div className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-2 text-white">
          <Leaf className="w-8 h-8 text-emerald-400" />
          <span className="font-black text-xl tracking-tight drop-shadow-md">AgroDirecto</span>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="px-5 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-sm border border-white/30 transition-all flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Ingresar
          </button>
          <button 
            onClick={() => navigate('/registro')}
            className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg text-white font-bold text-sm transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Regístrate
          </button>
        </div>
      </div>

      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?q=80&w=1280&auto=format&fit=crop"
        bgImageSrc="https://images.unsplash.com/photo-1500937386664-56d1dfef4522?q=80&w=1920&auto=format&fit=crop"
        title="Agro Directo"
        date="Conectando el campo con la ciudad"
        scrollToExpand="⬇ Desliza para explorar la plataforma"
        textBlend={false}
      >
        <div className="max-w-5xl mx-auto w-full pt-12 pb-24">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Revolucionando el agro en <span className="text-emerald-600">Bolivia</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium">
              AgroDirecto elimina a los intermediarios para que los productores obtengan precios justos y los compradores reciban alimentos frescos directamente del origen.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {/* Productor */}
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-emerald-900/5 border border-emerald-100 hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Leaf className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Productores</h3>
              <p className="text-slate-600 mb-6">
                Publica tus cosechas y preventas. Vende directo a mercados, restaurantes y familias sin pagar comisiones abusivas.
              </p>
            </div>

            {/* Comprador */}
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-blue-900/5 border border-blue-100 hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Store className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Compradores</h3>
              <p className="text-slate-600 mb-6">
                Accede a un marketplace con productos frescos verificados. Compra al por mayor directo de la finca de origen.
              </p>
            </div>

            {/* Transportista */}
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-amber-900/5 border border-amber-100 hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Transportistas</h3>
              <p className="text-slate-600 mb-6">
                Encuentra cargas disponibles (fletes) en tu ruta. Optimiza tus viajes y aumenta tus ingresos diarios.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-blue-600/20" />
            <div className="relative z-10 flex flex-col items-center">
              <ShieldCheck className="w-16 h-16 text-emerald-400 mb-6" />
              <h2 className="text-3xl md:text-4xl font-black mb-6">
                ¿Listo para formar parte del cambio?
              </h2>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-10">
                Únete a la plataforma que está transformando la comercialización agrícola en Santa Cruz y toda Bolivia.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button 
                  onClick={() => navigate('/registro')}
                  className="px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/30"
                >
                  Crear mi cuenta gratis
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-lg transition-all flex items-center gap-2"
                >
                  Ya tengo cuenta
                </button>
              </div>
            </div>
          </div>
        </div>
      </ScrollExpandMedia>
    </div>
  );
}
