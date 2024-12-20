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
exports.videoAnalysisService = exports.VideoAnalysisService = void 0;
const tf = __importStar(require("@tensorflow/tfjs-node"));
const predictionService_1 = require("./predictionService");
class VideoAnalysisService {
    constructor() {
        this.objectDetectionModel = null;
        this.poseEstimationModel = null;
        this.eventDetectionModel = null;
        this.initializeModels();
    }
    async initializeModels() {
        try {
            // Cargar modelos pre-entrenados
            this.objectDetectionModel = await tf.loadGraphModel('file://./models/object_detection/model.json');
            this.poseEstimationModel = await tf.loadGraphModel('file://./models/pose_estimation/model.json');
            this.eventDetectionModel = await tf.loadGraphModel('file://./models/event_detection/model.json');
        }
        catch (error) {
            console.error('Error loading video analysis models:', error);
        }
    }
    // Análisis de frame de video
    async analyzeFrame(frame) {
        // Convertir frame a tensor
        const tensor = await this.preprocessFrame(frame);
        // Detección de objetos (jugadores, pelota)
        const detections = await this.detectObjects(tensor);
        // Estimación de poses de jugadores
        const poses = await this.estimatePlayerPoses(tensor, detections);
        // Detección de eventos
        const events = await this.detectEvents(tensor, detections, poses);
        // Generar heatmap
        const heatmap = this.generateHeatmap(detections);
        // Liberar memoria
        tensor.dispose();
        return {
            playerPositions: this.extractPlayerPositions(detections, poses),
            events,
            heatmap,
        };
    }
    // Análisis de secuencia de video
    async analyzeSequence(frames) {
        const events = [];
        const playerTrajectories = new Map();
        const possessionData = [];
        // Analizar cada frame
        for (const frame of frames) {
            const analysis = await this.analyzeFrame(frame);
            // Acumular eventos
            events.push(...analysis.events);
            // Actualizar trayectorias
            this.updatePlayerTrajectories(playerTrajectories, analysis.playerPositions);
            // Recopilar datos de posesión
            possessionData.push(...this.extractPossessionEvents(analysis));
        }
        // Calcular estadísticas
        const possessionStats = this.calculatePossessionStats(possessionData);
        const pressureMap = this.calculatePressureMap(playerTrajectories);
        return {
            events,
            playerTrajectories,
            possessionStats,
            pressureMap,
        };
    }
    // Integración con predicciones
    async analyzeAndPredict(sequence, players, currentFormation) {
        // Realizar análisis de video
        const analysis = await this.analyzeSequence(sequence);
        // Obtener predicciones basadas en el análisis
        const predictions = await predictionService_1.predictionService.predictFromAnalysis(analysis, players, currentFormation);
        return { analysis, predictions };
    }
    // Métodos auxiliares de procesamiento
    async preprocessFrame(frame) {
        // Implementar preprocesamiento de frame
        return tf.tensor3d([]);
    }
    async detectObjects(frame) {
        if (!this.objectDetectionModel) {
            throw new Error('Object detection model not loaded');
        }
        // Realizar detección de objetos
        const predictions = await this.objectDetectionModel.predict(frame);
        // Procesar predicciones
        return this.processDetections(predictions);
    }
    async estimatePlayerPoses(frame, detections) {
        if (!this.poseEstimationModel) {
            throw new Error('Pose estimation model not loaded');
        }
        // Estimar poses para cada jugador detectado
        const poses = [];
        for (const detection of detections) {
            const playerRegion = this.extractPlayerRegion(frame, detection);
            const pose = await this.poseEstimationModel.predict(playerRegion);
            poses.push(this.processPose(pose));
            playerRegion.dispose();
        }
        return poses;
    }
    async detectEvents(frame, detections, poses) {
        if (!this.eventDetectionModel) {
            throw new Error('Event detection model not loaded');
        }
        // Detectar eventos basados en el frame actual
        const predictions = await this.eventDetectionModel.predict(frame);
        // Procesar y clasificar eventos
        return this.processEvents(predictions, detections, poses);
    }
    // Métodos de procesamiento de datos
    processDetections(predictions) {
        // Procesar y filtrar detecciones
        return [];
    }
    processPose(pose) {
        // Procesar datos de pose
        return {};
    }
    processEvents(predictions, detections, poses) {
        // Procesar y clasificar eventos
        return [];
    }
    extractPlayerPositions(detections, poses) {
        // Extraer posiciones de jugadores
        return [];
    }
    generateHeatmap(detections) {
        // Generar heatmap basado en posiciones
        return [];
    }
    updatePlayerTrajectories(trajectories, positions) {
        // Actualizar trayectorias de jugadores
    }
    extractPossessionEvents(frameAnalysis) {
        // Extraer eventos de posesión
        return [];
    }
    calculatePossessionStats(events) {
        // Calcular estadísticas de posesión
        return new Map();
    }
    calculatePressureMap(trajectories) {
        // Calcular mapa de presión
        return [];
    }
    extractPlayerRegion(frame, detection) {
        // Extraer región del jugador del frame
        return tf.tensor3d([]);
    }
}
exports.VideoAnalysisService = VideoAnalysisService;
exports.videoAnalysisService = new VideoAnalysisService();
//# sourceMappingURL=videoAnalysisService.js.map