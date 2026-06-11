-- Migración 005: Flujos de interacción cross-role (US04, US10-US11, US25)
USE AgroDirecto_Santa_Cruz_1;
GO

-- motivo_rechazo en usuarios (verificación admin)
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('usuarios') AND name = 'motivo_rechazo')
    ALTER TABLE usuarios ADD motivo_rechazo VARCHAR(500) NULL;
GO

-- Columnas logística y pago en Pedidos
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Pedidos') AND name = 'modalidad_entrega')
    ALTER TABLE Pedidos ADD modalidad_entrega VARCHAR(30) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Pedidos') AND name = 'direccion_entrega')
    ALTER TABLE Pedidos ADD direccion_entrega VARCHAR(300) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Pedidos') AND name = 'transportista_id')
    ALTER TABLE Pedidos ADD transportista_id UNIQUEIDENTIFIER NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Pedidos') AND name = 'firma_comprador_url')
    ALTER TABLE Pedidos ADD firma_comprador_url VARCHAR(500) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Pedidos') AND name = 'motivo_rechazo_pago')
    ALTER TABLE Pedidos ADD motivo_rechazo_pago VARCHAR(500) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Pedidos') AND name = 'fecha_actualizacion')
    ALTER TABLE Pedidos ADD fecha_actualizacion DATETIME NOT NULL DEFAULT GETDATE();
GO

-- pedido_id en notificaciones
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('notificaciones_app') AND name = 'pedido_id')
    ALTER TABLE notificaciones_app ADD pedido_id UNIQUEIDENTIFIER NULL;
GO

-- Ampliar estados de pedido
IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CHK_Pedidos_Estado')
    ALTER TABLE Pedidos DROP CONSTRAINT CHK_Pedidos_Estado;
GO

ALTER TABLE Pedidos ADD CONSTRAINT CHK_Pedidos_Estado CHECK (estado IN (
    'PENDIENTE_CONFIRMACION', 'PENDIENTE', 'COMPROBANTE_ENVIADO', 'PAGADO',
    'LISTO_PARA_DESPACHO', 'CONFIRMADO', 'RECHAZADO', 'EN_CAMINO', 'ENVIADO',
    'ENTREGADO', 'CANCELADO', 'PENDIENTE_SALDO'
));
GO
