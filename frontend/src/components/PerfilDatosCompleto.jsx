import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import {
  CAMPOS_CUENTA,
  getCamposPorRol,
  formatPerfilValor,
} from '../utils/perfilFieldsConfig';

const API_BASE = 'http://localhost:5000';

/**
 * Muestra todos los datos del registro (cuenta + perfil por rol).
 * @param {object} data — respuesta de GET /api/usuarios/mi-perfil o producto con datos productor
 * @param {'owner'|'public'} modo — público oculta datos sensibles de cuenta
 */
const PerfilDatosCompleto = ({ data, modo = 'owner', tituloCuenta = 'Datos de la cuenta', tituloRol }) => {
  if (!data) return null;

  const rol = data.rol || 'PRODUCTOR';
  const camposRol = getCamposPorRol(rol, modo);
  const tituloSeccionRol =
    tituloRol ||
    (rol === 'PRODUCTOR'
      ? modo === 'public'
        ? 'Información del productor'
        : 'Datos de productor'
      : rol === 'COMPRADOR'
        ? 'Datos de comprador'
        : rol === 'TRANSPORTISTA'
          ? 'Datos de transportista'
          : 'Datos del perfil');

  const renderValor = (key, raw) => {
    if (key === 'url_documento' && raw) {
      const href = raw.startsWith('http') ? raw : `${API_BASE}${raw}`;
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline"
        >
          Ver documento <ExternalLink className="w-3.5 h-3.5" />
        </a>
      );
    }
    if (key === 'rol') {
      const labels = {
        PRODUCTOR: 'Productor',
        COMPRADOR: 'Comprador',
        TRANSPORTISTA: 'Transportista',
        ADMINISTRADOR: 'Administrador',
      };
      return labels[raw] || raw;
    }
    return formatPerfilValor(key, raw);
  };

  const camposCuenta = modo === 'public' ? [] : CAMPOS_CUENTA;

  return (
    <div className="space-y-6">
            {camposCuenta.length > 0 && tituloCuenta && (
        <section className="card-elevated p-5 sm:p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            {tituloCuenta}
          </h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {camposCuenta.map(({ key, label }) => (
              <div key={key} className="min-w-0">
                <dt className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</dt>
                <dd className="text-sm font-medium text-slate-900 mt-0.5 break-words">
                  {renderValor(key, data[key])}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {camposRol.length > 0 && (
        <section className="card-elevated p-5 sm:p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            {tituloSeccionRol}
          </h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {camposRol.map(({ key, label }) => {
              const val = data[key];
              if (
                modo === 'public' &&
                (key === 'numero_documento' || key === 'url_documento')
              ) {
                return null;
              }
              if (key === 'nombre_negocio' && !val && data.tipo_comprador === 'Persona natural') {
                return null;
              }
              return (
                <div key={key} className="min-w-0">
                  <dt className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    {label}
                  </dt>
                  <dd className="text-sm font-medium text-slate-900 mt-0.5 break-words">
                    {renderValor(key, val)}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>
      )}

      {modo === 'owner' && data.estadisticas && (
        <section className="card-elevated p-5 sm:p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Resumen en la plataforma</h3>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(data.estadisticas).map(([k, v]) => {
              const labels = {
                productos_activos: 'Productos activos',
                productos_totales: 'Total publicados',
                pedidos_realizados: 'Pedidos realizados',
              };
              return (
                <div key={k} className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                  <dd className="text-xl font-bold text-slate-900">{v}</dd>
                  <dt className="text-[10px] font-semibold text-slate-500 uppercase mt-1">
                    {labels[k] || k.replace(/_/g, ' ')}
                  </dt>
                </div>
              );
            })}
          </dl>
        </section>
      )}
    </div>
  );
};

export default PerfilDatosCompleto;
