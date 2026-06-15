import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Search, ShoppingCart, MapPin, TrendingDown, TrendingUp, Minus, Star } from 'lucide-react';
import CartContext from '../context/CartContext';
import PageShell from '../components/ui/PageShell';
import { useToast } from '../context/ToastContext';

const ComparadorPage = () => {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const { agregarAlCarritoConVerificacion } = useContext(CartContext);
  const toast = useToast();

  const latComprador = -17.7833;
  const lngComprador = -63.1821;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!busqueda.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/cosechas/comparador`, {
        params: {
          busqueda,
          lat: latComprador,
          lng: lngComprador
        }
      });
      setResultados(res.data);
    } catch (error) {
      console.error('Error fetching comparador:', error);
      toast.error('Ocurrió un error al buscar productores.');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeDiferencia = (pct) => {
    if (pct == null) return <span className="text-gray-400 font-bold">-</span>;
    if (pct > 20) return <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 rounded-lg text-xs font-bold border border-red-200"><TrendingUp className="w-3 h-3" /> +{pct.toFixed(1)}%</span>;
    if (pct < -10) return <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold border border-blue-200"><TrendingDown className="w-3 h-3" /> {pct.toFixed(1)}%</span>;
    return <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-lg text-xs font-bold border border-green-200"><Minus className="w-3 h-3" /> Justo</span>;
  };

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header y Buscador */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
          <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-4 py-1 text-xs font-bold mb-4">
            <Star size={16} className="inline-block mr-1" /><Star size={16} className="inline-block mr-1" /> Comparador Inteligente
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Buscá el mejor precio</h1>
          <p className="text-slate-500 font-semibold mb-8">Comparamos los precios de todos los productores verificados contra el Mercado Abasto en tiempo real.</p>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
            <input
              type="text"
              placeholder="¿Qué producto buscás? Ej. Tomate, Soya..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-14 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all" />
            
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition-colors">
              
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
        </div>

        {/* Resultados */}
        {hasSearched &&
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">Resultados para "{busqueda}"</h2>
            </div>
            
            {resultados.length === 0 ?
          <div className="p-16 text-center">
                <p className="text-slate-500 font-bold text-lg">No encontramos productores vendiendo ese producto actualmente.</p>
              </div> :

          <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Productor</th>
                      <th className="p-4">Finca</th>
                      <th className="p-4">Ubicación</th>
                      <th className="p-4 text-right">Precio Unitario</th>
                      <th className="p-4 text-center">vs Abasto</th>
                      <th className="p-4 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resultados.map((item) =>
                <tr key={item.cosecha_id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {item.foto_url ?
                      <img src={`http://localhost:5000${item.foto_url}`} className="w-10 h-10 rounded-lg object-cover" alt={item.nombre_producto} /> :

                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">IMG</div>
                      }
                            <div>
                              <p className="text-sm font-bold text-slate-900 line-clamp-1">{item.nombre_producto}</p>
                              <p className="text-xs font-semibold text-slate-500">{item.productor_nombre}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm font-semibold text-slate-700">{item.nombre_finca || '-'}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {item.municipio || 'S/D'}
                            {item.distancia_km != null && <span className="text-xs text-blue-600 font-bold ml-1">({item.distancia_km.toFixed(1)}km)</span>}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-base font-black text-emerald-600">Bs. {Number(item.precio_unitario).toFixed(2)}</span>
                          <span className="text-xs text-slate-400 font-semibold ml-1">/{item.unidad_medida}</span>
                        </td>
                        <td className="p-4 text-center">
                          {getBadgeDiferencia(item.porcentaje_diferencia)}
                        </td>
                        <td className="p-4 text-center">
                          <button
                      onClick={() => {
                        const productoParaCarrito = {
                          id: item.cosecha_id,
                          nombre_producto: item.nombre_producto,
                          precio_unitario: item.precio_unitario,
                          unidad_medida: item.unidad_medida,
                          foto_url: item.foto_url,
                          productor_id: item.productor_id // aunque no viene explícito, lo maneja el context
                        };
                        const ok = agregarAlCarritoConVerificacion(productoParaCarrito, 1);
                        if (ok) toast.success(`Agregado: ${item.nombre_producto}`);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 mx-auto">
                      
                            <ShoppingCart className="w-4 h-4" />
                            Agregar
                          </button>
                        </td>
                      </tr>
                )}
                  </tbody>
                </table>
              </div>
          }
          </div>
        }
      </div>
    </PageShell>);

};

export default ComparadorPage;