const { sql, getPool } = require('./src/db');
async function run() {
    try {
        const pool = await getPool();
        await pool.query(`
            ALTER TABLE Pedidos 
            ADD modalidad_entrega VARCHAR(30) NULL
                CONSTRAINT CHK_Pedidos_Modalidad 
                CHECK (modalidad_entrega IN (
                'RETIRO_FINCA', 
                'ENVIO_DOMICILIO'
                ));
            
            ALTER TABLE Pedidos
            ADD direccion_entrega VARCHAR(300) NULL;
        `);
        console.log("Migration applied");
    } catch(e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
run();
