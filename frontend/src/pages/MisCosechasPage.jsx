import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Sprout, 
  PlusCircle, 
  Search, 
  Grid2X2, 
  List, 
  Package, 
  Clock, 
  Eye, 
  ShoppingCart, 
  Edit2, 
  Trash2, 
  X, 
  ImagePlus, 
  AlertCircle,
  Leaf,
  ChevronRight,
  TrendingUp,
  Info
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const MisCosechasPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreventa, setIsPreventa] = useState(false);
  const [userData, setUserData] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    nombre_producto: '',
    categoria: '',
    unidad_medida: '',
    precio_unitario: '',
    cantidad_disponible: '',
    descripcion: '',
    fecha_disponibilidad: new Date().toISOString().split('T')[0],
  });
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');
        const res = await axios.get('http://localhost:5000/api/usuarios/mi-perfil', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(res.data);
      } catch (error) {
        console.error("Error fetching profile", error);
      }
    };
    fetchProfile();
    fetchMisCosechas();
  }, [navigate]);

  const fetchMisCosechas = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5000/api/cosechas/mi-catalogo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const formattedData = res.data.map(item => ({
        id: item.id,
        nombre: item.nombre_producto,
        categoria: 'General', 
        precio: item.precio_unitario,
        unidad: item.unidad_medida,
        stock: item.cantidad_disponible,
        estado: item.es_preventa ? 'Preventa' : (item.cantidad_disponible <= 0 ? 'Agotado' : 'Activo'),
        vistas: Math.floor(Math.random() * 100), // Simulated metrics
        pedidos: Math.floor(Math.random() * 10),
        foto_url: item.foto_url
      }));
      setProductos(formattedData);
    } catch (error) {
      console.error('Error fetching mis cosechas:', error);
      toast.error('Error al cargar tu catálogo');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append('nombre_producto', formData.nombre_producto);
    data.append('descripcion', formData.descripcion);
    data.append('cantidad_disponible', formData.cantidad_disponible);
    data.append('unidad_medida', formData.unidad_medida);
    data.append('precio_unitario', formData.precio_unitario);
    data.append('fecha_disponibilidad', isPreventa ? formData.fecha_disponibilidad : new Date().toISOString().split('T')[0]);
    if (foto) data.append('foto', foto);

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/cosechas', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('¡Cosecha publicada con éxito!', {
        icon: '🚀',
        style: {
          borderRadius: '16px',
          background: '#0F172A',
          color: '#fff',
          fontWeight: 'bold'
        },
      });

      setIsModalOpen(false);
      resetForm();
      fetchMisCosechas();
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al publicar cosecha';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre_producto: '',
      categoria: '',
      unidad_medida: '',
      precio_unitario: '',
      cantidad_disponible: '',
      descripcion: '',
      fecha_disponibilidad: new Date().toISOString().split('T')[0],
    });
    setFoto(null);
    setPreview(null);
    setIsPreventa(false);
  };

  const renderBadge = (estado) => {
    const styles = {
      'Activo': 'bg-emerald-50 text-emerald-700 border-emerald-100',
      'Preventa': 'bg-blue-50 text-blue-700 border-blue-100',
      'Agotado': 'bg-rose-50 text-rose-700 border-rose-100',
      'Pendiente': 'bg-amber-50 text-amber-700 border-amber-100',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${styles[estado] || 'bg-slate-50 text-slate-600'}`}>
        {estado}
      </span>
    );
  };

  const filteredProductos = productos.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || p.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Toaster position="top-right" />

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/20 shrink-0">
            <Sprout className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mis Cosechas</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Catálogo de Productor</span>
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              <span className="text-xs font-black text-emerald-600">{productos.length} Productos</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white py-3 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-slate-900/20 whitespace-nowrap active:scale-95"
        >
          <PlusCircle className="w-5 h-5" />
          Publicar Cosecha
        </button>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Buscar por nombre de producto..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3 w-full lg:w-auto">
          <select 
            className="flex-1 lg:w-48 py-3 px-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="Todos">Todos los estados</option>
            <option value="Activo">Activos</option>
            <option value="Preventa">En Preventa</option>
            <option value="Agotado">Agotados</option>
          </select>

          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl shrink-0">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Grid2X2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* PRODUCTS DISPLAY */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold">Cargando catálogo...</p>
        </div>
      ) : filteredProductos.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 py-24 flex flex-col items-center text-center px-6">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Sprout className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Sin resultados</h3>
          <p className="text-slate-500 max-w-xs mt-2 font-medium">No encontramos cosechas con esos filtros o aún no has publicado ninguna.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-8 bg-emerald-100 text-emerald-700 py-3 px-8 rounded-2xl font-black text-sm hover:bg-emerald-200 transition-all active:scale-95"
          >
            Publicar Ahora
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProductos.map(prod => (
            <div key={prod.id} className="group bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-emerald-900/10 transition-all hover:-translate-y-1">
              <div className="h-48 bg-slate-100 relative flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => navigate('/producto/' + prod.id)}>
                <div className="absolute top-4 right-4 z-10">{renderBadge(prod.estado)}</div>
                {prod.foto_url ? (
                  <img src={`http://localhost:5000${prod.foto_url}`} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                    <Leaf className="w-16 h-16 text-emerald-200" />
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <div className="bg-white text-slate-900 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2">
                     Detalles <ChevronRight className="w-4 h-4" />
                   </div>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-1.5 mb-2">
                   <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Tendencia Alta</span>
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-4 line-clamp-1 group-hover:text-emerald-600 transition-colors">{prod.nombre}</h3>
                
                <div className="flex items-end gap-1.5 mb-6">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">Bs. {prod.precio}</span>
                  <span className="text-xs font-bold text-slate-400 mb-1">/{prod.unidad}</span>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-slate-400">
                    <div className="flex items-center gap-1.5" title="Vistas">
                      <Eye className="w-4 h-4" />
                      <span className="text-xs font-black">{prod.vistas}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Pedidos">
                      <ShoppingCart className="w-4 h-4" />
                      <span className="text-xs font-black">{prod.pedidos}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                    <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                  <th className="px-8 py-5">Producto</th>
                  <th className="px-6 py-5">Precio / Unidad</th>
                  <th className="px-6 py-5">Stock</th>
                  <th className="px-6 py-5">Estado</th>
                  <th className="px-6 py-5">Interacción</th>
                  <th className="px-8 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProductos.map(prod => (
                  <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                           {prod.foto_url ? <img src={`http://localhost:5000${prod.foto_url}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-emerald-600"><Leaf className="w-6 h-6" /></div>}
                        </div>
                        <span className="font-bold text-slate-900">{prod.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900">Bs. {prod.precio}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{prod.unidad}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                         <span className="text-sm font-bold text-slate-600">{prod.stock} kg</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">{renderBadge(prod.estado)}</td>
                    <td className="px-6 py-5">
                      <div className="flex gap-4 text-slate-400">
                        <div className="flex items-center gap-1.5 text-xs font-black"><Eye className="w-4 h-4" />{prod.vistas}</div>
                        <div className="flex items-center gap-1.5 text-xs font-black"><ShoppingCart className="w-4 h-4" />{prod.pedidos}</div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                        <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL PUBLICAR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex justify-center items-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl flex flex-col my-auto max-h-[90vh] overflow-hidden border border-white/20">
            
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <Sprout className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Nueva Cosecha</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Formulario de publicación</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-2xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
              {userData?.estado !== 'VERIFICADO' ? (
                <div className="bg-amber-50 border border-amber-200 p-8 rounded-3xl text-center">
                  <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-amber-900">Verificación Pendiente</h3>
                  <p className="text-sm text-amber-700 mt-2 font-medium max-w-sm mx-auto">No puedes publicar hasta que tu cuenta sea verificada por el equipo de AgroDirecto.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  
                  {/* LEFT */}
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Nombre del producto</label>
                      <input name="nombre_producto" value={formData.nombre_producto} onChange={handleInputChange} required type="text" placeholder="Ej. Tomate perita" className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all" />
                    </div>
                  
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Categoría</label>
                        <select name="categoria" value={formData.categoria} onChange={handleInputChange} required className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all">
                          <option value="">Elegir...</option>
                          <option>Verduras</option><option>Frutas</option><option>Granos</option><option>Tubérculos</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Unidad</label>
                        <select name="unidad_medida" value={formData.unidad_medida} onChange={handleInputChange} required className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all">
                          <option value="">Elegir...</option>
                          <option value="Quintal">Quintal</option><option value="Arroba">Arroba</option><option value="Kilogramo">Kilo</option><option value="Unidad">Unidad</option><option value="Caja">Caja</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Precio (Bs.)</label>
                        <input name="precio_unitario" value={formData.precio_unitario} onChange={handleInputChange} required type="number" step="0.01" className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Stock inicial</label>
                        <input name="cantidad_disponible" value={formData.cantidad_disponible} onChange={handleInputChange} required type="number" step="0.01" className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Descripción corta</label>
                      <textarea name="descripcion" value={formData.descripcion} rows="3" maxLength="300" onChange={handleInputChange} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all resize-none"></textarea>
                    </div>

                    <div className={`p-4 rounded-2xl border transition-all ${isPreventa ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className={`text-sm font-black uppercase tracking-tight ${isPreventa ? 'text-blue-700' : 'text-slate-400'}`}>Es venta futura (Preventa)</span>
                        <div className="relative">
                          <input type="checkbox" className="sr-only" checked={isPreventa} onChange={() => setIsPreventa(!isPreventa)} />
                          <div className={`block w-10 h-6 rounded-full transition-colors ${isPreventa ? 'bg-blue-500' : 'bg-slate-200'}`}></div>
                          <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isPreventa ? 'transform translate-x-4' : ''}`}></div>
                        </div>
                      </label>
                      {isPreventa && (
                        <div className="mt-4 pt-4 border-t border-blue-200 animate-in slide-in-from-top-2 duration-300">
                          <label className="text-[10px] font-black text-blue-500 uppercase mb-1 block">¿Cuándo estará disponible?</label>
                          <input name="fecha_disponibilidad" value={formData.fecha_disponibilidad} onChange={handleInputChange} type="date" required className="w-full px-4 py-2 bg-white border border-blue-200 rounded-xl text-sm font-bold text-blue-700 outline-none focus:ring-2 focus:ring-blue-500/20" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Imagen del producto</label>
                      <label className="border-2 border-dashed border-slate-200 rounded-[2rem] bg-white flex flex-col items-center justify-center p-8 hover:bg-emerald-50/50 hover:border-emerald-500/30 transition-all cursor-pointer group relative overflow-hidden h-64">
                        {preview ? (
                          <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" />
                        ) : (
                          <>
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
                              <ImagePlus className="w-8 h-8 text-slate-300 group-hover:text-emerald-500" />
                            </div>
                            <p className="text-sm font-black text-slate-900">Seleccionar imagen</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">PNG, JPG hasta 5MB</p>
                          </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      </label>
                    </div>

                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl">
                      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl"></div>
                      <div className="flex gap-4 relative z-10">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                          <Info className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-tight">Publicación Instantánea</h4>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed font-medium">Una vez publicada, tu cosecha será visible en el Marketplace. Recuerda que puedes editarla o pausarla en cualquier momento.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </form>

            <div className="px-8 py-6 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-2xl transition-all">
                Cancelar
              </button>
              <button 
                disabled={isSubmitting || userData?.estado !== 'VERIFICADO'} 
                onClick={handleSubmit} 
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Publicando...' : 'Publicar Ahora'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MisCosechasPage;
