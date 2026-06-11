/** US06 — utilidades de preventa agrícola */
const ANTICIPO_PORCENTAJE = 0.4;

function calcularMontosLinea(precioUnitario, cantidad, esPreventa) {
    const precio = Number(precioUnitario) || 0;
    const qty = Number(cantidad) || 0;
    const subtotal = precio * qty;

    if (!esPreventa) {
        return {
            subtotal,
            monto_anticipo: subtotal,
            monto_saldo: 0,
        };
    }

    const monto_anticipo = Math.round(subtotal * ANTICIPO_PORCENTAJE * 100) / 100;
    const monto_saldo = Math.round((subtotal - monto_anticipo) * 100) / 100;

    return { subtotal, monto_anticipo, monto_saldo };
}

function diasHastaDisponibilidad(fechaDisponibilidad) {
    if (!fechaDisponibilidad) return 0;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fecha = new Date(fechaDisponibilidad);
    fecha.setHours(0, 0, 0, 0);
    const diffMs = fecha.getTime() - hoy.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function esPreventaPorFecha(fechaDisponibilidad) {
    return diasHastaDisponibilidad(fechaDisponibilidad) > 0;
}

function cosechaYaDisponible(fechaDisponibilidad) {
    return diasHastaDisponibilidad(fechaDisponibilidad) <= 0;
}

module.exports = {
    ANTICIPO_PORCENTAJE,
    calcularMontosLinea,
    diasHastaDisponibilidad,
    esPreventaPorFecha,
    cosechaYaDisponible,
};
