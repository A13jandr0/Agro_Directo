// ============================================================
// Validadores Zod — Registro Multitipo (US01)
// ============================================================
const { z } = require('zod');

// -------------------------------------------------------
// Política de contraseña: min 8 chars, 1 mayúscula, 1 número
// -------------------------------------------------------
const passwordSchema = z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(8, 'La contraseña debe tener mínimo 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número');

// -------------------------------------------------------
// Campos comunes obligatorios para TODOS los roles
// -------------------------------------------------------
const baseSchema = z.object({
    nombre_completo: z
        .string({ required_error: 'El nombre completo es obligatorio' })
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(150),

    correo: z
        .string({ required_error: 'El correo es obligatorio' })
        .email('Formato de correo inválido')
        .max(150),

    contrasena: passwordSchema,

    celular: z
        .string({ required_error: 'El celular es obligatorio' })
        .min(7, 'El celular debe tener al menos 7 dígitos')
        .max(20),

    rol: z.enum(['PRODUCTOR', 'COMPRADOR', 'TRANSPORTISTA', 'ADMINISTRADOR'], {
        required_error: 'El rol es obligatorio',
        invalid_type_error: 'Rol inválido. Debe ser PRODUCTOR, COMPRADOR, TRANSPORTISTA o ADMINISTRADOR'
    }),

    acepto_terminos: z
        .boolean({ required_error: 'Debe aceptar los términos' })
        .refine(val => val === true, { message: 'Debe aceptar los términos de uso' }),

    acepto_privacidad: z
        .boolean({ required_error: 'Debe aceptar la política de privacidad' })
        .refine(val => val === true, { message: 'Debe aceptar la política de privacidad' })
});

// -------------------------------------------------------
// Campos específicos por ROL (validación dinámica)
// -------------------------------------------------------
const productorSchema = z.object({
    tipo_productor: z.enum(['Individual', 'Asociación', 'Cooperativa'], {
        required_error: 'El tipo de productor es obligatorio'
    }),
    nombre_finca: z
        .string({ required_error: 'El nombre de la finca es obligatorio' })
        .min(2)
        .max(150),
    municipio: z.string({ required_error: 'El municipio es obligatorio' }).max(100),
    provincia: z.string({ required_error: 'La provincia es obligatoria' }).max(100),
    departamento: z.string().max(100).default('Santa Cruz'),
    anios_experiencia: z
        .number({ required_error: 'Los años de experiencia son obligatorios' })
        .int()
        .min(0, 'Los años de experiencia no pueden ser negativos'),
    tipo_documento: z.enum(['CI', 'Registro', 'Certificado'], {
        required_error: 'El tipo de documento es obligatorio'
    }),
    numero_documento: z
        .string({ required_error: 'El número de documento es obligatorio' })
        .max(50)
});

const compradorSchema = z.object({
    tipo_comprador: z.enum(['Persona natural', 'Negocio', 'Empresa'], {
        required_error: 'El tipo de comprador es obligatorio'
    }),
    nombre_negocio: z.string().max(150).nullable().optional(),
    ciudad_principal: z
        .string({ required_error: 'La ciudad principal es obligatoria' })
        .max(100)
});

const transportistaSchema = z.object({
    tipo_transporte: z.enum(['Camión', 'Camioneta', 'Moto', 'Otro'], {
        required_error: 'El tipo de transporte es obligatorio'
    }),
    capacidad_carga_kg: z
        .number({ required_error: 'La capacidad de carga es obligatoria' })
        .positive('La capacidad de carga debe ser mayor a 0'),
    zona_operacion: z.enum(['Local', 'Regional', 'Departamental'], {
        required_error: 'La zona de operación es obligatoria'
    }),
    numero_licencia: z
        .string({ required_error: 'El número de licencia es obligatorio' })
        .max(100),
    placa_vehiculo: z
        .string({ required_error: 'La placa del vehículo es obligatoria' })
        .max(20),
    tipo_documento_subido: z.enum(['Licencia', 'SOAT', 'Registro'], {
        required_error: 'El tipo de documento subido es obligatorio'
    })
});

// -------------------------------------------------------
// Schema de ubicación GPS (US02)
// -------------------------------------------------------
const ubicacionSchema = z.object({
    latitud: z
        .number({ required_error: 'La latitud es obligatoria' })
        .min(-90).max(90),
    longitud: z
        .number({ required_error: 'La longitud es obligatoria' })
        .min(-180).max(180)
});

// -------------------------------------------------------
// Schema de verificación admin (US04)
// -------------------------------------------------------
const verificacionSchema = z.object({
    accion: z.enum(['aprobar', 'rechazar'], {
        required_error: 'La acción es obligatoria (aprobar o rechazar)'
    }),
    motivo: z.string().max(500).optional()
}).refine(
    data => data.accion !== 'rechazar' || (data.motivo && data.motivo.trim().length > 0),
    { message: 'El motivo es obligatorio cuando se rechaza', path: ['motivo'] }
);

module.exports = {
    baseSchema,
    productorSchema,
    compradorSchema,
    transportistaSchema,
    ubicacionSchema,
    verificacionSchema
};
