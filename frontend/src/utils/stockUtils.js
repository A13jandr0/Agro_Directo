/** US22 — umbral de stock bajo */
export const STOCK_BAJO_UMBRAL = 5;

export function esStockBajo(cantidad) {
  return Number(cantidad) > 0 && Number(cantidad) < STOCK_BAJO_UMBRAL;
}

export function capCantidadStock(cantidad, stockDisponible) {
  const stock = Number(stockDisponible) || 0;
  const qty = Number(cantidad) || 0;
  return Math.max(0, Math.min(qty, stock));
}
