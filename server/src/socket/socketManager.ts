import { Server, Socket } from 'socket.io';
import { roomService } from '../services/roomService';

export class SocketManager {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log('Cliente conectado:', socket.id);

      socket.on('room:create', ({ roomId, name }) => {
        const room = roomService.createRoom(roomId, name);
        socket.emit('room:created', { roomId: room.id });
      });

      socket.on('room:join', ({ roomId, userName, role }) => {
        const success = roomService.joinRoom(roomId, {
          id: socket.id,
          name: userName,
          role,
          socket,
        });

        if (success) {
          socket.join(roomId);
          socket.emit('room:joined', { roomId });
        } else {
          socket.emit('room:error', { message: 'No se pudo unir a la sala' });
        }
      });

      socket.on('tactical:update', ({ roomId, state }) => {
        const success = roomService.updateTacticalState(roomId, state, socket.id);
        if (!success) {
          socket.emit('tactical:error', {
            message: 'No se pudo actualizar el estado táctico',
          });
        }
      });

      socket.on('disconnect', () => {
        // Buscar y eliminar al usuario de todas las salas
        this.io.sockets.adapter.rooms.forEach((_, roomId) => {
          roomService.leaveRoom(roomId, socket.id);
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
