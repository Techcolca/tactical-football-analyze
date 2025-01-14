import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Tooltip,
  Stack
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import SendIcon from '@mui/icons-material/Send';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { API_ENDPOINTS } from '../../config';

const CoachAI: React.FC = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Tu navegador no soporta el reconocimiento de voz.');
      return;
    }

    try {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError('');
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Error en reconocimiento de voz:', event.error);
        setError('Error en el reconocimiento de voz. Por favor, intenta nuevamente.');
        stopListening();
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.start();
    } catch (error) {
      console.error('Error al iniciar reconocimiento de voz:', error);
      setError('Error al iniciar el reconocimiento de voz.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(API_ENDPOINTS['tactical-analysis'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input }),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();
      setResponse(data.response);
      speakResponse(data.response);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al procesar tu pregunta. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const speakResponse = (text: string) => {
    if (!window.speechSynthesis) {
      setError('Tu navegador no soporta la síntesis de voz.');
      return;
    }

    // Detener cualquier síntesis anterior
    stopSpeech();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error('Error en síntesis de voz:', event);
      setError('Error en la síntesis de voz.');
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const togglePause = () => {
    if (!window.speechSynthesis) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
      <Typography variant="h5" gutterBottom>
        Coach AI - Asistente Táctico
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Haz una pregunta sobre tácticas de fútbol..."
          variant="outlined"
          disabled={isLoading}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Tooltip title={isListening ? "Detener grabación" : "Iniciar grabación"}>
            <IconButton
              color={isListening ? 'error' : 'primary'}
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading}
              sx={{ 
                width: 56, 
                height: 56,
                animation: isListening ? 'pulse 1.5s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.1)' },
                  '100%': { transform: 'scale(1)' }
                }
              }}
            >
              {isListening ? <StopIcon /> : <MicIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Enviar pregunta">
            <IconButton
              color="primary"
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              sx={{ width: 56, height: 56 }}
            >
              {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {response && (
        <Paper elevation={1} sx={{ p: 2, backgroundColor: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
              Respuesta:
            </Typography>
            <Stack direction="row" spacing={1}>
              {isSpeaking && (
                <Tooltip title={isPaused ? "Reanudar" : "Pausar"}>
                  <IconButton 
                    onClick={togglePause}
                    color="primary"
                    size="small"
                  >
                    {isPaused ? <PlayArrowIcon /> : <PauseIcon />}
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={isSpeaking ? "Detener" : "Reproducir"}>
                <IconButton 
                  onClick={isSpeaking ? stopSpeech : () => speakResponse(response)}
                  color="primary"
                  size="small"
                >
                  {isSpeaking ? <StopIcon /> : <PlayArrowIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
          <Typography 
            variant="body1" 
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {response}
          </Typography>
        </Paper>
      )}
    </Paper>
  );
};

export default CoachAI;
