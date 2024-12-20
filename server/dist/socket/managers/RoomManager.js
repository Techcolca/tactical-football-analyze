"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
class RoomManager {
    constructor(io) {
        this.rooms = new Map();
        this.io = io;
    }
    createRoom(roomData) {
        if (this.rooms.has(roomData.id)) {
            throw new Error('Room already exists');
        }
        const room = {
            id: roomData.id,
            name: roomData.name,
            createdBy: roomData.createdBy,
            users: [],
            formation: roomData.formation,
            analysis: {
                id: `analysis_${roomData.id}`,
                title: 'Initial Analysis',
                description: '',
                tags: [],
                version: 1
            },
            messages: [],
            lastUpdate: Date.now()
        };
        this.rooms.set(room.id, room);
        return room;
    }
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }
    addUserToRoom(roomId, user) {
        const room = this.getRoom(roomId);
        if (!room) {
            throw new Error('Room not found');
        }
        // Verificar si el usuario ya está en la sala
        const existingUser = room.users.find(u => u.id === user.id);
        if (existingUser) {
            // Actualizar el estado del usuario existente
            existingUser.isActive = true;
            existingUser.lastAction = null;
            existingUser.lastActionTimestamp = Date.now();
        }
        else {
            // Agregar nuevo usuario
            room.users.push({
                ...user,
                isActive: true,
                lastAction: null,
                lastActionTimestamp: Date.now()
            });
        }
        // Notificar a todos los usuarios en la sala
        this.io.to(roomId).emit('user:joined', {
            user: existingUser || user,
            timestamp: Date.now()
        });
    }
    removeUserFromRoom(roomId, userId) {
        const room = this.getRoom(roomId);
        if (!room) {
            throw new Error('Room not found');
        }
        const userIndex = room.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return;
        }
        // Marcar al usuario como inactivo en lugar de eliminarlo
        room.users[userIndex].isActive = false;
        room.users[userIndex].lastActionTimestamp = Date.now();
        // Notificar a todos los usuarios en la sala
        this.io.to(roomId).emit('user:left', {
            userId,
            timestamp: Date.now()
        });
        // Si no quedan usuarios activos, programar la limpieza de la sala
        if (!room.users.some(u => u.isActive)) {
            this.scheduleRoomCleanup(roomId);
        }
    }
    updateUserStatus(roomId, userId, action) {
        const room = this.getRoom(roomId);
        if (!room) {
            throw new Error('Room not found');
        }
        const user = room.users.find(u => u.id === userId);
        if (!user) {
            throw new Error('User not found in room');
        }
        user.lastAction = action;
        user.lastActionTimestamp = Date.now();
        // Notificar a todos los usuarios en la sala
        this.io.to(roomId).emit('user:action', {
            userId,
            action,
            timestamp: user.lastActionTimestamp
        });
    }
    scheduleRoomCleanup(roomId) {
        // Programar la limpieza de la sala después de 24 horas de inactividad
        setTimeout(() => {
            const room = this.getRoom(roomId);
            if (room && !room.users.some(u => u.isActive)) {
                this.rooms.delete(roomId);
            }
        }, 24 * 60 * 60 * 1000); // 24 horas
    }
    getRoomUsers(roomId) {
        const room = this.getRoom(roomId);
        if (!room) {
            throw new Error('Room not found');
        }
        return room.users;
    }
    isUserInRoom(roomId, userId) {
        const room = this.getRoom(roomId);
        if (!room) {
            return false;
        }
        return room.users.some(u => u.id === userId && u.isActive);
    }
    updateRoomFormation(roomId, formation) {
        const room = this.getRoom(roomId);
        if (!room) {
            throw new Error('Room not found');
        }
        room.formation = formation;
        room.lastUpdate = Date.now();
        // Notificar a todos los usuarios en la sala
        this.io.to(roomId).emit('formation:updated', {
            formation,
            timestamp: room.lastUpdate
        });
    }
    cleanupInactiveRooms() {
        const inactivityThreshold = 24 * 60 * 60 * 1000; // 24 horas
        const now = Date.now();
        for (const [roomId, room] of this.rooms.entries()) {
            if (!room.users.some(u => u.isActive) &&
                now - room.lastUpdate > inactivityThreshold) {
                this.rooms.delete(roomId);
            }
        }
    }
}
exports.RoomManager = RoomManager;
//# sourceMappingURL=RoomManager.js.map