"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoService = exports.VideoService = void 0;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const path_1 = require("path");
const util_1 = require("util");
const child_process_1 = require("child_process");
const errors_1 = require("../utils/errors");
const uuid_1 = require("uuid");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class VideoService {
    constructor() {
        this.allowedFormats = ['mp4', 'mov', 'avi', 'mkv'];
        this.maxFileSize = 1024 * 1024 * 500; // 500MB
        this.videoStorage = process.env.VIDEO_STORAGE_PATH || './storage/videos';
        this.tempStorage = process.env.TEMP_STORAGE_PATH || './storage/temp';
    }
    // Procesar y analizar video
    async processVideo(videoPath, options) {
        try {
            // Validar archivo
            await this.validateVideo(videoPath);
            // Generar ID único para el video procesado
            const videoId = (0, uuid_1.v4)();
            const processedPath = (0, path_1.join)(this.videoStorage, `${videoId}.mp4`);
            // Procesar video con ffmpeg
            await this.processVideoWithFFmpeg(videoPath, processedPath, options);
            // Obtener metadata
            const metadata = await this.getVideoMetadata(processedPath);
            // Analizar video si se solicita
            let analysis;
            if (options.analyze) {
                analysis = await this.analyzeVideo(processedPath, options.track);
            }
            return {
                processedPath,
                metadata,
                analysis
            };
        }
        catch (error) {
            throw new Error(`Error processing video: ${error.message}`);
        }
    }
    // Extraer clips de momentos clave
    async extractClip(videoPath, options) {
        const clipId = (0, uuid_1.v4)();
        const clipPath = (0, path_1.join)(this.videoStorage, 'clips', `${clipId}.mp4`);
        await new Promise((resolve, reject) => {
            (0, fluent_ffmpeg_1.default)(videoPath)
                .setStartTime(options.startTime)
                .setDuration(options.duration)
                .output(clipPath)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });
        return clipPath;
    }
    // Generar resumen automático
    async generateHighlights(videoPath, options) {
        const analysis = await this.analyzeVideo(videoPath, true);
        const highlights = await this.detectHighlights(videoPath, analysis);
        const highlightPath = (0, path_1.join)(this.videoStorage, 'highlights', `${(0, uuid_1.v4)()}.mp4`);
        // Concatenar clips destacados
        await this.concatenateClips(highlights, highlightPath);
        return highlightPath;
    }
    // Seguimiento de jugadores
    async trackPlayers(videoPath) {
        // Usar YOLOv5 para detección de jugadores
        const detectionsPath = (0, path_1.join)(this.tempStorage, `${(0, uuid_1.v4)()}_detections.json`);
        await execAsync(`python scripts/track_players.py ${videoPath} ${detectionsPath}`);
        // Leer y procesar resultados
        const detections = require(detectionsPath);
        return this.processPlayerDetections(detections);
    }
    // Análisis de eventos
    async detectEvents(videoPath) {
        // Usar modelo de ML para detectar eventos
        const eventsPath = (0, path_1.join)(this.tempStorage, `${(0, uuid_1.v4)()}_events.json`);
        await execAsync(`python scripts/detect_events.py ${videoPath} ${eventsPath}`);
        // Leer y procesar resultados
        const events = require(eventsPath);
        return this.processEvents(events);
    }
    // Generar heatmaps
    async generateHeatmap(trackingData) {
        return trackingData.map(player => ({
            playerId: player.playerId,
            heatmap: this.calculateHeatmap(player.positions)
        }));
    }
    // Métodos privados auxiliares
    async validateVideo(videoPath) {
        const metadata = await this.getVideoMetadata(videoPath);
        const format = metadata.format.toLowerCase();
        if (!this.allowedFormats.includes(format)) {
            throw new errors_1.ValidationError(`Invalid video format. Allowed formats: ${this.allowedFormats.join(', ')}`);
        }
        if (metadata.size > this.maxFileSize) {
            throw new errors_1.ValidationError(`Video file too large. Maximum size: ${this.maxFileSize / (1024 * 1024)}MB`);
        }
    }
    async processVideoWithFFmpeg(inputPath, outputPath, options) {
        return new Promise((resolve, reject) => {
            let command = (0, fluent_ffmpeg_1.default)(inputPath);
            if (options.startTime) {
                command = command.setStartTime(options.startTime);
            }
            if (options.duration) {
                command = command.setDuration(options.duration);
            }
            if (options.quality) {
                command = command.videoQuality(options.quality);
            }
            command
                .output(outputPath)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });
    }
    async getVideoMetadata(videoPath) {
        return new Promise((resolve, reject) => {
            fluent_ffmpeg_1.default.ffprobe(videoPath, (err, metadata) => {
                if (err)
                    reject(err);
                else
                    resolve(metadata);
            });
        });
    }
    async analyzeVideo(videoPath, track) {
        const analysis = {};
        if (track) {
            analysis.players = await this.trackPlayers(videoPath);
            analysis.events = await this.detectEvents(videoPath);
            // Generar heatmaps para cada jugador
            const heatmaps = await this.generateHeatmap(analysis.players);
            analysis.players = analysis.players.map((player, index) => ({
                ...player,
                heatmap: heatmaps[index].heatmap
            }));
        }
        return analysis;
    }
    async detectHighlights(videoPath, analysis) {
        // Implementar lógica de detección de momentos destacados
        // basada en eventos y análisis del video
        return [];
    }
    async concatenateClips(clips, outputPath) {
        // Implementar lógica de concatenación de clips
    }
    processPlayerDetections(detections) {
        // Procesar y convertir detecciones de YOLO
        return [];
    }
    processEvents(events) {
        // Procesar y clasificar eventos detectados
        return [];
    }
    calculateHeatmap(positions) {
        // Implementar cálculo de heatmap basado en posiciones
        return [];
    }
}
exports.VideoService = VideoService;
exports.videoService = new VideoService();
//# sourceMappingURL=videoService.js.map