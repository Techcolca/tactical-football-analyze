import { Socket } from 'socket.io';

interface Room {
  id: string;
  name: string;
  users: User[];
  tacticalState: any;
}

interface User {
  id: string;
  name: string;
  role: 'coach' | 'assistant' | 'viewer';
  socket: Socket;
}

class RoomService {
  private rooms: Map<string, Room> = new Map();

  createRoom(roomId: string, name: string): Room {
    const room: Room = {
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

  joinRoom(roomId: string, user: User): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

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

  leaveRoom(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const userIndex = room.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    room.users.splice(userIndex, 1);
    
    this.broadcastToRoom(roomId, 'user:left', { userId });

    if (room.users.length === 0) {
      this.rooms.delete(roomId);
    }

    return true;
  }

  updateTacticalState(roomId: string, newState: any, userId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const user = room.users.find(u => u.id === userId);
    if (!user || user.role === 'viewer') return false;

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

  private broadcastToRoom(roomId: string, event: string, data: any) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.users.forEach(user => {
      user.socket.emit(event, data);
    });
  }
}

export const roomService = new RoomService();
