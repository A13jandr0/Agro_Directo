-- ============================================================
-- Migración: Actualizar constraint de unidades de medida
-- Propósito: Permitir más opciones de unidades (Kg, Caja, etc.)
-- ============================================================

USE AgroDirecto_Santa_Cruz_1;
GO

-- Eliminar el constraint actual
ALTER TABLE Cosechas
DROP CONSTRAINT CHK_Cosechas_UnidadMedida;
GO

-- Crear nuevo constraint con todas las unidades soportadas
ALTER TABLE Cosechas
ADD CONSTRAINT CHK_Cosechas_UnidadMedida CHECK (unidad_medida IN ('Quintal', 'Arroba', 'Kg', 'Unidad', 'Caja', 'Bolsa', 'Litro'));
GO

PRINT '✅ Constraint actualizado exitosamente';
GO
