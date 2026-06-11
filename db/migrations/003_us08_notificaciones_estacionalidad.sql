-- US08: alertas de estacionalidad — suscripciones y notificaciones in-app
USE AgroDirecto_Santa_Cruz_1;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.perfil_comprador') AND name = N'notificaciones_activas'
)
BEGIN
    ALTER TABLE perfil_comprador ADD notificaciones_activas BIT NOT NULL DEFAULT 1;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = N'suscripcion_categorias_comprador')
BEGIN
    CREATE TABLE suscripcion_categorias_comprador (
        comprador_id    UNIQUEIDENTIFIER    NOT NULL,
        categoria       VARCHAR(50)         NOT NULL,
        CONSTRAINT PK_suscripcion_categorias PRIMARY KEY (comprador_id, categoria),
        CONSTRAINT FK_suscripcion_comprador FOREIGN KEY (comprador_id)
            REFERENCES usuarios(id) ON DELETE CASCADE,
        CONSTRAINT CHK_suscripcion_categoria CHECK (categoria IN ('Verduras', 'Frutas', 'Granos', 'Tubérculos'))
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = N'notificaciones_app')
BEGIN
    CREATE TABLE notificaciones_app (
        id              UNIQUEIDENTIFIER    NOT NULL DEFAULT NEWID() PRIMARY KEY,
        usuario_id      UNIQUEIDENTIFIER    NOT NULL,
        tipo            VARCHAR(50)         NOT NULL DEFAULT 'NUEVO_PRODUCTO_TEMPORADA',
        titulo          VARCHAR(200)        NOT NULL,
        mensaje         VARCHAR(500)        NOT NULL,
        cosecha_id      UNIQUEIDENTIFIER    NULL,
        leida           BIT                 NOT NULL DEFAULT 0,
        fecha_creacion  DATETIME            NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_notificaciones_usuario FOREIGN KEY (usuario_id)
            REFERENCES usuarios(id) ON DELETE CASCADE,
        CONSTRAINT FK_notificaciones_cosecha FOREIGN KEY (cosecha_id)
            REFERENCES Cosechas(id) ON DELETE SET NULL
    );
    CREATE NONCLUSTERED INDEX IX_notificaciones_usuario_leida ON notificaciones_app(usuario_id, leida);
END
GO
