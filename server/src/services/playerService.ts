import Player, { IPlayer } from '../models/Player';
import mongoose from 'mongoose';
import { NotFoundError, ValidationError } from '../utils/errors';

export class PlayerService {
  // Crear nuevo jugador
  async createPlayer(playerData: Partial<IPlayer>): Promise<IPlayer> {
    try {
      const player = new Player(playerData);
      await player.validate();
      return await player.save();
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw new ValidationError('Invalid player data');
      }
      throw error;
    }
  }

  // Obtener jugador por ID
  async getPlayerById(id: string): Promise<IPlayer> {
    const player = await Player.findById(id);
    if (!player) {
      throw new NotFoundError('Player not found');
    }
    return player;
  }

  // Buscar jugadores con filtros
  async searchPlayers(filters: {
    name?: string;
    team?: string;
    position?: string;
    nationality?: string;
    minRating?: number;
    maxRating?: number;
    minAge?: number;
    maxAge?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ players: IPlayer[]; total: number; pages: number }> {
    const query: any = {};
    const {
      name,
      team,
      position,
      nationality,
      minRating,
      maxRating,
      minAge,
      maxAge,
      sort = '-rating',
      page = 1,
      limit = 20
    } = filters;

    // Construir query
    if (name) {
      query.$text = { $search: name };
    }
    if (team) {
      query.team = team;
    }
    if (position) {
      query.position = position;
    }
    if (nationality) {
      query.nationality = nationality;
    }
    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = minRating;
      if (maxRating) query.rating.$lte = maxRating;
    }
    if (minAge || maxAge) {
      query.age = {};
      if (minAge) query.age.$gte = minAge;
      if (maxAge) query.age.$lte = maxAge;
    }

    // Ejecutar query
    const total = await Player.countDocuments(query);
    const players = await Player.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      players,
      total,
      pages: Math.ceil(total / limit)
    };
  }

  // Actualizar jugador
  async updatePlayer(id: string, updateData: Partial<IPlayer>): Promise<IPlayer> {
    const player = await Player.findById(id);
    if (!player) {
      throw new NotFoundError('Player not found');
    }

    // Actualizar campos
    Object.assign(player, updateData);
    await player.validate();
    return await player.save();
  }

  // Actualizar estadísticas después de un partido
  async updateMatchStats(id: string, matchStats: {
    minutes: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    passAccuracy: number;
    shotsOnTarget: number;
    tackleSuccess: number;
    dribbleSuccess: number;
    aerialDuelsWon: number;
    interceptions: number;
    distanceCovered: number;
    sprintSpeed: number;
    positions: Array<{ x: number; y: number; intensity: number }>;
    rating: number;
  }): Promise<IPlayer> {
    const player = await Player.findById(id);
    if (!player) {
      throw new NotFoundError('Player not found');
    }

    // Actualizar estadísticas del partido
    player.performance.matches++;
    player.performance.minutesPlayed += matchStats.minutes;
    player.performance.goals += matchStats.goals;
    player.performance.assists += matchStats.assists;
    player.performance.yellowCards += matchStats.yellowCards;
    player.performance.redCards += matchStats.redCards;

    // Actualizar promedios
    const totalMatches = player.performance.matches;
    player.performance.passAccuracy = updateAverage(
      player.performance.passAccuracy,
      matchStats.passAccuracy,
      totalMatches
    );
    player.performance.shotsOnTarget = updateAverage(
      player.performance.shotsOnTarget,
      matchStats.shotsOnTarget,
      totalMatches
    );
    player.performance.tackleSuccess = updateAverage(
      player.performance.tackleSuccess,
      matchStats.tackleSuccess,
      totalMatches
    );
    player.performance.dribbleSuccess = updateAverage(
      player.performance.dribbleSuccess,
      matchStats.dribbleSuccess,
      totalMatches
    );
    player.performance.aerialDuelsWon = updateAverage(
      player.performance.aerialDuelsWon,
      matchStats.aerialDuelsWon,
      totalMatches
    );
    player.performance.interceptionRate = updateAverage(
      player.performance.interceptionRate,
      matchStats.interceptions,
      totalMatches
    );
    player.performance.distanceCovered = updateAverage(
      player.performance.distanceCovered,
      matchStats.distanceCovered,
      totalMatches
    );
    player.performance.sprintSpeed = Math.max(
      player.performance.sprintSpeed,
      matchStats.sprintSpeed
    );

    // Actualizar heatmap
    if (matchStats.positions && matchStats.positions.length > 0) {
      player.performance.heatmap = {
        positions: matchStats.positions,
        lastUpdated: new Date()
      };
    }

    // Actualizar rating promedio
    player.performance.averageRating = updateAverage(
      player.performance.averageRating,
      matchStats.rating,
      totalMatches
    );

    // Actualizar forma y fatiga
    player.form = calculateNewForm(player.form, matchStats.rating);
    player.fatigue = calculateNewFatigue(player.fatigue, matchStats.minutes);

    return await player.save();
  }

  // Actualizar progreso de entrenamiento
  async updateTrainingProgress(id: string, trainingData: {
    focus: string[];
    attributes: Array<{ name: string; improvement: number }>;
  }): Promise<IPlayer> {
    const player = await Player.findById(id);
    if (!player) {
      throw new NotFoundError('Player not found');
    }

    // Actualizar foco de entrenamiento
    player.training.focus = trainingData.focus;

    // Registrar mejoras
    const date = new Date();
    trainingData.attributes.forEach(({ name, improvement }) => {
      player.training.progress.push({
        date,
        attribute: name,
        improvement
      });

      // Actualizar estadística correspondiente
      if (player.stats.hasOwnProperty(name)) {
        (player.stats as any)[name] = Math.min(99, (player.stats as any)[name] + improvement);
      }
    });

    // Recalcular rating general
    player.rating = calculateOverallRating(player.stats);

    return await player.save();
  }

  // Eliminar jugador
  async deletePlayer(id: string): Promise<void> {
    const result = await Player.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundError('Player not found');
    }
  }
}

// Funciones auxiliares
function updateAverage(currentAvg: number, newValue: number, totalItems: number): number {
  return ((currentAvg * (totalItems - 1)) + newValue) / totalItems;
}

function calculateNewForm(currentForm: number, matchRating: number): number {
  const formWeight = 0.7; // Peso de la forma actual
  const performanceWeight = 0.3; // Peso del último rendimiento
  return Math.min(100, Math.max(0,
    (currentForm * formWeight) + (matchRating * performanceWeight)
  ));
}

function calculateNewFatigue(currentFatigue: number, minutesPlayed: number): number {
  const fatigueIncrease = (minutesPlayed / 90) * 30; // 30% de fatiga por partido completo
  return Math.min(100, Math.max(0, currentFatigue + fatigueIncrease));
}

function calculateOverallRating(stats: any): number {
  // Pesos por posición y atributos
  const weights = {
    pace: 0.15,
    shooting: 0.15,
    passing: 0.15,
    dribbling: 0.15,
    defending: 0.2,
    physical: 0.2
  };

  return Math.round(
    Object.entries(weights).reduce((sum, [stat, weight]) => {
      return sum + (stats[stat] * weight);
    }, 0)
  );
}

export const playerService = new PlayerService();
