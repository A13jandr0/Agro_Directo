import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, ClipboardList, MapPin, Package, DollarSign, Clock,
  Star, Navigation, Lock, Check, Scale, Map, Zap, ChevronRight, Route, ArrowUpRight
} from 'lucide-react';

const DashboardTransportistaPage = () => {
  const navigate = useNavigate();
  const [transporterState] = useState({
    nombre: 'Carlos',
    estado: 'Verificado',
    zonaOperacion: 'Local - Santa Cruz de la Sierra',
    entregasMes: 12,
    ingresosMes: 1850,
    calificacion: 4.9,
    tiempoPromedio: 2.3
  });

  const [isDisponible, setIsDisponible] = useState(true);

  const bolsaDeCarga = [
    { id: 'C-101', origen: 'Finca El Paraíso - Warnes', destino: 'Mercado Los Pozos - Santa Cruz', producto: 'Tomate perita', peso: '500 kg', distancia: 45, pago: 120, tiempoLimite: '14:00' },
    { id: 'C-102', origen: 'Asociación Norte - Montero', destino: 'Supermercado Fidalga - Equipetrol', producto: 'Soya en grano', peso: '2000 kg', distancia: 65, pago: 350, tiempoLimite: '16:30' },
    { id: 'C-103', origen: 'Hacienda Verde - La Guardia', destino: 'Mercado Abasto - Santa Cruz', producto: 'Maíz amarillo', peso: '800 kg', distancia: 25, pago: 80, tiempoLimite: '11:00' }
  ];

  const rutaActiva = {
    id: 'R-998',
    paradas: [
      { tipo: 'Recogida', lugar: 'Hacienda San Juan', completado: true },
      { tipo: 'Recogida', lugar: 'Quinta La Esperanza', completado: false },
      { tipo: 'Entrega', lugar: 'Mercado Mutualista', completado: false }
    ],
    progreso: 33
  };

  const historial = [
    { id: 'H-01', producto: 'Yuca y Plátano', ruta: 'Yapacaní → Abasto', pago: 450, calificacion: 5, fecha: 'Ayer' },
    { id: 'H-02', producto: 'Limón', ruta: 'Porongo → Los Pozos', pago: 150, calificacion: 4, fecha: '25 Abr' },
    { id: 'H-03', producto: 'Café (Grano)', ruta: 'Samaipata → Centro', pago: 550, calificacion: 5, fecha: '22 Abr' }
  ];

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-7">

      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl animate-slide-up">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1206] via-[#261a08] to-[#1f1507]" />
        <div className="absolute top-[-30%] right-[-10%] w-[400px] h-[400px] bg-amber-500/12 rounded-full blur-[80px] animate-float" />
        <div className="absolute bottom-[-20%] left-[-5%] w-[300px] h-[300px] bg-orange-400/8 rounded-full blur-[60px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 dot-pattern opacity-15" />
        
        <div className="relative z-10 p-8 sm:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <span className="bg-amber-500/20 text-amber-400 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.15em] border border-amber-500/20 backdrop-blur-sm">
                  <Zap className="w-3 h-3 inline mr-1" />
                  Panel del Transportista
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight text-white">
                Hola, {transporterState.nombre}
              </h1>
              <p className="text-amber-200/40 font-medium max-w-lg text-[15px] leading-relaxed">
                {isDisponible ? 'Estás disponible y visible en la Bolsa de Carga. Revisa las nuevas rutas disponibles.' : 'Estás fuera de servicio. No aparecerás en la bolsa de carga.'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Toggle */}
              <div className="bg-white/[0.06] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.08] text-center min-w-[180px]">
                <label className="relative inline-flex items-center cursor-pointer mb-3">
                  <input type="checkbox" className="sr-only peer" checked={isDisponible} onChange={() => setIsDisponible(!isDisponible)} />
                  <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all duration-300 peer-checked:bg-amber-500 after:shadow-lg" />
                </label>
                <p className={`text-sm font-black ${isDisponible ? 'text-amber-400' : 'text-white/30'}`}>
                  {isDisponible ? 'DISPONIBLE' : 'NO DISPONIBLE'}
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-white/30" />
                  <span className="text-[11px] font-medium text-white/30">Santa Cruz</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VERIFICATION BANNER */}
      {transporterState.estado === 'Pendiente_Verificacion' && (
        <div className="card-elevated !border-amber-200 bg-amber-50/50 p-5 flex items-start gap-4 animate-scale-bounce">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-black text-amber-800">Cuenta en verificación</h3>
            <p className="text-sm text-amber-700 mt-1 font-medium">Estamos validando tu licencia y documentos. Proceso de <strong>24 a 48 horas</strong>.</p>
          </div>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {[
          { label: 'Entregas mes', value: transporterState.entregasMes, icon: Truck, gradient: 'from-blue-500 to-indigo-600' },
          { label: 'Ingresos mes', value: `Bs. ${transporterState.ingresosMes}`, icon: DollarSign, gradient: 'from-emerald-500 to-teal-600' },
          { label: 'Calificación', value: transporterState.calificacion, icon: Star, gradient: 'from-amber-500 to-orange-600' },
          { label: 'Tiempo prom.', value: `${transporterState.tiempoPromedio} hrs`, icon: Clock, gradient: 'from-violet-500 to-purple-600' }
        ].map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="card-elevated p-5 group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 bg-gradient-to-br ${m.gradient} rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 mb-1">{m.value}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">{m.label}</p>
            </div>
          );
        })}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* BOLSA DE CARGA */}
        <div className="xl:col-span-2 card-elevated overflow-hidden animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="px-7 py-5 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-black text-slate-900">Bolsa de Carga</h3>
              <span className="bg-rose-100 text-rose-600 text-[10px] font-black px-2.5 py-1 rounded-full animate-pulse">
                {bolsaDeCarga.length} Nuevas
              </span>
            </div>
            <button onClick={() => navigate('/dashboard/transportista/bolsa')} className="text-[11px] font-black text-amber-600 uppercase tracking-[0.1em] flex items-center gap-1 group hover:text-amber-700">
              Ver todas <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {bolsaDeCarga.map(carga => (
              <div key={carga.id} className="p-6 table-row-hover group">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 mb-4 uppercase tracking-wider">
                      <span className="flex items-center gap-1"><Route className="w-3.5 h-3.5" /> {carga.distancia} km</span>
                      <span className="text-slate-200">|</span>
                      <span className="text-rose-500 animate-pulse">Hasta las {carga.tiempoLimite}</span>
                    </div>
                    {/* Route visualization */}
                    <div className="relative pl-7 space-y-4 mb-4">
                      <div className="absolute top-2 bottom-2 left-[10px] w-0.5 bg-gradient-to-b from-blue-400 to-amber-500" />
                      <div className="relative">
                        <div className="absolute -left-[28px] top-1 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white shadow-md z-10" />
                        <p className="font-bold text-slate-900 text-sm">{carga.origen}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Origen</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[28px] top-1 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-white shadow-md z-10" />
                        <p className="font-bold text-slate-900 text-sm">{carga.destino}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Destino</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs bg-slate-50 px-4 py-2.5 rounded-xl inline-flex border border-slate-100">
                      <span className="flex items-center gap-1.5 font-medium text-slate-600">
                        <Package className="w-3.5 h-3.5" /> {carga.producto}
                      </span>
                      <span className="text-slate-200">|</span>
                      <span className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Scale className="w-3.5 h-3.5" /> {carga.peso}
                      </span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6">
                    <div className="sm:text-right mb-0 sm:mb-4">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Pago</p>
                      <p className="text-2xl font-black text-amber-600">Bs. {carga.pago}</p>
                    </div>
                    <button
                      disabled={transporterState.estado === 'Pendiente_Verificacion'}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm py-2.5 px-6 rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 flex items-center gap-2 group"
                    >
                      Aceptar <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COL */}
        <div className="space-y-5">

          {/* RUTA ACTIVA */}
          <div className="card-elevated overflow-hidden !border-amber-200 animate-slide-in-right">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-black flex items-center gap-2 text-sm">
                <Map className="w-4 h-4" /> Ruta Activa
              </h3>
              <span className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">{rutaActiva.id}</span>
            </div>
            {/* Mini map */}
            <div className="h-28 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cartographer.png")' }} />
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <path d="M 20 20 Q 80 50 150 100 T 280 80" fill="transparent" stroke="#d97706" strokeWidth="2.5" strokeDasharray="6,4" />
              </svg>
              <div className="absolute top-4 left-4 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
              <div className="absolute bottom-4 right-6 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                <Navigation className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div className="p-5">
              {/* Progress */}
              <div className="mb-5">
                <div className="flex justify-between text-[11px] font-black mb-2">
                  <span className="text-amber-600">Progreso</span>
                  <span className="text-slate-500">{rutaActiva.progreso}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${rutaActiva.progreso}%` }} />
                </div>
              </div>
              {/* Stops */}
              <ul className="space-y-4 mb-5 relative">
                <div className="absolute top-2 bottom-4 left-[11px] w-0.5 bg-gradient-to-b from-emerald-400 via-slate-200 to-amber-400" />
                {rutaActiva.paradas.map((parada, idx) => (
                  <li key={idx} className={`relative pl-9 text-sm ${parada.completado ? 'text-slate-400' : 'text-slate-900'}`}>
                    <div className={`absolute left-0 top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 bg-white shadow-sm transition-all duration-300 ${parada.completado ? 'border-emerald-500' : 'border-amber-500'}`}>
                      {parada.completado ? <Check className="w-3 h-3 text-emerald-500" /> : <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />}
                    </div>
                    <p className="font-bold leading-tight">{parada.lugar}</p>
                    <p className="text-[10px] uppercase font-black text-slate-400 mt-0.5 tracking-wider">{parada.tipo}</p>
                  </li>
                ))}
              </ul>
              <div className="space-y-2">
                <button onClick={() => navigate('/dashboard/transportista/hoja-de-ruta')} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5">
                  <Check className="w-4 h-4" /> Ir a Hoja de Ruta
                </button>
                <button className="w-full py-2.5 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 transition-all duration-300 flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4" /> Abrir en Google Maps
                </button>
              </div>
            </div>
          </div>

          {/* HISTORIAL */}
          <div className="card-elevated overflow-hidden animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                </div>
                Historial
              </h3>
            </div>
            <ul className="divide-y divide-slate-100">
              {historial.map(h => (
                <li key={h.id} className="px-6 py-4 flex justify-between items-center table-row-hover">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{h.producto}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{h.ruta} — {h.fecha}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-amber-600 text-sm">Bs. {h.pago}</p>
                    <div className="flex items-center justify-end gap-0.5 mt-1">
                      {[...Array(h.calificacion)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTransportistaPage;
