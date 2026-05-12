const { getPool } = require('./src/db');

(async () => {
    try {
        const pool = await getPool();
        console.log("🚀 Updating CHK_Cosechas_UnidadMedida constraint...");
        
        // 1. Drop the old restriction
        await pool.request().query(`
            IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CHK_Cosechas_UnidadMedida')
            BEGIN
                ALTER TABLE Cosechas DROP CONSTRAINT CHK_Cosechas_UnidadMedida;
                PRINT 'Dropped old constraint.';
            END
        `);
        
        // 2. Create new inclusive restriction
        await pool.request().query(`
            ALTER TABLE Cosechas 
            ADD CONSTRAINT CHK_Cosechas_UnidadMedida 
            CHECK (unidad_medida IN ('Quintal', 'Arroba', 'Kilogramo', 'Unidad', 'Caja'));
        `);
        
        console.log("✅ DB migration COMPLETED. Allowed units updated to include Kilogramo, Unidad, Caja.");
        process.exit(0);
    } catch (err) {
        console.error("❌ MIGRATION FAILED:", err.message);
        process.exit(1);
    }
})();
