const { getPool, sql } = require('./src/db');

(async () => {
    try {
        const pool = await getPool();
        console.log("🚀 Adding missing computed column 'es_preventa'...");
        
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Cosechas') AND name = 'es_preventa')
            BEGIN
                ALTER TABLE Cosechas 
                ADD es_preventa AS (CASE WHEN fecha_disponibilidad > CAST(GETDATE() AS DATE) THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END);
                PRINT 'Added es_preventa column.';
            END
            ELSE
            BEGIN
                PRINT 'Column es_preventa already exists.';
            END
        `);
        
        console.log("✅ Column added successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ FAILED TO ADD COLUMN:", err.message);
        process.exit(1);
    }
})();
