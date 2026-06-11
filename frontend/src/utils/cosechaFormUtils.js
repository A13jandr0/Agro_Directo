export const CATEGORIAS_COSECHA = ['Verduras', 'Frutas', 'Granos', 'Tubérculos'];
export const UNIDADES_COSECHA = ['Quintal', 'Arroba'];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Valida archivo de imagen (formato y tamaño US05).
 * @returns {string|null} mensaje de error o null si es válido
 */
export function validarImagenCosecha(file) {
  if (!file) return 'Debes subir al menos una imagen del producto.';
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Formato no permitido. Usa JPG, PNG o WEBP.';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'La imagen no debe superar 5 MB.';
  }
  return null;
}

/**
 * Valida el formulario de publicación antes de enviar.
 * @returns {Record<string, string>} errores por campo
 */
export function validarFormularioCosecha(formData, foto) {
  const errors = {};

  if (!formData.nombre_producto?.trim()) {
    errors.nombre_producto = 'El nombre del producto es obligatorio.';
  }
  if (!formData.categoria) {
    errors.categoria = 'Selecciona una categoría.';
  }
  if (!formData.unidad_medida) {
    errors.unidad_medida = 'Selecciona la unidad de medida.';
  } else if (!UNIDADES_COSECHA.includes(formData.unidad_medida)) {
    errors.unidad_medida = 'La unidad debe ser Quintal o Arroba.';
  }
  if (!formData.precio_unitario) {
    errors.precio_unitario = 'El precio es obligatorio.';
  } else if (isNaN(Number(formData.precio_unitario)) || Number(formData.precio_unitario) <= 0) {
    errors.precio_unitario = 'El precio debe ser mayor a 0.';
  }
  if (!formData.cantidad_disponible) {
    errors.cantidad_disponible = 'La cantidad es obligatoria.';
  } else if (isNaN(Number(formData.cantidad_disponible)) || Number(formData.cantidad_disponible) <= 0) {
    errors.cantidad_disponible = 'La cantidad debe ser mayor a 0.';
  }
  if (!formData.descripcion?.trim()) {
    errors.descripcion = 'La descripción es obligatoria.';
  }

  const imgError = validarImagenCosecha(foto);
  if (imgError) errors.foto = imgError;

  return errors;
}
