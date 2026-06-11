-- Migración US05: categoría obligatoria en Cosechas (bases existentes)
USE AgroDirecto_Santa_Cruz_1;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.Cosechas') AND name = N'categoria'
)
BEGIN
    ALTER TABLE Cosechas ADD categoria VARCHAR(50) NULL;
    UPDATE Cosechas SET categoria = N'Verduras' WHERE categoria IS NULL;
    ALTER TABLE Cosechas ALTER COLUMN categoria VARCHAR(50) NOT NULL;

    IF NOT EXISTS (
        SELECT 1 FROM sys.check_constraints WHERE name = N'CHK_Cosechas_Categoria'
    )
    BEGIN
        ALTER TABLE Cosechas ADD CONSTRAINT CHK_Cosechas_Categoria
            CHECK (categoria IN ('Verduras', 'Frutas', 'Granos', 'Tubérculos'));
    END
END
GO

-- Descripción y foto obligatorias (US05)
IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.Cosechas') AND name = N'descripcion' AND is_nullable = 1
)
BEGIN
    UPDATE Cosechas SET descripcion = N'Sin descripción' WHERE descripcion IS NULL OR LTRIM(RTRIM(CAST(descripcion AS VARCHAR(MAX)))) = '';
    ALTER TABLE Cosechas ALTER COLUMN descripcion TEXT NOT NULL;
END
GO

IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.Cosechas') AND name = N'foto_url' AND is_nullable = 1
)
BEGIN
    -- Solo forzar NOT NULL si no hay filas sin foto
    IF NOT EXISTS (SELECT 1 FROM Cosechas WHERE foto_url IS NULL OR LTRIM(foto_url) = '')
    BEGIN
        ALTER TABLE Cosechas ALTER COLUMN foto_url VARCHAR(500) NOT NULL;
    END
END
GO
