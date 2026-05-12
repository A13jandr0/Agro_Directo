const { getPool, sql } = require('./src/db');
(async () => {
    try {
        const pool = await getPool();
        const data = await pool.request()
            .query("SELECT COLUMN_NAME, NUMERIC_PRECISION, NUMERIC_SCALE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Cosechas' AND DATA_TYPE = 'decimal'");
        console.table(data.recordset);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
