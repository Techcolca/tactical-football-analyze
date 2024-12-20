"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.playerService = exports.PlayerService = void 0;
const Player_1 = __importDefault(require("../models/Player"));
const mongoose_1 = __importDefault(require("mongoose"));
const errors_1 = require("../utils/errors");
class PlayerService {
    // Crear nuevo jugador
    async createPlayer(playerData) {
        try {
            const player = new Player_1.default(playerData);
            await player.validate();
            return await player.save();
        }
        catch (error) {
            if (error instanceof mongoose_1.default.Error.ValidationError) {
                throw new errors_1.ValidationError('Invalid player data');
            }
            throw error;
        }
    }
    // Obtener jugador por ID
    async getPlayerById(id) {
        const player = await Player_1.default.findById(id);
        if (!player) {
            throw new errors_1.NotFoundError('Player not found');
        }
        return player;
    }
    // Buscar jugadores con filtros
    async searchPlayers(filters) {
        const query = {};
        const { name, team, position, nationality, minRating, maxRating, minAge, maxAge, sort = '-rating', page = 1, limit = 20 } = filters;
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
            if (minRating)
                query.rating.$gte = minRating;
            if (maxRating)
                query.rating.$lte = maxRating;
        }
        if (minAge || maxAge) {
            query.age = {};
            if (minAge)
                query.age.$gte = minAge;
            if (maxAge)
                query.age.$lte = maxAge;
        }
        // Ejecutar query
        const total = await Player_1.default.countDocuments(query);
        const players = await Player_1.default.find(query)
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
    async updatePlayer(id, updateData) {
        const player = await Player_1.default.findById(id);
        if (!player) {
            throw new errors_1.NotFoundError('Player not found');
        }
        // Actualizar campos
        Object.assign(player, updateData);
        await player.validate();
        return await player.save();
    }
    // Actualizar estadísticas después de un partido
    async updateMatchStats(id, matchStats) {
        const player = await Player_1.default.findById(id);
        if (!player) {
            throw new errors_1.NotFoundError('Player not found');
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
        player.performance.passAccuracy = updateAverage(player.performance.passAccuracy, matchStats.passAccuracy, totalMatches);
        player.performance.shotsOnTarget = updateAverage(player.performance.shotsOnTarget, matchStats.shotsOnTarget, totalMatches);
        player.performance.tackleSuccess = updateAverage(player.performance.tackleSuccess, matchStats.tackleSuccess, totalMatches);
        player.performance.dribbleSuccess = updateAverage(player.performance.dribbleSuccess, matchStats.dribbleSuccess, totalMatches);
        player.performance.aerialDuelsWon = updateAverage(player.performance.aerialDuelsWon, matchStats.aerialDuelsWon, totalMatches);
        player.performance.interceptionRate = updateAverage(player.performance.interceptionRate, matchStats.interceptions, totalMatches);
        player.performance.distanceCovered = updateAverage(player.performance.distanceCovered, matchStats.distanceCovered, totalMatches);
        player.performance.sprintSpeed = Math.max(player.performance.sprintSpeed, matchStats.sprintSpeed);
        // Actualizar heatmap
        if (matchStats.positions && matchStats.positions.length > 0) {
            player.performance.heatmap = {
                positions: matchStats.positions,
                lastUpdated: new Date()
            };
        }
        // Actualizar rating promedio
        player.performance.averageRating = updateAverage(player.performance.averageRating, matchStats.rating, totalMatches);
        // Actualizar forma y fatiga
        player.form = calculateNewForm(player.form, matchStats.rating);
        player.fatigue = calculateNewFatigue(player.fatigue, matchStats.minutes);
        return await player.save();
    }
    // Actualizar progreso de entrenamiento
    async updateTrainingProgress(id, trainingData) {
        const player = await Player_1.default.findById(id);
        if (!player) {
            throw new errors_1.NotFoundError('Player not found');
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
                player.stats[name] = Math.min(99, player.stats[name] + improvement);
            }
        });
        // Recalcular rating general
        player.rating = calculateOverallRating(player.stats);
        return await player.save();
    }
    // Eliminar jugador
    async deletePlayer(id) {
        const result = await Player_1.default.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
            throw new errors_1.NotFoundError('Player not found');
        }
    }
}
exports.PlayerService = PlayerService;
// Funciones auxiliares
function updateAverage(currentAvg, newValue, totalItems) {
    return ((currentAvg * (totalItems - 1)) + newValue) / totalItems;
}
function calculateNewForm(currentForm, matchRating) {
    const formWeight = 0.7; // Peso de la forma actual
    const performanceWeight = 0.3; // Peso del último rendimiento
    return Math.min(100, Math.max(0, (currentForm * formWeight) + (matchRating * performanceWeight)));
}
function calculateNewFatigue(currentFatigue, minutesPlayed) {
    const fatigueIncrease = (minutesPlayed / 90) * 30; // 30% de fatiga por partido completo
    return Math.min(100, Math.max(0, currentFatigue + fatigueIncrease));
}
function calculateOverallRating(stats) {
    // Pesos por posición y atributos
    const weights = {
        pace: 0.15,
        shooting: 0.15,
        passing: 0.15,
        dribbling: 0.15,
        defending: 0.2,
        physical: 0.2
    };
    return Math.round(Object.entries(weights).reduce((sum, [stat, weight]) => {
        return sum + (stats[stat] * weight);
    }, 0));
}
exports.playerService = new PlayerService();
//# sourceMappingURL=playerService.js.map