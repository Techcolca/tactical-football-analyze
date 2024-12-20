"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TacticalAnalysisService = void 0;
const openai_1 = __importDefault(require("openai"));
class TacticalAnalysisService {
    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY no está configurada');
        }
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
            dangerouslyAllowBrowser: true
        });
        console.log('TacticalAnalysisService inicializado correctamente');
    }
    async getAIResponse(input) {
        console.log('Enviando consulta a OpenAI:', input);
        const systemPrompt = `Eres un entrenador de fútbol profesional con más de 25 años de experiencia internacional.
    Tu objetivo es proporcionar análisis tácticos detallados y recomendaciones específicas.
    Considera siempre:
    - Formaciones y tácticas modernas
    - Desarrollo de jugadores
    - Adaptabilidad a diferentes situaciones
    - Ejercicios de entrenamiento específicos
    
    Formato de respuesta:
    1. Resumen breve
    2. Análisis táctico detallado
    3. Jugadores clave y sus roles
    4. Recomendaciones específicas
    5. Variantes tácticas`;
        try {
            console.log('Iniciando llamada a OpenAI API...');
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: input }
                ],
                temperature: 0.7,
                max_tokens: 1000
            });
            console.log('Respuesta recibida de OpenAI');
            return completion.choices[0].message.content || '';
        }
        catch (error) {
            console.error('Error al obtener respuesta de OpenAI:', error);
            throw error;
        }
    }
    async analyzeQuery(input) {
        try {
            console.log('Iniciando análisis de consulta:', input);
            const response = await this.getAIResponse(input);
            console.log('Respuesta completa recibida, procesando...');
            // Procesar la respuesta en secciones
            const sections = response.split('\n');
            const analysis = {
                summary: '',
                tacticalAnalysis: '',
                keyPlayers: [],
                recommendations: [],
                variants: []
            };
            let currentSection = '';
            for (const line of sections) {
                if (line.includes('1.')) {
                    currentSection = 'summary';
                }
                else if (line.includes('2.')) {
                    currentSection = 'tacticalAnalysis';
                }
                else if (line.includes('3.')) {
                    currentSection = 'keyPlayers';
                }
                else if (line.includes('4.')) {
                    currentSection = 'recommendations';
                }
                else if (line.includes('5.')) {
                    currentSection = 'variants';
                }
                else if (line.trim()) {
                    switch (currentSection) {
                        case 'summary':
                            analysis.summary += line + '\n';
                            break;
                        case 'tacticalAnalysis':
                            analysis.tacticalAnalysis += line + '\n';
                            break;
                        case 'keyPlayers':
                            analysis.keyPlayers.push(line.trim());
                            break;
                        case 'recommendations':
                            analysis.recommendations.push(line.trim());
                            break;
                        case 'variants':
                            analysis.variants.push(line.trim());
                            break;
                    }
                }
            }
            console.log('Análisis procesado exitosamente');
            return analysis;
        }
        catch (error) {
            console.error('Error en analyzeQuery:', error);
            throw error;
        }
    }
    async generateTrainingAnimation(exerciseType, players, duration) {
        // Implementación básica de la animación
        return {
            type: exerciseType,
            players: players,
            duration: duration,
            frames: []
        };
    }
}
exports.TacticalAnalysisService = TacticalAnalysisService;
//# sourceMappingURL=tacticalAnalysisService.js.map