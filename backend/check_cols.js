const { getPool } = require('./src/db'); 
async function check() { 
  try { 
    const pool = await getPool(); 
    const resC = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Cosechas'"); 
    console.log('Cosechas cols:', resC.recordset.map(r => r.COLUMN_NAME)); 
    const resDP = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Detalle_Pedidos'"); 
    console.log('Detalle_Pedidos cols:', resDP.recordset.map(r => r.COLUMN_NAME)); 
    process.exit(0); 
  } catch(e) { 
    console.error(e); process.exit(1); 
  } 
} 
check();
