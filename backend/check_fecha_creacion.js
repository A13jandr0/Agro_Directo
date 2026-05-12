const { getPool, sql } = require('./src/db');

(async () => {
    try {
        const pool = await getPool();
        const data = await pool.request()
            .query("SELECT COLUMN_NAME, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Cosechas' AND COLUMN_NAME = 'fecha_creacion'");
        console.table(data.recordset);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
