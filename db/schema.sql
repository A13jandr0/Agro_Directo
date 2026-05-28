-- ============================================================
-- DDL Script: AgroDirecto Santa Cruz
-- Motor: SQL Server (Transact-SQL)
-- Épica 1: Gestión de Identidad y Roles
-- Autor: DBA Architect
-- Fecha: 2026-04-30
-- ============================================================

USE master;
GO

-- Recrear la base de datos (comentar si no se quiere borrar datos)
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'AgroDirecto_Santa_Cruz_1')
BEGIN
    ALTER DATABASE AgroDirecto_Santa_Cruz_1 SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE AgroDirecto_Santa_Cruz_1;
END
GO

CREATE DATABASE AgroDirecto_Santa_Cruz_1;
GO

USE AgroDirecto_Santa_Cruz_1;
GO


-- ============================================================
-- 1. TABLA PRINCIPAL: USUARIOS (US01)
-- ============================================================
-- Almacena la identidad común de todos los usuarios.
-- El estado inicial se asigna automáticamente mediante un TRIGGER
-- según la regla de negocio:
--   • COMPRADOR             → REGISTRADO
--   • PRODUCTOR/TRANSPORTISTA → PENDIENTE_VERIFICACION
-- ============================================================

CREATE TABLE usuarios (
    id                  UNIQUEIDENTIFIER    NOT NULL DEFAULT NEWID() PRIMARY KEY,
    nombre_completo     VARCHAR(150)        NOT NULL,
    correo              VARCHAR(150)        NOT NULL,
    password_hash       VARCHAR(255)        NOT NULL,
    celular             VARCHAR(20)         NOT NULL,       -- Con código de país, ej: +591 77711122
    rol                 VARCHAR(50)         NOT NULL,
    estado              VARCHAR(50)         NOT NULL DEFAULT 'PENDIENTE_VERIFICACION',
    acepto_terminos     BIT                 NOT NULL DEFAULT 1,
    acepto_privacidad   BIT                 NOT NULL DEFAULT 1,
    fecha_registro      DATETIME            NOT NULL DEFAULT GETDATE(),
    fecha_actualizacion DATETIME            NOT NULL DEFAULT GETDATE(),

    -- Correo único
    CONSTRAINT UQ_usuarios_correo UNIQUE (correo),

    -- Validación: el hash almacenado debe tener longitud mínima razonable
    -- (La política de complejidad: min 8 chars, 1 mayúscula, 1 número se valida en backend)
    CONSTRAINT CHK_usuarios_password_hash_length CHECK (LEN(password_hash) >= 8),

    -- Restricción de roles permitidos
    CONSTRAINT CHK_usuarios_rol CHECK (rol IN ('PRODUCTOR', 'COMPRADOR', 'TRANSPORTISTA', 'ADMINISTRADOR')),

    -- Restricción de estados permitidos
    CONSTRAINT CHK_usuarios_estado CHECK (estado IN ('REGISTRADO', 'PENDIENTE_VERIFICACION', 'VERIFICADO', 'RECHAZADO')),

    -- Términos y privacidad deben ser aceptados
    CONSTRAINT CHK_usuarios_acepto_terminos   CHECK (acepto_terminos = 1),
    CONSTRAINT CHK_usuarios_acepto_privacidad CHECK (acepto_privacidad = 1)
);
GO

-- Índices de rendimiento
CREATE NONCLUSTERED INDEX IX_usuarios_correo ON usuarios(correo);
CREATE NONCLUSTERED INDEX IX_usuarios_rol    ON usuarios(rol);
CREATE NONCLUSTERED INDEX IX_usuarios_estado ON usuarios(estado);
GO


-- ============================================================
-- 1.1 TRIGGER: Estado inicial automático según el rol
-- ============================================================
-- Regla de negocio:
--   Si rol = COMPRADOR → estado = REGISTRADO
--   Si rol = PRODUCTOR o TRANSPORTISTA → estado = PENDIENTE_VERIFICACION
-- ============================================================

CREATE TRIGGER TRG_usuarios_estado_inicial
ON usuarios
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO usuarios (
        id, nombre_completo, correo, password_hash, celular,
        rol, estado, acepto_terminos, acepto_privacidad,
        fecha_registro, fecha_actualizacion
    )
    SELECT
        ISNULL(id, NEWID()),
        nombre_completo,
        correo,
        password_hash,
        celular,
        rol,
        CASE
            WHEN rol = 'COMPRADOR' THEN 'REGISTRADO'
            WHEN rol = 'ADMINISTRADOR' THEN 'VERIFICADO'
            ELSE 'PENDIENTE_VERIFICACION'
        END,
        ISNULL(acepto_terminos, 1),
        ISNULL(acepto_privacidad, 1),
        ISNULL(fecha_registro, GETDATE()),
        ISNULL(fecha_actualizacion, GETDATE())
    FROM inserted;
END;
GO


-- ============================================================
-- 2. TABLA: PERFIL_PRODUCTOR (Relación 1:1 con Usuarios)
-- ============================================================
-- Extiende la información de los usuarios con rol PRODUCTOR.
-- Incluye geolocalización mediante el tipo GEOGRAPHY de SQL Server.
-- ============================================================

CREATE TABLE perfil_productor (
    id                  UNIQUEIDENTIFIER    NOT NULL DEFAULT NEWID() PRIMARY KEY,
    usuario_id          UNIQUEIDENTIFIER    NOT NULL,
    tipo_productor      VARCHAR(50)         NOT NULL,
    nombre_finca        VARCHAR(150)        NOT NULL,
    municipio           VARCHAR(100)        NOT NULL,
    provincia           VARCHAR(100)        NOT NULL,
    departamento        VARCHAR(100)        NOT NULL DEFAULT 'Santa Cruz',
    anios_experiencia   INT                 NOT NULL,
    tipo_documento      VARCHAR(50)         NOT NULL,
    numero_documento    VARCHAR(50)         NOT NULL,
    ubicacion_gps       GEOGRAPHY           NULL,       -- Tipo espacial nativo: Lat/Lng, inicialmente NULL
    url_documento       VARCHAR(500)        NULL,
    fecha_creacion      DATETIME            NOT NULL DEFAULT GETDATE(),
    fecha_actualizacion DATETIME            NOT NULL DEFAULT GETDATE(),

    -- FK → usuarios (1:1)
    CONSTRAINT FK_perfil_productor_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,

    -- Garantizar relación 1:1
    CONSTRAINT UQ_perfil_productor_usuario UNIQUE (usuario_id),

    -- Restricción: tipo_productor
    CONSTRAINT CHK_perfil_productor_tipo CHECK (tipo_productor IN (N'Individual', N'Asociación', N'Cooperativa')),

    -- Restricción: tipo_documento
    CONSTRAINT CHK_perfil_productor_tipo_doc CHECK (tipo_documento IN ('CI', 'Registro', 'Certificado')),

    -- Restricción: años de experiencia no negativo
    CONSTRAINT CHK_perfil_productor_experiencia CHECK (anios_experiencia >= 0)
);
GO

-- Índice espacial para consultas geográficas eficientes
CREATE SPATIAL INDEX IX_perfil_productor_ubicacion
    ON perfil_productor(ubicacion_gps)
    USING GEOGRAPHY_AUTO_GRID;
GO

CREATE NONCLUSTERED INDEX IX_perfil_productor_usuario ON perfil_productor(usuario_id);
GO


-- ============================================================
-- 3. TABLA: PERFIL_COMPRADOR (Relación 1:1 con Usuarios)
-- ============================================================
-- Extiende la información de los usuarios con rol COMPRADOR.
-- nombre_negocio es NULL cuando tipo_comprador = 'Persona natural'.
-- ============================================================

CREATE TABLE perfil_comprador (
    id                  UNIQUEIDENTIFIER    NOT NULL DEFAULT NEWID() PRIMARY KEY,
    usuario_id          UNIQUEIDENTIFIER    NOT NULL,
    tipo_comprador      VARCHAR(50)         NOT NULL,
    nombre_negocio      VARCHAR(150)        NULL,       -- NULL si tipo_comprador = 'Persona natural'
    ciudad_principal    VARCHAR(100)        NOT NULL,
    fecha_creacion      DATETIME            NOT NULL DEFAULT GETDATE(),
    fecha_actualizacion DATETIME            NOT NULL DEFAULT GETDATE(),

    -- FK → usuarios (1:1)
    CONSTRAINT FK_perfil_comprador_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,

    -- Garantizar relación 1:1
    CONSTRAINT UQ_perfil_comprador_usuario UNIQUE (usuario_id),

    -- Restricción: tipo_comprador
    CONSTRAINT CHK_perfil_comprador_tipo CHECK (tipo_comprador IN ('Persona natural', 'Negocio', 'Empresa'))
);
GO

CREATE NONCLUSTERED INDEX IX_perfil_comprador_usuario ON perfil_comprador(usuario_id);
GO


-- ============================================================
-- 4. TABLA: PERFIL_TRANSPORTISTA (Relación 1:1 con Usuarios)
-- ============================================================
-- Extiende la información de los usuarios con rol TRANSPORTISTA.
-- ============================================================

CREATE TABLE perfil_transportista (
    id                      UNIQUEIDENTIFIER    NOT NULL DEFAULT NEWID() PRIMARY KEY,
    usuario_id              UNIQUEIDENTIFIER    NOT NULL,
    tipo_transporte         VARCHAR(50)         NOT NULL,
    capacidad_carga_kg      DECIMAL(10,2)       NOT NULL,
    zona_operacion          VARCHAR(50)         NOT NULL,
    numero_licencia         VARCHAR(100)        NOT NULL,
    placa_vehiculo          VARCHAR(20)         NOT NULL,
    tipo_documento_subido   VARCHAR(50)         NOT NULL,
    url_documento           VARCHAR(500)        NULL,
    fecha_creacion          DATETIME            NOT NULL DEFAULT GETDATE(),
    fecha_actualizacion     DATETIME            NOT NULL DEFAULT GETDATE(),

    -- FK → usuarios (1:1)
    CONSTRAINT FK_perfil_transportista_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,

    -- Garantizar relación 1:1
    CONSTRAINT UQ_perfil_transportista_usuario UNIQUE (usuario_id),

    -- Placa debe ser única en el sistema
    CONSTRAINT UQ_perfil_transportista_placa UNIQUE (placa_vehiculo),

    -- Restricción: tipo_transporte
    CONSTRAINT CHK_perfil_transportista_tipo CHECK (tipo_transporte IN (N'Camión', 'Camioneta', 'Moto', 'Otro')),

    -- Restricción: zona_operacion
    CONSTRAINT CHK_perfil_transportista_zona CHECK (zona_operacion IN ('Local', 'Regional', 'Departamental')),

    -- Restricción: tipo_documento_subido
    CONSTRAINT CHK_perfil_transportista_tipo_doc CHECK (tipo_documento_subido IN ('Licencia', 'SOAT', 'Registro')),

    -- Restricción: capacidad de carga positiva
    CONSTRAINT CHK_perfil_transportista_carga CHECK (capacidad_carga_kg > 0)
);
GO

CREATE NONCLUSTERED INDEX IX_perfil_transportista_usuario ON perfil_transportista(usuario_id);
GO


-- ============================================================
-- FIN DEL DDL — Épica 1: Gestión de Identidad y Roles
-- ============================================================


-- =================================================================
-- ÉPICA 2: CATÁLOGO E INVENTARIO DINÁMICO
-- =================================================================

-- 1. Tabla: Cosechas (US05 y US06)
CREATE TABLE Cosechas (
    id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    
    productor_id UNIQUEIDENTIFIER NOT NULL, 
    
    nombre_producto VARCHAR(150) NOT NULL,
    descripcion TEXT NULL,
    foto_url VARCHAR(500) NULL,
    
    cantidad_disponible DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    unidad_medida VARCHAR(50) NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    fecha_disponibilidad DATE NOT NULL,
    estado_publicacion VARCHAR(50) NOT NULL DEFAULT 'Activo',
    
    -- Regla de Negocio (US06): Columna calculada para determinar si es Preventa
    -- Si la fecha de disponibilidad es mayor a la fecha actual, será 1 (Preventa), caso contrario 0.
    es_preventa AS (CASE WHEN fecha_disponibilidad > CAST(GETDATE() AS DATE) THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END),

    -- Restricciones
    CONSTRAINT FK_Cosechas_Productor FOREIGN KEY (productor_id) 
        REFERENCES perfil_productor(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
        
    CONSTRAINT CHK_Cosechas_UnidadMedida CHECK (unidad_medida IN ('Quintal', 'Arroba')),
    
    CONSTRAINT CHK_Cosechas_EstadoPublicacion CHECK (estado_publicacion IN ('Activo', 'Pausado', 'Agotado'))
);
GO

-- 2. Tabla: Precios_Mercado_Abasto (US09)
CREATE TABLE Precios_Mercado_Abasto (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre_producto VARCHAR(150) NOT NULL,
    precio_promedio_bs DECIMAL(10, 2) NOT NULL,
    fecha_actualizacion DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE)
);
GO

-- Índices recomendados para optimizar las consultas de catálogos y reportes
CREATE NONCLUSTERED INDEX IX_Cosechas_Productor ON Cosechas(productor_id);
CREATE NONCLUSTERED INDEX IX_Cosechas_Estado_Fecha ON Cosechas(estado_publicacion, fecha_disponibilidad);
CREATE NONCLUSTERED INDEX IX_PreciosMercado_Nombre_Fecha ON Precios_Mercado_Abasto(nombre_producto, fecha_actualizacion);
GO

-- =================================================================
-- ÉPICA 3: GESTIÓN DE PEDIDOS (US10, US11)
-- =================================================================

-- 1. Tabla: Pedidos
CREATE TABLE Pedidos (
    id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    comprador_id UNIQUEIDENTIFIER NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    fecha_pedido DATETIME NOT NULL DEFAULT GETDATE(),
    notas TEXT NULL,

    CONSTRAINT FK_Pedidos_Comprador FOREIGN KEY (comprador_id)
        REFERENCES usuarios(id),

    CONSTRAINT CHK_Pedidos_Estado CHECK (estado IN ('PENDIENTE','CONFIRMADO','RECHAZADO','ENVIADO','ENTREGADO','CANCELADO'))
);
GO

-- 2. Tabla: Detalle_Pedidos
CREATE TABLE Detalle_Pedidos (
    id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    pedido_id UNIQUEIDENTIFIER NOT NULL,
    cosecha_id UNIQUEIDENTIFIER NOT NULL,
    cantidad DECIMAL(10, 2) NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,

    CONSTRAINT FK_Detalle_Pedido FOREIGN KEY (pedido_id)
        REFERENCES Pedidos(id) ON DELETE CASCADE,

    CONSTRAINT FK_Detalle_Cosecha FOREIGN KEY (cosecha_id)
        REFERENCES Cosechas(id)
);
GO

CREATE NONCLUSTERED INDEX IX_Pedidos_Comprador ON Pedidos(comprador_id);
CREATE NONCLUSTERED INDEX IX_Pedidos_Estado ON Pedidos(estado);
CREATE NONCLUSTERED INDEX IX_DetallePedidos_Pedido ON Detalle_Pedidos(pedido_id);
GO
