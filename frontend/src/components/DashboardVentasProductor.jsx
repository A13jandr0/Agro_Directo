import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Package, DollarSign, BarChart3 } from 'lucide-react';

const COLORS = ['#0d9f6e', '#3b82f6', '#9b2335', '#f59e0b', '#6366f1'];

const DashboardVentasProductor = ({ embedded = false }) => {
  const [data, setData] = useState({ tendencia: [], topProductos: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBIData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/bi/productor/ventas', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (response.ok) setData(result);
      } catch (error) {
        console.error('Error al cargar datos BI:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBIData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-10 h-10 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  const totalIngresos = data.tendencia.reduce((acc, curr) => acc + Number(curr.ingresos || 0), 0);
  const mejorMes = [...data.tendencia].sort((a, b) => Number(b.ingresos) - Number(a.ingresos))[0];

  return (
    <div className={embedded ? 'p-6' : 'p-6 bg-[#f4f6f9] min-h-screen'}>
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-slate-700" />
        <h2 className="text-lg font-bold text-slate-900">Inteligencia comercial</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Ingresos mensuales</h3>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="h-[300px] w-full">
            {data.tendencia.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Sin datos de ventas aún
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.tendencia}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="mes" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                    }}
                    formatter={(value) => [`Bs. ${Number(value).toLocaleString('es-BO')}`, 'Ingresos']}
                  />
                  <Bar dataKey="ingresos" fill="#0d9f6e" radius={[6, 6, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Top productos</h3>
            <Package className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="h-[300px] w-full">
            {data.topProductos.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Sin ventas registradas
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.topProductos}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="total_vendido"
                    nameKey="nombre_producto"
                  >
                    {data.topProductos.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="metric-card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ingresos totales</p>
          <p className="text-xl font-bold text-slate-900 mt-1">Bs. {totalIngresos.toLocaleString('es-BO')}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Producto estrella</p>
          <p className="text-xl font-bold text-slate-900 mt-1 truncate">
            {data.topProductos[0]?.nombre_producto || '—'}
          </p>
        </div>
        <div className="metric-card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mejor mes</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{mejorMes?.mes || '—'}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardVentasProductor;
