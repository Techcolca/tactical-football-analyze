"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const openai_1 = require("openai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const configuration = new openai_1.Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new openai_1.OpenAIApi(configuration);
class AIService {
    static async analyzeTactics(formation, playerPositions, context) {
        try {
            const prompt = `
        Analiza la siguiente formación táctica de fútbol:
        Formación: ${formation}
        Posiciones de jugadores: ${JSON.stringify(playerPositions)}
        Contexto adicional: ${context || 'No proporcionado'}

        Por favor, proporciona un análisis detallado incluyendo:
        1. Fortalezas de la formación
        2. Debilidades potenciales
        3. Sugerencias tácticas
      `;
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt,
                max_tokens: 500,
                temperature: 0.7,
            });
            const analysis = response.data.choices[0].text || '';
            // Procesar la respuesta
            const sections = analysis.split('\n\n');
            return {
                formation,
                strengths: this.extractPoints(sections[0]),
                weaknesses: this.extractPoints(sections[1]),
                suggestions: this.extractPoints(sections[2]),
            };
        }
        catch (error) {
            console.error('Error en el análisis táctico:', error);
            throw new Error('No se pudo completar el análisis táctico');
        }
    }
    static async getMovementSuggestions(playerPosition, gameContext) {
        try {
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `
          Como entrenador de fútbol, sugiere movimientos tácticos para un jugador en la posición ${playerPosition}.
          Contexto del juego: ${gameContext}
          Proporciona 3 sugerencias específicas de movimiento.
        `,
                max_tokens: 200,
                temperature: 0.7,
            });
            return this.extractPoints(response.data.choices[0].text || '');
        }
        catch (error) {
            console.error('Error al obtener sugerencias de movimiento:', error);
            throw new Error('No se pudieron generar sugerencias de movimiento');
        }
    }
    static extractPoints(text) {
        return text
            .split('\n')
            .filter(line => line.trim().length > 0)
            .map(line => line.replace(/^\d+\.\s*/, '').trim());
    }
}
exports.AIService = AIService;
//# sourceMappingURL=aiService.js.map