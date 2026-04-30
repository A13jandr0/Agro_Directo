import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, LayoutDashboard, Sprout, PlusCircle, ShoppingBag, MapPin, BarChart2, User, Settings, LogOut, 
  Menu, Bell, CheckCircle2, AlertCircle, Camera, Star, Package, Calendar, TrendingUp, FileText, Upload,
  Mail, Phone, Lock, Save, X, Eye, EyeOff
} from 'lucide-react';
import axios from 'axios';

const MiPerfilProductorPage = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Personal');
  
  // Estados mock para notificaciones
  const [toastMsg, setToastMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de Formulario - Personal
  const [formDataPersonal, setFormDataPersonal] = useState({
    nombreCompleto: '',
    correo: '',
    celular: '',
    tipoProductor: 'Individual',
    aniosExperiencia: 0,
    tipoDocumento: 'CI',
    numeroDocumento: '',
    estado: 'Pendiente_Verificacion',
    fechaRegistro: ''
  });

  // Estados de Formulario - Finca
  const [formDataFinca, setFormDataFinca] = useState({
    nombreFinca: '',
    departamento: 'Santa Cruz',
    provincia: '',
    municipio: '',
    descripcionFinca: 'Terreno de 50 hectáreas dedicado a la agricultura sostenible y producción orgánica de granos y hortalizas.'
  });

  // Estados de Formulario - Seguridad
  const [formDataSeguridad, setFormDataSeguridad] = useState({
    passwordActual: '',
    nuevaPassword: '',
    confirmarPassword: ''
  });
  const [showPassword, setShowPassword] = useState({ actual: false, nueva: false, confirmar: false });

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const res = await axios.get('http://localhost:5000/api/usuarios/mi-perfil', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data;
        
        setFormDataPersonal({
          nombreCompleto: data.nombre_completo || '',
          correo: data.correo || '',
          celular: data.celular || '',
          tipoProductor: data.tipo_productor || 'Individual',
          aniosExperiencia: data.anios_experiencia || 0,
          tipoDocumento: data.tipo_documento || 'CI',
          numeroDocumento: data.numero_documento || '',
          estado: data.estado || 'PENDIENTE_VERIFICACION',
          fechaRegistro: data.fecha_registro || '',
          rol: data.rol || 'PRODUCTOR'
        });

        setFormDataFinca({
          nombreFinca: data.nombre_finca || '',
          departamento: data.departamento || 'Santa Cruz',
          provincia: data.provincia || '',
          municipio: data.municipio || '',
          descripcionFinca: 'Terreno dedicado a la agricultura sostenible y producción de granos y hortalizas.'
        });
      } catch (error) {
        console.error("Error fetching profile", error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          setToastMsg("Error al cargar los datos del perfil");
          setTimeout(() => setToastMsg(''), 4000);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  // Cálculo de fortaleza de contraseña
  const getPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    return strength; // 0, 1, 2, 3
  };
  const passStrength = getPasswordStrength(formDataSeguridad.nuevaPassword);
  const strengthColors = ['bg-gray-200', 'bg-red-500', 'bg-yellow-500', 'bg-green-500'];

  // Menu items del Sidebar
  const menuItems = [
    { id: 'dashboard', label: 'Mi Dashboard', icon: LayoutDashboard, path: '/dashboard/productor' },
    { id: 'cosechas', label: 'Mis Cosechas', icon: Sprout, path: '/dashboard/productor/cosechas' },
    { id: 'publicar', label: 'Publicar Producto', icon: PlusCircle, path: '#' },
    { id: 'pedidos', label: 'Mis Pedidos', icon: ShoppingBag, path: '/dashboard/productor/pedidos' },
    { id: 'finca', label: 'Mi Finca', icon: MapPin, path: '/dashboard/productor/finca' },
    { id: 'ingresos', label: 'Mis Ingresos', icon: BarChart2, path: '/dashboard/productor/ingresos' },
    { id: 'perfil', label: 'Mi Perfil', icon: User, path: '/dashboard/productor/perfil', active: true },
    { id: 'configuracion', label: 'Configuración', icon: Settings, path: '#' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/productor/perfil', {
        nombreCompleto: formDataPersonal.nombreCompleto,
        celular: formDataPersonal.celular,
        tipoProductor: formDataPersonal.tipoProductor,
        aniosExperiencia: formDataPersonal.aniosExperiencia,
        tipoDocumento: formDataPersonal.tipoDocumento,
        numeroDocumento: formDataPersonal.numeroDocumento,
        nombreFinca: formDataFinca.nombreFinca,
        municipio: formDataFinca.municipio,
        provincia: formDataFinca.provincia,
        departamento: formDataFinca.departamento
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToastMsg('Perfil actualizado correctamente');
      setTimeout(() => setToastMsg(''), 3000);
    } catch (error) {
      console.error(error);
      setToastMsg('Error al guardar el perfil');
      setTimeout(() => setToastMsg(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex h-screen bg-[#f9fafb] font-sans overflow-hidden relative">
      
      {/* TOAST MESSAGE */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-[100] bg-[#1D9E75] text-white px-6 py-3 rounded-lg shadow-lg font-medium animate-fade-in-down flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {toastMsg}
        </div>
      )}

      {/* OVERLAY PARA MÓVIL */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* SIDEBAR FIJO */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-[240px] bg-[#0F6E56] text-white z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none shrink-0`}>
        <div className="h-16 flex items-center gap-2 px-6 border-b border-white/10 shrink-0">
          <Leaf className="w-6 h-6 text-white" />
          <span className="text-xl font-bold tracking-wider">AgroDirecto</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button 
                    onClick={() => item.path !== '#' && navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${item.active ? 'bg-white/15 border-l-[3px] border-white text-white' : 'text-white/80 hover:bg-white/5 hover:text-white border-l-[3px] border-transparent'}`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-white/10 p-4 shrink-0">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-2 py-2 text-sm font-medium text-red-200 hover:text-red-100 hover:bg-white/5 rounded transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER TOP NAV */}
        <header className="h-[64px] bg-white shadow-sm flex items-center justify-between px-4 sm:px-8 z-10 shrink-0 border-b border-gray-100 lg:hidden">
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-[#1D9E75]" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-[#1a1a1a]">Mi Perfil</h1>
          </div>
        </header>

        {/* CONTENIDO SCROLLABLE */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {/* HEADER DE LA SECCIÓN (Solo Desktop) */}
          <div className="hidden lg:flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#E1F5EE] flex items-center justify-center text-[#1D9E75] shrink-0">
              <User className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1a1a1a]">Mi Perfil</h1>
              <p className="text-sm text-[#6b7280]">Gestiona tu información personal y de seguridad</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            
            {/* COLUMNA IZQUIERDA (320px) */}
            <div className="w-full lg:w-[320px] flex flex-col gap-6 shrink-0">
              
              {/* Card de Perfil */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-[120px] h-[120px] rounded-full bg-[#1D9E75] text-white flex items-center justify-center text-4xl font-bold border-4 border-[#E1F5EE]">
                    {getInitials(formDataPersonal.nombreCompleto)}
                  </div>
                  <button className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-white border border-gray-200 text-[#1a1a1a] rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold hover:bg-gray-50 shadow-sm whitespace-nowrap">
                    <Camera className="w-3.5 h-3.5" /> Cambiar foto
                  </button>
                </div>
                
                <h2 className="text-xl font-bold text-[#1a1a1a] mt-4">{formDataPersonal.nombreCompleto}</h2>
                {formDataPersonal.estado === 'VERIFICADO' ? (
                  <div className="flex items-center gap-1.5 mt-1.5 mb-4 text-[#1D9E75] bg-[#E1F5EE] px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" /> Verificado
                  </div>
                ) : formDataPersonal.estado === 'PENDIENTE_VERIFICACION' ? (
                  <div className="flex items-center gap-1.5 mt-1.5 mb-4 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" /> Pendiente de Verificación
                  </div>
                ) : formDataPersonal.estado === 'RECHAZADO' ? (
                  <div className="flex items-center gap-1.5 mt-1.5 mb-4 text-red-700 bg-red-50 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" /> Rechazado
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mt-1.5 mb-4 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" /> {formDataPersonal.estado || 'Registrado'}
                  </div>
                )}
                
                <div className="w-full space-y-2 text-sm text-[#6b7280] bg-gray-50 p-3 rounded-lg text-left">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-gray-400" /> <span className="truncate">{formDataFinca.nombreFinca}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" /> <span className="truncate">{formDataFinca.municipio}, {formDataFinca.departamento}</span>
                  </div>
                </div>
              </div>

              {/* Card de Calificación */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
                <div className="flex gap-1 mb-2 text-[#F59E0B]">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className={`w-6 h-6 ${star === 5 ? 'fill-gray-200 text-gray-200' : 'fill-current'}`} />
                  ))}
                </div>
                <h3 className="text-3xl font-bold text-[#1a1a1a]">4.8 <span className="text-lg text-gray-400 font-medium">/ 5.0</span></h3>
                <p className="text-xs text-[#6b7280] mt-1">Basado en 18 calificaciones</p>
              </div>

              {/* Estadísticas Rápidas */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-sm font-bold text-[#1a1a1a] mb-4 uppercase tracking-wider text-gray-500">Resumen de Actividad</h3>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0"><Package className="w-4 h-4" /></div>
                    <span className="text-sm text-[#1a1a1a] font-medium">34 ventas completadas</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 shrink-0"><Calendar className="w-4 h-4" /></div>
                    <span className="text-sm text-[#1a1a1a] font-medium">Miembro desde marzo 2024</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500 shrink-0"><Sprout className="w-4 h-4" /></div>
                    <span className="text-sm text-[#1a1a1a] font-medium">7 productos activos</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0"><TrendingUp className="w-4 h-4" /></div>
                    <span className="text-sm text-[#1a1a1a] font-medium">Bs. 8,450 en ventas totales</span>
                  </li>
                </ul>
              </div>

              {/* Card de Documentos */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-[#1D9E75]" />
                  <h3 className="text-sm font-bold text-[#1a1a1a] uppercase tracking-wider text-gray-500">Mis documentos</h3>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-100 rounded-lg">
                    <span className="text-xs font-semibold text-[#1a1a1a]">Carnet de Identidad</span>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-100 rounded-lg">
                    <span className="text-xs font-semibold text-[#1a1a1a]">Registro Agrario (RAU)</span>
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  </div>
                </div>

                <button className="w-full bg-white border border-gray-200 text-[#1a1a1a] py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-sm shadow-sm">
                  <Upload className="w-4 h-4" /> Subir nuevo documento
                </button>
              </div>

            </div>

            {/* COLUMNA DERECHA (Formulario de edición) */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-max">
              
              {/* TABS DE EDICIÓN */}
              <div className="flex border-b border-gray-100 bg-gray-50/50 overflow-x-auto hide-scrollbar shrink-0">
                {['Personal', 'Finca', 'Seguridad'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap px-6 py-4 text-sm font-bold transition-colors border-b-2 ${
                      activeTab === tab 
                        ? 'border-[#1D9E75] text-[#1D9E75] bg-white' 
                        : 'border-transparent text-[#6b7280] hover:text-[#1a1a1a] hover:bg-gray-100/50'
                    }`}
                  >
                    {tab === 'Personal' && 'Información personal'}
                    {tab === 'Finca' && 'Información de la finca'}
                    {tab === 'Seguridad' && 'Seguridad'}
                  </button>
                ))}
              </div>

              {/* CONTENIDO DEL TAB */}
              <div className="p-6 md:p-8 flex-1">
                
                {/* TAB: PERSONAL */}
                {activeTab === 'Personal' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5 flex items-center gap-2"><User className="w-4 h-4 text-gray-400"/> Nombre completo</label>
                        <input type="text" value={formDataPersonal.nombreCompleto} onChange={e => setFormDataPersonal({...formDataPersonal, nombreCompleto: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5 flex items-center gap-2 justify-between">
                          <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400"/> Correo electrónico</span>
                          <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">No editable</span>
                        </label>
                        <input type="email" value={formDataPersonal.correo} disabled className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5 flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400"/> Número de celular</label>
                        <input type="text" value={formDataPersonal.celular} onChange={e => setFormDataPersonal({...formDataPersonal, celular: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Tipo de productor</label>
                        <select value={formDataPersonal.tipoProductor} onChange={e => setFormDataPersonal({...formDataPersonal, tipoProductor: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] bg-white">
                          <option>Individual</option>
                          <option>Asociación</option>
                          <option>Cooperativa</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Años de experiencia</label>
                        <input type="number" value={formDataPersonal.aniosExperiencia} onChange={e => setFormDataPersonal({...formDataPersonal, aniosExperiencia: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Tipo doc.</label>
                          <select value={formDataPersonal.tipoDocumento} onChange={e => setFormDataPersonal({...formDataPersonal, tipoDocumento: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] bg-white">
                            <option>CI</option>
                            <option>NIT</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Número doc.</label>
                          <input type="text" value={formDataPersonal.numeroDocumento} onChange={e => setFormDataPersonal({...formDataPersonal, numeroDocumento: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: FINCA */}
                {activeTab === 'Finca' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5 flex items-center gap-2"><Leaf className="w-4 h-4 text-gray-400"/> Nombre de la finca</label>
                      <input type="text" value={formDataFinca.nombreFinca} onChange={e => setFormDataFinca({...formDataFinca, nombreFinca: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Departamento</label>
                        <select value={formDataFinca.departamento} onChange={e => setFormDataFinca({...formDataFinca, departamento: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] bg-white">
                          <option>Santa Cruz</option>
                          <option>Cochabamba</option>
                          <option>La Paz</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Provincia</label>
                        <input type="text" value={formDataFinca.provincia} onChange={e => setFormDataFinca({...formDataFinca, provincia: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Municipio</label>
                        <input type="text" value={formDataFinca.municipio} onChange={e => setFormDataFinca({...formDataFinca, municipio: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Descripción de la finca</label>
                      <textarea rows="4" value={formDataFinca.descripcionFinca} onChange={e => setFormDataFinca({...formDataFinca, descripcionFinca: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] resize-none"></textarea>
                    </div>

                    <div className="bg-[#E1F5EE]/50 border border-[#1D9E75]/20 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-6 h-6 text-[#1D9E75]" />
                        <div>
                          <h4 className="text-sm font-bold text-[#1a1a1a]">Ubicación en el mapa</h4>
                          <p className="text-xs text-[#6b7280]">Configura el pin exacto de tu finca para el cálculo de fletes.</p>
                        </div>
                      </div>
                      <button onClick={() => navigate('/dashboard/productor/finca')} className="text-sm font-bold text-[#1D9E75] hover:underline whitespace-nowrap">
                        Ver y editar ubicación →
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB: SEGURIDAD */}
                {activeTab === 'Seguridad' && (
                  <div className="space-y-6 animate-fade-in max-w-md">

                    {/* ALERTA DE VERIFICACIÓN PENDIENTE */}
                    {formDataPersonal.estado === 'PENDIENTE_VERIFICACION' && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-amber-800 font-bold text-sm">Verificación pendiente</h4>
                          <p className="text-amber-700 text-xs mt-1">Tu cuenta está siendo revisada por el equipo de AgroDirecto. Mientras tanto, tienes acceso limitado a ciertas funciones como la publicación de productos.</p>
                        </div>
                      </div>
                    )}
                    {formDataPersonal.estado === 'RECHAZADO' && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-red-800 font-bold text-sm">Verificación rechazada</h4>
                          <p className="text-red-700 text-xs mt-1">Tu verificación fue rechazada. Por favor, sube nuevos documentos o contacta al soporte.</p>
                        </div>
                      </div>
                    )}

                    {/* INFO DE CUENTA */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
                      <h4 className="text-sm font-bold text-[#1a1a1a] uppercase tracking-wider text-gray-500">Información de Cuenta</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="block text-[10px] text-gray-400 uppercase font-bold">Rol</span>
                          <span className="text-sm font-semibold text-[#1D9E75]">{formDataPersonal.rol}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-gray-400 uppercase font-bold">Estado</span>
                          <span className={`text-sm font-semibold ${formDataPersonal.estado === 'VERIFICADO' ? 'text-green-600' : formDataPersonal.estado === 'RECHAZADO' ? 'text-red-600' : 'text-amber-600'}`}>
                            {formDataPersonal.estado === 'PENDIENTE_VERIFICACION' ? 'Pendiente' : formDataPersonal.estado === 'VERIFICADO' ? 'Verificado' : formDataPersonal.estado === 'RECHAZADO' ? 'Rechazado' : formDataPersonal.estado}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-gray-400 uppercase font-bold">Miembro desde</span>
                          <span className="text-sm font-medium text-gray-700">{formDataPersonal.fechaRegistro ? new Date(formDataPersonal.fechaRegistro).toLocaleDateString('es-BO') : '—'}</span>
                        </div>
                      </div>
                    </div>

                    {/* CAMBIO DE CONTRASEÑA */}
                    <div>
                      <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5 flex items-center gap-2"><Lock className="w-4 h-4 text-gray-400"/> Contraseña actual</label>
                      <div className="relative">
                        <input type={showPassword.actual ? 'text' : 'password'} value={formDataSeguridad.passwordActual} onChange={e => setFormDataSeguridad({...formDataSeguridad, passwordActual: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" />
                        <button type="button" onClick={() => setShowPassword({...showPassword, actual: !showPassword.actual})} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPassword.actual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                      <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Nueva contraseña</label>
                      <div className="relative mb-2">
                        <input type={showPassword.nueva ? 'text' : 'password'} value={formDataSeguridad.nuevaPassword} onChange={e => setFormDataSeguridad({...formDataSeguridad, nuevaPassword: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" />
                        <button type="button" onClick={() => setShowPassword({...showPassword, nueva: !showPassword.nueva})} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPassword.nueva ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      {/* Indicador de Fortaleza */}
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3].map(level => (
                          <div key={level} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${passStrength >= level ? strengthColors[passStrength] : 'bg-gray-200'}`}></div>
                        ))}
                      </div>
                      <p className="text-xs text-[#6b7280]">Requisitos: Al menos 8 caracteres, una mayúscula y un número.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Confirmar nueva contraseña</label>
                      <div className="relative mb-4">
                        <input type={showPassword.confirmar ? 'text' : 'password'} value={formDataSeguridad.confirmarPassword} onChange={e => setFormDataSeguridad({...formDataSeguridad, confirmarPassword: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" />
                        <button type="button" onClick={() => setShowPassword({...showPassword, confirmar: !showPassword.confirmar})} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPassword.confirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <button className="w-full bg-[#1a1a1a] text-white py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-black transition-colors">
                        Actualizar contraseña
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* FOOTER DE ACCIONES GLOBAL */}
              {activeTab !== 'Seguridad' && (
                <div className="p-6 md:p-8 pt-0 border-t border-gray-100 bg-gray-50/30 flex items-center justify-end gap-3 shrink-0 mt-auto">
                  <button className="px-5 py-2.5 bg-white border border-gray-200 text-[#1a1a1a] rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-[#1D9E75] text-white rounded-lg text-sm font-bold hover:bg-[#0F6E56] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Guardar cambios
                  </button>
                </div>
              )}

            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default MiPerfilProductorPage;
