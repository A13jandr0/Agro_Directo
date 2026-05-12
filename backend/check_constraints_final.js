const { getPool, sql } = require('./src/db');

(async () => {
    try {
        const pool = await getPool();
        const constraints = await pool.request().query(`
            SELECT cc.name, cc.definition 
            FROM sys.check_constraints cc
            WHERE parent_object_id = OBJECT_ID('Cosechas')
        `);
        console.table(constraints.recordset);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
