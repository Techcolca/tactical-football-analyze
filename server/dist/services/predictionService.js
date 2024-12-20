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
exports.predictionService = exports.PredictionService = void 0;
const tf = __importStar(require("@tensorflow/tfjs-node"));
class PredictionService {
    constructor() {
        this.formationModel = null;
        this.playerPerformanceModel = null;
        this.matchPredictionModel = null;
        this.initializeModels();
    }
    async initializeModels() {
        try {
            // Cargar modelos pre-entrenados
            this.formationModel = await tf.loadLayersModel('file://./models/formation_model/model.json');
            this.playerPerformanceModel = await tf.loadLayersModel('file://./models/performance_model/model.json');
            this.matchPredictionModel = await tf.loadLayersModel('file://./models/match_model/model.json');
        }
        catch (error) {
            console.error('Error loading models:', error);
        }
    }
    // Predecir formación óptima
    async predictOptimalFormation(players, opponent) {
        try {
            // Preparar datos de entrada
            const playerStats = this.preparePlayerStats(players);
            const opponentFeatures = await this.getOpponentFeatures(opponent);
            // Realizar predicción
            const input = tf.tensor2d([...playerStats, ...opponentFeatures]);
            const prediction = this.formationModel.predict(input);
            const formationVector = await prediction.array();
            // Interpretar resultados
            const formation = this.interpretFormation(formationVector[0]);
            const confidence = this.calculateConfidence(formationVector[0]);
            const reasoning = this.explainFormationChoice(formation, players, opponent);
            return { formation, confidence, reasoning };
        }
        catch (error) {
            throw new Error(`Error predicting formation: ${error.message}`);
        }
    }
    // Predecir rendimiento de jugadores
    async predictPlayerPerformance(player, formation, opponent) {
        try {
            // Preparar datos de entrada
            const playerFeatures = this.preparePlayerFeatures(player);
            const formationFeatures = this.prepareFormationFeatures(formation);
            const opponentFeatures = await this.getOpponentFeatures(opponent);
            // Realizar predicción
            const input = tf.tensor2d([...playerFeatures, ...formationFeatures, ...opponentFeatures]);
            const prediction = this.playerPerformanceModel.predict(input);
            const performanceVector = await prediction.array();
            // Interpretar resultados
            return this.interpretPlayerPerformance(performanceVector[0]);
        }
        catch (error) {
            throw new Error(`Error predicting player performance: ${error.message}`);
        }
    }
    // Predecir resultado del partido
    async predictMatchOutcome(team, formation, opponent) {
        try {
            // Preparar datos de entrada
            const teamFeatures = this.prepareTeamFeatures(team);
            const formationFeatures = this.prepareFormationFeatures(formation);
            const opponentFeatures = await this.getOpponentFeatures(opponent);
            // Realizar predicción
            const input = tf.tensor2d([...teamFeatures, ...formationFeatures, ...opponentFeatures]);
            const prediction = this.matchPredictionModel.predict(input);
            const outcomeVector = await prediction.array();
            // Interpretar resultados
            return this.interpretMatchOutcome(outcomeVector[0], team, opponent);
        }
        catch (error) {
            throw new Error(`Error predicting match outcome: ${error.message}`);
        }
    }
    // Análisis de debilidades y fortalezas
    async analyzeTeamStrengths(team, formation) {
        // Analizar estadísticas del equipo
        const teamStats = this.calculateTeamStats(team);
        // Analizar formación
        const formationAnalysis = this.analyzeFormation(formation, team);
        // Generar recomendaciones
        const recommendations = this.generateRecommendations(teamStats, formationAnalysis);
        return {
            strengths: formationAnalysis.strengths,
            weaknesses: formationAnalysis.weaknesses,
            recommendations,
            confidence: formationAnalysis.confidence
        };
    }
    // Métodos privados auxiliares
    preparePlayerStats(players) {
        return players.flatMap(player => [
            player.stats.pace,
            player.stats.shooting,
            player.stats.passing,
            player.stats.dribbling,
            player.stats.defending,
            player.stats.physical,
            player.rating,
            player.form,
            player.fatigue
        ]);
    }
    async getOpponentFeatures(opponent) {
        // Obtener y procesar datos del oponente
        // Implementar lógica de obtención de datos
        return [];
    }
    interpretFormation(vector) {
        // Convertir vector de predicción en formación
        // Implementar lógica de interpretación
        return {};
    }
    calculateConfidence(vector) {
        // Calcular nivel de confianza de la predicción
        return 0;
    }
    explainFormationChoice(formation, players, opponent) {
        // Generar explicaciones sobre la elección de formación
        return [];
    }
    preparePlayerFeatures(player) {
        // Preparar características del jugador para el modelo
        return [];
    }
    prepareFormationFeatures(formation) {
        // Preparar características de la formación para el modelo
        return [];
    }
    prepareTeamFeatures(team) {
        // Preparar características del equipo para el modelo
        return [];
    }
    interpretPlayerPerformance(vector) {
        // Interpretar predicción de rendimiento del jugador
        return {};
    }
    interpretMatchOutcome(vector, team, opponent) {
        // Interpretar predicción del resultado del partido
        return {};
    }
    calculateTeamStats(team) {
        // Calcular estadísticas generales del equipo
        return {};
    }
    analyzeFormation(formation, team) {
        // Analizar fortalezas y debilidades de la formación
        return {
            strengths: [],
            weaknesses: [],
            confidence: 0
        };
    }
    generateRecommendations(teamStats, formationAnalysis) {
        // Generar recomendaciones basadas en el análisis
        return [];
    }
}
exports.PredictionService = PredictionService;
exports.predictionService = new PredictionService();
//# sourceMappingURL=predictionService.js.map