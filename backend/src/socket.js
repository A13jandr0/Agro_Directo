const socketIo = require('socket.io');

let io;

module.exports = {
    init: (httpServer) => {
        io = socketIo(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST", "PUT", "DELETE"]
            }
        });
        
        io.on('connection', (socket) => {
            console.log('Cliente conectado a WebSockets:', socket.id);
            
            // El cliente debe emitir este evento al conectarse, enviando su ID
            socket.on('join_room', (usuarioId) => {
                if (usuarioId) {
                    socket.join(usuarioId);
                    console.log(`Usuario ${usuarioId} se unió a su room personal.`);
                }
            });

            socket.on('disconnect', () => {
                console.log('Cliente desconectado:', socket.id);
            });
        });
        
        return io;
    },
    getIo: () => {
        if (!io) {
            throw new Error("Socket.io no está inicializado!");
        }
        return io;
    }
};
