const { sql, getPool } = require('./src/config/db');

async function testQuery() {
    try {
        const pool = await getPool();
        const id = '15F8620C-D0DC-4C2B-9342-F67132E49D87'.toLowerCase();
        
        console.log('Test 1: Query simple...');
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query('SELECT * FROM Pedidos WHERE id = @id');
        console.log('Resultado Query simple:', result.recordset);

        console.log('\nTest 2: Query con JOINs...');
        const result2 = await pool.request()
            .input('pedido_id', sql.UniqueIdentifier, id)
            .query(`
                SELECT 
                    p.id, p.estado, p.monto_total, p.fecha_pedido,
                    p.modalidad_entrega, p.direccion_entrega,
                    p.comprobante_url, p.motivo_rechazo_pago,
                    up.nombre_completo AS productor_nombre,
                    up.qr_banco_url, up.nombre_banco, up.titular_banco,
                    uc.nombre_completo AS comprador_nombre,
                    uc.celular AS comprador_celular
                FROM Pedidos p
                INNER JOIN usuarios uc ON p.comprador_id = uc.id
                LEFT JOIN Detalle_Pedidos dp ON dp.pedido_id = p.id
                LEFT JOIN Cosechas c ON dp.cosecha_id = c.id
                LEFT JOIN perfil_productor pp ON c.productor_id = pp.id
                LEFT JOIN usuarios up ON pp.usuario_id = up.id
                WHERE p.id = @pedido_id
            `);
        console.log('Resultado JOINs:', result2.recordset);

    } catch (error) {
        console.error('=== ERROR TEST ===');
        console.error('Mensaje:', error.message);
        console.error('SQL Number:', error.number);
        console.error('Stack:', error.stack);
    } finally {
        process.exit();
    }
}

testQuery();
