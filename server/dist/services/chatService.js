"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const openai_1 = require("openai");
const aiService_1 = require("./aiService");
const configuration = new openai_1.Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new openai_1.OpenAIApi(configuration);
class ChatService {
    static async processMessage(message, context) {
        var _a;
        try {
            const messages = [
                {
                    role: 'system',
                    content: `Eres un asistente táctico de fútbol experto. Tu objetivo es ayudar a analizar tácticas, 
          formaciones y movimientos de jugadores. Debes proporcionar análisis detallados y sugerencias 
          específicas basadas en el contexto del juego y las formaciones actuales.
          
          Contexto actual:
          ${context.formation ? `Formación: ${context.formation.pattern}` : 'No hay formación seleccionada'}
          ${context.analysis ? `Análisis previo: ${JSON.stringify(context.analysis)}` : 'No hay análisis previo'}`
                },
                ...context.previousMessages,
                {
                    role: 'user',
                    content: message
                }
            ];
            const response = await openai.createChatCompletion({
                model: 'gpt-4',
                messages,
                temperature: 0.7,
                max_tokens: 500,
            });
            const aiResponse = ((_a = response.data.choices[0].message) === null || _a === void 0 ? void 0 : _a.content) || '';
            // Analizar el tipo de consulta y realizar acciones específicas
            if (message.toLowerCase().includes('analizar formación') && context.formation) {
                const analysis = await aiService_1.AIService.analyzeTactics(context.formation.pattern, context.formation.positions);
                return {
                    response: aiResponse,
                    analysis
                };
            }
            if (message.toLowerCase().includes('sugerir movimientos') && context.formation) {
                const playerPosition = this.extractPlayerPosition(message);
                if (playerPosition) {
                    const suggestions = await aiService_1.AIService.getMovementSuggestions(playerPosition, JSON.stringify(context));
                    return {
                        response: aiResponse,
                        suggestions
                    };
                }
            }
            return { response: aiResponse };
        }
        catch (error) {
            console.error('Error en el procesamiento del mensaje:', error);
            throw new Error('No se pudo procesar el mensaje');
        }
    }
    static async generateResponse(message, context) {
        try {
            return await this.processMessage(message, context);
        }
        catch (error) {
            console.error('Error al generar respuesta:', error);
            throw error;
        }
    }
    static extractPlayerPosition(message) {
        const positions = [
            'portero',
            'defensa central',
            'lateral derecho',
            'lateral izquierdo',
            'mediocentro',
            'centrocampista',
            'extremo derecho',
            'extremo izquierdo',
            'delantero'
        ];
        for (const position of positions) {
            if (message.toLowerCase().includes(position)) {
                return position;
            }
        }
        return null;
    }
    static async analyzeGameContext(gameContext) {
        var _a, _b;
        try {
            const prompt = `
        Analiza el siguiente contexto de juego y proporciona recomendaciones tácticas:
        
        Marcador: ${gameContext.score}
        Minuto: ${gameContext.minute}
        Posesión: ${gameContext.possession}%
        Últimos eventos: ${gameContext.lastEvents.join(', ')}

        Proporciona:
        1. 3 sugerencias tácticas específicas
        2. Análisis de riesgo
        3. Recomendación de presión
      `;
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt,
                max_tokens: 300,
                temperature: 0.7,
            });
            const analysis = response.data.choices[0].text || '';
            const sections = analysis.split('\n\n');
            return {
                tacticalSuggestions: this.extractPoints(sections[0]),
                riskAnalysis: ((_a = sections[1]) === null || _a === void 0 ? void 0 : _a.trim()) || '',
                pressureRecommendation: ((_b = sections[2]) === null || _b === void 0 ? void 0 : _b.trim()) || ''
            };
        }
        catch (error) {
            console.error('Error al analizar contexto del juego:', error);
            throw new Error('No se pudo analizar el contexto del juego');
        }
    }
    static extractPoints(text) {
        return text
            .split('\n')
            .filter(line => line.trim().length > 0)
            .map(line => line.replace(/^\d+\.\s*/, '').trim());
    }
}
exports.ChatService = ChatService;
//# sourceMappingURL=chatService.js.map