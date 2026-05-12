const { getPool, sql } = require('./src/db');

(async () => {
    try {
        const pool = await getPool();
        console.log("🚀 Testing Mi Catalogo Select query...");
        
        // Mimic exactly the controller query for mi-catalogo
        const res = await pool.request().query(`
            SELECT TOP 5 c.*, c.es_preventa 
            FROM Cosechas c
        `);
        
        console.log("✅ QUERY SUCCESSFUL!");
        console.log(`Retrieved ${res.recordset.length} rows.`);
        console.table(res.recordset.map(r => ({ id: r.id, nombre: r.nombre_producto, es_preventa: r.es_preventa })));
        process.exit(0);
    } catch (err) {
        console.error("❌ SELECT FAILED AGAIN:", err.message);
        process.exit(1);
    }
})();
