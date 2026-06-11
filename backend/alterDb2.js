const { getPool } = require('./src/config/db');

async function alter() {
    try {
        const pool = await getPool();
        
        // Ensure fecha_pago exists
        try {
            await pool.request().query(`
                ALTER TABLE Pedidos 
                ADD fecha_pago DATETIME NULL;
            `);
            console.log('Agregada columna fecha_pago a Pedidos');
        } catch (e) {
            console.log('fecha_pago ya existe o error:', e.message);
        }
        
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
}

alter();
