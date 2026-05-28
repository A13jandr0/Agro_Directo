import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, CreditCard, ShieldCheck, Save, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PerfilTransportistaPage = () => {
    const [formData, setFormData] = useState({
        tipo_transporte: '',
        capacidad_carga_kg: '',
        zona_operacion: '',
        numero_licencia: '',
        placa_vehiculo: ''
    });
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const user = JSON.parse(localStorage.getItem('user'));
                setUserData(user);

                const res = await axios.get('http://localhost:5000/api/usuarios/mi-perfil', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFormData(res.data);
            } catch (error) {
                console.error("Error al cargar perfil:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/transportista/perfil', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Perfil actualizado correctamente");
        } catch (error) {
            console.error("Error al actualizar perfil:", error);
            toast.error("Error al guardar los cambios.");
        }
    };

    if (loading) return <div className="p-10 text-center text-emerald-600 font-bold">Cargando tu perfil...</div>;

    if (userData?.estado !== 'VERIFICADO') {
        return (
            <div className="p-20 text-center">
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-10 max-w-2xl mx-auto">
                    <AlertCircle className="mx-auto text-amber-500 w-16 h-16 mb-4" />
                    <h2 className="text-2xl font-black text-amber-900 mb-2">Cuenta no Verificada</h2>
                    <p className="text-amber-700 font-medium">Debes subir tus documentos y ser aprobado para editar tu información operativa.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <Truck className="text-emerald-600" /> Mi Perfil de Transportista
                </h1>
                <p className="text-slate-500 font-medium">Mantén actualizada la información de tu vehículo para calificar a mejores rutas.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* SECCIÓN VEHÍCULO */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <CreditCard className="w-4 h-4" /> Datos del Vehículo
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Tipo de Transporte</label>
                                <select 
                                    name="tipo_transporte" 
                                    value={formData.tipo_transporte} 
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="Camión">Camión</option>
                                    <option value="Camioneta">Camioneta</option>
                                    <option value="Moto">Moto</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Placa del Vehículo</label>
                                <input 
                                    type="text" 
                                    name="placa_vehiculo" 
                                    value={formData.placa_vehiculo} 
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Capacidad Carga (kg)</label>
                                <input 
                                    type="number" 
                                    name="capacidad_carga_kg" 
                                    value={formData.capacidad_carga_kg} 
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN OPERATIVA */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> Operación y Legal
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Número de Licencia</label>
                                <input 
                                    type="text" 
                                    name="numero_licencia" 
                                    value={formData.numero_licencia} 
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Zona de Operación</label>
                                <select 
                                    name="zona_operacion" 
                                    value={formData.zona_operacion} 
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="Local">Local</option>
                                    <option value="Regional">Regional</option>
                                    <option value="Departamental">Departamental</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 mt-6 flex items-start gap-4">
                            <AlertCircle className="text-emerald-600 mt-1 shrink-0" size={20} />
                            <p className="text-xs text-emerald-800 font-medium">
                                Asegúrese de que sus documentos (Licencia y SOAT) coincidan con esta información. Un perfil verificado tiene prioridad en la bolsa de carga.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button 
                        type="submit"
                        className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                        <Save size={18} /> Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PerfilTransportistaPage;
