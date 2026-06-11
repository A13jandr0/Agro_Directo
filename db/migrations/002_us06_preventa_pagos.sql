-- US06: pagos anticipados (40%) y saldo pendiente en pedidos
USE AgroDirecto_Santa_Cruz_1;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Pedidos') AND name = N'comprobante_url')
    ALTER TABLE Pedidos ADD comprobante_url VARCHAR(500) NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Pedidos') AND name = N'comprobante_saldo_url')
    ALTER TABLE Pedidos ADD comprobante_saldo_url VARCHAR(500) NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Pedidos') AND name = N'monto_total')
    ALTER TABLE Pedidos ADD monto_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Pedidos') AND name = N'monto_pagado_anticipo')
    ALTER TABLE Pedidos ADD monto_pagado_anticipo DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Pedidos') AND name = N'monto_saldo_pendiente')
    ALTER TABLE Pedidos ADD monto_saldo_pendiente DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Pedidos') AND name = N'saldo_pagado')
    ALTER TABLE Pedidos ADD saldo_pagado BIT NOT NULL DEFAULT 0;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Pedidos') AND name = N'notificado_saldo_disponible')
    ALTER TABLE Pedidos ADD notificado_saldo_disponible BIT NOT NULL DEFAULT 0;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Detalle_Pedidos') AND name = N'es_preventa')
    ALTER TABLE Detalle_Pedidos ADD es_preventa BIT NOT NULL DEFAULT 0;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Detalle_Pedidos') AND name = N'fecha_disponibilidad')
    ALTER TABLE Detalle_Pedidos ADD fecha_disponibilidad DATE NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Detalle_Pedidos') AND name = N'subtotal_linea')
    ALTER TABLE Detalle_Pedidos ADD subtotal_linea DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Detalle_Pedidos') AND name = N'monto_anticipo')
    ALTER TABLE Detalle_Pedidos ADD monto_anticipo DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Detalle_Pedidos') AND name = N'monto_saldo')
    ALTER TABLE Detalle_Pedidos ADD monto_saldo DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Detalle_Pedidos') AND name = N'saldo_pagado')
    ALTER TABLE Detalle_Pedidos ADD saldo_pagado BIT NOT NULL DEFAULT 0;
GO
