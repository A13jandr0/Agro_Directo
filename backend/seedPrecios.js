const { sql, connectDB, getPool } = require('./src/db');

async function seed() {
  try {
    await connectDB();
    const pool = await getPool();
    await pool.request().query(`
      INSERT INTO Precios_Mercado_Abasto (nombre_producto, precio_promedio, unidad_medida)
      VALUES 
      ('Tomate perita orgánico', 35.00, 'Caja'),
      ('Achachairú fresco', 25.00, 'Kilogramo'),
      ('Soya Grano de Oro', 115.00, 'Quintal'),
      ('Maíz Amarillo Duro', 90.00, 'Quintal'),
      ('Sorgo Forrajero', 75.00, 'Quintal')
    `);
    console.log('Mock data insertada');
    process.exit(0);
  } catch(e) {
    console.log('La data ya existe o hubo un error', e.message);
    process.exit(0);
  }
}
seed();
