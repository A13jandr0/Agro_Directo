-- US09: datos mock Mercado Abasto (Sprint 2)
USE AgroDirecto_Santa_Cruz_1;
GO

IF NOT EXISTS (SELECT 1 FROM Precios_Mercado_Abasto WHERE nombre_producto = N'Tomate')
BEGIN
    INSERT INTO Precios_Mercado_Abasto (nombre_producto, precio_promedio_bs, fecha_actualizacion) VALUES
    (N'Tomate', 28.50, CAST(GETDATE() AS DATE)),
    (N'Papa', 18.00, CAST(GETDATE() AS DATE)),
    (N'Zanahoria', 15.50, CAST(GETDATE() AS DATE)),
    (N'Cebolla', 22.00, CAST(GETDATE() AS DATE)),
    (N'Lechuga', 12.00, CAST(GETDATE() AS DATE)),
    (N'Plátano', 20.00, CAST(GETDATE() AS DATE)),
    (N'Banana', 18.50, CAST(GETDATE() AS DATE)),
    (N'Maíz', 95.00, CAST(GETDATE() AS DATE)),
    (N'Soya', 120.00, CAST(GETDATE() AS DATE)),
    (N'Achachairú', 35.00, CAST(GETDATE() AS DATE)),
    (N'Mandarina', 25.00, CAST(GETDATE() AS DATE)),
    (N'Yuca', 14.00, CAST(GETDATE() AS DATE));
END
GO
