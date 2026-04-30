import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, ChevronRight, ChevronLeft, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const API = 'http://localhost:5000/api';

// ── Paso 1: Selección de Rol ──────────────────────────
const Step1Role = ({ formData, setFormData }) => {
  const roles = [
    { id: 'PRODUCTOR', icon: '🌱', title: 'Soy Productor', desc: 'Vendo mis cosechas directamente', color: '#1D9E75', bg: 'bg-emerald-50 border-emerald-500', benefits: ['Publica tus productos', 'Recibe pagos directos', 'Gestiona tu inventario'] },
    { id: 'COMPRADOR', icon: '🛒', title: 'Soy Comprador', desc: 'Compro productos del campo', color: '#378ADD', bg: 'bg-blue-50 border-blue-500', benefits: ['Precios sin intermediarios', 'Productos frescos', 'Seguimiento de pedidos'] },
    { id: 'TRANSPORTISTA', icon: '🚚', title: 'Soy Transportista', desc: 'Transporto del campo a la ciudad', color: '#BA7517', bg: 'bg-amber-50 border-amber-500', benefits: ['Rutas disponibles', 'Gestiona entregas', 'Ingresos por flete'] },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">¿Cómo usarás AgroDirecto?</h2>
      <p className="text-gray-500 text-center mb-8">Selecciona tu rol para personalizar tu experiencia</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map(r => {
          const sel = formData.rol === r.id;
          return (
            <div key={r.id} onClick={() => setFormData(p => ({ ...p, rol: r.id }))}
              className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${sel ? `${r.bg} shadow-lg border-2` : 'border-gray-200 bg-white'}`}>
              {sel && <CheckCircle2 className="absolute top-3 right-3 w-6 h-6" style={{ color: r.color }} />}
              <div className="text-5xl mb-4 text-center">{r.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{r.title}</h3>
              <p className="text-gray-500 text-sm text-center mb-4">{r.desc}</p>
              <div className="border-t pt-4">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Beneficios</p>
                <ul className="space-y-1.5">
                  {r.benefits.map((b, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: r.color }} />{b}
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Información Personal</h2>
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
              className="input-field pr-10" placeholder="••••••••" />
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
      <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
        Datos de {rol === 'PRODUCTOR' ? 'Productor' : rol === 'COMPRADOR' ? 'Comprador' : 'Transportista'}
      </h2>
      <p className="text-gray-500 text-center mb-6">Completa tu perfil según tu rol</p>
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
      </div>
    </div>
  );
};

// ── Componente de campo reutilizable ──────────────────
const Field = ({ label, hint, error, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">
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
  const rolColor = formData.rol === 'PRODUCTOR' ? '#1D9E75' : formData.rol === 'COMPRADOR' ? '#378ADD' : formData.rol === 'TRANSPORTISTA' ? '#BA7517' : '#1D9E75';

  // Validaciones locales por paso
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
      navigate(rol === 'PRODUCTOR' ? '/mapa' : rol === 'COMPRADOR' ? '/dashboard/comprador' : '/dashboard/transportista');
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
    <div className="min-h-screen bg-white relative flex flex-col items-center justify-center py-8 px-4"
      style={{ backgroundImage: 'radial-gradient(#1D9E75 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}>
      <div className="absolute inset-0 bg-white/90 z-0" />
      <div className="relative z-10 w-full max-w-4xl">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-3xl">🌱</span>
            <span className="text-2xl font-black text-gray-800 tracking-wider uppercase">AgroDirecto</span>
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
                {i > 0 && <div className={`h-0.5 w-12 mx-1 transition-colors ${done ? 'bg-emerald-500' : 'bg-gray-300'}`} />}
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${done ? 'bg-emerald-500 text-white' : active ? 'text-white' : 'bg-gray-200 text-gray-500'}`}
                    style={active ? { backgroundColor: rolColor } : {}}>
                    {done ? '✓' : num}
                  </div>
                  <span className={`text-sm font-medium hidden sm:inline ${active ? 'text-gray-800' : 'text-gray-400'}`}>{label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-10">
          {apiError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />{apiError}
            </div>
          )}

          {step === 1 && <Step1Role formData={formData} setFormData={setFormData} />}
          {step === 2 && <Step2Common formData={formData} setFormData={setFormData} errors={errors} />}
          {step === 3 && <Step3Profile formData={formData} setFormData={setFormData} errors={errors} />}

          {/* Navegación */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button onClick={prev} className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition">
                <ChevronLeft className="w-5 h-5" />Anterior
              </button>
            ) : <div />}

            {step < 3 ? (
              <button onClick={next} className="flex items-center gap-2 px-8 py-3 rounded-xl text-white font-bold shadow-lg hover:opacity-90 transition"
                style={{ backgroundColor: rolColor }}>
                Siguiente<ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="flex items-center gap-2 px-8 py-3 rounded-xl text-white font-bold shadow-lg hover:opacity-90 transition disabled:opacity-50"
                style={{ backgroundColor: rolColor }}>
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Registrando...</> : <><CheckCircle2 className="w-5 h-5" />Crear Cuenta</>}
              </button>
            )}
          </div>
        </div>

        {/* Link Login */}
        <p className="text-center mt-6 text-gray-500 text-sm">
          ¿Ya tienes cuenta? <a href="/login" className="font-bold underline" style={{ color: rolColor }}>Inicia sesión</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterWizardPage;
