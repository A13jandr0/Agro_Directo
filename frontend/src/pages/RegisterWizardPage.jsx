import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Eye, EyeOff, ChevronRight, ChevronLeft, CheckCircle2,
  Loader2, AlertCircle, Leaf, ShoppingCart, Truck, ShieldCheck,
  Check
} from 'lucide-react';

const API = 'http://localhost:5000/api';

// ── Paso 1: Selección de Rol ──────────────────────────
const Step1Role = ({ formData, setFormData }) => {
  const roles = [
    {
      id: 'PRODUCTOR', Icon: Leaf, title: 'Soy Productor',
      desc: 'Vendo mis cosechas directamente',
      color: '#1D9E75', bgSelected: 'bg-emerald-50 border-emerald-500',
      iconBg: 'bg-emerald-100 text-emerald-600',
      benefits: ['Publica tus productos', 'Recibe pagos directos', 'Gestiona tu inventario']
    },
    {
      id: 'COMPRADOR', Icon: ShoppingCart, title: 'Soy Comprador',
      desc: 'Compro productos del campo',
      color: '#378ADD', bgSelected: 'bg-blue-50 border-blue-500',
      iconBg: 'bg-blue-100 text-blue-600',
      benefits: ['Precios sin intermediarios', 'Productos frescos', 'Seguimiento de pedidos']
    },
    {
      id: 'TRANSPORTISTA', Icon: Truck, title: 'Soy Transportista',
      desc: 'Transporto del campo a la ciudad',
      color: '#BA7517', bgSelected: 'bg-amber-50 border-amber-500',
      iconBg: 'bg-amber-100 text-amber-600',
      benefits: ['Rutas disponibles', 'Gestiona entregas', 'Ingresos por flete']
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-black text-slate-900 mb-2 text-center tracking-tight">
        ¿Cómo usarás AgroDirecto?
      </h2>
      <p className="text-gray-500 text-sm text-center mb-8">Selecciona tu rol para personalizar tu experiencia</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
        {roles.map(r => {
          const sel = formData.rol === r.id;
          const RoleIcon = r.Icon;
          return (
            <div
              key={r.id}
              onClick={() => setFormData(p => ({ ...p, rol: r.id }))}
              className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                sel ? `${r.bgSelected} shadow-md` : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {sel && <CheckCircle2 className="absolute top-3 right-3 w-5 h-5" style={{ color: r.color }} />}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${r.iconBg}`}>
                <RoleIcon className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1 text-center">{r.title}</h3>
              <p className="text-gray-500 text-xs text-center mb-4">{r.desc}</p>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Beneficios</p>
                <ul className="space-y-1.5">
                  {r.benefits.map((b, i) => (
                    <li key={i} className="flex items-center text-xs text-gray-600">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" style={{ color: r.color }} />{b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Paso 2: Datos Comunes ─────────────────────────────
const Step2Common = ({ formData, setFormData, errors }) => {
  const [showPass, setShowPass] = useState(false);
  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-black text-slate-900 mb-6 text-center tracking-tight">Información Personal</h2>
      <div className="space-y-4">
        <Field label="Nombre completo" error={errors.nombre_completo}>
          <input type="text" value={formData.nombre_completo} onChange={e => set('nombre_completo', e.target.value)}
            className="input-field" placeholder="Ej: Juan Pérez Mamani" />
        </Field>
        <Field label="Correo electrónico" error={errors.correo}>
          <input type="email" value={formData.correo} onChange={e => set('correo', e.target.value)}
            className="input-field" placeholder="correo@ejemplo.com" />
        </Field>
        <Field label="Contraseña" hint="Mín. 8 caracteres, 1 mayúscula, 1 número" error={errors.contrasena}>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} value={formData.contrasena} onChange={e => set('contrasena', e.target.value)}
              className="input-field pr-10" placeholder="Tu contraseña segura" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </Field>
        <Field label="Celular (con código de país)" error={errors.celular}>
          <input type="tel" value={formData.celular} onChange={e => set('celular', e.target.value)}
            className="input-field" placeholder="+591 77711122" />
        </Field>
        <div className="space-y-2 pt-2">
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.acepto_terminos} onChange={e => set('acepto_terminos', e.target.checked)}
              className="mt-1 w-4 h-4 accent-emerald-600" />
            <span className="text-sm text-gray-600">Acepto los <span className="text-emerald-600 font-medium underline">Términos de Uso</span></span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.acepto_privacidad} onChange={e => set('acepto_privacidad', e.target.checked)}
              className="mt-1 w-4 h-4 accent-emerald-600" />
            <span className="text-sm text-gray-600">Acepto la <span className="text-emerald-600 font-medium underline">Política de Privacidad</span></span>
          </label>
          {errors.acepto && <p className="text-red-500 text-xs">{errors.acepto}</p>}
        </div>
      </div>
    </div>
  );
};

// ── Paso 3: Campos Dinámicos por Rol ──────────────────
const Step3Profile = ({ formData, setFormData, errors }) => {
  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));
  const { rol } = formData;

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-black text-slate-900 mb-2 text-center tracking-tight">
        Datos de {rol === 'PRODUCTOR' ? 'Productor' : rol === 'COMPRADOR' ? 'Comprador' : rol === 'TRANSPORTISTA' ? 'Transportista' : 'Administrador'}
      </h2>
      <p className="text-gray-500 text-sm text-center mb-6">Completa tu perfil según tu rol</p>
      <div className="space-y-4">
        {rol === 'PRODUCTOR' && (<>
          <Field label="Tipo de productor" error={errors.tipo_productor}>
            <select value={formData.tipo_productor || ''} onChange={e => set('tipo_productor', e.target.value)} className="input-field">
              <option value="">Seleccionar...</option>
              <option>Individual</option><option>Asociación</option><option>Cooperativa</option>
            </select>
          </Field>
          <Field label="Nombre de la finca" error={errors.nombre_finca}>
            <input type="text" value={formData.nombre_finca || ''} onChange={e => set('nombre_finca', e.target.value)} className="input-field" placeholder="Ej: Finca El Sol" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Municipio" error={errors.municipio}>
              <input type="text" value={formData.municipio || ''} onChange={e => set('municipio', e.target.value)} className="input-field" placeholder="Montero" />
            </Field>
            <Field label="Provincia" error={errors.provincia}>
              <input type="text" value={formData.provincia || ''} onChange={e => set('provincia', e.target.value)} className="input-field" placeholder="Obispo Santistevan" />
            </Field>
          </div>
          <Field label="Años de experiencia" error={errors.anios_experiencia}>
            <input type="number" min="0" value={formData.anios_experiencia ?? ''} onChange={e => set('anios_experiencia', parseInt(e.target.value) || 0)} className="input-field" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo de documento" error={errors.tipo_documento}>
              <select value={formData.tipo_documento || ''} onChange={e => set('tipo_documento', e.target.value)} className="input-field">
                <option value="">Seleccionar...</option>
                <option>CI</option><option>Registro</option><option>Certificado</option>
              </select>
            </Field>
            <Field label="Número de documento" error={errors.numero_documento}>
              <input type="text" value={formData.numero_documento || ''} onChange={e => set('numero_documento', e.target.value)} className="input-field" />
            </Field>
          </div>
        </>)}

        {rol === 'COMPRADOR' && (<>
          <Field label="Tipo de comprador" error={errors.tipo_comprador}>
            <select value={formData.tipo_comprador || ''} onChange={e => set('tipo_comprador', e.target.value)} className="input-field">
              <option value="">Seleccionar...</option>
              <option>Persona natural</option><option>Negocio</option><option>Empresa</option>
            </select>
          </Field>
          {(formData.tipo_comprador === 'Negocio' || formData.tipo_comprador === 'Empresa') && (
            <Field label="Nombre del negocio/empresa">
              <input type="text" value={formData.nombre_negocio || ''} onChange={e => set('nombre_negocio', e.target.value)} className="input-field" />
            </Field>
          )}
          <Field label="Ciudad principal" error={errors.ciudad_principal}>
            <input type="text" value={formData.ciudad_principal || ''} onChange={e => set('ciudad_principal', e.target.value)} className="input-field" placeholder="Santa Cruz de la Sierra" />
          </Field>
        </>)}

        {rol === 'TRANSPORTISTA' && (<>
          <Field label="Tipo de transporte" error={errors.tipo_transporte}>
            <select value={formData.tipo_transporte || ''} onChange={e => set('tipo_transporte', e.target.value)} className="input-field">
              <option value="">Seleccionar...</option>
              <option>Camión</option><option>Camioneta</option><option>Moto</option><option>Otro</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Placa del vehículo" error={errors.placa_vehiculo}>
              <input type="text" value={formData.placa_vehiculo || ''} onChange={e => set('placa_vehiculo', e.target.value)} className="input-field" placeholder="1234-ABC" />
            </Field>
            <Field label="Capacidad de carga (kg)" error={errors.capacidad_carga_kg}>
              <input type="number" min="1" value={formData.capacidad_carga_kg ?? ''} onChange={e => set('capacidad_carga_kg', parseFloat(e.target.value) || 0)} className="input-field" />
            </Field>
          </div>
          <Field label="Zona de operación" error={errors.zona_operacion}>
            <select value={formData.zona_operacion || ''} onChange={e => set('zona_operacion', e.target.value)} className="input-field">
              <option value="">Seleccionar...</option>
              <option>Local</option><option>Regional</option><option>Departamental</option>
            </select>
          </Field>
          <Field label="Número de licencia" error={errors.numero_licencia}>
            <input type="text" value={formData.numero_licencia || ''} onChange={e => set('numero_licencia', e.target.value)} className="input-field" />
          </Field>
          <Field label="Tipo de documento a subir" error={errors.tipo_documento_subido}>
            <select value={formData.tipo_documento_subido || ''} onChange={e => set('tipo_documento_subido', e.target.value)} className="input-field">
              <option value="">Seleccionar...</option>
              <option>Licencia</option><option>SOAT</option><option>Registro</option>
            </select>
          </Field>
        </>)}

        {rol === 'ADMINISTRADOR' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No se requieren más datos</h3>
            <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">El perfil de administrador no necesita información adicional. Puedes finalizar tu registro.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Componente de campo reutilizable ──────────────────
const Field = ({ label, hint, error, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label}
      {hint && <span className="text-xs text-gray-400 font-normal ml-1">({hint})</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
  </div>
);

// ── Wizard Principal ──────────────────────────────────
const RegisterWizardPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    rol: '', nombre_completo: '', correo: '', contrasena: '', celular: '',
    acepto_terminos: false, acepto_privacidad: false,
  });

  const stepLabels = ['Elige tu Rol', 'Datos Personales', 'Perfil Específico'];
  const rolColor = formData.rol === 'PRODUCTOR' ? '#1D9E75' : formData.rol === 'COMPRADOR' ? '#378ADD' : formData.rol === 'TRANSPORTISTA' ? '#BA7517' : formData.rol === 'ADMINISTRADOR' ? '#4B5563' : '#1D9E75';

  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!formData.rol) { setApiError('Selecciona un rol para continuar'); return false; }
    }
    if (step === 2) {
      if (!formData.nombre_completo || formData.nombre_completo.length < 3) e.nombre_completo = 'Nombre requerido (mín. 3 caracteres)';
      if (!formData.correo || !/\S+@\S+\.\S+/.test(formData.correo)) e.correo = 'Correo inválido';
      if (!formData.contrasena || formData.contrasena.length < 8) e.contrasena = 'Mín. 8 caracteres';
      else if (!/[A-Z]/.test(formData.contrasena)) e.contrasena = 'Debe tener al menos 1 mayúscula';
      else if (!/[0-9]/.test(formData.contrasena)) e.contrasena = 'Debe tener al menos 1 número';
      if (!formData.celular || formData.celular.length < 7) e.celular = 'Celular requerido';
      if (!formData.acepto_terminos || !formData.acepto_privacidad) e.acepto = 'Debe aceptar términos y privacidad';
    }
    if (step === 3) {
      if (formData.rol === 'PRODUCTOR') {
        if (!formData.tipo_productor) e.tipo_productor = 'Requerido';
        if (!formData.nombre_finca) e.nombre_finca = 'Requerido';
        if (!formData.municipio) e.municipio = 'Requerido';
        if (!formData.provincia) e.provincia = 'Requerido';
        if (formData.anios_experiencia === undefined || formData.anios_experiencia === '') e.anios_experiencia = 'Requerido';
        if (!formData.tipo_documento) e.tipo_documento = 'Requerido';
        if (!formData.numero_documento) e.numero_documento = 'Requerido';
      }
      if (formData.rol === 'COMPRADOR') {
        if (!formData.tipo_comprador) e.tipo_comprador = 'Requerido';
        if (!formData.ciudad_principal) e.ciudad_principal = 'Requerido';
      }
      if (formData.rol === 'TRANSPORTISTA') {
        if (!formData.tipo_transporte) e.tipo_transporte = 'Requerido';
        if (!formData.placa_vehiculo) e.placa_vehiculo = 'Requerido';
        if (!formData.capacidad_carga_kg || formData.capacidad_carga_kg <= 0) e.capacidad_carga_kg = 'Debe ser mayor a 0';
        if (!formData.zona_operacion) e.zona_operacion = 'Requerido';
        if (!formData.numero_licencia) e.numero_licencia = 'Requerido';
        if (!formData.tipo_documento_subido) e.tipo_documento_subido = 'Requerido';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { setApiError(''); if (validateStep()) setStep(s => Math.min(s + 1, 3)); };
  const prev = () => { setApiError(''); setErrors({}); setStep(s => Math.max(s - 1, 1)); };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setApiError('');
    try {
      const res = await axios.post(`${API}/auth/registro`, formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.usuario));
      const rol = res.data.usuario.rol;
      navigate(rol === 'PRODUCTOR' ? '/dashboard/productor' : rol === 'COMPRADOR' ? '/dashboard/comprador' : rol === 'TRANSPORTISTA' ? '/dashboard/transportista' : '/admin/verificaciones');
    } catch (err) {
      const data = err.response?.data;
      if (data?.detalles) {
        const fieldErrors = {};
        data.detalles.forEach(d => { fieldErrors[d.campo] = d.mensaje; });
        setErrors(fieldErrors);
      }
      setApiError(data?.error || 'Error al registrar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] relative flex flex-col items-center justify-center py-8 px-4 font-sans">
      {/* Background effects */}
      <div className="absolute inset-0 dot-pattern opacity-30" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-[120px] -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-100/20 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4" />

      <div className="relative z-10 w-full max-w-4xl animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black text-slate-900 tracking-tight block leading-tight">AgroDirecto</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Santa Cruz</span>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-8 gap-1">
          {stepLabels.map((label, i) => {
            const num = i + 1;
            const active = step === num;
            const done = step > num;
            return (
              <React.Fragment key={i}>
                {i > 0 && <div className={`h-0.5 w-16 mx-1 rounded-full transition-all duration-500 ${done ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black transition-all duration-500 ${
                      done ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : active ? 'text-white shadow-lg' : 'bg-slate-100 text-slate-400'
                    }`}
                    style={active ? { backgroundColor: rolColor, boxShadow: `0 8px 16px ${rolColor}33` } : {}}
                  >
                    {done ? <Check className="w-4 h-4" /> : num}
                  </div>
                  <span className={`text-sm font-bold hidden sm:inline transition-colors duration-300 ${active ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/[0.04] border border-slate-200/60 p-6 md:p-10">
          {apiError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl flex items-center gap-3 text-sm font-medium animate-scale-bounce">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              {apiError}
            </div>
          )}

          <div className="animate-fade-in">
            {step === 1 && <Step1Role formData={formData} setFormData={setFormData} />}
            {step === 2 && <Step2Common formData={formData} setFormData={setFormData} errors={errors} />}
            {step === 3 && <Step3Profile formData={formData} setFormData={setFormData} errors={errors} />}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
            {step > 1 ? (
              <button onClick={prev} className="flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 group">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />Anterior
              </button>
            ) : <div />}

            {step < 3 ? (
              <button onClick={next} className="flex items-center gap-2 px-7 py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-all duration-500 hover:-translate-y-0.5 hover:shadow-xl group"
                style={{ backgroundColor: rolColor, boxShadow: `0 8px 24px ${rolColor}33` }}>
                Siguiente<ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="flex items-center gap-2 px-7 py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-all duration-500 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:hover:translate-y-0"
                style={{ backgroundColor: rolColor, boxShadow: `0 8px 24px ${rolColor}33` }}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Registrando...</> : <><CheckCircle2 className="w-4 h-4" />Crear Cuenta</>}
              </button>
            )}
          </div>
        </div>

        <p className="text-center mt-8 text-slate-500 text-sm font-medium animate-fade-in" style={{ animationDelay: '0.3s' }}>
          ¿Ya tienes cuenta? <a href="/login" className="font-black hover:underline transition-colors" style={{ color: rolColor }}>Inicia sesión</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterWizardPage;
