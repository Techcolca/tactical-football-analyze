import axios from 'axios';

const API_URL = 'http://localhost:3006';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

interface CoachResponse {
  summary: string;
  tacticalAnalysis: string;
  keyPlayers: string[];
  recommendations: string[];
  variants: string[];
  trainingAnimation?: any;
}

interface TacticalAnalysis {
  formation: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class AITacticalAssistant {
  private chatHistory: ChatMessage[] = [];
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
    this.validateApiUrl();
  }

  private validateApiUrl() {
    if (!this.baseUrl) {
      throw new Error('API_URL no está configurada. Por favor, verifica tus variables de entorno.');
    }
  }

  private async makeApiRequest<T>(endpoint: string, data: any): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log(`Realizando petición a: ${url}`);
      
      const response = await axiosInstance.post(url, data);

      if (!response.data.success) {
        const errorText = response.data.error;
        console.error('Error en la respuesta:', errorText);
        throw new Error(`Error en la petición: ${errorText}`);
      }

      return response.data.data;
    } catch (error) {
      console.error('Error en la petición API:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('No se pudo conectar con el servidor. Por favor, verifica que el servidor esté corriendo y accesible.');
      }
      throw error;
    }
  }

  async analyzeTacticalSetup(
    players: any[],
    currentFormation: string
  ): Promise<TacticalAnalysis> {
    const requestData = {
      formation: currentFormation,
      playerPositions: players,
      context: 'Análisis en tiempo real del tablero táctico',
    };

    try {
      return await this.makeApiRequest<TacticalAnalysis>('/ai/tactical-analysis', requestData);
    } catch (error) {
      console.error('Error en analyzeTacticalSetup:', error);
      // Devolver un análisis por defecto en caso de error
      return {
        formation: currentFormation,
        strengths: ['No se pudo realizar el análisis'],
        weaknesses: ['Error de conexión con el servidor'],
        suggestions: ['Por favor, intenta de nuevo más tarde'],
      };
    }
  }

  async getMovementSuggestions(
    player: any,
    context: string
  ): Promise<string[]> {
    const requestData = {
      player,
      context,
    };

    try {
      const response = await this.makeApiRequest<{ suggestions: string[] }>('/ai/suggest-movements', requestData);
      return response.suggestions;
    } catch (error) {
      console.error('Error en getMovementSuggestions:', error);
      return ['No se pudieron obtener sugerencias en este momento'];
    }
  }

  async chat(message: string): Promise<string> {
    try {
      console.log('Enviando mensaje a:', `${this.baseUrl}/ai/chat`);
      console.log('Datos:', {
        message,
        chatHistory: this.chatHistory,
      });

      const response = await this.makeApiRequest<{ response: string }>('/ai/chat', {
        message,
        chatHistory: this.chatHistory,
      });

      // Actualizar el historial del chat
      this.chatHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: response.response }
      );

      // Mantener solo los últimos 10 mensajes para evitar tokens excesivos
      if (this.chatHistory.length > 10) {
        this.chatHistory = this.chatHistory.slice(-10);
      }

      return response.response;
    } catch (error) {
      console.error('Error en chat:', error);
      throw error;
    }
  }

  clearChatHistory(): void {
    this.chatHistory = [];
  }
}

export const aiTacticalAssistant = new AITacticalAssistant();

export const useAITacticalAssistant = () => {
  const getCoachAdvice = async (input: string): Promise<CoachResponse> => {
    try {
      console.log('Enviando consulta al servidor:', input);
      
      // Enviar tanto input como prompt para compatibilidad
      const response = await axiosInstance.post('/api/ai/tactical-analysis', { 
        input,
        prompt: input 
      });
      
      console.log('Respuesta del servidor:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Error en el análisis táctico');
      }

      // Si no hay datos, crear una respuesta por defecto
      if (!response.data.data) {
        return {
          summary: response.data.response || 'No hay respuesta disponible',
          tacticalAnalysis: response.data.response || 'No hay análisis disponible',
          keyPlayers: [],
          recommendations: [],
          variants: []
        };
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error al obtener consejo del entrenador:', error);
      
      if (error.response) {
        console.error('Respuesta del servidor:', error.response.data);
        throw new Error(error.response.data.error || 'Error en la comunicación con el servidor');
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('La conexión con el servidor ha expirado. Por favor, intenta de nuevo.');
      }
      
      if (error.code === 'ERR_NETWORK') {
        throw new Error('No se puede conectar con el servidor. Por favor, verifica tu conexión.');
      }
      
      throw new Error('Error al procesar la consulta: ' + (error.message || 'Error desconocido'));
    }
  };

  const generateTrainingAnimation = async (
    exerciseType: string,
    players: any[],
    duration: number
  ): Promise<any> => {
    try {
      const response = await axiosInstance.post('/api/ai/generate-animation', {
        exerciseType,
        players,
        duration
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al generar la animación');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error al generar la animación:', error);
      if (error.response) {
        throw new Error(error.response.data.error || 'Error al generar la animación');
      }
      throw new Error('Error al generar la animación: ' + (error.message || 'Error desconocido'));
    }
  };

  return {
    getCoachAdvice,
    generateTrainingAnimation
  };
};
