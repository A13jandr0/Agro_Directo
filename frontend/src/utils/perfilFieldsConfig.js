/** Campos mostrados según rol (los mismos del registro) */
export const LABELS_ESTADO = {
  REGISTRADO: 'Registrado',
  PENDIENTE_VERIFICACION: 'Pendiente de verificación',
  VERIFICADO: 'Verificado',
  RECHAZADO: 'Rechazado',
};

export function formatPerfilValor(key, value) {
  if (value === null || value === undefined || value === '') return '—';
  if (key === 'fecha_registro' || key === 'fecha_creacion' || key === 'fecha_actualizacion') {
    try {
      return new Date(value).toLocaleDateString('es-BO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return String(value);
    }
  }
  if (key === 'estado') return LABELS_ESTADO[value] || value;
  if (key === 'acepto_terminos' || key === 'acepto_privacidad' || key === 'notificaciones_activas') {
    return value ? 'Sí' : 'No';
  }
  if (key === 'latitud' || key === 'longitud') {
    return Number(value).toFixed(6);
  }
  if (key === 'capacidad_carga_kg') {
    return `${Number(value).toLocaleString('es-BO')} kg`;
  }
  return String(value);
}

export const CAMPOS_CUENTA = [
  { key: 'nombre_completo', label: 'Nombre completo' },
  { key: 'correo', label: 'Correo electrónico' },
  { key: 'celular', label: 'Celular' },
  { key: 'rol', label: 'Rol en la plataforma' },
  { key: 'estado', label: 'Estado de la cuenta' },
  { key: 'fecha_registro', label: 'Miembro desde' },
];

export const CAMPOS_PRODUCTOR = [
  { key: 'tipo_productor', label: 'Tipo de productor' },
  { key: 'nombre_finca', label: 'Nombre de la finca' },
  { key: 'departamento', label: 'Departamento' },
  { key: 'provincia', label: 'Provincia' },
  { key: 'municipio', label: 'Municipio' },
  { key: 'anios_experiencia', label: 'Años de experiencia' },
  { key: 'tipo_documento', label: 'Tipo de documento' },
  { key: 'numero_documento', label: 'Número de documento' },
  { key: 'latitud', label: 'Latitud GPS' },
  { key: 'longitud', label: 'Longitud GPS' },
  { key: 'url_documento', label: 'Documento de verificación' },
];

export const CAMPOS_PRODUCTOR_PUBLICO = [
  { key: 'nombre_productor', label: 'Productor' },
  { key: 'tipo_productor', label: 'Tipo de productor' },
  { key: 'nombre_finca', label: 'Finca' },
  { key: 'departamento', label: 'Departamento' },
  { key: 'provincia', label: 'Provincia' },
  { key: 'municipio', label: 'Municipio' },
  { key: 'anios_experiencia', label: 'Años de experiencia' },
  { key: 'productos_publicados', label: 'Productos publicados' },
  { key: 'calificacion_productor', label: 'Calificación' },
];

export const CAMPOS_COMPRADOR = [
  { key: 'tipo_comprador', label: 'Tipo de comprador' },
  { key: 'nombre_negocio', label: 'Nombre del negocio / empresa' },
  { key: 'ciudad_principal', label: 'Ciudad principal' },
  { key: 'notificaciones_activas', label: 'Alertas de temporada' },
  { key: 'categorias_suscritas', label: 'Categorías suscritas' },
];

export const CAMPOS_TRANSPORTISTA = [
  { key: 'tipo_transporte', label: 'Tipo de transporte' },
  { key: 'placa_vehiculo', label: 'Placa del vehículo' },
  { key: 'capacidad_carga_kg', label: 'Capacidad de carga' },
  { key: 'zona_operacion', label: 'Zona de operación' },
  { key: 'numero_licencia', label: 'Número de licencia' },
  { key: 'tipo_documento_subido', label: 'Documento presentado' },
  { key: 'url_documento', label: 'Archivo de verificación' },
];

export function getCamposPorRol(rol, modo = 'owner') {
  if (rol === 'PRODUCTOR' && modo === 'public') return CAMPOS_PRODUCTOR_PUBLICO;
  if (rol === 'PRODUCTOR') return CAMPOS_PRODUCTOR;
  if (rol === 'COMPRADOR') return CAMPOS_COMPRADOR;
  if (rol === 'TRANSPORTISTA') return CAMPOS_TRANSPORTISTA;
  return [];
}
