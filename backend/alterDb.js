const { getPool } = require('./src/config/db');

async function alter() {
    try {
        const pool = await getPool();
        await pool.request().query(`
            ALTER TABLE Cosechas 
            ADD fecha_creacion DATETIME NOT NULL DEFAULT GETDATE();
        `);
        console.log("Columna agregada exitosamente.");
    } catch (error) {
        console.error("Error (quizás ya existe):", error.message);
    } finally {
        process.exit();
    }
}
alter();
