const { getPool } = require('./src/config/db');

async function test() {
    try {
        const pool = await getPool();
        const res = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Pedidos'");
        console.log(JSON.stringify(res.recordset.map(r => r.COLUMN_NAME), null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

test();
