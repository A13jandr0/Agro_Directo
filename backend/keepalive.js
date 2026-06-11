const https = require('https');

const url = 'https://agrodirecto-api.onrender.com/api/health';

console.log('🚀 Iniciando script Keep-Alive para AgroDirecto...');
console.log(`📡 URL objetivo: ${url}`);
console.log('⏱️ Frecuencia: Cada 4 minutos');

const ping = () => {
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      const time = new Date().toLocaleTimeString('es-BO');
      if (res.statusCode === 200) {
        console.log(`✅ Backend activo - ${time}`);
      } else {
        console.log(`⚠️ Alerta: Status ${res.statusCode} - ${time}`);
      }
    });
  }).on('error', (err) => {
    const time = new Date().toLocaleTimeString('es-BO');
    console.error(`❌ Error al conectar - ${time}: ${err.message}`);
  });
};

// Ejecutar inmediatamente al iniciar
ping();

// Configurar intervalo de 4 minutos (240000 ms)
setInterval(ping, 240000);
