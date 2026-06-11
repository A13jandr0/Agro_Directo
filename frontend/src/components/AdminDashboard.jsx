import React from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar 
} from 'recharts';
import { 
  Users, ShoppingBag, Truck, Leaf, TrendingUp, DollarSign, MapPin, Award
} from 'lucide-react';

// ============================================================
// Datos Simulados Realistas para la Demo de AgroDirecto
// ============================================================

// 1. Total de pedidos por estado
const pedidosEstadoData = [
  { name: 'Pendientes', value: 45, color: '#F59E0B' },   // Amber
  { name: 'Confirmados', value: 120, color: '#10B981' },  // Emerald
  { name: 'Enviados', value: 78, color: '#3B82F6' },     // Blue
  { name: 'Entregados', value: 245, color: '#059669' },   // Deep Emerald
  { name: 'Rechazados', value: 12, color: '#EF4444' }     // Red
];

// 2. Ventas por semana del último mes (en Bs.)
const ventasSemanalesData = [
  { name: 'Semana 1', Ventas: 18400, Pedidos: 85 },
  { name: 'Semana 2', Ventas: 24500, Pedidos: 110 },
  { name: 'Semana 3', Ventas: 29800, Pedidos: 135 },
  { name: 'Semana 4', Ventas: 36200, Pedidos: 170 }
];

// 3. Top 5 productos más vendidos (en Quintales / Cajas / Unidades)
const productosMasVendidosData = [
  { name: 'Soya Grano de Oro', cantidad: 480, unidad: 'Quintal', ingresos: 57600 },
  { name: 'Sorgo Forrajero', cantidad: 320, unidad: 'Quintal', ingresos: 25600 },
  { name: 'Tomate Santa Cruz', cantidad: 290, unidad: 'Caja', ingresos: 8700 },
  { name: 'Maíz Amarillo Duro', cantidad: 210, unidad: 'Quintal', ingresos: 19950 },
  { name: 'Papa Harinosa', cantidad: 180, unidad: 'Arroba', ingresos: 4500 }
];

// 4. Mapa de calor / ranking de fincas activas por provincia de Santa Cruz
const fincasProvinciasData = [
  { provincia: 'Obispo Santistevan', municipio: 'Montero', fincas: 42, cultivos: 'Soya, Maíz, Caña' },
  { provincia: 'Ichilo', municipio: 'Yapacaní', fincas: 28, cultivos: 'Arroz, Yuca, Cacao' },
  { provincia: 'Warnes', municipio: 'Warnes', fincas: 24, cultivos: 'Soya, Sorgo, Hortalizas' },
  { provincia: 'Chiquitos', municipio: 'Pailón', fincas: 19, cultivos: 'Granos, Sésamo' },
  { provincia: 'Sara', municipio: 'Portachuelo', fincas: 15, cultivos: 'Arroz, Cítricos' }
];

// 5. KPIs de Registro
const kpiData = {
  productores: 124,
  compradores: 382,
  transportistas: 67,
  ventasTotalesBs: 108900,
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const AdminDashboard = () => {
  return (
    <div className="space-y-8 p-1">
      {/* ── SECCIÓN 1: TARJETAS KPI ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Productores */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Productores</span>
            <h3 className="text-3xl font-black text-slate-800">{kpiData.productores}</h3>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12 este mes</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Leaf className="w-6 h-6" />
          </div>
        </div>

        {/* Compradores */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compradores</span>
            <h3 className="text-3xl font-black text-slate-800">{kpiData.compradores}</h3>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+45 este mes</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Transportistas */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transportistas</span>
            <h3 className="text-3xl font-black text-slate-800">{kpiData.transportistas}</h3>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+8 este mes</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        {/* Ventas Totales */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ventas Acumuladas</span>
            <h3 className="text-3xl font-black text-slate-800">Bs. {kpiData.ventasTotalesBs.toLocaleString()}</h3>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+24% vs mes anterior</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* ── SECCIÓN 2: GRÁFICOS PRINCIPALES ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Gráfico 1: Pedidos por Estado (Torta) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900 mb-1">Pedidos por Estado</h4>
            <p className="text-xs text-slate-500 font-medium mb-4">Distribución porcentual de las solicitudes vigentes</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pedidosEstadoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pedidosEstadoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} pedidos`, 'Cantidad']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Leyenda Personalizada */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-semibold text-slate-600">
            {pedidosEstadoData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico 2: Ventas por Semana del Último Mes (Líneas) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-base font-bold text-slate-900">Ventas del Último Mes</h4>
              <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                <TrendingUp className="w-3.5 h-3.5" /> Tendencia Alza
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mb-4">Evolución de ingresos semanales en Bolivianos (Bs.)</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ventasSemanalesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip formatter={(value) => [`Bs. ${value}`, 'Monto']} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line 
                  type="monotone" 
                  dataKey="Ventas" 
                  stroke="#10B981" 
                  strokeWidth={3} 
                  activeDot={{ r: 8 }} 
                  dot={{ stroke: '#10B981', strokeWidth: 2, r: 4, fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ── SECCIÓN 3: TOP PRODUCTOS Y REGIONES ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Gráfico 3: Top 5 Productos (Barras) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900 mb-1">Top 5 Productos más Vendidos</h4>
            <p className="text-xs text-slate-500 font-medium mb-4">Volumen total de transacciones completadas por producto</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productosMasVendidosData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip formatter={(value) => [value, 'Cantidad Vendida']} />
                <Bar dataKey="cantidad" fill="#0F6E56" radius={[6, 6, 0, 0]}>
                  {productosMasVendidosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#0F6E56'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Región 4: Fincas Activas por Provincia (Lista Rankeada Premium) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900 mb-1">Fincas Activas por Provincia</h4>
            <p className="text-xs text-slate-500 font-medium mb-4">Concentración de productores en el departamento</p>
          </div>
          
          <div className="space-y-4 my-auto">
            {fincasProvinciasData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {/* Ranking Badge */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                  idx === 0 ? 'bg-amber-100 text-amber-700' :
                  idx === 1 ? 'bg-slate-100 text-slate-700' :
                  idx === 2 ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500'
                }`}>
                  {idx + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800 text-sm truncate">{item.provincia}</span>
                    <span className="text-xs font-black text-emerald-600">{item.fincas} fincas</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="w-3 h-3 text-slate-300" />
                    <span className="truncate">Mun: {item.municipio} • Cultiva: {item.cultivos}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-2.5 mt-4">
            <Award className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-[11px] text-slate-500 font-semibold leading-snug">
              Obispo Santistevan (Montero) lidera con el 33% de los cultivos activos en la plataforma.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
