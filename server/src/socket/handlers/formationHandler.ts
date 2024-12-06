import { Server, Socket } from 'socket.io';
import { Formation, PlayerPosition, TacticalInstruction } from '../../types/collaboration';
import { verifyToken } from '../../middleware/auth';
import { RoomManager } from '../managers/RoomManager';

export class FormationHandler {
  private io: Server;
  private roomManager: RoomManager;

  constructor(io: Server, roomManager: RoomManager) {
    this.io = io;
    this.roomManager = roomManager;
  }

  public handleConnection(socket: Socket): void {
    // Manejar actualizaciones de formación
    socket.on('formation:update', async (data: {
      roomId: string;
      formation: Formation;
    }) => {
      try {
        const user = await verifyToken(socket.handshake.auth.token);
        const room = this.roomManager.getRoom(data.roomId);

        if (!room) {
          throw new Error('Room not found');
        }

        const roomUser = room.users.find(u => u.id === user.id);
        if (!roomUser || (roomUser.role !== 'coach' && roomUser.role !== 'analyst')) {
          throw new Error('Unauthorized to update formation');
        }

        // Validar la formación
        this.validateFormation(data.formation);

        // Actualizar la formación en la sala
        room.formation = {
          ...data.formation,
          version: (room.formation?.version || 0) + 1
        };

        // Notificar a todos los usuarios en la sala
        this.io.to(data.roomId).emit('formation:updated', {
          formation: room.formation,
          updatedBy: {
            id: user.id,
            name: user.name,
            role: roomUser.role
          }
        });

        // Actualizar el estado del usuario
        roomUser.lastAction = 'formation_update';
        roomUser.lastActionTimestamp = Date.now();
        this.io.to(data.roomId).emit('user:action', {
          userId: user.id,
          action: 'formation_update',
          timestamp: roomUser.lastActionTimestamp
        });

      } catch (error: any) {
        socket.emit('error', {
          type: 'formation:update',
          message: error.message
        });
      }
    });

    // Manejar movimientos de jugadores
    socket.on('player:move', async (data: {
      roomId: string;
      playerId: string;
      position: { x: number; y: number };
    }) => {
      try {
        const user = await verifyToken(socket.handshake.auth.token);
        const room = this.roomManager.getRoom(data.roomId);

        if (!room) {
          throw new Error('Room not found');
        }

        const roomUser = room.users.find(u => u.id === user.id);
        if (!roomUser || (roomUser.role !== 'coach' && roomUser.role !== 'analyst')) {
          throw new Error('Unauthorized to move players');
        }

        // Validar y actualizar la posición del jugador
        const playerIndex = room.formation.players.findIndex(p => p.id === data.playerId);
        if (playerIndex === -1) {
          throw new Error('Player not found');
        }

        room.formation.players[playerIndex] = {
          ...room.formation.players[playerIndex],
          x: data.position.x,
          y: data.position.y
        };

        // Emitir la actualización a todos los usuarios en la sala
        this.io.to(data.roomId).emit('player:moved', {
          playerId: data.playerId,
          position: data.position,
          updatedBy: {
            id: user.id,
            name: user.name,
            role: roomUser.role
          }
        });

      } catch (error: any) {
        socket.emit('error', {
          type: 'player:move',
          message: error.message
        });
      }
    });

    // Manejar instrucciones tácticas
    socket.on('tactics:update', async (data: {
      roomId: string;
      instruction: TacticalInstruction;
    }) => {
      try {
        const user = await verifyToken(socket.handshake.auth.token);
        const room = this.roomManager.getRoom(data.roomId);

        if (!room) {
          throw new Error('Room not found');
        }

        const roomUser = room.users.find(u => u.id === user.id);
        if (!roomUser || (roomUser.role !== 'coach' && roomUser.role !== 'analyst')) {
          throw new Error('Unauthorized to update tactics');
        }

        // Validar y agregar/actualizar la instrucción táctica
        this.validateTacticalInstruction(data.instruction);
        
        const instructionIndex = room.formation.tactics.findIndex(t => t.id === data.instruction.id);
        if (instructionIndex === -1) {
          room.formation.tactics.push(data.instruction);
        } else {
          room.formation.tactics[instructionIndex] = data.instruction;
        }

        // Emitir la actualización a todos los usuarios en la sala
        this.io.to(data.roomId).emit('tactics:updated', {
          instruction: data.instruction,
          updatedBy: {
            id: user.id,
            name: user.name,
            role: roomUser.role
          }
        });

      } catch (error: any) {
        socket.emit('error', {
          type: 'tactics:update',
          message: error.message
        });
      }
    });
  }

  private validateFormation(formation: Formation): void {
    if (!formation.name || formation.name.trim().length === 0) {
      throw new Error('Formation name is required');
    }

    if (!Array.isArray(formation.players) || formation.players.length === 0) {
      throw new Error('Formation must have at least one player');
    }

    if (!Array.isArray(formation.tactics)) {
      throw new Error('Tactics must be an array');
    }

    // Validar cada jugador
    formation.players.forEach(this.validatePlayerPosition);
  }

  private validatePlayerPosition(player: PlayerPosition): void {
    if (!player.id) {
      throw new Error('Player ID is required');
    }

    if (!player.number || player.number < 1 || player.number > 99) {
      throw new Error('Invalid player number');
    }

    if (!player.position || player.position.trim().length === 0) {
      throw new Error('Player position is required');
    }

    if (typeof player.x !== 'number' || typeof player.y !== 'number') {
      throw new Error('Invalid player coordinates');
    }

    // Validar que las coordenadas estén dentro del campo
    if (player.x < 0 || player.x > 100 || player.y < 0 || player.y > 100) {
      throw new Error('Player coordinates must be between 0 and 100');
    }
  }

  private validateTacticalInstruction(instruction: TacticalInstruction): void {
    if (!instruction.id) {
      throw new Error('Instruction ID is required');
    }

    if (!instruction.type || !['movement', 'pressing', 'marking'].includes(instruction.type)) {
      throw new Error('Invalid instruction type');
    }

    if (!instruction.description || instruction.description.trim().length === 0) {
      throw new Error('Instruction description is required');
    }

    if (!Array.isArray(instruction.players) || instruction.players.length === 0) {
      throw new Error('Instruction must involve at least one player');
    }
  }
}
