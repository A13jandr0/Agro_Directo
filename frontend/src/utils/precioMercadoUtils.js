/** US09 — comparación con precio referencial del Mercado Abasto */
export function compararPrecioMercado(precioUsuario, precioMercado) {
  const precio = Number(precioUsuario);
  const mercado = Number(precioMercado);
  if (!precio || !mercado || Number.isNaN(precio) || Number.isNaN(mercado)) return null;

  if (precio < mercado * 0.9) {
    return {
      text: 'Por debajo del mercado',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      barColor: 'bg-amber-500',
    };
  }
  if (precio > mercado * 1.1) {
    return {
      text: 'Por encima del mercado',
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      barColor: 'bg-rose-500',
    };
  }
  return {
    text: 'Competitivo',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    barColor: 'bg-emerald-500',
  };
}
