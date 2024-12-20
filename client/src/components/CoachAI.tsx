import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Container,
  Alert
} from '@mui/material';
import {
  Mic,
  MicOff,
  VolumeUp,
  VolumeOff,
  Send,
} from '@mui/icons-material';
import LanguageSelector from './LanguageSelector';
import { getCoachAdvice } from '../services/aiTacticalAssistant';

interface CoachAIProps {
  selectedLanguage: string;
}

const CoachAI: React.FC<CoachAIProps> = ({ selectedLanguage }) => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [placeholder, setPlaceholder] = useState(getPlaceholderText(selectedLanguage));

  const recognition = useRef<any>(null);
  const synthesis = window.speechSynthesis;

  // Actualizar el placeholder cuando cambia el idioma
  useEffect(() => {
    setPlaceholder(getPlaceholderText(selectedLanguage));
  }, [selectedLanguage]);

  // Función para obtener el texto del placeholder según el idioma
  function getPlaceholderText(language: string): string {
    switch (language) {
      case 'es':
        return 'Haz una pregunta sobre táctica futbolística...';
      case 'fr':
        return 'Posez une question sur la tactique du football...';
      default:
        return 'Ask a question about football tactics...';
    }
  }

  // Función para obtener el texto del botón según el idioma
  function getButtonText(language: string): string {
    switch (language) {
      case 'es':
        return 'Preguntar';
      case 'fr':
        return 'Demander';
      default:
        return 'Ask';
    }
  }

  // Función para manejar el reconocimiento de voz
  const handleSpeechRecognition = () => {
    if (!isListening) {
      setIsListening(true);
      setError(null);
      
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = selectedLanguage === 'en' ? 'en-US' : 
                        selectedLanguage === 'es' ? 'es-ES' : 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        console.log('Speech recognition started');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Recognized text:', transcript);
        setInput(transcript); // Solo actualiza el input, no envía la pregunta
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        const errorMessages = {
          es: 'Error en el reconocimiento de voz',
          fr: 'Erreur de reconnaissance vocale',
          en: 'Speech recognition error'
        };
        setError(errorMessages[selectedLanguage as keyof typeof errorMessages] || errorMessages.en);
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      recognition.start();
    }
  };

  // Función para manejar el envío de texto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Sending request:', {
        prompt: input,
        language: selectedLanguage
      });

      const response = await fetch('http://localhost:3017/api/tactical-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: input,
          language: selectedLanguage
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error de red' }));
        console.error('Server response error:', response.status, errorData);
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received response:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }

      await handleResponse(data);
      
    } catch (error: any) {
      console.error('Error completo:', error);
      const errorMessages = {
        es: 'Error al procesar tu pregunta: ' + (error.message || 'Inténtalo de nuevo'),
        fr: 'Erreur lors du traitement de votre question: ' + (error.message || 'Veuillez réessayer'),
        en: 'Error processing your question: ' + (error.message || 'Please try again')
      };
      setError(errorMessages[selectedLanguage as keyof typeof errorMessages] || errorMessages.en);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponse = async (data: any) => {
    try {
      let fullResponse = data.response;
      
      // Añadir las preguntas de seguimiento según el idioma
      const followUpQuestions = {
        fr: "\n\nQuestions de suivi :\n1. Souhaitez-vous approfondir un aspect spécifique de cette analyse ?\n2. Voulez-vous des conseils supplémentaires sur une position particulière ?\n3. Désirez-vous une analyse plus détaillée des variations tactiques ?",
        es: "\n\nPreguntas de seguimiento:\n1. ¿Deseas profundizar en algún aspecto específico de este análisis?\n2. ¿Quieres consejos adicionales sobre alguna posición en particular?\n3. ¿Te gustaría un análisis más detallado de las variaciones tácticas?",
        en: "\n\nFollow-up questions:\n1. Would you like to explore any specific aspect of this analysis in more detail?\n2. Do you want additional advice about any particular position?\n3. Would you like a more detailed analysis of the tactical variations?"
      };

      fullResponse += followUpQuestions[selectedLanguage as keyof typeof followUpQuestions] || followUpQuestions.en;
      
      setResponse(fullResponse);
      await handleSpeak(fullResponse);
    } catch (error) {
      console.error('Error handling response:', error);
      const errorMessages = {
        es: 'Error al procesar la respuesta',
        fr: 'Erreur lors du traitement de la réponse',
        en: 'Error processing response'
      };
      setError(errorMessages[selectedLanguage as keyof typeof errorMessages] || errorMessages.en);
    }
  };

  // Función para manejar la síntesis de voz
  const handleSpeak = async (text: string) => {
    try {
      const synth = window.speechSynthesis;
      
      // Dividir el texto en secciones más grandes (por párrafos)
      const sections = text.split(/\n\n+/).filter(section => section.trim());
      console.log('Text sections to read:', sections);

      // Función para leer una sección
      const speakSection = async (sectionText: string) => {
        return new Promise<void>((resolve) => {
          const utterance = new SpeechSynthesisUtterance(sectionText);

          utterance.onend = () => resolve();
          utterance.onerror = (event) => {
            console.error('Error speaking section:', event);
            resolve();
          };

          // Obtener todas las voces disponibles
          const voices = synth.getVoices();

          // Configurar la voz según el idioma
          switch (selectedLanguage) {
            case 'es':
              const spanishVoice = voices.find(voice => 
                voice.lang === 'es-ES' && voice.name.includes('Spanish')
              ) || voices.find(voice => voice.lang === 'es-ES');
              
              if (spanishVoice) {
                utterance.voice = spanishVoice;
              }
              utterance.lang = 'es-ES';
              utterance.rate = 1.1;  // Velocidad ligeramente más rápida
              utterance.pitch = 1.0;
              break;

            case 'fr':
              const paulVoice = voices.find(voice => 
                voice.name === 'Microsoft Paul' && voice.lang === 'fr-FR'
              );
              
              if (paulVoice) {
                utterance.voice = paulVoice;
              } else {
                const julieVoice = voices.find(voice => 
                  voice.name === 'Microsoft Julie' && voice.lang === 'fr-FR'
                );
                if (julieVoice) {
                  utterance.voice = julieVoice;
                }
              }
              utterance.lang = 'fr-FR';
              utterance.rate = 1.2;  // Velocidad más rápida para francés
              utterance.pitch = 1.0;
              break;

            default: // 'en'
              const englishVoice = voices.find(voice => 
                voice.lang === 'en-US' && voice.name.includes('English')
              ) || voices.find(voice => voice.lang === 'en-US');
              
              if (englishVoice) {
                utterance.voice = englishVoice;
              }
              utterance.lang = 'en-US';
              utterance.rate = 1.1;  // Velocidad ligeramente más rápida
              utterance.pitch = 1.0;
          }

          synth.speak(utterance);
        });
      };

      // Detener cualquier síntesis anterior
      synth.cancel();

      // Leer cada sección secuencialmente
      for (const section of sections) {
        if (section.trim()) {
          await speakSection(section.trim());
          // Pausa más corta entre secciones
          await new Promise(resolve => setTimeout(resolve, 250));
        }
      }

    } catch (error) {
      console.error('Error en la síntesis de voz:', error);
      const errorMessages = {
        es: 'Error al reproducir el audio',
        fr: 'Erreur lors de la lecture audio',
        en: 'Error playing audio'
      };
      setError(errorMessages[selectedLanguage as keyof typeof errorMessages] || errorMessages.en);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton
              color={isListening ? "error" : "primary"}
              onClick={handleSpeechRecognition}
              disabled={isLoading}
              sx={{ mr: 2 }}
            >
              {isListening ? <MicOff /> : <Mic />}
            </IconButton>
            <Typography variant="body2" color={isListening ? "error" : "textSecondary"}>
              {isListening ? 
                (selectedLanguage === 'es' ? 'Escuchando...' :
                 selectedLanguage === 'fr' ? 'Écoute en cours...' :
                 'Listening...') :
                (selectedLanguage === 'es' ? 'Haz clic para hablar' :
                 selectedLanguage === 'fr' ? 'Cliquez pour parler' :
                 'Click to speak')}
            </Typography>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={isLoading || !input.trim()}
            startIcon={isLoading ? <CircularProgress size={20} /> : <Send />}
            fullWidth
          >
            {getButtonText(selectedLanguage)}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        {response && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              {selectedLanguage === 'es' ? 'Respuesta del Entrenador' :
               selectedLanguage === 'fr' ? 'Réponse du Coach' :
               'Coach\'s Response'}
            </Typography>
            <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {response}
              </Typography>
            </Paper>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default CoachAI;
