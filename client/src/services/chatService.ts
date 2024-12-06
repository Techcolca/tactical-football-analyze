import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

interface ChatContext {
  formation?: any;
  analysis?: any;
  previousMessages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
}

interface GameContext {
  score: string;
  minute: number;
  possession: number;
  lastEvents: string[];
}

export class ChatService {
  static async sendMessage(message: string, context: ChatContext) {
    try {
      const response = await axios.post(`${API_URL}/api/chat/message`, {
        message,
        context
      });

      return response.data;
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      throw error;
    }
  }

  static async analyzeGameContext(gameContext: GameContext) {
    try {
      const response = await axios.post(`${API_URL}/api/chat/analyze-context`, gameContext);
      return response.data;
    } catch (error) {
      console.error('Error al analizar contexto:', error);
      throw error;
    }
  }

  static processMessageForSuggestions(message: string): string[] {
    // Procesar el mensaje para extraer palabras clave y generar sugerencias
    const suggestions: string[] = [];
    
    const keywords = {
      formation: ['formación', 'táctica', 'posición', 'sistema'],
      player: ['jugador', 'movimiento', 'posición'],
      analysis: ['analizar', 'analisis', 'evaluar'],
      pressure: ['presión', 'pressing', 'presionar'],
      defense: ['defensa', 'defender', 'marca'],
      attack: ['ataque', 'atacar', 'gol']
    };

    // Verificar palabras clave en el mensaje
    Object.entries(keywords).forEach(([category, words]) => {
      words.forEach(word => {
        if (message.toLowerCase().includes(word)) {
          switch (category) {
            case 'formation':
              suggestions.push('Analizar formación actual');
              suggestions.push('Sugerir ajustes tácticos');
              break;
            case 'player':
              suggestions.push('Analizar movimientos del jugador');
              suggestions.push('Sugerir posicionamiento');
              break;
            case 'analysis':
              suggestions.push('Realizar análisis táctico completo');
              suggestions.push('Evaluar efectividad del sistema');
              break;
            case 'pressure':
              suggestions.push('Analizar zonas de presión');
              suggestions.push('Sugerir ajustes de pressing');
              break;
            case 'defense':
              suggestions.push('Evaluar línea defensiva');
              suggestions.push('Sugerir ajustes defensivos');
              break;
            case 'attack':
              suggestions.push('Analizar oportunidades de ataque');
              suggestions.push('Sugerir movimientos ofensivos');
              break;
          }
        }
      });
    });

    // Eliminar duplicados y retornar máximo 3 sugerencias
    return [...new Set(suggestions)].slice(0, 3);
  }

  static formatAnalysisResponse(analysis: any): string {
    let formattedResponse = '';

    if (analysis.strengths?.length) {
      formattedResponse += '\n\n💪 Fortalezas:\n';
      analysis.strengths.forEach((strength: string) => {
        formattedResponse += `• ${strength}\n`;
      });
    }

    if (analysis.weaknesses?.length) {
      formattedResponse += '\n⚠️ Puntos a mejorar:\n';
      analysis.weaknesses.forEach((weakness: string) => {
        formattedResponse += `• ${weakness}\n`;
      });
    }

    if (analysis.suggestions?.length) {
      formattedResponse += '\n💡 Sugerencias:\n';
      analysis.suggestions.forEach((suggestion: string) => {
        formattedResponse += `• ${suggestion}\n`;
      });
    }

    return formattedResponse;
  }

  static getMessageTemplate(type: string): string {
    const templates: { [key: string]: string } = {
      formation: '¿Podrías analizar la siguiente formación? [Formación]',
      player: '¿Qué movimientos sugieres para el jugador en la posición [Posición]?',
      pressure: '¿Cómo podríamos mejorar la presión en [Zona]?',
      counterattack: '¿Qué estrategias de contraataque recomiendas contra esta formación?',
      setpiece: '¿Qué variantes de tiro libre sugieres para esta situación?',
      substitution: '¿Qué cambios tácticos recomiendas para este momento del partido?'
    };

    return templates[type] || '';
  }
}
