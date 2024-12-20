"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomService = void 0;
class RoomService {
    constructor() {
        this.rooms = new Map();
    }
    createRoom(roomId, name) {
        const room = {
            id: roomId,
            name,
            users: [],
            tacticalState: {
                formation: '4-4-2',
                players: [],
                drawings: [],
            },
        };
        this.rooms.set(roomId, room);
        return room;
    }
    joinRoom(roomId, user) {
        const room = this.rooms.get(roomId);
        if (!room)
            return false;
        room.users.push(user);
        // Notificar a todos los usuarios en la sala
        this.broadcastToRoom(roomId, 'user:joined', {
            userId: user.id,
            userName: user.name,
            role: user.role,
        });
        // Enviar el estado actual al nuevo usuario
        user.socket.emit('room:state', room.tacticalState);
        return true;
    }
    leaveRoom(roomId, userId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return false;
        const userIndex = room.users.findIndex(u => u.id === userId);
        if (userIndex === -1)
            return false;
        room.users.splice(userIndex, 1);
        this.broadcastToRoom(roomId, 'user:left', { userId });
        if (room.users.length === 0) {
            this.rooms.delete(roomId);
        }
        return true;
    }
    updateTacticalState(roomId, newState, userId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return false;
        const user = room.users.find(u => u.id === userId);
        if (!user || user.role === 'viewer')
            return false;
        room.tacticalState = {
            ...room.tacticalState,
            ...newState,
        };
        this.broadcastToRoom(roomId, 'tactical:update', {
            state: room.tacticalState,
            updatedBy: userId,
        });
        return true;
    }
    broadcastToRoom(roomId, event, data) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        room.users.forEach(user => {
            user.socket.emit(event, data);
        });
    }
}
exports.roomService = new RoomService();
//# sourceMappingURL=roomService.js.map