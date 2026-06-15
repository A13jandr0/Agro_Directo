import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BellRing, Carrot, Apple, Wheat, Sprout } from 'lucide-react';
import PageShell from '../components/ui/PageShell';
import { useToast } from '../context/ToastContext';

const SuscripcionesPage = () => {
  const [preferencias, setPreferencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const CATEGORIAS = [
  { id: 'Verduras', icon: Carrot, title: 'Verduras', examples: 'Tomate, Cebolla, Lechuga...', color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'Frutas', icon: Apple, title: 'Frutas', examples: 'Mango, Banana, Achachairú...', color: 'text-red-500', bg: 'bg-red-50' },
  { id: 'Granos', icon: Wheat, title: 'Granos', examples: 'Soya, Maíz, Trigo...', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { id: 'Tubérculos', icon: Sprout, title: 'Tubérculos', examples: 'Papa, Yuca, Camote...', color: 'text-emerald-600', bg: 'bg-emerald-50' }];


  useEffect(() => {
    const fetchPreferencias = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('http://localhost:5000/api/notificaciones/preferencias', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Asumiendo que retorna un array de strings: ['Verduras', 'Frutas']
        setPreferencias(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error('Error fetching preferencias:', error);
        toast.error('Error al cargar preferencias');
      } finally {
        setLoading(false);
      }
    };
    fetchPreferencias();
  }, [toast]);

  const toggleCategoria = async (categoriaId) => {
    const nuevasPrefs = preferencias.includes(categoriaId) ?
    preferencias.filter((c) => c !== categoriaId) :
    [...preferencias, categoriaId];

    // Optimistic update
    setPreferencias(nuevasPrefs);

    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/notificaciones/preferencias',
      { categorias: nuevasPrefs },
      { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Preferencias guardadas");
    } catch (error) {
      console.error('Error saving preferencias:', error);
      toast.error('Error al guardar. Revertiendo cambios.');
      // Revert in case of error
      setPreferencias(preferencias.includes(categoriaId) ?
      [...preferencias, categoriaId] :
      preferencias.filter((c) => c !== categoriaId));
    }
  };

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <BellRing className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Alertas de Categorías</h1>
          <p className="text-slate-500 font-semibold max-w-lg mx-auto">
            Recibí una notificación cada vez que un productor publique un producto nuevo en las categorías que te interesan.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CATEGORIAS.map((cat) => {
            const isActive = preferencias.includes(cat.id);
            const Icon = cat.icon;

            return (
              <div
                key={cat.id}
                onClick={() => toggleCategoria(cat.id)}
                className={`cursor-pointer rounded-3xl p-6 border-2 transition-all flex items-center gap-5 ${
                isActive ?
                'border-indigo-600 bg-white shadow-lg shadow-indigo-600/5' :
                'border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-300'}`
                }>
                
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                isActive ? cat.bg : 'bg-white shadow-sm border border-slate-200'}`
                }>
                  <Icon className={`w-7 h-7 ${isActive ? cat.color : 'text-slate-400'}`} />
                </div>
                
                <div className="flex-1">
                  <h3 className={`text-lg font-black transition-colors ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                    {cat.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5 leading-relaxed">
                    Ej: {cat.examples}
                  </p>
                </div>

                {/* Toggle Switch */}
                <div className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${isActive ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                  <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>);

          })}
        </div>

      </div>
    </PageShell>);

};

export default SuscripcionesPage;