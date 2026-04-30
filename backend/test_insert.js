const { sql, connectDB } = require('./src/db.js');

async function test() {
    await connectDB();
    const pool = await sql.connect();
    try {
        await pool.request().query("DELETE FROM Usuarios WHERE Correo = 'test@test.com'");
        const query = `
            SET NOCOUNT ON;
            INSERT INTO Usuarios (NombreCompleto, Correo, ContrasenaHash, Celular, Rol, AceptaTerminos, AceptaPrivacidad)
            VALUES ('Test', 'test@test.com', 'hash', '123', 'Productor', 1, 1);
            SELECT Id, Estado FROM Usuarios WHERE Id = @@IDENTITY;
        `;
        const result = await pool.request().query(query);
        console.log("RESULT OBJECT:", JSON.stringify(result, null, 2));
    } catch (err) {
        console.error("ERROR:", err);
    }
    process.exit(0);
}
test();
