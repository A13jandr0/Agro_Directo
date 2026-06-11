const CATEGORIAS_VALIDAS = ['Verduras', 'Frutas', 'Granos', 'Tubérculos', 'Carnes', 'Lácteos'];
const UNIDADES_VALIDAS = ['Quintal', 'Arroba', 'Kg', 'Unidad', 'Caja', 'Bolsa', 'Litro'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Valida el payload de creación de cosecha (US05).
 * @returns {{ ok: boolean, message?: string }}
 */
function validarCosechaCreacion(body, tieneFoto) {
    const nombre = body.nombre_producto?.trim();
    const categoria = body.categoria?.trim();
    const descripcion = body.descripcion?.trim();
    const unidad = body.unidad_medida?.trim();
    const precio = body.precio_unitario;
    const cantidad = body.cantidad_disponible;

    if (!nombre) {
        return { ok: false, message: 'El nombre del producto es obligatorio.' };
    }
    if (!categoria || !CATEGORIAS_VALIDAS.includes(categoria)) {
        return { ok: false, message: 'Selecciona una categoría válida (Frutas, Verduras, Tubérculos, Granos, Carnes o Lácteos).' };
    }
    if (!descripcion) {
        return { ok: false, message: 'La descripción es obligatoria.' };
    }
    if (precio === undefined || precio === null || precio === '') {
        return { ok: false, message: 'El precio es obligatorio.' };
    }
    if (Number.isNaN(Number(precio)) || Number(precio) <= 0) {
        return { ok: false, message: 'El precio debe ser un número mayor a 0.' };
    }
    if (cantidad === undefined || cantidad === null || cantidad === '') {
        return { ok: false, message: 'La cantidad disponible es obligatoria.' };
    }
    if (Number.isNaN(Number(cantidad)) || Number(cantidad) <= 0) {
        return { ok: false, message: 'La cantidad debe ser un número mayor a 0.' };
    }
    if (!unidad || !UNIDADES_VALIDAS.includes(unidad)) {
        return { ok: false, message: 'La unidad de medida debe ser Quintal, Arroba, Kg, Unidad, Caja, Bolsa o Litro.' };
    }
    if (!tieneFoto) {
        return { ok: false, message: 'Debes subir al menos una imagen del producto.' };
    }

    return { ok: true };
}

module.exports = {
    CATEGORIAS_VALIDAS,
    UNIDADES_VALIDAS,
    MAX_IMAGE_BYTES,
    IMAGE_MIME_TYPES,
    validarCosechaCreacion,
};
