import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, CheckCircle2, AlertCircle, Camera, Lock, Save, X, Eye, EyeOff, Mail, Phone,
  MapPin, Landmark, ShieldCheck, Sparkles, BellRing, Star } from
'lucide-react';
import axios from 'axios';
import PageShell from '../components/ui/PageShell';
import { useToast } from '../context/ToastContext';

const MiPerfilCompradorPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('Personal'); // Personal | Alertas
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Profile fields
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [tipoNegocio, setTipoNegocio] = useState('Particular'); // Particular | Tienda | Restaurante | Supermercado | Mayorista
  const [nit, setNit] = useState('');

  // Alerts of seasonality
  const [alertas, setAlertas] = useState({
    Tomates: true,
    Mangos: true,
    Papas: true,
    Cebollas: false,
    Zanahorias: false,
    Maiz: true,
    Platanos: false,
    Yuca: true
  });

  const handleToggleAlerta = (key) => {
    setAlertas((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      const res = await axios.get('http://localhost:5000/api/usuarios/mi-perfil', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;

      setNombre(data.nombre_completo || '');
      setEmail(data.correo || '');
      setTelefono(data.celular || '');
      setDireccion(data.direccion || '');
      setCiudad(data.ciudad || 'Santa Cruz de la Sierra');
      setTipoNegocio(data.tipo_negocio || 'Particular');
      setNit(data.nit || '');
    } catch (error) {
      console.error("Error fetching profile", error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        toast.error("Error al cargar los datos del perfil");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');

      // Update profile
      await axios.put('http://localhost:5000/api/usuarios/perfil', {
        nombre_completo: nombre,
        celular: telefono,
        direccion: direccion,
        ciudad: ciudad,
        tipo_negocio: tipoNegocio,
        nit: nit
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'No se pudieron guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-bold">Cargando perfil...</p>
        </div>
      </div>);

  }

  return (
    <PageShell>
      {/* Page Header */}
      <div>
        <span className="inline-flex bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold">
          <Star size={16} className="inline-block mr-1" /> Mi Cuenta
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Mi Perfil</h1>
        <p className="text-sm text-slate-400 mt-1">Administrá tu información de contacto, facturación y alertas</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Avatar & Summary Card */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col items-center text-center shadow-sm">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-3xl text-white flex items-center justify-center text-3xl font-black border-4 border-blue-50 shadow-inner bg-gradient-to-br from-blue-500 to-indigo-600">
                {getInitials(nombre)}
              </div>
              <button className="absolute -bottom-1 -right-1 bg-white border border-slate-200 text-slate-600 rounded-xl p-2 hover:bg-slate-50 shadow-sm transition-all hover:scale-105">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <h2 className="text-lg font-black text-slate-800 leading-tight">{nombre}</h2>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">{tipoNegocio}</p>
            
            <div className="flex items-center gap-1.5 mt-4 text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" /> Comprador Verificado
            </div>
          </div>
        </div>

        {/* Right Column: Editable Tabs Form */}
        <div className="flex-grow bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-max">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50/50">
            {[
            { id: 'Personal', label: 'Información Personal' },
            { id: 'Alertas', label: 'Alertas de Estacionalidad' }].
            map((tab) =>
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id ?
              'border-indigo-600 text-indigo-600 font-extrabold bg-white' :
              'border-transparent text-slate-400 hover:text-slate-600'}`
              }>
              
                {tab.label}
              </button>
            )}
          </div>

          <div className="p-6 sm:p-8">
            {/* TAB: Personal info */}
            {activeTab === 'Personal' &&
            <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre Completo *</label>
                    <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                      <span>Correo Electrónico</span>
                      <span className="text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-black uppercase">Único</span>
                    </label>
                    <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-3 bg-slate-50/50 text-slate-400 border border-slate-200 rounded-xl text-xs font-semibold cursor-not-allowed" />
                  
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Número de Celular *</label>
                    <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  
                  </div>

                  {/* Ciudad */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Ciudad / Municipio *</label>
                    <input
                    type="text"
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  
                  </div>

                  {/* Tipo de negocio */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo de Negocio</label>
                    <select
                    value={tipoNegocio}
                    onChange={(e) => setTipoNegocio(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                    
                      <option value="Particular">Particular / Consumidor final</option>
                      <option value="Tienda">Tienda de barrio / Frial</option>
                      <option value="Restaurante">Restaurante / Pensión</option>
                      <option value="Supermercado">Supermercado</option>
                      <option value="Mayorista">Comprador Mayorista / Distribuidor</option>
                    </select>
                  </div>

                  {/* NIT */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">NIT (Para Facturación / Recibo)</label>
                    <input
                    type="text"
                    value={nit}
                    onChange={(e) => setNit(e.target.value)}
                    placeholder="Ej. 10203040025"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  
                  </div>
                </div>

                {/* Dirección de entrega */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Dirección predeterminada de entrega</label>
                  <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Calle, Barrio, Referencia detallada..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
                
                </div>
              </div>
            }

            {/* TAB: Seasonal alerts (US08 Redirect) */}
            {activeTab === 'Alertas' &&
            <div className="space-y-6 animate-fade-in flex flex-col items-center justify-center py-10 text-center">
                <BellRing className="w-16 h-16 text-blue-200 mb-4" />
                <h3 className="text-lg font-black text-slate-800">Gestioná tus alertas de categorías</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
                  Hemos mejorado la gestión de alertas. Ahora podés suscribirte por categorías completas para recibir notificaciones en tiempo real.
                </p>
                <button
                onClick={() => navigate('/suscripciones')}
                className="mt-6 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2">
                
                  <BellRing className="w-4 h-4" />
                  Ir a Mis Alertas
                </button>
              </div>
            }
          </div>

          {/* Form Actions Footer */}
          {activeTab === 'Personal' &&
          <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 mt-auto">
              <button
              onClick={fetchProfile}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors">
              
                Restaurar
              </button>
              <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/10 flex items-center gap-2">
              
                {isSaving ?
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> :

              <Save className="w-4 h-4" />
              }
                Guardar cambios
              </button>
            </div>
          }
        </div>
      </div>
    </PageShell>);

};

export default MiPerfilCompradorPage;