"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketManager = void 0;
const roomService_1 = require("../services/roomService");
class SocketManager {
    constructor(io) {
        this.io = io;
        this.setupSocketHandlers();
    }
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('Cliente conectado:', socket.id);
            socket.on('room:create', ({ roomId, name }) => {
                const room = roomService_1.roomService.createRoom(roomId, name);
                socket.emit('room:created', { roomId: room.id });
            });
            socket.on('room:join', ({ roomId, userName, role }) => {
                const success = roomService_1.roomService.joinRoom(roomId, {
                    id: socket.id,
                    name: userName,
                    role,
                    socket,
                });
                if (success) {
                    socket.join(roomId);
                    socket.emit('room:joined', { roomId });
                }
                else {
                    socket.emit('room:error', { message: 'No se pudo unir a la sala' });
                }
            });
            socket.on('tactical:update', ({ roomId, state }) => {
                const success = roomService_1.roomService.updateTacticalState(roomId, state, socket.id);
                if (!success) {
                    socket.emit('tactical:error', {
                        message: 'No se pudo actualizar el estado táctico',
                    });
                }
            });
            socket.on('disconnect', () => {
                // Buscar y eliminar al usuario de todas las salas
                this.io.sockets.adapter.rooms.forEach((_, roomId) => {
                    roomService_1.roomService.leaveRoom(roomId, socket.id);
                });
            });
            // Chat
            socket.on('chat:message', ({ roomId, message }) => {
                this.io.to(roomId).emit('chat:message', {
                    userId: socket.id,
                    message,
                    timestamp: new Date(),
                });
            });
            // Drawing
            socket.on('drawing:update', ({ roomId, drawing }) => {
                socket.to(roomId).emit('drawing:update', {
                    userId: socket.id,
                    drawing,
                });
            });
            // Formation
            socket.on('formation:change', ({ roomId, formation }) => {
                socket.to(roomId).emit('formation:change', {
                    userId: socket.id,
                    formation,
                });
            });
            // Player Movement
            socket.on('player:move', ({ roomId, playerId, position }) => {
                socket.to(roomId).emit('player:move', {
                    userId: socket.id,
                    playerId,
                    position,
                });
            });
        });
    }
}
exports.SocketManager = SocketManager;
//# sourceMappingURL=socketManager.js.map