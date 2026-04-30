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
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'AgroDirecto_Santa_Cruz')
BEGIN
    ALTER DATABASE AgroDirecto_Santa_Cruz SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE AgroDirecto_Santa_Cruz;
END
GO

CREATE DATABASE AgroDirecto_Santa_Cruz;
GO

USE AgroDirecto_Santa_Cruz;
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
    CONSTRAINT CHK_usuarios_rol CHECK (rol IN ('PRODUCTOR', 'COMPRADOR', 'TRANSPORTISTA')),

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
