import { Configuration, OpenAIApi } from 'openai';
import { AIService } from './aiService';
import { MatchAnalysis, TeamFormation, PlayerPosition } from '../types/analysis';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class ChatService {
  private static async processMessage(
    message: string,
    context: {
      formation?: TeamFormation;
      analysis?: MatchAnalysis;
      previousMessages: ChatMessage[];
    }
  ): Promise<{
    response: string;
    analysis?: any;
    suggestions?: any[];
  }> {
    try {
      const messages: ChatMessage[] = [
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

      const aiResponse = response.data.choices[0].message?.content || '';

      // Analizar el tipo de consulta y realizar acciones específicas
      if (message.toLowerCase().includes('analizar formación') && context.formation) {
        const analysis = await AIService.analyzeTactics(
          context.formation.pattern,
          context.formation.positions
        );
        return {
          response: aiResponse,
          analysis
        };
      }

      if (message.toLowerCase().includes('sugerir movimientos') && context.formation) {
        const playerPosition = this.extractPlayerPosition(message);
        if (playerPosition) {
          const suggestions = await AIService.getMovementSuggestions(
            playerPosition,
            JSON.stringify(context)
          );
          return {
            response: aiResponse,
            suggestions
          };
        }
      }

      return { response: aiResponse };
    } catch (error) {
      console.error('Error en el procesamiento del mensaje:', error);
      throw new Error('No se pudo procesar el mensaje');
    }
  }

  static async generateResponse(
    message: string,
    context: {
      formation?: TeamFormation;
      analysis?: MatchAnalysis;
      previousMessages: ChatMessage[];
    }
  ): Promise<{
    response: string;
    analysis?: any;
    suggestions?: any[];
  }> {
    try {
      return await this.processMessage(message, context);
    } catch (error) {
      console.error('Error al generar respuesta:', error);
      throw error;
    }
  }

  private static extractPlayerPosition(message: string): string | null {
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

  static async analyzeGameContext(
    gameContext: {
      score: string;
      minute: number;
      possession: number;
      lastEvents: string[];
    }
  ): Promise<{
    tacticalSuggestions: string[];
    riskAnalysis: string;
    pressureRecommendation: string;
  }> {
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
        riskAnalysis: sections[1]?.trim() || '',
        pressureRecommendation: sections[2]?.trim() || ''
      };
    } catch (error) {
      console.error('Error al analizar contexto del juego:', error);
      throw new Error('No se pudo analizar el contexto del juego');
    }
  }

  private static extractPoints(text: string): string[] {
    return text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').trim());
  }
}
