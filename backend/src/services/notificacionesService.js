const { sql, getPool } = require('../db');
const { CATEGORIAS_VALIDAS } = require('../utils/cosechaValidation');

function formatPedidoRef(pedidoId) {
    const short = String(pedidoId).replace(/-/g, '').slice(0, 6).toUpperCase();
    return `#PAA-${short}`;
}

/**
 * Inserta una notificación in-app para un usuario.
 */
async function crearNotificacion(usuarioId, tipo, titulo, mensaje, extras = {}) {
    const pool = await getPool();
    const req = pool.request()
        .input('usuario_id', sql.UniqueIdentifier, usuarioId)
        .input('tipo', sql.VarChar(50), tipo)
        .input('titulo', sql.VarChar(200), titulo)
        .input('mensaje', sql.VarChar(500), mensaje);

    if (extras.cosecha_id) {
        req.input('cosecha_id', sql.UniqueIdentifier, extras.cosecha_id);
    } else {
        req.input('cosecha_id', sql.UniqueIdentifier, null);
    }
    if (extras.pedido_id) {
        req.input('pedido_id', sql.UniqueIdentifier, extras.pedido_id);
    } else {
        req.input('pedido_id', sql.UniqueIdentifier, null);
    }

    await req.query(`
        INSERT INTO notificaciones_app (usuario_id, tipo, titulo, mensaje, cosecha_id, pedido_id)
        VALUES (@usuario_id, @tipo, @titulo, @mensaje, @cosecha_id, @pedido_id)
    `);
}

async function obtenerProductoresDelPedido(pool, pedidoId) {
    const result = await pool.request()
        .input('pedido_id', sql.UniqueIdentifier, pedidoId)
        .query(`
            SELECT DISTINCT pp.usuario_id
            FROM Detalle_Pedidos d
            INNER JOIN Cosechas c ON d.cosecha_id = c.id
            INNER JOIN perfil_productor pp ON c.productor_id = pp.id
            WHERE d.pedido_id = @pedido_id
        `);
    return result.recordset.map((r) => r.usuario_id);
}

async function guardarSuscripciones(compradorId, categorias, activas) {
    const pool = await getPool();

    await pool.request()
        .input('usuario_id', sql.UniqueIdentifier, compradorId)
        .input('activas', sql.Bit, activas ? 1 : 0)
        .query(`
            UPDATE perfil_comprador
            SET notificaciones_activas = @activas, fecha_actualizacion = GETDATE()
            WHERE usuario_id = @usuario_id
        `);

    await pool.request()
        .input('comprador_id', sql.UniqueIdentifier, compradorId)
        .query('DELETE FROM suscripcion_categorias_comprador WHERE comprador_id = @comprador_id');

    if (!activas || !Array.isArray(categorias) || categorias.length === 0) return;

    for (const cat of categorias) {
        if (!CATEGORIAS_VALIDAS.includes(cat)) continue;
        await pool.request()
            .input('comprador_id', sql.UniqueIdentifier, compradorId)
            .input('categoria', sql.VarChar(50), cat)
            .query(`
                INSERT INTO suscripcion_categorias_comprador (comprador_id, categoria)
                VALUES (@comprador_id, @categoria)
            `);
    }
}

async function notificarNuevoProductoTemporada(cosechaId, categoria, nombreProducto, precioUnitario) {
    if (!categoria || !CATEGORIAS_VALIDAS.includes(categoria)) return;

    const pool = await getPool();
    const titulo = `¡Nuevo producto de temporada en ${categoria}!`;
    const precio = precioUnitario != null ? ` — Bs ${Number(precioUnitario).toFixed(2)}` : '';
    const mensaje = `🔔 Nueva cosecha disponible: ${nombreProducto}${precio}. Aprovechá precio y stock de temporada.`;

    const suscriptores = await pool.request()
        .input('categoria', sql.VarChar(50), categoria)
        .query(`
            SELECT u.id AS usuario_id
            FROM usuarios u
            INNER JOIN perfil_comprador pc ON pc.usuario_id = u.id
            INNER JOIN suscripcion_categorias_comprador s ON s.comprador_id = u.id
            WHERE u.rol = 'COMPRADOR'
              AND pc.notificaciones_activas = 1
              AND s.categoria = @categoria
        `);

    for (const row of suscriptores.recordset) {
        await crearNotificacion(
            row.usuario_id,
            'NUEVO_PRODUCTO_TEMPORADA',
            titulo,
            mensaje,
            { cosecha_id: cosechaId }
        );
    }
}

async function notificarVerificacionCuenta(usuarioId, aprobado, motivo) {
    if (aprobado) {
        await crearNotificacion(
            usuarioId,
            'CUENTA_VERIFICADA',
            '✅ Cuenta verificada',
            'Tu cuenta fue verificada por el administrador. Ya podés usar todas las funcionalidades.',
        );
    } else {
        await crearNotificacion(
            usuarioId,
            'CUENTA_RECHAZADA',
            '❌ Cuenta rechazada',
            `Tu cuenta fue rechazada. Motivo: ${motivo || 'Documentación no válida.'}`,
        );
    }
}

async function notificarNuevoPedido(pedidoId, compradorNombre, monto) {
    const pool = await getPool();
    const ref = formatPedidoRef(pedidoId);
    const productores = await obtenerProductoresDelPedido(pool, pedidoId);
    for (const productorId of productores) {
        await crearNotificacion(
            productorId,
            'PEDIDO_NUEVO',
            '🛒 Nuevo pedido',
            `Nuevo pedido de ${compradorNombre} — Bs ${Number(monto).toFixed(2)} (${ref})`,
            { pedido_id: pedidoId }
        );
    }
}

async function notificarComprobanteEnviado(pedidoId, compradorNombre) {
    const pool = await getPool();
    const ref = formatPedidoRef(pedidoId);
    const productores = await obtenerProductoresDelPedido(pool, pedidoId);
    for (const productorId of productores) {
        await crearNotificacion(
            productorId,
            'COMPROBANTE_RECIBIDO',
            '📸 Comprobante recibido',
            `${compradorNombre} envió el comprobante del pedido ${ref}. Revisá el pago.`,
            { pedido_id: pedidoId }
        );
    }
}

async function notificarPagoConfirmado(pedidoId, compradorId, productorNombre) {
    const ref = formatPedidoRef(pedidoId);
    await crearNotificacion(
        compradorId,
        'PAGO_CONFIRMADO',
        '✅ Pago confirmado',
        `${productorNombre} confirmó tu pago del pedido ${ref}. Está preparando tu pedido.`,
        { pedido_id: pedidoId }
    );
}

async function notificarPagoRechazado(pedidoId, compradorId, productorNombre, motivo) {
    const ref = formatPedidoRef(pedidoId);
    await crearNotificacion(
        compradorId,
        'PAGO_RECHAZADO',
        '⚠️ Problema con el pago',
        `${productorNombre} no pudo verificar tu pago del pedido ${ref}. Motivo: ${motivo}`,
        { pedido_id: pedidoId }
    );
}

async function notificarListoDespacho(pedidoId, compradorId) {
    const ref = formatPedidoRef(pedidoId);
    await crearNotificacion(
        compradorId,
        'LISTO_DESPACHO',
        '📦 Listo para despacho',
        `Tu pedido ${ref} está listo para despacho.`,
        { pedido_id: pedidoId }
    );
}

async function notificarRutaAceptada(pedidoId, productorIds, compradorId, transportistaNombre, placa) {
    const ref = formatPedidoRef(pedidoId);
    const msgProductor = `🚚 ${transportistaNombre} aceptó llevar tu pedido ${ref}. Placa: ${placa || 'N/D'}`;
    const msgComprador = `🚚 Tu pedido está en camino con ${transportistaNombre}. Placa: ${placa || 'N/D'}`;

    for (const pid of productorIds) {
        await crearNotificacion(pid, 'RUTA_ASIGNADA', '🚛 Transportista asignado', msgProductor, { pedido_id: pedidoId });
    }
    await crearNotificacion(compradorId, 'EN_CAMINO', '🚛 En camino', msgComprador, { pedido_id: pedidoId });
}

async function notificarEntregaCompletada(pedidoId, compradorId, productorIds, transportistaId, monto) {
    const ref = formatPedidoRef(pedidoId);
    await crearNotificacion(
        compradorId,
        'ENTREGA_COMPLETADA',
        '📦 Pedido entregado',
        `Tu pedido fue entregado (${ref}). ¿Querés calificar al productor y transportista?`,
        { pedido_id: pedidoId }
    );
    for (const pid of productorIds) {
        await crearNotificacion(
            pid,
            'INGRESO_REGISTRADO',
            '💰 Ingreso registrado',
            `El pedido ${ref} fue entregado. Ingreso registrado: Bs ${Number(monto).toFixed(2)}`,
            { pedido_id: pedidoId }
        );
    }
    if (transportistaId) {
        await crearNotificacion(
            transportistaId,
            'VIAJE_COMPLETADO',
            '✅ Viaje completado',
            `Entrega del pedido ${ref} confirmada. Ganancia registrada.`,
            { pedido_id: pedidoId }
        );
    }
}

module.exports = {
    guardarSuscripciones,
    notificarNuevoProductoTemporada,
    crearNotificacion,
    formatPedidoRef,
    notificarVerificacionCuenta,
    notificarNuevoPedido,
    notificarComprobanteEnviado,
    notificarPagoConfirmado,
    notificarPagoRechazado,
    notificarListoDespacho,
    notificarRutaAceptada,
    notificarEntregaCompletada,
    obtenerProductoresDelPedido,
    CATEGORIAS_VALIDAS,
};
