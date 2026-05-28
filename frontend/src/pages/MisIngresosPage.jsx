import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart2, 
  Download, 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Star, 
  Calendar, 
  Eye,
  ArrowUpRight,
  TrendingDown,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const ingresosMensuales = [
  { mes: 'Ene', ingresos: 4200 },
  { mes: 'Feb', ingresos: 5100 },
  { mes: 'Mar', ingresos: 4800 },
  { mes: 'Abr', ingresos: 6300 },
  { mes: 'May', ingresos: 8450 },
  { mes: 'Jun', ingresos: 7900 }
];

const ventasPorProducto = [
  { name: 'Tomate perita', value: 45 },
  { name: 'Soya Grano', value: 25 },
  { name: 'Maíz Amarillo', value: 20 },
  { name: 'Yuca Blanca', value: 10 }
];
const COLORS = ['#10b981', '#059669', '#d97706', '#3b82f6'];

const estadoPedidos = [
  { estado: 'Entregados', cantidad: 34, fill: '#10b981' },
  { estado: 'En camino', cantidad: 12, fill: '#f59e0b' },
  { estado: 'Cancelados', cantidad: 4, fill: '#f43f5e' }
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 shadow-2xl rounded-xl border border-white/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-sm font-black text-emerald-400">
          Bs. {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const MisIngresosPage = () => {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState('Este mes');

  const [transacciones] = useState([
    { id: 'TR-001', fecha: 'Hoy', comprador: 'Juan Pérez', producto: 'Tomate perita', cantidad: '3 qq', monto: 135, estado: 'Entregado' },
    { id: 'TR-002', fecha: 'Ayer', comprador: 'Supermercados Ketal', producto: 'Maíz Amarillo', cantidad: '50 qq', monto: 4750, estado: 'En camino' },
    { id: 'TR-003', fecha: '25 Abr', comprador: 'Maria López', producto: 'Soya Grano', cantidad: '10 qq', monto: 1200, estado: 'Entregado' },
    { id: 'TR-004', fecha: '24 Abr', comprador: 'Agroindustrias Norte', producto: 'Yuca Blanca', cantidad: '20 arr', monto: 600, estado: 'Entregado' },
  ]);

  const getBadgeColor = (estado) => {
    switch(estado) {
      case 'Entregado': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'En camino': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Cancelado': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/20 shrink-0">
            <BarChart2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mis Ingresos</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Análisis de Ventas y Rendimiento</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select 
            className="py-2.5 px-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all cursor-pointer"
            value={periodo}
            onChange={e => setPeriodo(e.target.value)}
          >
            <option>Este mes</option>
            <option>Últimos 3 meses</option>
            <option>Este año</option>
          </select>
          <button className="flex items-center gap-2 bg-slate-900 text-white py-2.5 px-6 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
            <Download className="w-4 h-4" /> Exportar
          </button>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Ingresos Brutos', value: 'Bs. 8,450', icon: TrendingUp, color: 'emerald', trend: '+12%', isUp: true },
          { label: 'Ventas Cerradas', value: '34', icon: ShoppingBag, color: 'blue', trend: '+5', isUp: true },
          { label: 'Ticket Promedio', value: 'Bs. 248', icon: Package, color: 'indigo', trend: '-2%', isUp: false },
          { label: 'Satisfacción', value: '4.8/5', icon: Star, color: 'amber', trend: 'Excelente', isUp: true }
        ].map((m, idx) => {
          const Icon = m.icon;
          const colors = {
            emerald: 'bg-emerald-50 text-emerald-600',
            blue: 'bg-emerald-50 text-emerald-600',
            indigo: 'bg-indigo-50 text-indigo-600',
            amber: 'bg-amber-50 text-amber-600',
          };
          return (
            <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${colors[m.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${m.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} uppercase`}>
                  {m.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {m.trend}
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{m.value}</h3>
              <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">{m.label}</p>
            </div>
          );
        })}
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* REVENUE BAR CHART */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-xl font-black text-slate-900 tracking-tight">Evolución de Ingresos</h2>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semestral</span>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ingresosMensuales} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} tickFormatter={(value) => `$${value}`} />
                <RechartsTooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                <Bar dataKey="ingresos" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col">
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-8">Top Productos</h2>
          <div className="h-[250px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ventasPorProducto}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {ventasPorProducto.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }} itemStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Historial de Transacciones</h2>
          <button className="text-xs font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest">Descargar CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <th className="px-8 py-4">Fecha</th>
                <th className="px-6 py-4">Comprador</th>
                <th className="px-6 py-4">Producto / Cantidad</th>
                <th className="px-6 py-4 text-center">Monto</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-8 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transacciones.map(tr => (
                <tr key={tr.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                      <Calendar className="w-4 h-4" /> {tr.fecha}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="font-bold text-slate-900">{tr.comprador}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 leading-tight">{tr.producto}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase mt-0.5">{tr.cantidad}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center font-black text-emerald-600">
                    Bs. {tr.monto}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${getBadgeColor(tr.estado)}`}>
                      {tr.estado}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mostrando 1-4 de 34 transacciones</span>
            <div className="flex gap-2">
               <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all shadow-sm disabled:opacity-50" disabled>Anterior</button>
               <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all shadow-sm">Siguiente</button>
            </div>
        </div>
      </div>

    </div>
  );
};

export default MisIngresosPage;
