import { Server as SocketServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { User, UserRole } from '../models/User';
import { verifyToken } from './authService';

interface Room {
  id: string;
  name: string;
  createdBy: string;
  users: ConnectedUser[];
  formation?: any;
  analysis?: any;
  chat: ChatMessage[];
  permissions: {
    [key: string]: {
      canEdit: boolean;
      canChat: boolean;
      canInvite: boolean;
    };
  };
}

interface ConnectedUser {
  id: string;
  name: string;
  role: UserRole;
  socketId: string;
  isActive: boolean;
  lastAction?: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'system' | 'analysis';
}

export class SocketService {
  private io: SocketServer;
  private rooms: Map<string, Room> = new Map();
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', async (socket) => {
      try {
        // Autenticar usuario
        const token = socket.handshake.auth.token;
        if (!token) {
          throw new Error('No token provided');
        }

        const userData = await verifyToken(token);
        if (!userData) {
          throw new Error('Invalid token');
        }

        const user: ConnectedUser = {
          id: userData.id,
          name: userData.name,
          role: userData.role,
          socketId: socket.id,
          isActive: true
        };

        // Manejar unión a sala
        socket.on('joinRoom', async (roomId: string) => {
          await this.handleJoinRoom(socket, user, roomId);
        });

        // Manejar cambios en la formación
        socket.on('formationUpdate', async (data: { roomId: string; formation: any }) => {
          await this.handleFormationUpdate(socket, user, data);
        });

        // Manejar mensajes de chat
        socket.on('chatMessage', async (data: { roomId: string; content: string }) => {
          await this.handleChatMessage(socket, user, data);
        });

        // Manejar cambios en el análisis
        socket.on('analysisUpdate', async (data: { roomId: string; analysis: any }) => {
          await this.handleAnalysisUpdate(socket, user, data);
        });

        // Manejar cursor/puntero en tiempo real
        socket.on('cursorMove', (data: { roomId: string; x: number; y: number }) => {
          this.handleCursorMove(socket, user, data);
        });

        // Manejar dibujos tácticos
        socket.on('tacticalDraw', (data: { roomId: string; path: any }) => {
          this.handleTacticalDraw(socket, user, data);
        });

        // Manejar desconexión
        socket.on('disconnect', () => {
          this.handleDisconnect(user);
        });

      } catch (error) {
        console.error('Socket connection error:', error);
        socket.disconnect();
      }
    });
  }

  private async handleJoinRoom(socket: any, user: ConnectedUser, roomId: string) {
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
          canEdit: user.role === UserRole.COACH || user.role === UserRole.ANALYST,
          canChat: true,
          canInvite: user.role === UserRole.COACH
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

    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Error al unirse a la sala' });
    }
  }

  private async handleFormationUpdate(socket: any, user: ConnectedUser, data: { roomId: string; formation: any }) {
    try {
      const room = this.rooms.get(data.roomId);
      if (!room) return;

      if (!room.permissions[user.id]?.canEdit) {
        throw new Error('No tienes permisos para editar');
      }

      room.formation = data.formation;
      room.users.find(u => u.id === user.id)!.lastAction = 'formation_update';

      this.io.to(data.roomId).emit('formationUpdated', {
        formation: data.formation,
        updatedBy: {
          id: user.id,
          name: user.name
        }
      });

    } catch (error) {
      console.error('Error updating formation:', error);
      socket.emit('error', { message: 'Error al actualizar la formación' });
    }
  }

  private async handleChatMessage(socket: any, user: ConnectedUser, data: { roomId: string; content: string }) {
    try {
      const room = this.rooms.get(data.roomId);
      if (!room) return;

      if (!room.permissions[user.id]?.canChat) {
        throw new Error('No tienes permisos para chatear');
      }

      const message: ChatMessage = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        content: data.content,
        timestamp: new Date(),
        type: 'text'
      };

      room.chat.push(message);
      this.io.to(data.roomId).emit('newChatMessage', message);

    } catch (error) {
      console.error('Error sending chat message:', error);
      socket.emit('error', { message: 'Error al enviar mensaje' });
    }
  }

  private async handleAnalysisUpdate(socket: any, user: ConnectedUser, data: { roomId: string; analysis: any }) {
    try {
      const room = this.rooms.get(data.roomId);
      if (!room) return;

      if (!room.permissions[user.id]?.canEdit) {
        throw new Error('No tienes permisos para editar el análisis');
      }

      room.analysis = data.analysis;
      room.users.find(u => u.id === user.id)!.lastAction = 'analysis_update';

      this.io.to(data.roomId).emit('analysisUpdated', {
        analysis: data.analysis,
        updatedBy: {
          id: user.id,
          name: user.name
        }
      });

    } catch (error) {
      console.error('Error updating analysis:', error);
      socket.emit('error', { message: 'Error al actualizar el análisis' });
    }
  }

  private handleCursorMove(socket: any, user: ConnectedUser, data: { roomId: string; x: number; y: number }) {
    this.io.to(data.roomId).emit('cursorMoved', {
      userId: user.id,
      userName: user.name,
      position: { x: data.x, y: data.y }
    });
  }

  private handleTacticalDraw(socket: any, user: ConnectedUser, data: { roomId: string; path: any }) {
    this.io.to(data.roomId).emit('tacticalDrawUpdate', {
      userId: user.id,
      userName: user.name,
      path: data.path
    });
  }

  private handleDisconnect(user: ConnectedUser) {
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
  public getRoomState(roomId: string) {
    return this.rooms.get(roomId);
  }

  public getUsersInRoom(roomId: string) {
    const room = this.rooms.get(roomId);
    return room?.users.filter(u => u.isActive) || [];
  }

  public broadcastToRoom(roomId: string, event: string, data: any) {
    this.io.to(roomId).emit(event, data);
  }
}
