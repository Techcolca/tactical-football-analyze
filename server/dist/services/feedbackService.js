"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedbackService = exports.FeedbackService = void 0;
const modelTraining_1 = require("../ml/modelTraining");
const dataPreparation_1 = require("../ml/dataPreparation");
class FeedbackService {
    constructor() {
        this.feedbackBuffer = {
            formations: [],
            performances: [],
            matches: [],
        };
        this.bufferThreshold = 100;
    }
    // Retroalimentación de predicción de formación
    async submitFormationFeedback(prediction, actualFormation, success, players, opponent, matchEvents) {
        // Almacenar feedback
        this.feedbackBuffer.formations.push({
            predictedFormation: prediction.formation,
            actualFormation,
            success,
            players,
            opponent,
            matchEvents,
            timestamp: new Date(),
        });
        // Reentrenar si se alcanza el umbral
        if (this.feedbackBuffer.formations.length >= this.bufferThreshold) {
            await this.retrainFormationModel();
        }
    }
    // Retroalimentación de predicción de rendimiento
    async submitPerformanceFeedback(prediction, actualPerformance, player, formation, opponent, matchEvents) {
        // Almacenar feedback
        this.feedbackBuffer.performances.push({
            prediction,
            actualPerformance,
            player,
            formation,
            opponent,
            matchEvents,
            timestamp: new Date(),
        });
        // Reentrenar si se alcanza el umbral
        if (this.feedbackBuffer.performances.length >= this.bufferThreshold) {
            await this.retrainPerformanceModel();
        }
    }
    // Retroalimentación de predicción de partido
    async submitMatchFeedback(prediction, actualResult, team, formation, opponent, matchEvents) {
        // Almacenar feedback
        this.feedbackBuffer.matches.push({
            prediction,
            actualResult,
            team,
            formation,
            opponent,
            matchEvents,
            timestamp: new Date(),
        });
        // Reentrenar si se alcanza el umbral
        if (this.feedbackBuffer.matches.length >= this.bufferThreshold) {
            await this.retrainMatchModel();
        }
    }
    // Reentrenamiento de modelos
    async retrainFormationModel() {
        try {
            console.log('Reentrenando modelo de formación...');
            // Preparar datos de entrenamiento
            const trainingData = this.feedbackBuffer.formations.map(feedback => ({
                players: feedback.players,
                opponent: feedback.opponent,
                actualFormation: feedback.actualFormation,
                matchEvents: feedback.matchEvents,
                result: feedback.success ? 'success' : 'failure',
            }));
            // Preparar datos
            const [inputs, outputs] = dataPreparation_1.dataPreparation.prepareFormationData(trainingData);
            // Reentrenar modelo
            await modelTraining_1.modelTrainer.trainFormationModel(trainingData);
            // Limpiar buffer
            this.feedbackBuffer.formations = [];
            console.log('Reentrenamiento de modelo de formación completado');
        }
        catch (error) {
            console.error('Error al reentrenar modelo de formación:', error);
        }
    }
    async retrainPerformanceModel() {
        try {
            console.log('Reentrenando modelo de rendimiento...');
            // Preparar datos de entrenamiento
            const trainingData = this.feedbackBuffer.performances.map(feedback => ({
                player: feedback.player,
                formation: feedback.formation,
                opponent: feedback.opponent,
                matchEvents: feedback.matchEvents,
                actualPerformance: feedback.actualPerformance,
            }));
            // Preparar datos
            const [inputs, outputs] = dataPreparation_1.dataPreparation.preparePerformanceData(trainingData);
            // Reentrenar modelo
            await modelTraining_1.modelTrainer.trainPerformanceModel(trainingData);
            // Limpiar buffer
            this.feedbackBuffer.performances = [];
            console.log('Reentrenamiento de modelo de rendimiento completado');
        }
        catch (error) {
            console.error('Error al reentrenar modelo de rendimiento:', error);
        }
    }
    async retrainMatchModel() {
        try {
            console.log('Reentrenando modelo de predicción de partidos...');
            // Preparar datos de entrenamiento
            const trainingData = this.feedbackBuffer.matches.map(feedback => ({
                team: feedback.team,
                formation: feedback.formation,
                opponent: feedback.opponent,
                matchEvents: feedback.matchEvents,
                actualResult: feedback.actualResult,
            }));
            // Preparar datos
            const [inputs, outputs] = dataPreparation_1.dataPreparation.prepareMatchData(trainingData);
            // Reentrenar modelo
            await modelTraining_1.modelTrainer.trainMatchModel(trainingData);
            // Limpiar buffer
            this.feedbackBuffer.matches = [];
            console.log('Reentrenamiento de modelo de predicción de partidos completado');
        }
        catch (error) {
            console.error('Error al reentrenar modelo de predicción de partidos:', error);
        }
    }
    // Métricas de rendimiento del modelo
    async getModelMetrics() {
        // Calcular métricas de rendimiento para cada modelo
        return {
            formationAccuracy: await this.calculateFormationAccuracy(),
            performanceMSE: await this.calculatePerformanceMSE(),
            matchPredictionAccuracy: await this.calculateMatchAccuracy(),
        };
    }
    async calculateFormationAccuracy() {
        // Implementar cálculo de precisión del modelo de formación
        return 0;
    }
    async calculatePerformanceMSE() {
        // Implementar cálculo de MSE del modelo de rendimiento
        return 0;
    }
    async calculateMatchAccuracy() {
        // Implementar cálculo de precisión del modelo de predicción de partidos
        return 0;
    }
}
exports.FeedbackService = FeedbackService;
exports.feedbackService = new FeedbackService();
//# sourceMappingURL=feedbackService.js.map