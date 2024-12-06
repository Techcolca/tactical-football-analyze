import { Server } from 'socket.io';
import { CollaborationRoom, RoomUser, Formation } from '../../types/collaboration';

export class RoomManager {
  private rooms: Map<string, CollaborationRoom>;
  private io: Server;

  constructor(io: Server) {
    this.rooms = new Map();
    this.io = io;
  }

  public createRoom(roomData: {
    id: string;
    name: string;
    createdBy: string;
    formation: Formation;
  }): CollaborationRoom {
    if (this.rooms.has(roomData.id)) {
      throw new Error('Room already exists');
    }

    const room: CollaborationRoom = {
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

  public getRoom(roomId: string): CollaborationRoom | undefined {
    return this.rooms.get(roomId);
  }

  public addUserToRoom(roomId: string, user: RoomUser): void {
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
    } else {
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

  public removeUserFromRoom(roomId: string, userId: string): void {
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

  public updateUserStatus(roomId: string, userId: string, action: string): void {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const user = room.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found in room');
    }

    user.lastAction = action as any;
    user.lastActionTimestamp = Date.now();

    // Notificar a todos los usuarios en la sala
    this.io.to(roomId).emit('user:action', {
      userId,
      action,
      timestamp: user.lastActionTimestamp
    });
  }

  private scheduleRoomCleanup(roomId: string): void {
    // Programar la limpieza de la sala después de 24 horas de inactividad
    setTimeout(() => {
      const room = this.getRoom(roomId);
      if (room && !room.users.some(u => u.isActive)) {
        this.rooms.delete(roomId);
      }
    }, 24 * 60 * 60 * 1000); // 24 horas
  }

  public getRoomUsers(roomId: string): RoomUser[] {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    return room.users;
  }

  public isUserInRoom(roomId: string, userId: string): boolean {
    const room = this.getRoom(roomId);
    if (!room) {
      return false;
    }
    return room.users.some(u => u.id === userId && u.isActive);
  }

  public updateRoomFormation(roomId: string, formation: Formation): void {
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

  public cleanupInactiveRooms(): void {
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
