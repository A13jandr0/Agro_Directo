const sql = require('mssql');
const cfg = {
  user: 'sa',
  password: 'pumari14',
  server: 'localhost',
  database: 'AgroDirecto_Santa_Cruz_1',
  options: { encrypt: false, trustServerCertificate: true, enableArithAbort: true }
};

(async () => {
  try {
    const pool = await sql.connect(cfg);
    
    // 1. Listar tablas
    const tables = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'");
    console.log('TABLAS:', tables.recordset.map(x => x.TABLE_NAME));

    // 2. Listar columnas de usuarios
    const cols = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='usuarios'");
    console.log('COLUMNAS usuarios:', cols.recordset);

    // 3. Listar triggers
    const triggers = await pool.request().query("SELECT name FROM sys.triggers");
    console.log('TRIGGERS:', triggers.recordset.map(x => x.name));

    process.exit(0);
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  }
})();
