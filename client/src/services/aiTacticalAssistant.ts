import axios from 'axios';

const API_URL = 'http://localhost:3017';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

interface CoachResponse {
  summary?: string;
  tacticalAnalysis?: string;
  keyPlayers?: string[];
  recommendations?: string[];
  variants?: string[];
  response?: string;
}

export const getCoachAdvice = async (input: string, language: string): Promise<string> => {
  try {
    console.log('Sending query to server:', { input, language });
    
    const response = await axiosInstance.post('/api/ai/tactical-analysis', { 
      input,
      prompt: input,
      language // Enviamos el idioma al servidor
    });

    // If response is an object with sections, format it as text
    if (response.data && typeof response.data === 'object') {
      const {
        summary,
        tacticalAnalysis,
        keyPlayers,
        recommendations,
        variants
      } = response.data;

      let formattedResponse = '';
      
      // Formatear la respuesta según el idioma
      if (language === 'es') {
        if (summary) formattedResponse += `Resumen:\n${summary}\n\n`;
        if (tacticalAnalysis) formattedResponse += `Análisis Táctico:\n${tacticalAnalysis}\n\n`;
        if (keyPlayers && keyPlayers.length) formattedResponse += `Puntos Clave:\n${keyPlayers.join('\n')}\n\n`;
        if (recommendations && recommendations.length) formattedResponse += `Recomendaciones:\n${recommendations.join('\n')}\n\n`;
        if (variants && variants.length) formattedResponse += `Variaciones:\n${variants.join('\n')}`;
      } else if (language === 'fr') {
        if (summary) formattedResponse += `Résumé:\n${summary}\n\n`;
        if (tacticalAnalysis) formattedResponse += `Analyse Tactique:\n${tacticalAnalysis}\n\n`;
        if (keyPlayers && keyPlayers.length) formattedResponse += `Points Clés:\n${keyPlayers.join('\n')}\n\n`;
        if (recommendations && recommendations.length) formattedResponse += `Recommandations:\n${recommendations.join('\n')}\n\n`;
        if (variants && variants.length) formattedResponse += `Variations:\n${variants.join('\n')}`;
      } else {
        if (summary) formattedResponse += `Summary:\n${summary}\n\n`;
        if (tacticalAnalysis) formattedResponse += `Tactical Analysis:\n${tacticalAnalysis}\n\n`;
        if (keyPlayers && keyPlayers.length) formattedResponse += `Key Points:\n${keyPlayers.join('\n')}\n\n`;
        if (recommendations && recommendations.length) formattedResponse += `Recommendations:\n${recommendations.join('\n')}\n\n`;
        if (variants && variants.length) formattedResponse += `Variations:\n${variants.join('\n')}`;
      }

      return formattedResponse.trim();
    }

    // If response is directly text
    if (typeof response.data === 'string') {
      return response.data;
    }

    // If there's an error message in the response
    if (response.data.error) {
      throw new Error(response.data.error);
    }

    // Error messages in different languages
    switch (language) {
      case 'es':
        return 'No se pudo procesar la respuesta del servidor';
      case 'fr':
        return 'Impossible de traiter la réponse du serveur';
      default:
        return 'Could not process server response';
    }
  } catch (error: any) {
    console.error('Error getting coach advice:', error);
    
    // Error messages in different languages
    const errorMessage = error.response?.data?.error || error.message;
    switch (language) {
      case 'es':
        throw new Error(`Error al procesar la consulta: ${errorMessage}`);
      case 'fr':
        throw new Error(`Erreur lors du traitement de la requête: ${errorMessage}`);
      default:
        throw new Error(`Error processing query: ${errorMessage}`);
    }
  }
};
