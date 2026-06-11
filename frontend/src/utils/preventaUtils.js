export const ANTICIPO_PORCENTAJE = 0.4;

export function diasHastaDisponibilidad(fechaDisponibilidad) {
  if (!fechaDisponibilidad) return 0;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(fechaDisponibilidad);
  fecha.setHours(0, 0, 0, 0);
  return Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
}

export function etiquetaPreventa(producto) {
  if (!producto?.es_preventa) return null;
  const dias = diasHastaDisponibilidad(producto.fecha_disponibilidad);
  if (dias <= 0) return 'Preventa — ya disponible';
  if (dias === 1) return 'Disponible en 1 día';
  return `Disponible en ${dias} días`;
}

export function calcularPagoAhora(precioUnitario, cantidad, esPreventa) {
  const subtotal = (Number(precioUnitario) || 0) * (Number(cantidad) || 0);
  return esPreventa ? subtotal * ANTICIPO_PORCENTAJE : subtotal;
}
