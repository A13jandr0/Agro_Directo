import React, { useState } from 'react';
import { Settings, Save, ShieldAlert, Database, HelpCircle, Activity } from 'lucide-react';
import PageShell from '../components/ui/PageShell';
import { useToast } from '../context/ToastContext';

const AdminConfiguracionPage = () => {
  const toast = useToast();
  const [comision, setComision] = useState(5.0); // % de comisión del marketplace
  const [radioKm, setRadioKm] = useState(50); // Radio de búsqueda km
  const [requiereRAU, setRequiereRAU] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Configuraciones del sistema actualizadas correctamente');
    }, 1000);
  };

  return (
    <PageShell>
      <div>
        <span className="inline-flex bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-bold">
          ⚙️ Parámetros Globales
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Configuración del Sistema</h1>
        <p className="text-sm text-slate-400 mt-1">Configurá las comisiones, políticas de verificación y comportamiento de la app</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Form settings */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-500" /> Parámetros Operativos
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Comisión de Venta (%)</label>
                <input
                  type="number"
                  value={comision}
                  onChange={e => setComision(parseFloat(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Radio Geográfico Máximo (km)</label>
                <input
                  type="number"
                  value={radioKm}
                  onChange={e => setRadioKm(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Políticas de Registro</h4>
              
              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-800">Verificación obligatoria de RAU</span>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Exigir Registro Ambiental Único a productores para poder publicar cosechas</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRequiereRAU(!requiereRAU)}
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
                    requiereRAU ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow-md ${requiereRAU ? 'translate-x-4' : ''}`} />
                </button>
              </label>
            </div>
          </div>
        </div>

        {/* Audit logs panel */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" /> Registro de Actividad
            </h3>
            
            <div className="space-y-4 text-xs font-semibold">
              <div className="border-l-2 border-slate-200 pl-3 py-1">
                <span className="text-[10px] text-slate-400 font-bold block">Hoy, 10:45 AM</span>
                <p className="text-slate-700">Se aprobó al productor "Finca El Sol"</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-3 py-1">
                <span className="text-[10px] text-slate-400 font-bold block">Ayer, 03:20 PM</span>
                <p className="text-slate-700">Configuración global modificada por Admin</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-3 py-1">
                <span className="text-[10px] text-slate-400 font-bold block">08 Jun, 09:12 AM</span>
                <p className="text-slate-700">Backup de base de datos completado con éxito</p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>

      </div>
    </PageShell>
  );
};

export default AdminConfiguracionPage;
