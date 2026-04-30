const { sql, connectDB } = require('./src/db.js');

async function clear() {
    try {
        await connectDB();
        const pool = await sql.connect();
        
        await pool.request().query('DELETE FROM Productores;');
        await pool.request().query('DELETE FROM Compradores;');
        await pool.request().query('DELETE FROM Transportistas;');
        await pool.request().query('DELETE FROM Usuarios;');
        await pool.request().query('DBCC CHECKIDENT ([Usuarios], RESEED, 0);');
        
        console.log('✅ Base de datos limpiada correctamente. Lista para pruebas.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
clear();
