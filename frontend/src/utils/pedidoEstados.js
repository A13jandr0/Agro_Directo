const ESTADOS_COMPRADOR = {
  PENDIENTE_CONFIRMACION: { label: '⏳ Esperando confirmación', class: 'bg-amber-50 text-amber-700 border-amber-200' },
  PENDIENTE: { label: '⚠️ Problema con el pago', class: 'bg-amber-50 text-amber-700 border-amber-200' },
  COMPROBANTE_ENVIADO: { label: '📸 Comprobante enviado', class: 'bg-purple-50 text-purple-700 border-purple-200' },
  PAGADO: { label: '✅ Pago verificado', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  LISTO_PARA_DESPACHO: { label: '📦 Listo para despacho', class: 'bg-blue-50 text-blue-700 border-blue-200' },
  EN_CAMINO: { label: '🚛 En camino', class: 'bg-sky-50 text-sky-700 border-sky-200' },
  ENTREGADO: { label: '✅ Entregado', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  RECHAZADO: { label: '❌ Rechazado', class: 'bg-rose-50 text-rose-700 border-rose-200' },
  CONFIRMADO: { label: '✅ Confirmado', class: 'bg-blue-50 text-blue-700 border-blue-200' },
  PENDIENTE_SALDO: { label: 'Saldo pendiente', class: 'bg-amber-50 text-amber-700 border-amber-200' },
  CANCELADO: { label: 'Cancelado', class: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const ESTADOS_PRODUCTOR = {
  PENDIENTE_CONFIRMACION: { label: '🛒 Nuevo pedido — confirmar o rechazar', class: 'bg-amber-50 text-amber-700 animate-pulse' },
  PENDIENTE: { label: '⏳ Esperando comprobante', class: 'bg-amber-50 text-amber-700' },
  COMPROBANTE_ENVIADO: { label: '📸 Revisá el comprobante', class: 'bg-purple-50 text-purple-700 animate-pulse font-black' },
  PAGADO: { label: '💰 Pago confirmado — preparar pedido', class: 'bg-emerald-50 text-emerald-700' },
  LISTO_PARA_DESPACHO: { label: '🚚 Listo para despacho', class: 'bg-indigo-50 text-indigo-700' },
  EN_CAMINO: { label: '🚛 En camino', class: 'bg-sky-50 text-sky-700' },
  ENTREGADO: { label: '✅ Entregado — ingreso registrado', class: 'bg-emerald-50 text-emerald-700' },
  RECHAZADO: { label: '❌ Rechazado', class: 'bg-rose-50 text-rose-700' },
  CONFIRMADO: { label: '✓ Confirmado', class: 'bg-blue-50 text-blue-700' },
};

export function getEstadoPedido(estado, rol = 'COMPRADOR') {
  const map = rol === 'PRODUCTOR' ? ESTADOS_PRODUCTOR : ESTADOS_COMPRADOR;
  return map[estado] || { label: estado, class: 'bg-gray-50 text-gray-600 border-gray-200' };
}

export function formatPedidoRef(pedidoId) {
  const short = String(pedidoId).replace(/-/g, '').slice(0, 6).toUpperCase();
  return `#PAA-${short}`;
}

export function tipoNotificacionToUi(tipo) {
  const map = {
    CUENTA_VERIFICADA: 'celebration',
    CUENTA_RECHAZADA: 'error',
    PEDIDO_NUEVO: 'info',
    COMPROBANTE_RECIBIDO: 'warning',
    PAGO_CONFIRMADO: 'success',
    PAGO_RECHAZADO: 'warning',
    LISTO_DESPACHO: 'info',
    RUTA_ASIGNADA: 'info',
    EN_CAMINO: 'info',
    ENTREGA_COMPLETADA: 'celebration',
    INGRESO_REGISTRADO: 'success',
    VIAJE_COMPLETADO: 'success',
    NUEVO_PRODUCTO_TEMPORADA: 'warning',
  };
  return map[tipo] || 'info';
}

export function rutaNotificacion(notif, rol) {
  if (notif.pedido_id) {
    if (rol === 'PRODUCTOR') return '/dashboard/productor/pedidos';
    if (rol === 'TRANSPORTISTA') return '/dashboard/transportista/hoja-de-ruta';
    return '/dashboard/comprador/mis-pedidos';
  }
  if (notif.cosecha_id) return `/marketplace/producto/${notif.cosecha_id}`;
  if (notif.tipo === 'CUENTA_VERIFICADA' || notif.tipo === 'CUENTA_RECHAZADA') {
    if (rol === 'PRODUCTOR') return '/dashboard/productor/perfil';
    if (rol === 'TRANSPORTISTA') return '/dashboard/transportista/perfil';
  }
  return '';
}
