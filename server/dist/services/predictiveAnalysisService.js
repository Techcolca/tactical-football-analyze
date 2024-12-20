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
exports.predictiveAnalysisService = exports.PredictiveAnalysisService = void 0;
const tf = __importStar(require("@tensorflow/tfjs-node"));
class PredictiveAnalysisService {
    constructor() {
        this.modelPaths = {
            tactics: './models/tactics_analysis/model.json',
            performance: './models/performance_analysis/model.json',
            outcome: './models/outcome_prediction/model.json'
        };
        this.tacticsModel = null;
        this.performanceModel = null;
        this.outcomeModel = null;
        this.initializeModels();
    }
    async initializeModels() {
        try {
            this.tacticsModel = await tf.loadLayersModel(`file://${this.modelPaths.tactics}`);
            this.performanceModel = await tf.loadLayersModel(`file://${this.modelPaths.performance}`);
            this.outcomeModel = await tf.loadLayersModel(`file://${this.modelPaths.outcome}`);
        }
        catch (error) {
            console.error('Error loading prediction models:', error);
        }
    }
    // Análisis Táctico Avanzado
    async analyzeTactics(team, formation, matchEvents) {
        try {
            // Preparar datos para análisis
            const tacticalFeatures = this.prepareTacticalFeatures(team, formation, matchEvents);
            // Realizar predicciones
            const predictions = await this.tacticsModel.predict(tacticalFeatures);
            const analysisResults = await predictions.array();
            // Interpretar resultados
            return this.interpretTacticalAnalysis(analysisResults[0], team, formation);
        }
        catch (error) {
            console.error('Error in tactical analysis:', error);
            throw error;
        }
    }
    // Predicción de Rendimiento Detallada
    async predictPerformance(player, formation, recentEvents) {
        try {
            // Preparar características del jugador
            const playerFeatures = this.preparePlayerFeatures(player, formation, recentEvents);
            // Realizar predicción
            const predictions = await this.performanceModel.predict(playerFeatures);
            const performanceResults = await predictions.array();
            // Interpretar resultados
            return this.interpretPerformancePrediction(performanceResults[0], player);
        }
        catch (error) {
            console.error('Error in performance prediction:', error);
            throw error;
        }
    }
    // Predicción de Resultado de Partido
    async predictMatchOutcome(team, formation, opponent, recentForm) {
        try {
            // Preparar características del partido
            const matchFeatures = this.prepareMatchFeatures(team, formation, opponent, recentForm);
            // Realizar predicción
            const predictions = await this.outcomeModel.predict(matchFeatures);
            const outcomeResults = await predictions.array();
            // Interpretar resultados
            return this.interpretMatchPrediction(outcomeResults[0], team, opponent);
        }
        catch (error) {
            console.error('Error in match outcome prediction:', error);
            throw error;
        }
    }
    // Análisis de Patrones y Tendencias
    async analyzePatterns(matchEvents, timeframe) {
        try {
            // Filtrar eventos por timeframe
            const filteredEvents = this.filterEventsByTimeframe(matchEvents, timeframe);
            // Analizar patrones
            const patterns = this.identifyPatterns(filteredEvents);
            // Analizar tendencias
            const trends = this.analyzeTrends(filteredEvents);
            // Generar insights
            const insights = this.generateInsights(patterns, trends);
            return { patterns, trends, insights };
        }
        catch (error) {
            console.error('Error in pattern analysis:', error);
            throw error;
        }
    }
    // Métodos auxiliares de preparación de datos
    prepareTacticalFeatures(team, formation, events) {
        // Implementar preparación de características tácticas
        return tf.tensor([]);
    }
    preparePlayerFeatures(player, formation, events) {
        // Implementar preparación de características del jugador
        return tf.tensor([]);
    }
    prepareMatchFeatures(team, formation, opponent, recentForm) {
        // Implementar preparación de características del partido
        return tf.tensor([]);
    }
    // Métodos auxiliares de interpretación
    interpretTacticalAnalysis(results, team, formation) {
        // Implementar interpretación de análisis táctico
        return {};
    }
    interpretPerformancePrediction(results, player) {
        // Implementar interpretación de predicción de rendimiento
        return {};
    }
    interpretMatchPrediction(results, team, opponent) {
        // Implementar interpretación de predicción de partido
        return {};
    }
    // Métodos auxiliares de análisis de patrones
    filterEventsByTimeframe(events, timeframe) {
        // Implementar filtrado de eventos por timeframe
        return [];
    }
    identifyPatterns(events) {
        // Implementar identificación de patrones
        return {};
    }
    analyzeTrends(events) {
        // Implementar análisis de tendencias
        return {};
    }
    generateInsights(patterns, trends) {
        // Implementar generación de insights
        return [];
    }
}
exports.PredictiveAnalysisService = PredictiveAnalysisService;
exports.predictiveAnalysisService = new PredictiveAnalysisService();
//# sourceMappingURL=predictiveAnalysisService.js.map