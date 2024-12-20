"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataPreparation = exports.DataPreparation = void 0;
const tf = __importStar(require("@tensorflow/tfjs-node"));
class DataPreparation {
    // Preparación de datos para el modelo de formación
    prepareFormationData(rawData) {
        const inputs = [];
        const outputs = [];
        for (const data of rawData) {
            // Características del equipo
            const teamFeatures = this.extractTeamFeatures(data.players);
            // Características del oponente
            const opponentFeatures = this.extractOpponentFeatures(data.opponent);
            // Características de eventos del partido
            const eventFeatures = this.extractEventFeatures(data.matchEvents);
            // Combinar todas las características
            inputs.push([
                ...teamFeatures,
                ...opponentFeatures,
                ...eventFeatures
            ]);
            // Codificar formación como one-hot
            outputs.push(this.encodeFormation(data.formation));
        }
        return [
            tf.tensor2d(inputs),
            tf.tensor2d(outputs)
        ];
    }
    // Preparación de datos para el modelo de rendimiento
    preparePerformanceData(rawData) {
        const inputs = [];
        const outputs = [];
        for (const data of rawData) {
            // Características del jugador
            const playerFeatures = this.extractPlayerFeatures(data.player);
            // Características de la formación
            const formationFeatures = this.extractFormationFeatures(data.formation);
            // Características de eventos relacionados al jugador
            const eventFeatures = this.extractPlayerEventFeatures(data.matchEvents, data.player.id);
            inputs.push([
                ...playerFeatures,
                ...formationFeatures,
                ...eventFeatures
            ]);
            outputs.push([
                data.performance.rating,
                data.performance.stats.goals,
                data.performance.stats.assists,
                data.performance.stats.passAccuracy,
                data.performance.stats.tackles,
                data.performance.stats.interceptions
            ]);
        }
        return [
            tf.tensor2d(inputs),
            tf.tensor2d(outputs)
        ];
    }
    // Preparación de datos para el modelo de predicción de partidos
    prepareMatchData(rawData) {
        const inputs = [];
        const outputs = [];
        for (const data of rawData) {
            // Características del equipo
            const teamFeatures = this.extractTeamFeatures(data.team);
            // Características de la formación
            const formationFeatures = this.extractFormationFeatures(data.formation);
            // Características del oponente
            const opponentFeatures = this.extractOpponentFeatures(data.opponent);
            // Características de eventos del partido
            const eventFeatures = this.extractEventFeatures(data.matchEvents);
            inputs.push([
                ...teamFeatures,
                ...formationFeatures,
                ...opponentFeatures,
                ...eventFeatures
            ]);
            // Codificar resultado
            outputs.push([
                data.result.goalsFor,
                data.result.goalsAgainst,
                ...this.encodeMatchOutcome(data.result.outcome)
            ]);
        }
        return [
            tf.tensor2d(inputs),
            tf.tensor2d(outputs)
        ];
    }
    // Métodos auxiliares de extracción de características
    extractTeamFeatures(players) {
        return [
            // Promedio de ratings
            players.reduce((acc, p) => acc + p.rating, 0) / players.length,
            // Promedio de forma
            players.reduce((acc, p) => acc + p.form, 0) / players.length,
            // Promedio de fatiga
            players.reduce((acc, p) => acc + p.fatigue, 0) / players.length,
            // Estadísticas agregadas del equipo
            ...this.aggregateTeamStats(players)
        ];
    }
    extractPlayerFeatures(player) {
        return [
            player.rating,
            player.form,
            player.fatigue,
            player.stats.pace,
            player.stats.shooting,
            player.stats.passing,
            player.stats.dribbling,
            player.stats.defending,
            player.stats.physical,
            // Historial reciente
            ...this.extractRecentHistory(player)
        ];
    }
    extractFormationFeatures(formation) {
        return [
            formation.defenders,
            formation.midfielders,
            formation.forwards,
            // Características tácticas
            ...this.extractTacticalFeatures(formation)
        ];
    }
    extractOpponentFeatures(opponent) {
        // Implementar extracción de características del oponente
        return [];
    }
    extractEventFeatures(events) {
        return [
            // Contar tipos de eventos
            events.filter(e => e.type === 'shot').length,
            events.filter(e => e.type === 'pass').length,
            events.filter(e => e.type === 'tackle').length,
            events.filter(e => e.type === 'interception').length,
            // Análisis de posesión
            this.calculatePossessionStats(events),
            // Análisis de presión
            this.calculatePressureStats(events)
        ];
    }
    extractPlayerEventFeatures(events, playerId) {
        const playerEvents = events.filter(e => e.playerId === playerId);
        return [
            // Eventos específicos del jugador
            playerEvents.filter(e => e.type === 'shot').length,
            playerEvents.filter(e => e.type === 'pass').length,
            playerEvents.filter(e => e.type === 'tackle').length,
            playerEvents.filter(e => e.type === 'interception').length,
            // Análisis de movimiento
            ...this.analyzePlayerMovement(playerEvents)
        ];
    }
    // Métodos de codificación
    encodeFormation(formation) {
        // Implementar codificación one-hot de formaciones
        return [];
    }
    encodeMatchOutcome(outcome) {
        switch (outcome) {
            case 'win': return [1, 0, 0];
            case 'draw': return [0, 1, 0];
            case 'loss': return [0, 0, 1];
        }
    }
    // Métodos de análisis
    aggregateTeamStats(players) {
        // Implementar agregación de estadísticas del equipo
        return [];
    }
    extractRecentHistory(player) {
        // Implementar extracción de historial reciente
        return [];
    }
    extractTacticalFeatures(formation) {
        // Implementar extracción de características tácticas
        return [];
    }
    calculatePossessionStats(events) {
        // Implementar cálculo de estadísticas de posesión
        return 0;
    }
    calculatePressureStats(events) {
        // Implementar cálculo de estadísticas de presión
        return 0;
    }
    analyzePlayerMovement(events) {
        // Implementar análisis de movimiento del jugador
        return [];
    }
}
exports.DataPreparation = DataPreparation;
exports.dataPreparation = new DataPreparation();
//# sourceMappingURL=dataPreparation.js.map