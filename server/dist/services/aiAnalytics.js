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
exports.aiAnalytics = void 0;
const openai_1 = require("openai");
const tf = __importStar(require("@tensorflow/tfjs-node"));
class AIAnalytics {
    constructor() {
        this.model = null;
        const configuration = new openai_1.Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.openai = new openai_1.OpenAIApi(configuration);
        this.initializeModel();
    }
    async initializeModel() {
        // Cargar modelo pre-entrenado para análisis de posiciones
        this.model = await tf.loadLayersModel('file://./models/tactical_analysis_model/model.json');
    }
    async analyzeTacticalSetup(formation) {
        try {
            const prompt = `
        Analiza la siguiente formación táctica:
        Formación: ${formation.pattern}
        Posiciones: ${JSON.stringify(formation.positions)}
        
        Proporciona un análisis detallado incluyendo:
        1. Fortalezas y debilidades
        2. Oportunidades de ataque
        3. Vulnerabilidades defensivas
        4. Recomendaciones de ajustes
      `;
            const response = await this.openai.createCompletion({
                model: "text-davinci-003",
                prompt,
                max_tokens: 1000,
                temperature: 0.7,
            });
            const analysis = response.data.choices[0].text || '';
            return this.parseAnalysis(analysis);
        }
        catch (error) {
            console.error('Error en análisis táctico:', error);
            throw new Error('Error al analizar la formación táctica');
        }
    }
    async getPressingSuggestions(playerPositions, ballPosition) {
        // Convertir posiciones a tensor
        const positionsTensor = tf.tensor2d(playerPositions.map(p => [p.x, p.y]));
        // Predecir zonas de presión óptimas
        const predictions = this.model.predict(positionsTensor);
        const pressureZones = await predictions.array();
        // Generar sugerencias basadas en las predicciones
        const suggestions = this.generatePressingSuggestions(pressureZones, ballPosition);
        return suggestions;
    }
    async analyzePlayerMovement(playerPositions, timeframe = 5) {
        // Análisis de patrones de movimiento
        const movementPatterns = this.detectMovementPatterns(playerPositions);
        // Generar prompt para análisis de IA
        const prompt = `
      Analiza los siguientes patrones de movimiento:
      ${JSON.stringify(movementPatterns)}
      
      Identifica:
      1. Patrones tácticos
      2. Áreas de mejora
      3. Sugerencias de movimiento
    `;
        const response = await this.openai.createCompletion({
            model: "text-davinci-003",
            prompt,
            max_tokens: 500,
            temperature: 0.7,
        });
        return {
            patterns: movementPatterns,
            analysis: response.data.choices[0].text,
        };
    }
    async getCounterAttackOpportunities(teamPositions, opponentPositions) {
        // Análisis de espacios y oportunidades
        const spaces = this.analyzeSpaces(teamPositions, opponentPositions);
        const vulnerabilities = this.detectVulnerabilities(opponentPositions);
        const prompt = `
      Analiza las siguientes oportunidades de contraataque:
      Espacios disponibles: ${JSON.stringify(spaces)}
      Vulnerabilidades defensivas: ${JSON.stringify(vulnerabilities)}
      
      Proporciona:
      1. Rutas de contraataque recomendadas
      2. Jugadores clave a involucrar
      3. Timing sugerido
    `;
        const response = await this.openai.createCompletion({
            model: "text-davinci-003",
            prompt,
            max_tokens: 500,
            temperature: 0.7,
        });
        return {
            opportunities: {
                spaces,
                vulnerabilities,
            },
            recommendations: response.data.choices[0].text,
        };
    }
    async getSetPieceSuggestions(type, position, playerPositions) {
        // Análisis de posiciones para jugada a balón parado
        const setup = this.analyzeSetPieceSetup(type, position, playerPositions);
        const prompt = `
      Sugiere estrategias para la siguiente jugada a balón parado:
      Tipo: ${type}
      Posición: ${JSON.stringify(position)}
      Disposición actual: ${JSON.stringify(setup)}
      
      Proporciona:
      1. Movimientos recomendados
      2. Variantes tácticas
      3. Roles específicos de jugadores
    `;
        const response = await this.openai.createCompletion({
            model: "text-davinci-003",
            prompt,
            max_tokens: 700,
            temperature: 0.7,
        });
        return {
            setup,
            suggestions: response.data.choices[0].text,
        };
    }
    parseAnalysis(analysis) {
        const sections = analysis.split('\n\n');
        return {
            strengths: this.extractPoints(sections[0]),
            weaknesses: this.extractPoints(sections[1]),
            attackingOpportunities: this.extractPoints(sections[2]),
            defensiveVulnerabilities: this.extractPoints(sections[3]),
            recommendations: this.extractPoints(sections[4]),
        };
    }
    extractPoints(text) {
        return text
            .split('\n')
            .filter(line => line.trim().length > 0)
            .map(line => line.replace(/^\d+\.\s*/, '').trim());
    }
    detectMovementPatterns(positions) {
        // Implementar detección de patrones usando TensorFlow.js
        const positionsTensor = tf.tensor2d(positions.map(p => [p.x, p.y]));
        // Análisis de clusters y patrones
        const patterns = {
            clusters: [],
            movements: [],
            trends: [],
        };
        return patterns;
    }
    analyzeSpaces(team, opponents) {
        // Análisis de espacios libres y zonas de oportunidad
        const spaces = {
            openAreas: [],
            dangerZones: [],
            opportunities: [],
        };
        return spaces;
    }
    detectVulnerabilities(positions) {
        // Detección de vulnerabilidades en la formación
        const vulnerabilities = {
            gaps: [],
            exposedAreas: [],
            riskZones: [],
        };
        return vulnerabilities;
    }
    analyzeSetPieceSetup(type, position, players) {
        // Análisis de disposición para jugadas a balón parado
        const setup = {
            optimalPositions: [],
            movements: [],
            roles: [],
        };
        return setup;
    }
    generatePressingSuggestions(zones, ballPosition) {
        // Generar sugerencias basadas en zonas de presión
        const suggestions = [];
        // Implementar lógica de generación de sugerencias
        return suggestions;
    }
}
exports.aiAnalytics = new AIAnalytics();
//# sourceMappingURL=aiAnalytics.js.map