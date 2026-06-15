import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Leaf, ShoppingCart, Truck, Check, ChevronLeft, ChevronRight,
  Upload, FileText, CheckCircle, Clock, AlertCircle, Eye, EyeOff, X } from
'lucide-react';
import { useToast } from '../context/ToastContext';

// Municipios / Ciudades de Bolivia
const BOLIVIAN_CITIES = [
'Santa Cruz de la Sierra',
'La Paz',
'Cochabamba',
'Oruro',
'Potosí',
'Tarija',
'Sucre',
'Trinidad',
'Cobija',
'Montero',
'Warnes',
'El Alto'];


// Provincias de Santa Cruz
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
'Ángel Sandoval'];


const RegisterWizardPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Modales finales de éxito
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    rol: '',
    // Datos Comunes
    nombre_completo: '',
    correo: '',
    contrasena: '',
    confirmar_contrasena: '',
    celular: '',
    ciudad: '',
    acepto_terminos: false,

    // Productor
    nombre_finca: '',
    tipo_produccion: '',
    hectareas: '',
    provincia: '',
    foto_perfil: null,

    // Comprador
    tipo_comprador: '',
    nombre_negocio: '',
    nit: '',

    // Transportista
    placa_vehiculo: '',
    tipo_transporte: '',
    capacidad_carga_kg: '',
    zonas_operacion: [], // Provincias seleccionadas

    // Archivos del Paso 3
    doc_ci: null,
    doc_adicional: null // RAU para Productor, Licencia+SOAT para Transportista
  });

  // Previews de imágenes
  const [previews, setPreviews] = useState({
    foto_perfil: null,
    doc_ci: null,
    doc_adicional: null
  });

  // Validation Errors
  const [errors, setErrors] = useState({});

  const validateField = (field, value) => {
    let err = '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{7,15}$/;

    switch (field) {
      case 'nombre_completo':
        if (!value.trim()) err = 'El nombre completo es requerido';else
        if (value.trim().length < 3) err = 'El nombre debe tener al menos 3 caracteres';
        break;
      case 'correo':
        if (!value.trim()) err = 'El correo electrónico es requerido';else
        if (!emailRegex.test(value)) err = 'Ingresá un correo electrónico válido';
        break;
      case 'contrasena':
        if (!value) err = 'La contraseña es requerida';else
        if (value.length < 8) err = 'Debe tener al menos 8 caracteres';else
        if (!/[A-Z]/.test(value)) err = 'Debe contener al menos una mayúscula';else
        if (!/[0-9]/.test(value)) err = 'Debe contener al menos un número';
        break;
      case 'confirmar_contrasena':
        if (value !== formData.contrasena) err = 'Las contraseñas no coinciden';
        break;
      case 'celular':
        if (!value.trim()) err = 'El teléfono celular es requerido';else
        if (!phoneRegex.test(value.replace(/\s+/g, ''))) err = 'Ingresá un número de celular válido';
        break;
      case 'ciudad':
        if (!value) err = 'Selecciona tu ciudad/municipio';
        break;
      // Productor
      case 'nombre_finca':
        if (formData.rol === 'PRODUCTOR' && !value.trim()) err = 'El nombre de la finca es requerido';
        break;
      case 'tipo_produccion':
        if (formData.rol === 'PRODUCTOR' && !value) err = 'Selecciona tu tipo de producción';
        break;
      case 'hectareas':
        if (formData.rol === 'PRODUCTOR' && (!value || Number(value) <= 0)) err = 'Ingresá una cantidad de hectáreas válida';
        break;
      case 'provincia':
        if (formData.rol === 'PRODUCTOR' && !value) err = 'Selecciona tu provincia';
        break;
      // Comprador
      case 'tipo_comprador':
        if (formData.rol === 'COMPRADOR' && !value) err = 'Selecciona el tipo de comprador';
        break;
      // Transportista
      case 'placa_vehiculo':
        if (formData.rol === 'TRANSPORTISTA' && !value.trim()) err = 'La placa del vehículo es requerida';
        break;
      case 'tipo_transporte':
        if (formData.rol === 'TRANSPORTISTA' && !value) err = 'Selecciona tu tipo de transporte';
        break;
      case 'capacidad_carga_kg':
        if (formData.rol === 'TRANSPORTISTA' && (!value || Number(value) <= 0)) err = 'Ingresá una capacidad de carga válida';
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: err }));
    return err === '';
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  // Drag and Drop & File Upload handlers
  const handleFileUpload = (field, file) => {
    if (!file) return;

    // Validar tipo de archivo (imagen o pdf)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Solo se permiten imágenes (JPG, PNG, WEBP) o documentos PDF');
      return;
    }

    // Limit size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El tamaño máximo permitido es 5MB');
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: file }));

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviews((prev) => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setPreviews((prev) => ({ ...prev, [field]: 'pdf' })); // Indicador de PDF
    }
  };

  const removeFile = (field) => {
    setFormData((prev) => ({ ...prev, [field]: null }));
    setPreviews((prev) => ({ ...prev, [field]: null }));
  };

  const handleZoneToggle = (prov) => {
    const zones = formData.zonas_operacion.includes(prov) ?
    formData.zonas_operacion.filter((z) => z !== prov) :
    [...formData.zonas_operacion, prov];

    setFormData((prev) => ({ ...prev, zonas_operacion: zones }));

    if (zones.length === 0) {
      setErrors((prev) => ({ ...prev, zonas_operacion: 'Debes seleccionar al menos una provincia de operación' }));
    } else {
      setErrors((prev) => ({ ...prev, zonas_operacion: '' }));
    }
  };

  // Stepper Visual Actions
  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.rol) {
        toast.warning('Por favor, selecciona tu rol para continuar');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validar paso 2
      const commonFields = ['nombre_completo', 'correo', 'contrasena', 'confirmar_contrasena', 'celular', 'ciudad'];
      let isStepValid = true;

      commonFields.forEach((f) => {
        if (!validateField(f, formData[f])) isStepValid = false;
      });

      if (formData.rol === 'PRODUCTOR') {
        ['nombre_finca', 'tipo_production', 'hectareas', 'provincia'].forEach((f) => {
          if (f === 'tipo_production') {
            if (!validateField('tipo_produccion', formData.tipo_produccion)) isStepValid = false;
          } else {
            if (!validateField(f, formData[f])) isStepValid = false;
          }
        });
      } else if (formData.rol === 'COMPRADOR') {
        if (!validateField('tipo_comprador', formData.tipo_comprador)) isStepValid = false;
      } else if (formData.rol === 'TRANSPORTISTA') {
        ['placa_vehiculo', 'tipo_transporte', 'capacidad_carga_kg'].forEach((f) => {
          if (!validateField(f, formData[f])) isStepValid = false;
        });
        if (formData.zonas_operacion.length === 0) {
          isStepValid = false;
          setErrors((prev) => ({ ...prev, zonas_operacion: 'Debes seleccionar al menos una provincia de operación' }));
        }
      }

      if (!isStepValid) {
        toast.error('Corregí los errores del formulario antes de continuar');
        return;
      }

      // Si es comprador, el paso 3 es directo a confirmar e inmediatamente se activa
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleRegisterSubmit = async () => {
    if (formData.rol !== 'COMPRADOR') {
      // Validar documentos en paso 3 para Productor y Transportista
      if (!formData.doc_ci) {
        toast.error('El documento de identidad es requerido');
        return;
      }
      if (!formData.doc_adicional) {
        const docName = formData.rol === 'PRODUCTOR' ? 'Registro Agrario Único (RAU)' : 'Licencia de conducir + SOAT';
        toast.error(`El documento "${docName}" es requerido`);
        return;
      }
    }

    if (!formData.acepto_terminos) {
      toast.warning('Debes aceptar los Términos y Condiciones');
      return;
    }

    setLoading(true);
    try {
      // Registro del usuario (sin archivos)
      const payload = {
        nombre_completo: formData.nombre_completo,
        correo: formData.correo,
        contrasena: formData.contrasena,
        celular: formData.celular,
        rol: formData.rol,
        acepto_terminos: true,
        acepto_privacidad: true,
        // Productor
        tipo_productor: formData.tipo_productor || 'Individual',
        nombre_finca: formData.nombre_finca,
        municipio: formData.ciudad || formData.municipio || 'Santa Cruz',
        provincia: formData.provincia || 'Andrés Ibáñez',
        anios_experiencia: Number(formData.anios_experiencia) || 0,
        tipo_documento: 'CI',
        numero_documento: formData.numero_documento || '1234567',
        // Comprador
        tipo_comprador: formData.tipo_comprador,
        nombre_negocio: formData.nombre_negocio,
        nit: formData.nit,
        ciudad_principal: formData.ciudad,
        // Transportista
        tipo_transporte: formData.tipo_transporte,
        capacidad_carga_kg: Number(formData.capacidad_carga_kg) || 1000,
        zona_operacion: 'Regional',
        numero_licencia: formData.numero_licencia || '1234567',
        placa_vehiculo: formData.placa_vehiculo,
        tipo_documento_subido: 'Licencia'
      };

      const res = await axios.post('http://localhost:5000/api/auth/registro', payload);
      const { token, usuario } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));

      // Subir documentos después del registro exitoso (para PRODUCTOR y TRANSPORTISTA)
      if (formData.rol !== 'COMPRADOR' && (formData.doc_ci || formData.doc_adicional)) {
        const docsFormData = new FormData();
        if (formData.doc_ci) {
          docsFormData.append('documento_ci', formData.doc_ci);
        }
        if (formData.doc_adicional) {
          // Renombrar según el rol
          const fieldName = formData.rol === 'PRODUCTOR' ? 'documento_rau' : 'documento';
          docsFormData.append(fieldName, formData.doc_adicional);
        }

        try {
          await axios.post('http://localhost:5000/api/usuarios/documentos', docsFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`
            }
          });
          console.log("Documentos subidos correctamente durante el registro");
        } catch (docError) {
          console.warn('Advertencia: Los documentos no se subieron durante el registro. Puedes subirlos después.', docError);
          // No lanzar error aquí, permitir que continúe el flujo de registro
        }
      }

      toast.success('¡Registro procesado con éxito!');
      setShowSuccessModal(true);
    } catch (error) {
      const msg = error.response?.data?.error || 'Ocurrió un error al crear tu cuenta. Intenta de nuevo.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] relative flex flex-col items-center justify-center py-12 px-4 font-sans">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-radial-gradient-dots opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-emerald-100/40 rounded-full blur-3xl opacity-40 pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3.5 mb-2 hover:opacity-90 transition-opacity">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black text-slate-900 tracking-tight block leading-none">AgroDirecto</span>
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">Santa Cruz</span>
            </div>
          </Link>
        </div>

        {/* Stepper Visual (3 pasos) */}
        <div className="flex items-center justify-center max-w-md mx-auto mb-10">
          {[1, 2, 3].map((num) =>
          <React.Fragment key={num}>
              {num > 1 &&
            <div
              className={`h-1 flex-1 rounded-full transition-all duration-300 mx-2 ${
              step >= num ? 'bg-emerald-500' : 'bg-slate-200'}`
              } />

            }
              <div className="flex flex-col items-center">
                <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                step > num ?
                'bg-emerald-500 border-emerald-500 text-white shadow-md' :
                step === num ?
                'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/25 scale-110' :
                'bg-white border-slate-200 text-slate-400'}`
                }>
                
                  {step > num ? <Check className="w-5 h-5" /> : num}
                </div>
              </div>
            </React.Fragment>
          )}
        </div>

        {/* Wizard Panel */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/[0.03] border border-slate-100 p-6 sm:p-10">
          
          {/* PASO 1 — Selección de rol */}
          {step === 1 &&
          <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  ¿Cuál es tu rol en AgroDirecto?
                </h2>
                <p className="text-sm text-slate-400 mt-2">Seleccioná una opción para continuar</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tarjeta Productor */}
                <div
                onClick={() => handleInputChange('rol', 'PRODUCTOR')}
                className={`rounded-2xl border-2 p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                formData.rol === 'PRODUCTOR' ?
                'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/5' :
                'border-slate-200 bg-gradient-to-br from-emerald-50/10 to-teal-50/5 hover:border-emerald-200'}`
                }>
                
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">PRODUCTOR</h3>
                  <p className="text-xs text-slate-500 mt-2">
                    Vendé tu cosecha directamente, administrá tus inventarios y conectá con compradores.
                  </p>
                </div>

                {/* Tarjeta Comprador */}
                <div
                onClick={() => handleInputChange('rol', 'COMPRADOR')}
                className={`rounded-2xl border-2 p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                formData.rol === 'COMPRADOR' ?
                'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/5' :
                'border-slate-200 bg-gradient-to-br from-blue-50/10 to-indigo-50/5 hover:border-blue-200'}`
                }>
                
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">COMPRADOR</h3>
                  <p className="text-xs text-slate-500 mt-2">
                    Comprá directo del campo, obtené ofertas frescas y realizá el seguimiento de tus pedidos.
                  </p>
                </div>

                {/* Tarjeta Transportista */}
                <div
                onClick={() => handleInputChange('rol', 'TRANSPORTISTA')}
                className={`rounded-2xl border-2 p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                formData.rol === 'TRANSPORTISTA' ?
                'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/5' :
                'border-slate-200 bg-gradient-to-br from-amber-50/10 to-orange-50/5 hover:border-amber-200'}`
                }>
                
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
                    <Truck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">TRANSPORTISTA</h3>
                  <p className="text-xs text-slate-500 mt-2">
                    Ofrecé tu servicio de flete, localizá cargas disponibles y gestioná tus hojas de ruta.
                  </p>
                </div>
              </div>
            </div>
          }

          {/* PASO 2 — Datos Personales */}
          {step === 2 &&
          <div className="animate-fade-in space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Datos de tu Cuenta</h2>
                <p className="text-sm text-slate-400 mt-2">Completá la información del perfil</p>
              </div>

              {/* Grid Común */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Nombre completo</label>
                  <input
                  type="text"
                  value={formData.nombre_completo}
                  onChange={(e) => handleInputChange('nombre_completo', e.target.value)}
                  placeholder="Ej. Juan Pérez Mamani"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all ${
                  errors.nombre_completo ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'}`
                  } />
                
                  {errors.nombre_completo && <span className="text-rose-600 text-xs font-semibold mt-1 block">{errors.nombre_completo}</span>}
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Correo electrónico</label>
                  <input
                  type="email"
                  value={formData.correo}
                  onChange={(e) => handleInputChange('correo', e.target.value)}
                  placeholder="juan@correo.com"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all ${
                  errors.correo ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'}`
                  } />
                
                  {errors.correo && <span className="text-rose-600 text-xs font-semibold mt-1 block">{errors.correo}</span>}
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Contraseña</label>
                  <div className="relative">
                    <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.contrasena}
                    onChange={(e) => handleInputChange('contrasena', e.target.value)}
                    placeholder="Contraseña segura"
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 pr-10 transition-all ${
                    errors.contrasena ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'}`
                    } />
                  
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                    
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                  {errors.contrasena && <span className="text-rose-600 text-xs font-semibold mt-1 block">{errors.contrasena}</span>}
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Confirmar contraseña</label>
                  <div className="relative">
                    <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmar_contrasena}
                    onChange={(e) => handleInputChange('confirmar_contrasena', e.target.value)}
                    placeholder="Repetir contraseña"
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 pr-10 transition-all ${
                    errors.confirmar_contrasena ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'}`
                    } />
                  
                    <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                    
                      {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                  {errors.confirmar_contrasena && <span className="text-rose-600 text-xs font-semibold mt-1 block">{errors.confirmar_contrasena}</span>}
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Teléfono celular</label>
                  <input
                  type="tel"
                  value={formData.celular}
                  onChange={(e) => handleInputChange('celular', e.target.value)}
                  placeholder="Ej. +591 77711122"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all ${
                  errors.celular ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'}`
                  } />
                
                  {errors.celular && <span className="text-rose-600 text-xs font-semibold mt-1 block">{errors.celular}</span>}
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Ciudad (Bolivia)</label>
                  <select
                  value={formData.ciudad}
                  onChange={(e) => handleInputChange('ciudad', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all ${
                  errors.ciudad ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'}`
                  }>
                  
                    <option value="">Selecciona tu ciudad...</option>
                    {BOLIVIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.ciudad && <span className="text-rose-600 text-xs font-semibold mt-1 block">{errors.ciudad}</span>}
                </div>
              </div>

              {/* ROL PRODUCTOR ADICIONAL */}
              {formData.rol === 'PRODUCTOR' &&
            <div className="border-t border-slate-100 pt-6 space-y-5">
                  <h3 className="text-base font-bold text-slate-800">Detalles de la Finca</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Nombre de la Finca</label>
                      <input
                    type="text"
                    value={formData.nombre_finca}
                    onChange={(e) => handleInputChange('nombre_finca', e.target.value)}
                    placeholder="Ej. Hacienda El Sol"
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all ${
                    errors.nombre_finca ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'}`
                    } />
                  
                      {errors.nombre_finca && <span className="text-rose-600 text-xs font-semibold mt-1 block">{errors.nombre_finca}</span>}
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Provincia (Santa Cruz)</label>
                      <select
                    value={formData.provincia}
                    onChange={(e) => handleInputChange('provincia', e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all ${
                    errors.provincia ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'}`
                    }>
                    
                        <option value="">Selecciona provincia...</option>
                        {SANTA_CRUZ_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                      {errors.provincia && <span className="text-rose-600 text-xs font-semibold mt-1 block">{errors.provincia}</span>}
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Tipo de producción</label>
                      <select
                    value={formData.tipo_produccion}
                    onChange={(e) => handleInputChange('tipo_produccion', e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all ${
                    errors.tipo_produccion ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'}`
                    }>
                    
                        <option value="">Selecciona tipo...</option>
                        <option value="Frutas">Frutas</option>
                        <option value="Verduras">Verduras</option>
                        <option value="Granos">Granos</option>
                        <option value="Ganadería">Ganadería</option>
                        <option value="Mixto">Mixto</option>
                      </select>
                      {errors.tipo_produccion && <span className="text-rose-600 text-xs font-semibold mt-1 block">{errors.tipo_produccion}</span>}
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Hectáreas aproximadas</label>
                      <input
                    type="number"
                    min="1"
                    value={formData.hectareas}
                    onChange={(e) => handleInputChange('hectareas', e.target.value)}
                    placeholder="Ej. 15"
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all ${
                    errors.hectareas ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'}`
                    } />
                  
                      {errors.hectareas && <span className="text-rose-600 text-xs font-semibold mt-1 block">{errors.hectareas}</span>}
                    </div>

                    {/* Foto de perfil / Finca (Drag & Drop) */}
                    <div className="md:col-span-2">
                      <label className="block text-[13px] font-bold text-slate-700 mb-2">Foto de la Finca / Perfil</label>
                      <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleFileUpload('foto_perfil', e.dataTransfer.files[0]);
                      }}
                      className="flex-1 w-full border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 hover:bg-slate-50/80">
                      
                          <input
                        type="file"
                        id="foto_perfil"
                        accept="image/*"
                        onChange={(e) => handleFileUpload('foto_perfil', e.target.files[0])}
                        className="hidden" />
                      
                          <label htmlFor="foto_perfil" className="cursor-pointer text-center">
                            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <span className="text-sm font-bold text-emerald-600">Subir foto de perfil</span>
                            <span className="text-xs text-slate-400 block mt-1">Arrastrá y soltá una imagen aquí</span>
                          </label>
                        </div>
                        {previews.foto_perfil &&
                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-slate-200 shrink-0">
                            <img src={previews.foto_perfil} className="w-full h-full object-cover" alt="Preview" />
                            <button
                        type="button"
                        onClick={() => removeFile('foto_perfil')}
                        className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-black">
                        
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                    }
                      </div>
                    </div>
                  </div>
                </div>
            }

              {/* ROL COMPRADOR ADICIONAL */}
              {formData.rol === 'COMPRADOR' &&
            <div className="border-t border-slate-100 pt-6 space-y-5">
                  <h3 className="text-base font-bold text-slate-800">Detalles de Compras</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Tipo de comprador</label>
                      <select
                    value={formData.tipo_comprador}
                    onChange={(e) => handleInputChange('tipo_comprador', e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all ${
                    errors.tipo_comprador ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'}`
                    }>
                    
                        <option value="">Selecciona tipo...</option>
                        <option value="Persona natural">Persona natural</option>
                        <option value="Negocio">Negocio</option>
                        <option value="Empresa">Empresa</option>
                        <option value="Restaurante">Restaurante</option>
                        <option value="Supermercado">Supermercado</option>
                      </select>
                      {errors.tipo_comprador && <span className="text-rose-600 text-xs font-semibold mt-1 block">{errors.tipo_comprador}</span>}
                    </div>

                    {formData.tipo_comprador && formData.tipo_comprador !== 'Persona natural' &&
                <>
                        <div>
                          <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Nombre del Negocio (Opcional)</label>
                          <input
                      type="text"
                      value={formData.nombre_negocio}
                      onChange={(e) => handleInputChange('nombre_negocio', e.target.value)}
                      placeholder="Nombre comercial"
                      className="w-full px-4 py-3 bg-gray-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                    
                        </div>
                        <div>
                          <label className="block text-[13px] font-bold text-slate-700 mb-1.5">NIT (Opcional)</label>
                          <input
                      type="text"
                      value={formData.nit}
                      onChange={(e) => handleInputChange('nit', e.target.value)}
                      placeholder="Número de identificación tributaria"
                      className="w-full px-4 py-3 bg-gray-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                    
                        </div>
                      </>
                }
                  </div>
                </div>
            }

              {/* ROL TRANSPORTISTA ADICIONAL */}
              {formData.rol === 'TRANSPORTISTA' &&
            <div className="border-t border-slate-100 pt-6 space-y-5">
                  <h3 className="text-base font-bold text-slate-800">Detalles del Vehículo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Número de placa</label>
                      <input
                    type="text"
                    value={formData.placa_vehiculo}
                    onChange={(e) => handleInputChange('placa_vehiculo', e.target.value)}
                    placeholder="Ej. 3422-XYZ"
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all ${
                    errors.placa_vehiculo ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'}`
                    } />
                  
                      {errors.placa_vehiculo && <span className="text-rose-600 text-xs font-semibold mt-1 block">{errors.placa_vehiculo}</span>}
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Tipo de vehículo</label>
                      <select
                    value={formData.tipo_transporte}
                    onChange={(e) => handleInputChange('tipo_transporte', e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all ${
                    errors.tipo_transporte ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'}`
                    }>
                    
                        <option value="">Selecciona tipo...</option>
                        <option value="Camión">Camión</option>
                        <option value="Camioneta">Camioneta</option>
                        <option value="Motocarro">Motocarro</option>
                      </select>
                      {errors.tipo_transporte && <span className="text-rose-600 text-xs font-semibold mt-1 block">{errors.tipo_transporte}</span>}
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Capacidad de carga (Kg)</label>
                      <input
                    type="number"
                    min="1"
                    value={formData.capacidad_carga_kg}
                    onChange={(e) => handleInputChange('capacidad_carga_kg', e.target.value)}
                    placeholder="Ej. 2500"
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all ${
                    errors.capacidad_carga_kg ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'}`
                    } />
                  
                      {errors.capacidad_carga_kg && <span className="text-rose-600 text-xs font-semibold mt-1 block">{errors.capacidad_carga_kg}</span>}
                    </div>

                    {/* Zonas de operación checkboxes */}
                    <div className="md:col-span-2">
                      <label className="block text-[13px] font-bold text-slate-700 mb-2">Provincias de Operación (Santa Cruz)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 max-h-48 overflow-y-auto">
                        {SANTA_CRUZ_PROVINCES.map((prov) =>
                    <label key={prov} className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                        type="checkbox"
                        checked={formData.zonas_operacion.includes(prov)}
                        onChange={() => handleZoneToggle(prov)}
                        className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer" />
                      
                            <span className="text-xs font-semibold text-slate-700">{prov}</span>
                          </label>
                    )}
                      </div>
                      {errors.zonas_operacion && <span className="text-rose-600 text-xs font-semibold mt-1.5 block">{errors.zonas_operacion}</span>}
                    </div>
                  </div>
                </div>
            }
            </div>
          }

          {/* PASO 3 — Documentos & Finalización */}
          {step === 3 &&
          <div className="animate-fade-in space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Verificación de Cuenta</h2>
                <p className="text-sm text-slate-400 mt-2">Seguridad y confianza en nuestro marketplace</p>
              </div>

              {formData.rol !== 'COMPRADOR' ?
            <>
                  {/* Banner Informativo Azul */}
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl p-4 flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5 animate-float" />
                    <div>
                      <h4 className="text-sm font-extrabold leading-tight">Revisaremos tus documentos</h4>
                      <p className="text-xs text-blue-800/80 mt-1 font-medium">
                        Nuestro equipo administrativo verificará tus acreditaciones en un plazo estimado de 24–48 horas hábiles.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {/* CI Uploader */}
                    <div className="space-y-2">
                      <label className="block text-[13px] font-bold text-slate-700">Carnet de Identidad (Ambos lados)</label>
                      <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFileUpload('doc_ci', e.dataTransfer.files[0]);
                    }}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 hover:bg-slate-50/80">
                    
                        <input
                      type="file"
                      id="doc_ci"
                      onChange={(e) => handleFileUpload('doc_ci', e.target.files[0])}
                      className="hidden" />
                    
                        <label htmlFor="doc_ci" className="cursor-pointer text-center">
                          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <span className="text-xs font-bold text-emerald-600">Cargar CI</span>
                        </label>
                      </div>
                      {formData.doc_ci &&
                  <div className="flex items-center justify-between p-2.5 bg-slate-100 rounded-xl">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="w-4.5 h-4.5 text-slate-500 shrink-0" />
                            <span className="text-xs font-semibold text-slate-700 truncate">{formData.doc_ci.name}</span>
                          </div>
                          <button
                      type="button"
                      onClick={() => removeFile('doc_ci')}
                      className="text-rose-600 hover:bg-rose-50 p-1 rounded-lg transition-colors">
                      
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                  }
                    </div>

                    {/* RAU / Licencia Uploader */}
                    <div className="space-y-2">
                      <label className="block text-[13px] font-bold text-slate-700">
                        {formData.rol === 'PRODUCTOR' ? 'Registro Agrario Único (RAU)' : 'Licencia de conducir + SOAT'}
                      </label>
                      <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFileUpload('doc_adicional', e.dataTransfer.files[0]);
                    }}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 hover:bg-slate-50/80">
                    
                        <input
                      type="file"
                      id="doc_adicional"
                      onChange={(e) => handleFileUpload('doc_adicional', e.target.files[0])}
                      className="hidden" />
                    
                        <label htmlFor="doc_adicional" className="cursor-pointer text-center">
                          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <span className="text-xs font-bold text-emerald-600">Cargar Documento</span>
                        </label>
                      </div>
                      {formData.doc_adicional &&
                  <div className="flex items-center justify-between p-2.5 bg-slate-100 rounded-xl">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="w-4.5 h-4.5 text-slate-500 shrink-0" />
                            <span className="text-xs font-semibold text-slate-700 truncate">{formData.doc_adicional.name}</span>
                          </div>
                          <button
                      type="button"
                      onClick={() => removeFile('doc_adicional')}
                      className="text-rose-600 hover:bg-rose-50 p-1 rounded-lg transition-colors">
                      
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                  }
                    </div>
                  </div>
                </> :

            <div className="text-center py-10 bg-emerald-50/40 border border-emerald-100 rounded-2xl animate-scale-bounce">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-800">¡Listo para activar!</h3>
                  <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
                    Tu cuenta como comprador se activa inmediatamente sin necesidad de subir documentos de acreditación.
                  </p>
                </div>
            }

              {/* Aceptación de términos y condiciones */}
              <div className="border-t border-slate-100 pt-6">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                  type="checkbox"
                  checked={formData.acepto_terminos}
                  onChange={(e) => handleInputChange('acepto_terminos', e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 mt-0.5 cursor-pointer" />
                
                  <span className="text-xs font-semibold text-slate-600 leading-normal">
                    Declaro que la información proporcionada es verdadera y acepto los{' '}
                    <a href="#" className="text-emerald-600 font-bold hover:underline">
                      Términos de Uso
                    </a>{' '}
                    y{' '}
                    <a href="#" className="text-emerald-600 font-bold hover:underline">
                      Política de Privacidad
                    </a>{' '}
                    de AgroDirecto.
                  </span>
                </label>
              </div>
            </div>
          }

          {/* Botones del footer del wizard */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
            {step > 1 ?
            <button
              onClick={handlePrevStep}
              className="flex items-center gap-2 px-5 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all">
              
                <ChevronLeft className="w-4 h-4" />
                Atrás
              </button> :

            <div />
            }

            {step < 3 ?
            <button
              onClick={handleNextStep}
              disabled={step === 1 && !formData.rol}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
              
                Continuar
                <ChevronRight className="w-4 h-4" />
              </button> :

            <button
              onClick={handleRegisterSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-60">
              
                {loading ? 'Procesando cuenta...' : 'Crear mi cuenta'}
              </button>
            }
          </div>
        </div>

        <p className="text-center mt-8 text-sm text-slate-500 font-medium">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-bold text-emerald-600 hover:underline">
            Iniciá sesión aquí
          </Link>
        </p>
      </div>

      {/* MODALES DE ÉXITO POST-REGISTRO (OVERLAY FOCUS MODAL) */}
      {showSuccessModal &&
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          {formData.rol !== 'COMPRADOR' ? (
        /* PRODUCTOR / TRANSPORTISTA: Cuenta en revisión */
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center animate-scale-bounce">
              <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-5 animate-float">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Cuenta en revisión</h3>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                Tus credenciales y acreditaciones comerciales han sido enviadas correctamente. Te notificaremos vía correo electrónico o SMS cuando sea aprobada en las siguientes 24 a 48 horas.
              </p>
              <button
            onClick={() => navigate('/login')}
            className="w-full mt-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-md transition-all">
            
                Ir al inicio
              </button>
            </div>) : (

        /* COMPRADOR: Cuenta creada y activa inmediatamente */
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center animate-scale-bounce relative overflow-hidden">
              {/* Partículas de Confetti (CSS animado simple) */}
              <div className="absolute inset-0 pointer-events-none opacity-30 select-none">
                <div className="absolute w-2.5 h-2.5 bg-red-400 rounded-full animate-float top-4 left-6" />
                <div className="absolute w-2 h-3 bg-blue-400 rotate-12 animate-float top-12 right-8" style={{ animationDelay: '1s' }} />
                <div className="absolute w-3 h-2 bg-yellow-400 rotate-45 animate-float bottom-10 left-12" style={{ animationDelay: '1.5s' }} />
                <div className="absolute w-2.5 h-2.5 bg-emerald-400 rounded-full animate-float bottom-16 right-16" style={{ animationDelay: '0.5s' }} />
              </div>

              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-5 animate-pulse-glow">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">¡Cuenta creada!</h3>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                ¡Tu cuenta de comprador ya está activa e inmediatamente lista para explorar! Accedé para ver las cosechas cruceñas más frescas disponibles.
              </p>
              <button
            onClick={() => navigate('/marketplace')}
            className="w-full mt-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5">
            
                Ir al marketplace
              </button>
            </div>)
        }
        </div>
      }
    </div>);

};

export default RegisterWizardPage;