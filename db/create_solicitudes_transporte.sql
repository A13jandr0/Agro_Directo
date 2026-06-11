-- =================================================================
-- Tabla: solicitudes_transporte
-- =================================================================

USE AgroDirecto_Santa_Cruz_1;
GO

CREATE TABLE solicitudes_transporte (
    id                  UNIQUEIDENTIFIER    NOT NULL DEFAULT NEWID() PRIMARY KEY,
    pedido_id           UNIQUEIDENTIFIER    NOT NULL,
    transportista_id    UNIQUEIDENTIFIER    NOT NULL,
    estado_solicitud    VARCHAR(30)         NOT NULL DEFAULT 'PENDIENTE',
    origen              VARCHAR(255)        NOT NULL,
    destino             VARCHAR(255)        NOT NULL,
    descripcion_carga   TEXT                NULL,
    fecha_solicitud     DATETIME            NOT NULL DEFAULT GETDATE(),
    fecha_respuesta     DATETIME            NULL,

    CONSTRAINT FK_ST_Pedido FOREIGN KEY (pedido_id)
        REFERENCES Pedidos(id) ON DELETE CASCADE,
    CONSTRAINT FK_ST_Transportista FOREIGN KEY (transportista_id)
        REFERENCES usuarios(id),
    CONSTRAINT CHK_ST_Estado CHECK (estado_solicitud IN ('PENDIENTE', 'ACEPTADO', 'RECHAZADO'))
);
GO

CREATE NONCLUSTERED INDEX IX_ST_Pedido          ON solicitudes_transporte(pedido_id);
CREATE NONCLUSTERED INDEX IX_ST_Transportista   ON solicitudes_transporte(transportista_id);
GO
