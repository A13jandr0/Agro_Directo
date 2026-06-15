require('dotenv').config();
const sql = require('mssql');
const { getPool } = require('./src/db');

async function updateImage() {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            UPDATE Cosechas 
            SET foto_url = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'
            WHERE foto_url LIKE '%1500937386664%';
        `);
        console.log('Filas actualizadas:', result.rowsAffected);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}
updateImage();
