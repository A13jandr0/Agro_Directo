const { getPool, sql } = require('./src/db');

(async () => {
    try {
        const pool = await getPool();
        
        const prodResult = await pool.request().query("SELECT TOP 1 id FROM perfil_productor");
        const productor_id = prodResult.recordset[0].id;
        
        console.log("Testing simulation with EMPTY STRING in Decimal/Date...");
        const payload = {
            nombre_producto: 'Test Cosecha Empty',
            descripcion: '',
            foto_url: null,
            cantidad_disponible: '', // EMPTY STRING
            unidad_medida: 'Quintal',
            precio_unitario: 25.00,
            fecha_disponibilidad: '2026-06-01'
        };
        
        await pool.request()
            .input('productor_id', sql.UniqueIdentifier, productor_id)
            .input('nombre_producto', sql.VarChar(150), payload.nombre_producto)
            .input('descripcion', sql.Text, payload.descripcion)
            .input('foto_url', sql.VarChar(500), payload.foto_url)
            .input('cantidad_disponible', sql.Decimal(10, 2), payload.cantidad_disponible)
            .input('unidad_medida', sql.VarChar(50), payload.unidad_medida)
            .input('precio_unitario', sql.Decimal(10, 2), payload.precio_unitario)
            .input('fecha_disponibilidad', sql.Date, payload.fecha_disponibilidad)
            .query(`
                INSERT INTO Cosechas (
                    productor_id, nombre_producto, descripcion, foto_url, 
                    cantidad_disponible, unidad_medida, precio_unitario, fecha_disponibilidad
                ) VALUES (
                    @productor_id, @nombre_producto, @descripcion, @foto_url,
                    @cantidad_disponible, @unidad_medida, @precio_unitario, @fecha_disponibilidad
                )
            `);
        
        console.log("✅ SUCCESSFUL SIMULATION (Empty Decimal worked? Wait)");
        process.exit(0);
    } catch (err) {
        console.error("❌ SIMULATION FAILED WITH ERROR:");
        console.error(err);
        process.exit(1);
    }
})();
