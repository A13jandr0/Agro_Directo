// ============================================================
// Conexión a SQL Server — AgroDirecto Santa Cruz
// ============================================================
const sql = require('mssql');

const dbConfig = {
    user: 'sa',
    password: 'pumari14',
    server: 'localhost',
    database: 'AgroDirecto_Santa_Cruz_1',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

// Pool de conexión reutilizable
let pool = null;

const getPool = async () => {
    if (!pool) {
        pool = await sql.connect(dbConfig);
    }
    return pool;
};

const connectDB = async () => {
    try {
        await getPool();
        console.log(`✅ Conexión exitosa a SQL Server (${dbConfig.database})`);
    } catch (error) {
        console.error('❌ Error al conectar con SQL Server:', error.message);
        process.exit(1);
    }
};

module.exports = { sql, connectDB, getPool };
