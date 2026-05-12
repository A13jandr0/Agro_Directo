const { connectDB, getPool, sql } = require('./src/db');

(async () => {
  await connectDB();
  const pool = await getPool();

  try {
    await pool.request().query(`
      CREATE TABLE Pedidos (
        id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        comprador_id UNIQUEIDENTIFIER NOT NULL,
        estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
        fecha_pedido DATETIME NOT NULL DEFAULT GETDATE(),
        notas TEXT NULL,
        CONSTRAINT FK_Pedidos_Comprador FOREIGN KEY (comprador_id) REFERENCES usuarios(id),
        CONSTRAINT CHK_Pedidos_Estado CHECK (estado IN ('PENDIENTE','CONFIRMADO','RECHAZADO','ENVIADO','ENTREGADO','CANCELADO'))
      )
    `);
    console.log('Tabla Pedidos creada');
  } catch (e) {
    console.log('Pedidos:', e.message);
  }

  try {
    await pool.request().query(`
      CREATE TABLE Detalle_Pedidos (
        id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        pedido_id UNIQUEIDENTIFIER NOT NULL,
        cosecha_id UNIQUEIDENTIFIER NOT NULL,
        cantidad DECIMAL(10, 2) NOT NULL,
        precio_unitario DECIMAL(10, 2) NOT NULL,
        CONSTRAINT FK_Detalle_Pedido FOREIGN KEY (pedido_id) REFERENCES Pedidos(id) ON DELETE CASCADE,
        CONSTRAINT FK_Detalle_Cosecha FOREIGN KEY (cosecha_id) REFERENCES Cosechas(id)
      )
    `);
    console.log('Tabla Detalle_Pedidos creada');
  } catch (e) {
    console.log('Detalle_Pedidos:', e.message);
  }

  process.exit(0);
})();
