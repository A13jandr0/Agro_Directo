import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, LayoutDashboard, Sprout, PlusCircle, ShoppingBag, MapPin, BarChart2, User, Settings, LogOut, 
  Bell, Menu, Search, Grid2X2, List, Package, Clock, Eye, ShoppingCart, Edit2, Trash2, X, ImagePlus
} from 'lucide-react';

const MisCosechasPage = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreventa, setIsPreventa] = useState(false);
  const [descLength, setDescLength] = useState(0);

  const [productos, setProductos] = useState([
    { id: 1, nombre: 'Tomate Santa Cruz', categoria: 'Hortalizas', precio: 45, unidad: 'caja', stock: 15, estado: 'Activo', vistas: 124, pedidos: 5 },
    { id: 2, nombre: 'Maíz Amarillo Duro', categoria: 'Granos', precio: 95, unidad: 'quintal', stock: 200, estado: 'Activo', vistas: 340, pedidos: 12 },
    { id: 3, nombre: 'Soya Grano de Oro', categoria: 'Granos', precio: 120, unidad: 'quintal', stock: 0, estado: 'Agotado', vistas: 56, pedidos: 0 },
    { id: 4, nombre: 'Yuca Blanca', categoria: 'Tubérculos', precio: 30, unidad: 'arroba', stock: 0, estado: 'Pendiente', vistas: 12, pedidos: 0 },
    { id: 5, nombre: 'Cebolla Roja', categoria: 'Verduras', precio: 50, unidad: 'quintal', stock: 50, estado: 'Preventa', diasPreventa: 15, vistas: 89, pedidos: 2 },
  ]);

  const menuItems = [
    { id: 'dashboard', label: 'Mi Dashboard', icon: LayoutDashboard, path: '/dashboard/productor' },
    { id: 'cosechas', label: 'Mis Cosechas', icon: Sprout, path: '/dashboard/productor/cosechas', active: true },
    { id: 'publicar', label: 'Publicar Producto', icon: PlusCircle, path: '#' },
    { id: 'pedidos', label: 'Mis Pedidos', icon: ShoppingBag, path: '/dashboard/productor/pedidos' },
    { id: 'finca', label: 'Mi Finca', icon: MapPin, path: '/dashboard/productor/finca' },
    { id: 'ingresos', label: 'Mis Ingresos', icon: BarChart2, path: '/dashboard/productor/ingresos' },
    { id: 'perfil', label: 'Mi Perfil', icon: User, path: '/dashboard/productor/perfil' },
    { id: 'configuracion', label: 'Configuración', icon: Settings, path: '#' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const renderBadge = (estado) => {
    switch(estado) {
      case 'Activo':
        return <span className="bg-[#1D9E75]/10 text-[#1D9E75] px-2.5 py-1 rounded-full text-xs font-bold tracking-wide">Activo</span>;
      case 'Agotado':
        return <span className="bg-red-100 text-red-600 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide">Agotado</span>;
      case 'Preventa':
        return <span className="bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide">Preventa</span>;
      case 'Pendiente':
        return <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide">Pendiente</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide">{estado}</span>;
    }
  };

  const filteredProductos = productos.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'Todas' || p.categoria === categoryFilter;
    const matchesStatus = statusFilter === 'Todos' || p.estado === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-[#f9fafb] font-sans overflow-hidden">
      
      {/* OVERLAY PARA MÓVIL */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* SIDEBAR FIJO */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-[240px] bg-[#0F6E56] text-white z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none`}>
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
        
        {/* HEADER */}
        <header className="h-[64px] bg-white shadow-sm flex items-center justify-between px-4 sm:px-8 z-10 shrink-0 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-500 hover:text-[#1D9E75]" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-[#1D9E75] transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="w-9 h-9 rounded-full bg-[#1D9E75] text-white flex items-center justify-center font-bold text-sm shadow-sm hover:ring-2 hover:ring-[#1D9E75]/30 transition-all">
              JP
            </button>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {/* SECCIÓN SUPERIOR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#E1F5EE] flex items-center justify-center text-[#1D9E75] shrink-0">
                <Sprout className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1a1a1a]">Mis Cosechas</h1>
                <p className="text-sm text-[#6b7280]">Gestiona todos tus productos publicados</p>
              </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white py-2.5 px-5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm whitespace-nowrap"
            >
              <PlusCircle className="w-5 h-5" />
              Publicar nueva cosecha
            </button>
          </div>

          {/* FILTROS Y BÚSQUEDA */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Buscar producto..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                className="py-2 px-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] text-[#1a1a1a]"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="Todas">Todas las categorías</option>
                <option value="Verduras">Verduras</option>
                <option value="Frutas">Frutas</option>
                <option value="Granos">Granos</option>
                <option value="Tubérculos">Tubérculos</option>
                <option value="Lácteos">Lácteos</option>
                <option value="Carnes">Carnes</option>
              </select>
              <select 
                className="py-2 px-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] text-[#1a1a1a]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="Todos">Todos los estados</option>
                <option value="Activo">Activo</option>
                <option value="Agotado">Agotado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Preventa">Preventa</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg shrink-0">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#1D9E75]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Grid2X2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#1D9E75]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ESTADO VACÍO */}
          {filteredProductos.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 border-dashed py-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Sprout className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-[#1a1a1a]">Aún no tienes productos publicados</h3>
              <p className="text-sm text-[#6b7280] mb-6 mt-1">Empieza publicando tu primera cosecha</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[#1D9E75] text-white py-2 px-6 rounded-lg font-semibold text-sm hover:bg-[#0F6E56] transition-colors"
              >
                Publicar mi primer producto
              </button>
            </div>
          )}

          {/* VISTA EN GRILLA */}
          {filteredProductos.length > 0 && viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProductos.map(prod => (
                <div key={prod.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  {/* Imagen Placeholder */}
                  <div className="h-40 bg-[#E1F5EE] relative flex items-center justify-center">
                    <div className="absolute top-3 right-3">{renderBadge(prod.estado)}</div>
                    <Leaf className="w-12 h-12 text-[#1D9E75]/30" />
                  </div>
                  
                  {/* Info Principal */}
                  <div className="p-4 flex-1">
                    <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1">{prod.categoria}</p>
                    <h3 className="font-bold text-[#1a1a1a] text-lg mb-3 line-clamp-1">{prod.nombre}</h3>
                    
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-xl font-bold text-[#1D9E75]">Bs. {prod.precio}</span>
                      <span className="text-sm text-[#6b7280]">/{prod.unidad}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                        <Package className="w-4 h-4" />
                        <span>{prod.stock} kg disponibles</span>
                      </div>
                      {prod.estado === 'Preventa' && (
                        <div className="flex items-center gap-2 text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                          <Clock className="w-4 h-4" />
                          <span>Disponible en {prod.diasPreventa} días</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Stats & Actions */}
                  <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-4 text-[#6b7280]">
                      <div className="flex items-center gap-1.5" title="Vistas">
                        <Eye className="w-4 h-4" />
                        <span className="text-xs font-semibold">{prod.vistas}</span>
                      </div>
                      <div className="flex items-center gap-1.5" title="Pedidos">
                        <ShoppingCart className="w-4 h-4" />
                        <span className="text-xs font-semibold">{prod.pedidos}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setIsModalOpen(true)} className="p-1.5 text-gray-400 hover:text-[#1D9E75] hover:bg-[#E1F5EE] rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VISTA EN LISTA */}
          {filteredProductos.length > 0 && viewMode === 'list' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-[#6b7280] text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold">Producto</th>
                      <th className="px-6 py-4 font-semibold">Categoría</th>
                      <th className="px-6 py-4 font-semibold">Precio</th>
                      <th className="px-6 py-4 font-semibold">Stock</th>
                      <th className="px-6 py-4 font-semibold">Estado</th>
                      <th className="px-6 py-4 font-semibold">Métricas</th>
                      <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProductos.map(prod => (
                      <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-[#E1F5EE] flex items-center justify-center text-[#1D9E75] shrink-0">
                               <Leaf className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-[#1a1a1a]">{prod.nombre}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#6b7280]">{prod.categoria}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#1D9E75]">Bs. {prod.precio}</span>
                            <span className="text-xs text-[#6b7280]">/{prod.unidad}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#1a1a1a]">{prod.stock} kg</td>
                        <td className="px-6 py-4">{renderBadge(prod.estado)}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-3 text-[#6b7280]">
                            <div className="flex items-center gap-1 text-xs"><Eye className="w-3.5 h-3.5" />{prod.vistas}</div>
                            <div className="flex items-center gap-1 text-xs"><ShoppingCart className="w-3.5 h-3.5" />{prod.pedidos}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setIsModalOpen(true)} className="p-1.5 text-gray-400 hover:text-[#1D9E75] transition-colors"><Edit2 className="w-4 h-4" /></button>
                            <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL PUBLICAR / EDITAR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col my-auto max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sprout className="w-6 h-6 text-[#1D9E75]" />
                <h2 className="text-xl font-bold text-[#1a1a1a]">Publicar Producto</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* COLUMNA IZQUIERDA: Info */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Nombre del producto *</label>
                    <input type="text" placeholder="Ej. Tomate perita orgánico" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Categoría *</label>
                      <select className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]">
                        <option value="">Seleccionar...</option>
                        <option>Verduras</option>
                        <option>Frutas</option>
                        <option>Granos</option>
                        <option>Tubérculos</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Unidad de medida *</label>
                      <select className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]">
                        <option value="">Seleccionar...</option>
                        <option>Quintal</option>
                        <option>Arroba</option>
                        <option>Kilo</option>
                        <option>Unidad</option>
                        <option>Caja</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Precio por unidad (Bs.) *</label>
                      <input type="number" placeholder="0.00" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Stock disponible *</label>
                      <input type="number" placeholder="Ej. 50" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Descripción del producto</label>
                    <textarea 
                      rows="3" 
                      maxLength="300"
                      onChange={(e) => setDescLength(e.target.value.length)}
                      placeholder="Detalles de calidad, variedad, lugar de cosecha..." 
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] resize-none"
                    ></textarea>
                    <div className="text-right text-xs text-[#6b7280] mt-1">{descLength}/300</div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col gap-3">
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" className="sr-only" checked={isPreventa} onChange={() => setIsPreventa(!isPreventa)} />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${isPreventa ? 'bg-[#1D9E75]' : 'bg-gray-300'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isPreventa ? 'transform translate-x-4' : ''}`}></div>
                      </div>
                      <div className="ml-3 font-semibold text-sm text-[#1a1a1a]">Es preventa</div>
                    </label>
                    {isPreventa && (
                      <div>
                        <label className="block text-xs font-semibold text-[#6b7280] mb-1">Fecha de disponibilidad estimada</label>
                        <input type="date" className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]" />
                      </div>
                    )}
                  </div>
                </div>

                {/* COLUMNA DERECHA: Fotos y Ubicación */}
                <div className="space-y-5 flex flex-col">
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Fotografías del producto</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center p-8 hover:bg-gray-100 hover:border-[#1D9E75] transition-colors cursor-pointer group">
                      <ImagePlus className="w-10 h-10 text-gray-400 group-hover:text-[#1D9E75] mb-3 transition-colors" />
                      <p className="text-sm font-semibold text-[#1a1a1a] text-center">Arrastra tus fotos aquí o haz clic para seleccionar</p>
                      <p className="text-xs text-[#6b7280] mt-1 text-center">JPG, PNG. Máximo 5 fotos de 5MB cada una</p>
                    </div>
                  </div>

                  <div className="mt-auto bg-[#E1F5EE] border border-[#1D9E75]/30 rounded-xl p-4 flex gap-3">
                    <MapPin className="w-6 h-6 text-[#1D9E75] shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-[#1D9E75]">Geolocalización automática</h4>
                      <p className="text-xs text-[#1D9E75]/80 mt-0.5 leading-relaxed">Tus productos mostrarán la ubicación de tu finca registrada automáticamente para que los compradores puedan calcular distancias y rutas de envío.</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-white border border-gray-200 text-[#1a1a1a] rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
                Cancelar
              </button>
              <button className="px-5 py-2.5 bg-[#1D9E75] text-white rounded-lg text-sm font-semibold hover:bg-[#0F6E56] transition-colors shadow-sm">
                Publicar producto
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MisCosechasPage;
