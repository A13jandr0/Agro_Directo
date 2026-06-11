import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Sprout, Plus, Search, Eye, ShoppingCart, Edit2, Trash2, 
  Upload, AlertTriangle, Calendar, X, FileText, MapPin, 
  Check, ArrowRight, Loader2, Info, AlertCircle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import FocusModal from '../components/ui/FocusModal';
import PageShell from '../components/ui/PageShell';

// Categorías con íconos
const CATEGORIES = [
  { id: 'Frutas', label: 'Frutas🍎', icon: '🍎' },
  { id: 'Verduras', label: 'Verduras🥬', icon: '🥬' },
  { id: 'Tubérculos', label: 'Tubérculos🥔', icon: '🥔' },
  { id: 'Granos', label: 'Granos🌾', icon: '🌾' },
  { id: 'Carnes', label: 'Carnes🥩', icon: '🥩' },
  { id: 'Lácteos', label: 'Lácteos🥛', icon: '🥛' }
];

const SANTA_CRUZ_PROVINCES = [
  'Andrés Ibáñez',
  'Obispo Santistevan',
  'Warnes',
  'Ichilo',
  'Sara',
  'Chiquitos',
  'Cordillera',
  'Vallegrande',
  'Florida',
  'Manuel María Caballero',
  'Ñuflo de Chávez',
  'Velasco',
  'Guarayos',
  'Germán Busch',
  'Ángel Sandoval'
];

const MOCK_MUNICIPIOS = {
  'Andrés Ibáñez': ['Santa Cruz de la Sierra', 'Cotoca', 'El Torno', 'La Guardia', 'Porongo'],
  'Obispo Santistevan': ['Montero', 'Saavedra', 'Mineros', 'Fernández Alonso', 'San Pedro'],
  'Warnes': ['Warnes', 'Okinawa Uno'],
  'Florida': ['Samaipata', 'Pampa Grande', 'Mairana', 'Quirusillas']
};

const MisCosechasPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);

  // States
  const [activeTab, setActiveTab] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre_producto: '',
    categoria: '',
    descripcion: '',
    precio_unitario: '',
    unidad_medida: 'Quintal',
    cantidad_disponible: '',
    modalidad: 'Inmediata', // Inmediata o Preventa
    fecha_disponibilidad: new Date().toISOString().split('T')[0],
    provincia: '',
    municipio: ''
  });

  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [errorFormulario, setErrorFormulario] = useState(null);
  const [tieneUbicacion, setTieneUbicacion] = useState(null);

  // Precios abasto mock para comparador
  const MOCK_ABASTO_PRICES = {
    'Tomate': 28.50,
    'Papa': 18.00,
    'Zanahoria': 15.50,
    'Cebolla': 22.00,
    'Plátano': 20.00,
    'Maíz': 95.00,
    'Soya': 120.00
  };

  useEffect(() => {
    const verificarPerfil = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        let perfil = null;
        let userDataResult = null;
        
        try {
          const perfilRes = await axios.get('http://localhost:5000/api/usuarios/mi-perfil', {
            headers: { Authorization: `Bearer ${token}` }
          });
          userDataResult = perfilRes.data;
          setUserData(userDataResult);
        } catch (e) { console.error(e); }

        const endpoints = [
          'http://localhost:5000/api/productor/perfil',
          'http://localhost:5000/api/usuarios/mi-perfil',
          'http://localhost:5000/api/auth/me'
        ];

        for (const ep of endpoints) {
          try {
            const res = await axios.get(ep, { headers: { Authorization: `Bearer ${token}` } });
            if (res.data) {
              perfil = res.data;
              break;
            }
          } catch (e) {}
        }

        let tieneGPS = false;
        if (perfil) {
          tieneGPS = (perfil.latitud != null && perfil.longitud != null && perfil.latitud !== 0 && perfil.longitud !== 0) ||
                     (perfil.ubicacion_gps?.lat != null && perfil.ubicacion_gps?.lng != null) ||
                     (perfil.lat != null && perfil.lng != null) ||
                     (perfil.wkt != null && perfil.wkt !== '');
        }

        if (!tieneGPS) {
          const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
          tieneGPS = userInfo.latitud != null || userInfo.ubicacion_gps != null || userInfo.lat != null;
        }

        if (!tieneGPS && userDataResult?.perfil_productor?.ubicacion_gps) {
            tieneGPS = true;
        }

        setTieneUbicacion(tieneGPS);
      } catch (error) {
        console.error('Error verificando perfil:', error);
        setTieneUbicacion(true);
      }
      fetchMisCosechas();
    };

    verificarPerfil();
  }, [navigate]);

  const fetchMisCosechas = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/cosechas/mi-catalogo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const formatted = res.data.map(item => ({
        id: item.id,
        nombre: item.nombre_producto,
        categoria: item.categoria,
        descripcion: item.descripcion,
        precio: Number(item.precio_unitario),
        unidad: item.unidad_medida,
        stock: Number(item.cantidad_disponible),
        es_preventa: item.es_preventa,
        fecha_disponibilidad: item.fecha_disponibilidad?.split('T')?.[0] || item.fecha_disponibilidad,
        foto_url: item.foto_url,
        estado: item.es_preventa 
          ? 'Preventa' 
          : (Number(item.cantidad_disponible) <= 0 
            ? 'Agotada' 
            : (item.estado_publicacion === 'Pausado' || item.estado_publicacion === 'Inactivo' ? 'Inactivas' : 'Activas'))
      }));
      setProductos(formatted);
    } catch (error) {
      console.error(error);
      toast.error('No se pudo cargar tu catálogo de cosechas');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten imágenes (JPEG, PNG, WEBP)');
      return;
    }
    setFoto(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const err = {};
    const nombre = formData.nombre_producto?.trim() || '';
    if (nombre.length < 3) err.nombre_producto = 'El nombre debe tener al menos 3 caracteres';
    if (nombre.toLowerCase() === 'sin comentarios' || nombre.toLowerCase() === 'sin nombre') err.nombre_producto = 'Por favor, ingresá un nombre válido y descriptivo';
    
    if (!formData.categoria) err.categoria = 'Selecciona una categoría';
    
    const desc = formData.descripcion?.trim() || '';
    if (desc.length < 15) err.descripcion = 'La descripción debe tener al menos 15 caracteres';
    if (!formData.precio_unitario || Number(formData.precio_unitario) <= 0) err.precio_unitario = 'El precio debe ser mayor a 0';
    if (!formData.cantidad_disponible || Number(formData.cantidad_disponible) <= 0) err.cantidad_disponible = 'El stock debe ser mayor a 0';
    if (!formData.unidad_medida) err.unidad_medida = 'Selecciona una unidad';
    
    if (!formData.fecha_disponibilidad) {
      err.fecha_disponibilidad = 'Selecciona la fecha de entrega';
    } else {
      const [year, month, day] = formData.fecha_disponibilidad.split('T')[0].split('-');
      const fechaDisp = new Date(year, month - 1, day);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaDisp < hoy) err.fecha_disponibilidad = 'La fecha no puede ser pasada';
    }

    if (!formData.provincia) err.provincia = 'Selecciona la provincia';
    if (!formData.municipio) err.municipio = 'Selecciona el municipio';
    if (!editingId && !foto) err.foto = 'La foto es obligatoria para nuevas cosechas';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Por favor, corregí los errores del formulario');
      return;
    }

    const savedQR = localStorage.getItem('productorQR');
    if (!savedQR) {
      toast.error('Debes configurar tu QR de cobro en tu perfil antes de poder publicar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const formPayload = new FormData();
      formPayload.append('nombre_producto', formData.nombre_producto.trim());
      formPayload.append('categoria', formData.categoria);
      formPayload.append('descripcion', formData.descripcion.trim());
      formPayload.append('precio_unitario', formData.precio_unitario);
      formPayload.append('unidad_medida', formData.unidad_medida);
      formPayload.append('cantidad_disponible', formData.cantidad_disponible);
      formPayload.append('es_preventa', formData.modalidad === 'Preventa');
      formPayload.append('fecha_disponibilidad', formData.modalidad === 'Preventa' ? formData.fecha_disponibilidad : new Date().toISOString().split('T')[0]);
      formPayload.append('provincia', formData.provincia);
      formPayload.append('municipio', formData.municipio);
      if (foto) {
        formPayload.append('foto', foto);
      }

      if (editingId) {
        await axios.put(`http://localhost:5000/api/cosechas/${editingId}`, formPayload, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}` 
          }
        });
        toast.success('Cosecha actualizada con éxito');
      } else {
        await axios.post('http://localhost:5000/api/cosechas', formPayload, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}` 
          }
        });
        toast.success('Cosecha publicada con éxito');
      }

      setIsModalOpen(false);
      resetForm();
      fetchMisCosechas();
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Error al publicar la cosecha';
      toast.error(errorMessage);
      setErrorFormulario(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setErrorFormulario(null);
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingId(prod.id);
    setFormData({
      nombre_producto: prod.nombre,
      categoria: prod.categoria,
      descripcion: prod.descripcion,
      precio_unitario: String(prod.precio),
      unidad_medida: prod.unidad,
      cantidad_disponible: String(prod.stock),
      modalidad: prod.es_preventa ? 'Preventa' : 'Inmediata',
      fecha_disponibilidad: prod.fecha_disponibilidad || new Date().toISOString().split('T')[0],
      provincia: 'Andrés Ibáñez',
      municipio: 'Santa Cruz de la Sierra'
    });
    setPreview(prod.foto_url ? `http://localhost:5000${prod.foto_url}` : null);
    setFoto(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta cosecha? Se ocultará del marketplace pero conservará historial.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/cosechas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Cosecha eliminada');
      fetchMisCosechas();
    } catch (err) {
      console.error(err);
      toast.error('No se pudo eliminar la cosecha');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      nombre_producto: '',
      categoria: '',
      descripcion: '',
      precio_unitario: '',
      unidad_medida: 'Kg',
      cantidad_disponible: '',
      modalidad: 'Inmediata',
      fecha_disponibilidad: new Date().toISOString().split('T')[0],
      provincia: 'Andrés Ibáñez',
      municipio: ''
    });
    setFoto(null);
    setPreview(null);
    setErrors({});
  };

  // Autocomplete & abasto comparison calculations
  const matchAbasto = MOCK_ABASTO_PRICES[formData.nombre_producto] || null;
  const abastoDiff = matchAbasto && formData.precio_unitario 
    ? ((Number(formData.precio_unitario) - matchAbasto) / matchAbasto) * 100 
    : null;

  // Tabs filtering
  const getTabCounts = (tab) => {
    if (tab === 'Todas') return productos.length;
    if (tab === 'Activas') return productos.filter(p => p.estado === 'Activas' || p.estado === 'Activo').length;
    if (tab === 'Preventas') return productos.filter(p => p.es_preventa).length;
    if (tab === 'Agotadas') return productos.filter(p => p.estado === 'Agotada' || p.estado === 'Agotado').length;
    if (tab === 'Inactivas') return productos.filter(p => p.estado === 'Inactivas' || p.estado === 'Inactivo').length;
    return 0;
  };

  const filteredProductos = productos.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'Todas') return matchesSearch;
    if (activeTab === 'Activas') return matchesSearch && (p.estado === 'Activas' || p.estado === 'Activo');
    if (activeTab === 'Preventas') return matchesSearch && p.es_preventa;
    if (activeTab === 'Agotadas') return matchesSearch && (p.estado === 'Agotada' || p.estado === 'Agotado');
    if (activeTab === 'Inactivas') return matchesSearch && (p.estado === 'Inactivas' || p.estado === 'Inactivo');
    return matchesSearch;
  });

  return (
    <PageShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
            🌱 Catálogo AgroDirecto
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Mis Cosechas</h1>
          <p className="text-sm text-slate-400 mt-1">Gestioná tu inventario y habilitá preventas para entregas futuras</p>
        </div>
        
        {userData?.estado === 'VERIFICADO' ? (
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Nueva Cosecha
          </button>
        ) : (
          <span className="badge bg-amber-50 text-amber-700 border-amber-200 py-2.5 px-4 font-bold text-xs">
            ⏳ Verificación requerida para publicar
          </span>
        )}
      </div>

      {userData?.estado !== 'VERIFICADO' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3 mt-6">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-900">Tu cuenta está pendiente de verificación.</h4>
            <p className="text-xs text-amber-700 mt-1">No podés publicar hasta ser aprobado.</p>
          </div>
          <button onClick={() => navigate('/dashboard/productor/perfil')} className="bg-white px-4 py-2 rounded-lg text-xs font-bold text-amber-700 border border-amber-200 shadow-sm hover:bg-amber-100 transition-colors">
            Ver mi perfil
          </button>
        </div>
      )}

      {tieneUbicacion === false && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4 mt-6">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-900">Necesitás registrar la ubicación de tu finca primero.</h4>
              <p className="text-xs text-amber-700 mt-1">Es obligatorio para publicar cosechas y aparecer en el mapa.</p>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard/productor/finca')} className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-4 py-2 text-sm font-semibold shrink-0 transition-colors">
            Ir a Mi Finca →
          </button>
        </div>
      )}

      {/* Tabs & Search */}
      <div className="card-elevated p-5 flex flex-col md:flex-row items-center justify-between gap-5">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {['Todas', 'Activas', 'Preventas', 'Agotadas', 'Inactivas'].map(tab => {
            const isActive = activeTab === tab;
            const count = getTabCounts(tab);
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <span>{tab}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar cosecha..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 border border-slate-200/40 transition-all"
          />
        </div>
      </div>

      {/* Cosechas Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-500 font-bold text-sm">Cargando cosechas...</p>
        </div>
      ) : filteredProductos.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/60 p-16 text-center max-w-lg mx-auto shadow-sm">
          <Sprout className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-black text-slate-800">No hay cosechas</h3>
          <p className="text-xs text-slate-400 mt-2 font-semibold">
            No tenés cosechas en esta pestaña que coincidan con la búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProductos.map((prod) => (
            <div 
              key={prod.id} 
              className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col group hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300"
            >
              {/* Product Photo */}
              <div className="h-44 relative bg-slate-50 overflow-hidden">
                {prod.foto_url ? (
                  <img src={`http://localhost:5000${prod.foto_url}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={prod.nombre} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                    <Sprout className="w-12 h-12 text-emerald-200" />
                  </div>
                )}
                {/* State Badge top-right */}
                <div className="absolute top-3 right-3">
                  {(() => {
                    const diasFaltantes = prod.fecha_disponibilidad ? Math.ceil((new Date(prod.fecha_disponibilidad) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
                    if (prod.es_preventa && diasFaltantes > 0) {
                      return (
                        <div className="flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-full shadow-sm">
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-0.5 text-[10px] font-semibold">
                            Preventa
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold px-1">
                            Disponible en {diasFaltantes} días
                          </span>
                        </div>
                      );
                    }
                    if (prod.es_preventa && diasFaltantes <= 0) {
                      return (
                        <span className="badge bg-emerald-50 text-emerald-700 border-emerald-200">
                          Activa (Disponible hoy)
                        </span>
                      );
                    }
                    return (
                      <span className={`badge ${
                        prod.estado === 'Agotada' 
                          ? 'bg-rose-50 text-rose-700 border-rose-200' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {prod.estado === 'Activas' ? 'Activa' : prod.estado}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{prod.categoria}</span>
                  <h3 className="text-base font-black text-slate-800 tracking-tight mt-1 line-clamp-1">{prod.nombre}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed font-semibold">{prod.descripcion}</p>
                  
                  {prod.es_preventa && (
                    <div className="mt-3 inline-flex items-center gap-1 bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                      <Calendar className="w-3.5 h-3.5" />
                      Disponible: {prod.fecha_disponibilidad}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <span className="text-lg font-black text-slate-900">Bs. {prod.precio.toFixed(2)}</span>
                      <span className="text-xs text-slate-400 font-bold ml-1">/{prod.unidad}</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                      Stock: {prod.stock}
                    </span>
                  </div>

                  {/* 3 action buttons: Editar (outline azul) | Ver pedidos | Eliminar (outline rojo) */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openEditModal(prod)}
                      className="flex-1 py-2 border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button 
                      onClick={() => navigate('/dashboard/productor/pedidos')}
                      className="py-2 px-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all"
                      title="Ver pedidos asociados"
                    >
                      Pedidos
                    </button>
                    <button 
                      onClick={() => handleDelete(prod.id)}
                      className="py-2 px-3 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all"
                      title="Eliminar cosecha"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CREAR/EDITAR COSECHA */}
      <FocusModal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editingId ? 'Editar Cosecha' : 'Nueva Cosecha'}
        subtitle={editingId ? 'Actualizá los datos de tu producción' : 'Completá los datos para publicar tu producto en el marketplace'}
        icon={Sprout}
        footer={
          <div className="flex items-center gap-3 justify-end w-full">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || tieneUbicacion === false}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/10 flex items-center gap-1.5 transition-all ${
                tieneUbicacion === false 
                  ? "opacity-50 cursor-not-allowed bg-slate-300 text-slate-500" 
                  : "bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white"
              }`}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Publicando...' : (editingId ? 'Guardar cambios' : 'Publicar Cosecha')}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {tieneUbicacion === false && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-sm text-amber-700">
                Registrá la ubicación de tu finca para publicar.
                <button type="button" onClick={() => navigate('/dashboard/productor/finca')} className="ml-1 underline font-semibold text-amber-800 hover:text-amber-900">
                  Ir a Mi Finca
                </button>
              </span>
            </div>
          )}
          
          {errorFormulario && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <p className="text-sm text-rose-700">{errorFormulario}</p>
            </div>
          )}

          {/* SECCIÓN 1: Información Básica */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">Sección 1 — Información básica</h3>
            
            {/* Photo upload drag & drop */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">Foto del producto</label>
              <div className="flex items-center gap-4">
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFileUpload(e.dataTransfer.files[0]);
                  }}
                  className="flex-1 border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-slate-50/50 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors"
                >
                  <input
                    type="file"
                    id="modal-foto"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                  <label htmlFor="modal-foto" className="cursor-pointer text-center">
                    <Upload className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
                    <span className="text-xs font-bold text-emerald-600 block">Subir foto de la cosecha</span>
                    <span className="text-[10px] text-slate-400">Arrastrá una imagen aquí</span>
                  </label>
                </div>
                {preview && (
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shrink-0">
                    <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                    <button 
                      type="button"
                      onClick={() => {
                        setFoto(null);
                        setPreview(null);
                      }}
                      className="absolute top-1, right-1 bg-black/60 text-white p-0.5 rounded-full hover:bg-black"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Nombre del producto (con autocomplete básico) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del producto <span className="text-rose-500">*</span></label>
              <input
                type="text"
                list="productos-comunes"
                value={formData.nombre_producto}
                onChange={(e) => handleInputChange('nombre_producto', e.target.value)}
                placeholder="Ej. Tomate perita, Papa huaycha"
                className={`w-full rounded-xl bg-gray-50 border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all ${
                  errors.nombre_producto ? 'border-rose-300 ring-2 ring-rose-100' : 'border-gray-200'
                }`}
              />
              <datalist id="productos-comunes">
                <option value="Tomate" />
                <option value="Papa" />
                <option value="Zanahoria" />
                <option value="Cebolla" />
                <option value="Soya" />
                <option value="Maíz" />
                <option value="Yuca" />
              </datalist>
              {errors.nombre_producto && <span className="text-rose-600 text-xs font-semibold mt-1 block">{errors.nombre_producto}</span>}
            </div>

            {/* Categoría: select */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría <span className="text-rose-500">*</span></label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={(e) => handleInputChange('categoria', e.target.value)}
                className={`w-full rounded-xl bg-gray-50 border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all ${
                  errors.categoria ? 'border-rose-300 ring-2 ring-rose-100' : 'border-gray-200'
                }`}
              >
                <option value="">Seleccioná una categoría</option>
                <option value="Verduras">🥬 Verduras</option>
                <option value="Frutas">🍎 Frutas</option>
                <option value="Granos">🌾 Granos</option>
                <option value="Tubérculos">🥔 Tubérculos</option>
                <option value="Carnes">🥩 Carnes</option>
                <option value="Lácteos">🥛 Lácteos</option>
              </select>
              {errors.categoria && <span className="text-rose-600 text-xs font-semibold mt-1 block">{errors.categoria}</span>}
            </div>

            {/* Descripción textarea con contador de caracteres */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-semibold text-gray-700">Descripción <span className="text-rose-500">*</span></label>
                <span className="text-[10px] font-bold text-slate-400">{formData.descripcion.length}/300</span>
              </div>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value.slice(0, 300))}
                placeholder="Detalla la calidad, tamaño, variedad o recomendaciones de la cosecha..."
                rows="3"
                className={`w-full rounded-xl bg-gray-50 border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all resize-none ${
                  errors.descripcion ? 'border-rose-300 ring-2 ring-rose-100' : 'border-gray-200'
                }`}
              />
              {errors.descripcion && <span className="text-rose-600 text-xs font-semibold mt-1 block">{errors.descripcion}</span>}
            </div>
          </div>

          {/* SECCIÓN 2: Precios y Stock */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">Sección 2 — Precios y stock</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Precio unitario (Bs.) <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.precio_unitario}
                  onChange={(e) => handleInputChange('precio_unitario', e.target.value)}
                  placeholder="25.00"
                  className={`w-full rounded-xl bg-gray-50 border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all ${
                    errors.precio_unitario ? 'border-rose-300 ring-2 ring-rose-100' : 'border-gray-200'
                  }`}
                />
                {errors.precio_unitario && <span className="text-rose-600 text-xs font-semibold mt-1 block">{errors.precio_unitario}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Stock disponible <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  value={formData.cantidad_disponible}
                  onChange={(e) => handleInputChange('cantidad_disponible', e.target.value)}
                  placeholder="50"
                  className={`w-full rounded-xl bg-gray-50 border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all ${
                    errors.cantidad_disponible ? 'border-rose-300 ring-2 ring-rose-100' : 'border-gray-200'
                  }`}
                />
                {errors.cantidad_disponible && <span className="text-rose-600 text-xs font-semibold mt-1 block">{errors.cantidad_disponible}</span>}
                {formData.cantidad_disponible && Number(formData.cantidad_disponible) < 10 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-600 mt-1.5 animate-pulse">
                    ⚠️ Últimas unidades disponibles
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Unidad de medida <span className="text-rose-500">*</span></label>
                <select
                  name="unidad_medida"
                  value={formData.unidad_medida}
                  onChange={(e) => handleInputChange('unidad_medida', e.target.value)}
                  className={`w-full rounded-xl bg-gray-50 border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all ${
                    errors.unidad_medida ? 'border-rose-300 ring-2 ring-rose-100' : 'border-gray-200'
                  }`}
                >
                  <option value="">Seleccioná una unidad</option>
                  <option value="Quintal">Quintal</option>
                  <option value="Arroba">Arroba</option>
                  <option value="Kg">Kg</option>
                  <option value="Unidad">Unidad</option>
                  <option value="Caja">Caja</option>
                  <option value="Bolsa">Bolsa</option>
                  <option value="Litro">Litro</option>
                </select>
                {errors.unidad_medida && <span className="text-rose-600 text-xs font-semibold mt-1 block">{errors.unidad_medida}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de disponibilidad <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  value={formData.fecha_disponibilidad}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleInputChange('fecha_disponibilidad', e.target.value)}
                  className={`w-full rounded-xl bg-gray-50 border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all ${
                    errors.fecha_disponibilidad ? 'border-rose-300 ring-2 ring-rose-100' : 'border-gray-200'
                  }`}
                />
                {errors.fecha_disponibilidad && <span className="text-rose-600 text-xs font-semibold mt-1 block">{errors.fecha_disponibilidad}</span>}
              </div>
            </div>

            {/* WIDGET COMPARADOR */}
            {matchAbasto && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex items-start gap-2 text-emerald-900 mt-4">
                <Info className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs font-semibold leading-normal">
                  Precio Abasto hoy:{' '}
                  <span className="font-extrabold">Bs. {matchAbasto.toFixed(2)} / kg</span>.{' '}
                  Tu precio está{' '}
                  <span className={`font-extrabold ${abastoDiff > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {abastoDiff > 0 ? `${abastoDiff.toFixed(0)}% por encima` : `${Math.abs(abastoDiff).toFixed(0)}% por debajo`}
                  </span>{' '}
                  de la media del mercado.
                </div>
              </div>
            )}
          </div>

          {/* SECCIÓN 3: Origen */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">Sección 3 — Origen</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Provincia (Santa Cruz) <span className="text-rose-500">*</span></label>
                <select
                  value={formData.provincia}
                  onChange={(e) => {
                    handleInputChange('provincia', e.target.value);
                    handleInputChange('municipio', ''); // Reset municipio
                  }}
                  className={`w-full rounded-xl bg-gray-50 border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all ${
                    errors.provincia ? 'border-rose-300 ring-2 ring-rose-100' : 'border-gray-200'
                  }`}
                >
                  <option value="">Seleccionar...</option>
                  {SANTA_CRUZ_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.provincia && <span className="text-rose-600 text-xs font-semibold mt-1 block">{errors.provincia}</span>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Municipio</label>
                <select
                  value={formData.municipio}
                  disabled={!formData.provincia}
                  onChange={(e) => handleInputChange('municipio', e.target.value)}
                  className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                    errors.municipio ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'
                  }`}
                >
                  <option value="">Seleccionar...</option>
                  {(MOCK_MUNICIPIOS[formData.provincia] || ['Santa Cruz de la Sierra', 'Montero', 'Warnes', 'La Guardia']).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {errors.municipio && <span className="text-rose-600 text-xs font-semibold mt-1 block">{errors.municipio}</span>}
              </div>
            </div>

            {/* Marcador en mapa mini preview */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">Ubicación geográfica de la cosecha</label>
              <div className="w-full h-32 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 relative overflow-hidden group">
                {/* Mock Map Background Visual */}
                <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600')" }} />
                <div className="relative z-10 text-center">
                  <MapPin className="w-6 h-6 text-emerald-600 mx-auto mb-1 animate-bounce" />
                  <span className="text-[10px] font-black text-slate-700 bg-white/90 px-3 py-1 rounded-full shadow-sm border border-slate-200 uppercase tracking-wide">
                    Finca registrada: Santa Cruz
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </FocusModal>
    </PageShell>
  );
};

export default MisCosechasPage;
