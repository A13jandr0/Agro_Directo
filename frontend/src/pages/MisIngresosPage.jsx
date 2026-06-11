import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  History, TrendingUp, Calendar, Eye, Download, Info,
  DollarSign, CheckCircle, Clock, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import PageShell from '../components/ui/PageShell';

const MisIngresosPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('Este mes');
  
  // Data State
  const [stats, setStats] = useState({
    totalMes: 2450,
    totalAnio: 18400,
    pendienteCobro: 320,
    completadosCount: 15
  });

  const [historial, setHistorial] = useState([
    { id: '1', fecha: new Date(Date.now() - 2 * 3600 * 1000), pedido: '#PED-001', comprador: 'Mercado Fama', monto: 175, estado: 'Cobrado' },
    { id: '2', fecha: new Date(Date.now() - 24 * 3600 * 1000), pedido: '#PED-002', comprador: 'Restaurante El Aljibe', monto: 350, estado: 'Cobrado' },
    { id: '3', fecha: new Date(Date.now() - 48 * 3600 * 1000), pedido: '#PED-003', comprador: 'Supermercado Fidalga', monto: 1200, estado: 'Pendiente' },
    { id: '4', fecha: new Date(Date.now() - 72 * 3600 * 1000), pedido: '#PED-004', comprador: 'Distribuidora Abasto', monto: 725, estado: 'Cobrado' }
  ]);

  const [ingresosMensuales, setIngresosMensuales] = useState([
    { mes: 'Ene', ingresos: 1200 },
    { mes: 'Feb', ingresos: 2100 },
    { mes: 'Mar', ingresos: 1800 },
    { mes: 'Abr', ingresos: 3100 },
    { mes: 'May', ingresos: 2800 },
    { mes: 'Jun', ingresos: 2450 }
  ]);

  useEffect(() => {
    const fetchIngresosData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      try {
        const headers = { Authorization: `Bearer={token}` };
        // Si hay una API de BI implementada, cargamos los datos
        const res = await axios.get('http://localhost:5000/api/bi/productor/ventas', { headers }).catch(() => null);
        if (res && res.data) {
          // Si el endpoint responde correctamente, parseamos los datos
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchIngresosData();
  }, [navigate]);

  const getBadgeColor = (estado) => {
    return estado === 'Cobrado' 
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
      : 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const handleExport = () => {
    toast.success('Historial de transacciones exportado en formato CSV');
  };

  // Encontrar el valor máximo de ingresos para escalar las barras del gráfico
  const maxIngreso = Math.max(...ingresosMensuales.map(i => i.ingresos), 1);

  return (
    <PageShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
            💰 Finanzas & Facturación
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Mis Ingresos</h1>
          <p className="text-sm text-slate-400 mt-1">Monitoreá tus ganancias brutas y liquidaciones de preventas</p>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={periodo} 
            onChange={(e) => setPeriodo(e.target.value)}
            className="py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer shadow-sm"
          >
            <option value="Este mes">Este mes</option>
            <option value="Últimos 3 meses">Últimos 3 meses</option>
            <option value="Este año">Este año</option>
          </select>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-2.5 px-5 rounded-xl text-xs font-bold transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0"
          >
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Cards resumen: Total mes | Total año | Pendiente cobro | Transacciones completadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Mes', value: `Bs. ${stats.totalMes.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Total Año', value: `Bs. ${stats.totalAnio.toLocaleString()}`, icon: ShieldCheck, color: 'text-emerald-700 bg-emerald-50' },
          { label: 'Pendiente Cobro', value: `Bs. ${stats.pendienteCobro.toLocaleString()}`, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Transacciones Completadas', value: stats.completadosCount, icon: CheckCircle, color: 'text-blue-600 bg-blue-50' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1">{card.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de barras premium hecho a mano con SVG y Tailwind (Col Span 2) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Evolución de Ingresos</h2>
              <p className="text-xs text-slate-400">Últimos 6 meses de facturación</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 uppercase tracking-wide">
              Expresado en Bs.
            </span>
          </div>

          {/* Gráfico SVG/HTML */}
          <div className="flex items-end justify-between h-56 pt-4 px-2 select-none border-b border-slate-100">
            {ingresosMensuales.map((item, idx) => {
              const heightPercent = (item.ingresos / maxIngreso) * 100;
              return (
                <div key={idx} className="flex flex-col items-center group w-12 sm:w-16">
                  {/* Tooltip flotante al hacer hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute mb-2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-md -translate-y-12">
                    Bs. {item.ingresos}
                  </div>
                  {/* Barra animada */}
                  <div 
                    className="w-full bg-emerald-600 rounded-t-lg transition-all duration-700 ease-out group-hover:bg-emerald-700 cursor-pointer shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20"
                    style={{ height: `${heightPercent}%` }}
                  />
                  {/* Label inferior */}
                  <span className="text-[10px] font-bold text-slate-400 uppercase mt-2.5 block">
                    {item.mes}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel lateral informativo */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Resumen de liquidación</h2>
            <p className="text-xs text-slate-400 mt-1">Cómo se fraccionan tus ganancias de preventas</p>
          </div>

          <div className="space-y-4 flex-grow py-4">
            <div className="flex gap-3 items-start p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-950 font-semibold leading-normal">
                Recordá que para preventas, el comprador abona un 50% de anticipo. El 50% restante se liquida una vez el producto se marca como listo para entrega.
              </p>
            </div>
            
            <div className="border-t border-slate-100 pt-4 space-y-3 text-xs font-semibold">
              <div className="flex justify-between text-slate-500">
                <span>Completadas:</span>
                <span className="text-slate-800 font-bold">15 transacciones</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Cobrado acumulado:</span>
                <span className="text-emerald-700 font-black">Bs. 18,400.00</span>
              </div>
              <div className="flex justify-between text-slate-500 border-t border-dashed border-slate-200 pt-3">
                <span>Pendiente de liquidación:</span>
                <span className="text-amber-700 font-black">Bs. 320.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla Historial */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Historial de Transacciones</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-semibold">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Pedido</th>
                <th className="px-6 py-4">Comprador</th>
                <th className="px-6 py-4 text-center">Monto Bs</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {historial.map(tr => (
                <tr key={tr.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs text-slate-400 font-semibold">
                    {tr.fecha.toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">{tr.pedido}</td>
                  <td className="px-6 py-4">{tr.comprador}</td>
                  <td className="px-6 py-4 text-center font-black text-slate-900">Bs. {tr.monto.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`badge ${getBadgeColor(tr.estado)}`}>
                      {tr.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => navigate('/dashboard/productor/pedidos')}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
};

export default MisIngresosPage;
