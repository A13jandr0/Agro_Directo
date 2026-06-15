import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Leaf, Store, Truck, ShieldCheck, ArrowRight, UserPlus, LogIn,
  Upload, Handshake, PackageCheck, MapPin, Lock, Eye, BarChart3,
  Phone, Mail, ChevronRight,
  Users, TrendingUp, Globe, CheckCircle, Star, Map,
} from 'lucide-react';
import ScrollExpandMedia from '../components/ui/scroll-expansion-hero';
import StatCounter from '../components/landing/StatCounter';
import RoleCard from '../components/landing/RoleCard';
import ProductCard from '../components/landing/ProductCard';
import TestimonialCard from '../components/landing/TestimonialCard';
import ScrollReveal from '../components/landing/ScrollReveal';

/* ============================================================
   LANDING PAGE — AgroDirecto Santa Cruz
   ============================================================ */
export default function LandingPage() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);

  // Cargar productos destacados desde el marketplace
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get('http://localhost:5000/api/marketplace/productos', {
          headers,
          params: { lat_comprador: -17.7833, lng_comprador: -63.1821, radio_km: 200 }
        });
        const data = Array.isArray(res.data) ? res.data : [];
        setProductos(data.slice(0, 6));
      } catch (err) {
        console.warn('Productos públicos no disponibles, mostrando datos de ejemplo.');
        // Productos de respaldo estáticos
        setProductos([
          { id: 1, nombre_producto: 'Soya Grano de Oro', precio_unitario: 120, unidad_medida: 'Quintal', nombre_finca: 'Hacienda El Sol', municipio: 'Montero' },
          { id: 2, nombre_producto: 'Maíz Amarillo Duro', precio_unitario: 95, unidad_medida: 'Quintal', nombre_finca: 'Finca Los Tajibos', municipio: 'Warnes' },
          { id: 3, nombre_producto: 'Tomate Santa Cruz', precio_unitario: 30, unidad_medida: 'Caja', nombre_finca: 'Chaco Verde', municipio: 'Cotoca' },
          { id: 4, nombre_producto: 'Arroz Grano Largo', precio_unitario: 180, unidad_medida: 'Quintal', nombre_finca: 'Arrozal del Norte', municipio: 'San Julián' },
        ]);
      }
    };
    fetchProductos();
  }, []);

  /* ── STEPS DATA ── */
  const steps = [
    { icon: Upload, title: 'Publica tu cosecha', desc: 'El productor sube su producto con fotos, precios y cantidades disponibles desde cualquier dispositivo.', color: 'emerald' },
    { icon: Handshake, title: 'Conecta con comprador', desc: 'El comprador explora el marketplace, selecciona lo que necesita y realiza su pedido directamente al productor.', color: 'blue' },
    { icon: PackageCheck, title: 'Transportista entrega', desc: 'Un transportista verificado recoge la carga en la finca y la lleva al destino con seguimiento en tiempo real.', color: 'amber' },
  ];

  /* ── ROLES DATA ── */
  const roles = [
    {
      icon: Leaf, title: 'Productores', color: 'emerald',
      description: 'Publica tus cosechas y preventas. Vende directo a mercados, restaurantes y familias sin pagar comisiones abusivas.',
      features: ['Catalogo digital de cosechas', 'Precios justos sin intermediarios', 'Gestión de pedidos en tiempo real', 'Mapa GPS de tu finca'],
      registerPath: '/registro',
    },
    {
      icon: Store, title: 'Compradores', color: 'blue',
      description: 'Accede a un marketplace con productos frescos verificados. Compra al por mayor directo de la finca de origen.',
      features: ['Marketplace con filtros avanzados', 'Comparador de precios del abasto', 'Seguimiento de pedidos tipo PedidosYa', 'Notificaciones de nuevos productos'],
      registerPath: '/registro',
    },
    {
      icon: Truck, title: 'Transportistas', color: 'amber',
      description: 'Encuentra cargas disponibles (fletes) en tu ruta. Optimiza tus viajes y aumenta tus ingresos diarios.',
      features: ['Bolsa de cargas disponibles', 'Hoja de ruta inteligente con mapa', 'Firma digital de entrega', 'Historial de viajes completados'],
      registerPath: '/registro',
    },
  ];

  /* ── TESTIMONIALS DATA ── */
  const testimonials = [
    { name: 'Ramiro Flores Vaca', role: 'Productor', location: 'Montero', quote: 'Antes vendía mi soya a intermediarios por 80 Bs el quintal. Ahora con AgroDirecto vendo directo a 120 Bs. Mi familia notó la diferencia inmediatamente.' },
    { name: 'Marcela Gutiérrez', role: 'Compradora', location: 'Santa Cruz', quote: 'Los tomates llegan frescos del mismo día. Ya no tengo que madrugar al Abasto ni regatear. El seguimiento del pedido es como PedidosYa, genial.' },
    { name: 'Hugo Condori Choque', role: 'Transportista', location: 'Warnes', quote: 'La bolsa de cargas me permite llenar mi camión en cada viaje. Ya no viajo vacío de vuelta, mis ingresos se duplicaron en el primer mes.' },
  ];

  /* ── TRUST FEATURES ── */
  const trustFeatures = [
    { icon: ShieldCheck, title: 'Productores verificados', desc: 'Cada productor pasa por un proceso de verificación documental antes de publicar.' },
    { icon: Map, title: 'Seguimiento en tiempo real', desc: 'Sigue tu pedido en un mapa con GPS, tal como las apps de delivery más reconocidas.' },
    { icon: Lock, title: 'Pagos seguros', desc: 'Confirmación de pago con comprobante QR. Tu dinero está protegido en cada transacción.' },
    { icon: Star, title: 'Calidad garantizada', desc: 'Sistema de calificaciones y reseñas para mantener la calidad de los productos.' },
  ];

  /* ── BOLIVIA IMPACT ── */
  const departments = [
    { name: 'Santa Cruz', status: 'active' },
    { name: 'Cochabamba', status: 'upcoming' },
    { name: 'Tarija', status: 'upcoming' },
    { name: 'Beni', status: 'planned' },
    { name: 'La Paz', status: 'planned' },
    { name: 'Chuquisaca', status: 'planned' },
    { name: 'Oruro', status: 'planned' },
    { name: 'Potosí', status: 'planned' },
    { name: 'Pando', status: 'planned' },
  ];

  const stepColorMap = {
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', line: 'bg-emerald-400' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', line: 'bg-blue-400' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600', line: 'bg-amber-400' },
  };

  return (
    <div className="bg-[#f4f6f9] text-slate-800 font-inter">
      {/* ════════════════════════════════════════════
          NAVBAR FIJO
          ════════════════════════════════════════════ */}
      <div className="fixed top-0 left-0 w-full z-50 p-4 sm:p-6 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2 text-white">
          <Leaf className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />
          <span className="font-black text-lg sm:text-xl tracking-tight drop-shadow-md">AgroDirecto</span>
        </div>
        <div className="flex gap-2 sm:gap-4">
          <button
            onClick={() => navigate('/login')}
            className="px-4 sm:px-5 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Ingresar</span>
          </button>
          <button
            onClick={() => navigate('/registro')}
            className="px-4 sm:px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Regístrate</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          SECCIÓN 1: HERO CON SCROLL EXPAND MEDIA
          ════════════════════════════════════════════
        
        OPCIONES mediaSrc (imagen central que se expande):
        1. Campo de trigo dorado:  photo-1500382017468-9049fed747ef
        2. Cosecha de maíz:        photo-1574943320219-553eb213f72d
        3. Verduras frescas:       photo-1488459716781-31db52582fe9
        4. Plantación verde:       photo-1464226184884-fa280b87c399
        
        OPCIONES bgImageSrc (fondo fullscreen detrás del hero):
        1. Paisaje agrícola verde: photo-1625246333195-78d9c38ad449
        2. Campo arado panorámico: photo-1523348837708-15d4a09cfac2
        3. Atardecer en campo:     photo-1500076656116-558758c991c1
        4. Montañas y campo verde: photo-1501854140801-50d01698950b
        
        Para usar imágenes locales en vez de Unsplash:
        1. Descarga a: /src/assets/images/agro-hero.jpg y agro-background.jpg
        2. Importa: import agroHero from '../assets/images/agro-hero.jpg';
        3. Usa: mediaSrc={agroHero}
      */}
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1280&q=80&auto=format&fit=crop"
        bgImageSrc="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80&auto=format&fit=crop"
        title="Agro Directo"
        date="Conectando el campo con la ciudad"
        scrollToExpand="Desliza para explorar la plataforma"
        textBlend={false}
      >
        <div className="max-w-6xl mx-auto w-full pt-8 pb-24 px-4">
          {/* ── Hero Intro + CTAs ── */}
          <ScrollReveal>
            <div className="text-center mb-10 space-y-5">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Revolucionando el agro en <span className="text-emerald-600">Bolivia</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
                AgroDirecto elimina a los intermediarios para que los productores obtengan precios justos y los compradores reciban alimentos frescos directamente del origen.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => navigate('/marketplace')}
                  className="px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 hover:-translate-y-0.5"
                >
                  Explorar Productos
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/registro')}
                  className="px-8 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-lg border border-slate-200 transition-all flex items-center gap-2 hover:-translate-y-0.5"
                >
                  <UserPlus className="w-4 h-4" />
                  Crear mi cuenta
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* ── Métricas Destacadas ── */}
          <ScrollReveal delay={150}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-24 py-10 px-6 bg-white/70 backdrop-blur-sm rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-200/30">
              <StatCounter value={248} suffix="+" label="Productores Registrados" icon={Users} color="emerald" />
              <StatCounter value={1520} suffix="+" label="Compradores Activos" icon={Store} color="blue" />
              <StatCounter value={3400} suffix=" tn" label="Toneladas Comercializadas" icon={TrendingUp} color="amber" />
              <StatCounter value={3} label="Departamentos Cubiertos" icon={Globe} color="slate" />
            </div>
          </ScrollReveal>

          {/* ════════════════════════════════════════════
              SECCIÓN 2: CÓMO FUNCIONA (3 pasos)
              ════════════════════════════════════════════ */}
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">Proceso simple</p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">¿Cómo funciona?</h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 mb-28 relative">
            {/* Línea conectora desktop */}
            <div className="hidden md:block absolute top-20 left-[18%] right-[18%] h-0.5 bg-gradient-to-r from-emerald-300 via-blue-300 to-amber-300 z-0" />

            {steps.map((step, i) => {
              const sc = stepColorMap[step.color];
              return (
                <ScrollReveal key={i} delay={i * 150}>
                  <div className="relative z-10 text-center bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/30 border border-slate-100 hover:-translate-y-2 hover:shadow-xl transition-all duration-500">
                    <div className={`w-16 h-16 ${sc.bg} rounded-2xl flex items-center justify-center mx-auto mb-5 relative`}>
                      <step.icon className={`w-7 h-7 ${sc.text}`} />
                      <span className={`absolute -top-2 -right-2 w-7 h-7 ${sc.line} rounded-full flex items-center justify-center text-white text-xs font-black`}>
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">{step.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">{step.desc}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          {/* ════════════════════════════════════════════
              SECCIÓN 3: ROLES (Productores, Compradores, Transportistas)
              ════════════════════════════════════════════ */}
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">¿Quién eres?</p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Elige tu rol en la plataforma</h2>
              <p className="text-slate-500 mt-3 max-w-2xl mx-auto">Cada participante tiene herramientas diseñadas especialmente para su operación diaria.</p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 mb-28">
            {roles.map((role, i) => (
              <ScrollReveal key={i} delay={i * 120}>
                <RoleCard {...role} />
              </ScrollReveal>
            ))}
          </div>

          {/* ════════════════════════════════════════════
              SECCIÓN 4: PRODUCTOS DESTACADOS
              ════════════════════════════════════════════ */}
          {productos.length > 0 && (
            <>
              <ScrollReveal>
                <div className="text-center mb-14">
                  <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">Directo del campo</p>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Productos Destacados</h2>
                  <p className="text-slate-500 mt-3 max-w-2xl mx-auto">Los productos más frescos publicados por nuestros productores verificados.</p>
                </div>
              </ScrollReveal>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {productos.map((prod, i) => (
                  <ScrollReveal key={prod.id || i} delay={i * 100}>
                    <ProductCard product={prod} />
                  </ScrollReveal>
                ))}
              </div>

              <ScrollReveal>
                <div className="text-center mb-28">
                  <button
                    onClick={() => navigate('/marketplace')}
                    className="px-8 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-lg border border-slate-200 transition-all flex items-center gap-2 mx-auto hover:-translate-y-0.5"
                  >
                    Ver todo el marketplace
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </ScrollReveal>
            </>
          )}

          {/* ════════════════════════════════════════════
              SECCIÓN 5: CONFIANZA Y SEGURIDAD
              ════════════════════════════════════════════ */}
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">Tranquilidad total</p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Confianza y Seguridad</h2>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {trustFeatures.map((feat, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md shadow-slate-200/30 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-400">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                    <feat.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h4 className="font-black text-slate-900 mb-2">{feat.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Testimonios */}
          <ScrollReveal>
            <div className="text-center mb-10">
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Testimonios reales</p>
              <h3 className="text-2xl font-black text-slate-900">Lo que dicen nuestros usuarios</h3>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 mb-28">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} delay={i * 120}>
                <TestimonialCard {...t} />
              </ScrollReveal>
            ))}
          </div>

          {/* ════════════════════════════════════════════
              SECCIÓN 6: IMPACTO EN BOLIVIA
              ════════════════════════════════════════════ */}
          <ScrollReveal>
            <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-[2.5rem] p-8 sm:p-12 border border-emerald-100/60 mb-28 shadow-lg shadow-emerald-100/20">
              <div className="text-center mb-12">
                <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">Crecimiento sostenible</p>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Impacto en Bolivia</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Estadísticas de impacto */}
                <div className="space-y-6">
                  {[
                    { label: 'Productores beneficiados', value: '248+', desc: 'familias productoras generando ingresos justos' },
                    { label: 'Reducción de intermediarios', value: '85%', desc: 'de la cadena comercial eliminada' },
                    { label: 'Ahorro para compradores', value: '30%', desc: 'menos que en mercados tradicionales' },
                    { label: 'Viajes optimizados', value: '1,200+', desc: 'entregas completadas exitosamente' },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-start gap-4 group">
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">{stat.value}</span>
                          <span className="text-sm font-bold text-slate-500">{stat.label}</span>
                        </div>
                        <p className="text-sm text-slate-400 mt-0.5">{stat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Departamentos cubiertos */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-md">
                  <h4 className="font-black text-slate-900 mb-6 text-lg">Cobertura por departamento</h4>
                  <div className="space-y-3">
                    {departments.map((dept, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          dept.status === 'active' ? 'bg-emerald-500' :
                          dept.status === 'upcoming' ? 'bg-amber-400' : 'bg-slate-200'
                        }`} />
                        <span className={`text-sm font-bold ${dept.status === 'active' ? 'text-slate-900' : 'text-slate-400'}`}>
                          {dept.name}
                        </span>
                        <span className={`ml-auto text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          dept.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                          dept.status === 'upcoming' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
                        }`}>
                          {dept.status === 'active' ? 'Activo' : dept.status === 'upcoming' ? 'Próximamente' : 'Planificado'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-4 text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Activo</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Próximamente</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-200" /> Planificado</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* ════════════════════════════════════════════
              SECCIÓN 7: CTA FINAL
              ════════════════════════════════════════════ */}
          <ScrollReveal>
            <div className="bg-slate-900 rounded-[3rem] p-10 sm:p-14 text-center text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/15 to-blue-600/15" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mb-8 border border-emerald-500/30">
                  <ShieldCheck className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-tight">
                  ¿Listo para formar parte<br className="hidden sm:block" /> del cambio?
                </h2>
                <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                  Únete a la plataforma que está transformando la comercialización agrícola en Santa Cruz y toda Bolivia. Sin intermediarios, sin comisiones abusivas.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={() => navigate('/registro')}
                    className="px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5"
                  >
                    Crear mi cuenta gratis
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-lg transition-all flex items-center gap-2 border border-white/10"
                  >
                    Ya tengo cuenta
                  </button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </ScrollExpandMedia>

      {/* ════════════════════════════════════════════
          SECCIÓN 8: FOOTER COMPLETO
          ════════════════════════════════════════════ */}
      <footer className="bg-slate-900 text-slate-400 pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Logo y descripción */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 text-white mb-4">
                <Leaf className="w-7 h-7 text-emerald-400" />
                <span className="font-black text-xl tracking-tight">AgroDirecto</span>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                Plataforma digital que conecta productores agrícolas, compradores y transportistas en Santa Cruz, Bolivia, eliminando intermediarios.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-emerald-600 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-emerald-600 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-emerald-600 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>
            </div>

            {/* Navegación */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Navegación</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Inicio', path: '/' },
                  { label: 'Marketplace', path: '/marketplace' },
                  { label: 'Mapa de Productores', path: '/mapa' },
                  { label: 'Comparador de Precios', path: '/comparador' },
                ].map((link, i) => (
                  <li key={i}>
                    <button onClick={() => navigate(link.path)} className="text-sm hover:text-emerald-400 transition-colors flex items-center gap-1.5 group">
                      <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Por Rol */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Por Rol</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Para Productores', path: '/registro' },
                  { label: 'Para Compradores', path: '/registro' },
                  { label: 'Para Transportistas', path: '/registro' },
                  { label: 'Administración', path: '/login' },
                ].map((link, i) => (
                  <li key={i}>
                    <button onClick={() => navigate(link.path)} className="text-sm hover:text-emerald-400 transition-colors flex items-center gap-1.5 group">
                      <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Contacto</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  +591 77711122
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  contacto@agrodirecto.bo
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  Santa Cruz de la Sierra, Bolivia
                </li>
              </ul>
            </div>
          </div>

          {/* Línea divisora y legales */}
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500 text-center sm:text-left">
              <span className="text-slate-400 font-bold">AgroDirecto</span> Santa Cruz © 2026 — Plataforma Agropecuaria Digital
            </p>
            <div className="flex gap-6 text-xs">
              <a href="#" className="hover:text-emerald-400 transition-colors">Términos de Servicio</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Política de Privacidad</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Soporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}