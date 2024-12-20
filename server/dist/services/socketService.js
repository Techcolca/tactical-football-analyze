"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const User_1 = require("../models/User");
const authService_1 = require("./authService");
class SocketService {
    constructor(server) {
        this.rooms = new Map();
        this.userSockets = new Map(); // userId -> socketId
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.CLIENT_URL || 'http://localhost:3000',
                methods: ['GET', 'POST'],
                credentials: true
            }
        });
        this.setupSocketHandlers();
    }
    setupSocketHandlers() {
        this.io.on('connection', async (socket) => {
            try {
                // Autenticar usuario
                const token = socket.handshake.auth.token;
                if (!token) {
                    throw new Error('No token provided');
                }
                const userData = await (0, authService_1.verifyToken)(token);
                if (!userData) {
                    throw new Error('Invalid token');
                }
                const user = {
                    id: userData.id,
                    name: userData.name,
                    role: userData.role,
                    socketId: socket.id,
                    isActive: true
                };
                // Manejar unión a sala
                socket.on('joinRoom', async (roomId) => {
                    await this.handleJoinRoom(socket, user, roomId);
                });
                // Manejar cambios en la formación
                socket.on('formationUpdate', async (data) => {
                    await this.handleFormationUpdate(socket, user, data);
                });
                // Manejar mensajes de chat
                socket.on('chatMessage', async (data) => {
                    await this.handleChatMessage(socket, user, data);
                });
                // Manejar cambios en el análisis
                socket.on('analysisUpdate', async (data) => {
                    await this.handleAnalysisUpdate(socket, user, data);
                });
                // Manejar cursor/puntero en tiempo real
                socket.on('cursorMove', (data) => {
                    this.handleCursorMove(socket, user, data);
                });
                // Manejar dibujos tácticos
                socket.on('tacticalDraw', (data) => {
                    this.handleTacticalDraw(socket, user, data);
                });
                // Manejar desconexión
                socket.on('disconnect', () => {
                    this.handleDisconnect(user);
                });
            }
            catch (error) {
                console.error('Socket connection error:', error);
                socket.disconnect();
            }
        });
    }
    async handleJoinRoom(socket, user, roomId) {
        try {
            let room = this.rooms.get(roomId);
            if (!room) {
                // Crear nueva sala si no existe
                room = {
                    id: roomId,
                    name: `Sala de Análisis ${roomId}`,
                    createdBy: user.id,
                    users: [],
                    chat: [],
                    permissions: {
                        [user.id]: {
                            canEdit: true,
                            canChat: true,
                            canInvite: true
                        }
                    }
                };
                this.rooms.set(roomId, room);
            }
            // Verificar permisos
            if (!room.permissions[user.id]) {
                room.permissions[user.id] = {
                    canEdit: user.role === User_1.UserRole.COACH || user.role === User_1.UserRole.ANALYST,
                    canChat: true,
                    canInvite: user.role === User_1.UserRole.COACH
                };
            }
            // Unir usuario a la sala
            socket.join(roomId);
            room.users.push(user);
            this.userSockets.set(user.id, socket.id);
            // Notificar a todos los usuarios en la sala
            this.io.to(roomId).emit('userJoined', {
                user: {
                    id: user.id,
                    name: user.name,
                    role: user.role
                },
                message: `${user.name} se ha unido a la sala`
            });
            // Enviar estado actual de la sala al usuario
            socket.emit('roomState', {
                room: {
                    ...room,
                    users: room.users.map(u => ({
                        id: u.id,
                        name: u.name,
                        role: u.role,
                        isActive: u.isActive
                    }))
                }
            });
        }
        catch (error) {
            console.error('Error joining room:', error);
            socket.emit('error', { message: 'Error al unirse a la sala' });
        }
    }
    async handleFormationUpdate(socket, user, data) {
        var _a;
        try {
            const room = this.rooms.get(data.roomId);
            if (!room)
                return;
            if (!((_a = room.permissions[user.id]) === null || _a === void 0 ? void 0 : _a.canEdit)) {
                throw new Error('No tienes permisos para editar');
            }
            room.formation = data.formation;
            room.users.find(u => u.id === user.id).lastAction = 'formation_update';
            this.io.to(data.roomId).emit('formationUpdated', {
                formation: data.formation,
                updatedBy: {
                    id: user.id,
                    name: user.name
                }
            });
        }
        catch (error) {
            console.error('Error updating formation:', error);
            socket.emit('error', { message: 'Error al actualizar la formación' });
        }
    }
    async handleChatMessage(socket, user, data) {
        var _a;
        try {
            const room = this.rooms.get(data.roomId);
            if (!room)
                return;
            if (!((_a = room.permissions[user.id]) === null || _a === void 0 ? void 0 : _a.canChat)) {
                throw new Error('No tienes permisos para chatear');
            }
            const message = {
                id: Date.now().toString(),
                userId: user.id,
                userName: user.name,
                content: data.content,
                timestamp: new Date(),
                type: 'text'
            };
            room.chat.push(message);
            this.io.to(data.roomId).emit('newChatMessage', message);
        }
        catch (error) {
            console.error('Error sending chat message:', error);
            socket.emit('error', { message: 'Error al enviar mensaje' });
        }
    }
    async handleAnalysisUpdate(socket, user, data) {
        var _a;
        try {
            const room = this.rooms.get(data.roomId);
            if (!room)
                return;
            if (!((_a = room.permissions[user.id]) === null || _a === void 0 ? void 0 : _a.canEdit)) {
                throw new Error('No tienes permisos para editar el análisis');
            }
            room.analysis = data.analysis;
            room.users.find(u => u.id === user.id).lastAction = 'analysis_update';
            this.io.to(data.roomId).emit('analysisUpdated', {
                analysis: data.analysis,
                updatedBy: {
                    id: user.id,
                    name: user.name
                }
            });
        }
        catch (error) {
            console.error('Error updating analysis:', error);
            socket.emit('error', { message: 'Error al actualizar el análisis' });
        }
    }
    handleCursorMove(socket, user, data) {
        this.io.to(data.roomId).emit('cursorMoved', {
            userId: user.id,
            userName: user.name,
            position: { x: data.x, y: data.y }
        });
    }
    handleTacticalDraw(socket, user, data) {
        this.io.to(data.roomId).emit('tacticalDrawUpdate', {
            userId: user.id,
            userName: user.name,
            path: data.path
        });
    }
    handleDisconnect(user) {
        this.userSockets.delete(user.id);
        // Actualizar estado en todas las salas donde estaba el usuario
        this.rooms.forEach((room, roomId) => {
            const userInRoom = room.users.find(u => u.id === user.id);
            if (userInRoom) {
                userInRoom.isActive = false;
                this.io.to(roomId).emit('userLeft', {
                    userId: user.id,
                    message: `${user.name} se ha desconectado`
                });
            }
        });
    }
    // Métodos públicos para gestión de salas
    getRoomState(roomId) {
        return this.rooms.get(roomId);
    }
    getUsersInRoom(roomId) {
        const room = this.rooms.get(roomId);
        return (room === null || room === void 0 ? void 0 : room.users.filter(u => u.isActive)) || [];
    }
    broadcastToRoom(roomId, event, data) {
        this.io.to(roomId).emit(event, data);
    }
}
exports.SocketService = SocketService;
//# sourceMappingURL=socketService.js.map