const { getPool, sql } = require('./src/db');

(async () => {
    try {
        const pool = await getPool();
        const data = await pool.request()
            .query("SELECT COLUMN_NAME, COLUMN_DEFAULT, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Cosechas' AND COLUMN_NAME = 'es_organico'");
        console.table(data.recordset);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
