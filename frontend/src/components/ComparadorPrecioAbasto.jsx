import React from 'react';
import { TrendingUp } from 'lucide-react';
import { compararPrecioMercado } from '../utils/precioMercadoUtils';

/** US09: Tu precio vs precio promedio del Mercado Abasto */
const ComparadorPrecioAbasto = ({ precioUsuario, precioMercado, nombreProducto }) => {
  if (!precioMercado) return null;

  const mercado = Number(precioMercado);
  const tuPrecio = Number(precioUsuario) || 0;
  const comparacion = compararPrecioMercado(tuPrecio, mercado);

  const pctTu = mercado > 0 ? Math.min(150, (tuPrecio / mercado) * 100) : 0;

  return (
    <div className="mt-3 p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-sm">
      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
        Tu precio vs mercado Abasto
      </div>
      <div className="flex justify-between text-xs font-bold text-slate-600">
        <span>Tu precio: Bs. {tuPrecio > 0 ? tuPrecio.toFixed(2) : '—'}</span>
        <span>Promedio: Bs. {mercado.toFixed(2)}</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden relative">
        <div
          className={`h-full rounded-full transition-all ${comparacion?.barColor || 'bg-slate-400'}`}
          style={{ width: `${Math.min(pctTu, 100)}%` }}
        />
        <div className="absolute top-0 bottom-0 left-[100%] w-0.5 bg-slate-400 -translate-x-px" title="Referencia mercado" />
      </div>
      {nombreProducto && (
        <p className="text-[10px] text-slate-400">Referencia: {nombreProducto} (Mercado Abasto)</p>
      )}
      {comparacion && tuPrecio > 0 && (
        <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${comparacion.color}`}>
          {comparacion.text}
        </span>
      )}
    </div>
  );
};

export default ComparadorPrecioAbasto;
