const { getPool, sql } = require('./src/db');

(async () => {
    try {
        const pool = await getPool();
        const tableInfo = await pool.request()
            .query("SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Cosechas'");
        console.log('--- TABLA Cosechas ---');
        console.table(tableInfo.recordset);
        
        const existingTables = await pool.request()
            .query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'");
        console.log('--- TODAS LAS TABLAS ---');
        console.log(existingTables.recordset.map(t => t.TABLE_NAME));
        
        process.exit(0);
    } catch (err) {
        console.error('ERROR AL CONECTAR:', err);
        process.exit(1);
    }
})();
