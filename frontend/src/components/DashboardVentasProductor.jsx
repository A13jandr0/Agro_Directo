import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Package, DollarSign } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const DashboardVentasProductor = () => {
    const [data, setData] = useState({ tendencia: [], topProductos: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBIData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/bi/productor/ventas', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (response.ok) {
                    setData(result);
                }
            } catch (error) {
                console.error("Error al cargar datos BI:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBIData();
    }, []);

    if (loading) return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                <TrendingUp className="text-emerald-600" /> Dashboard de Inteligencia Comercial
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfico de Tendencia de Ventas */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-700">Tendencia de Ingresos Mensuales</h2>
                        <DollarSign className="text-emerald-500" />
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.tendencia}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="mes" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`Bs. ${value}`, 'Ingresos']}
                                />
                                <Legend />
                                <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Gráfico Circular de Productos Top */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-700">Top 3 Productos (Volumen)</h2>
                        <Package className="text-emerald-500" />
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.topProductos}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="total_vendido"
                                    nameKey="nombre_producto"
                                    label={({ nombre_producto, percent }) => `${nombre_producto} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {data.topProductos.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Resumen Ejecutivo */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                    <p className="text-emerald-600 font-medium text-sm">Ingresos Totales</p>
                    <p className="text-2xl font-bold text-emerald-900">
                        Bs. {data.tendencia.reduce((acc, curr) => acc + curr.ingresos, 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                    <p className="text-emerald-600 font-medium text-sm">Producto Estrella</p>
                    <p className="text-2xl font-bold text-emerald-900">
                        {data.topProductos[0]?.nombre_producto || 'Sin ventas'}
                    </p>
                </div>
                <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                    <p className="text-amber-600 font-medium text-sm">Mes de Mayor Venta</p>
                    <p className="text-2xl font-bold text-amber-900">
                        {[...data.tendencia].sort((a, b) => b.ingresos - a.ingresos)[0]?.mes || 'N/A'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DashboardVentasProductor;
