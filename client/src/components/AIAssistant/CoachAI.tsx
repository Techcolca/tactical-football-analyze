import React, { useState, useCallback, Suspense } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress
} from '@mui/material';
import { useAITacticalAssistant } from '../../services/aiTacticalAssistant';

const CoachAI: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { getCoachAdvice } = useAITacticalAssistant();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const result = await getCoachAdvice(input);
      setResponse(result);
    } catch (err: any) {
      console.error('Error al procesar la consulta:', err);
      setError(err.message || 'Error al procesar la consulta');
    } finally {
      setLoading(false);
    }
  }, [input, getCoachAdvice]);

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 3 }}>
      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h5" gutterBottom>
          CoachAI - Tu Asistente Táctico
        </Typography>
        
        <Typography variant="body1" paragraph>
          Bienvenido a CoachAI, tu asistente personal para análisis táctico de fútbol.
          Puedo ayudarte con:
          - Análisis táctico
          - Recomendaciones de formaciones
          - Ejercicios de entrenamiento
          - Estrategias de juego
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder="Escribe tu consulta táctica aquí..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            sx={{ marginBottom: 2 }}
          />
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !input.trim()}
            sx={{ marginBottom: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Enviar Consulta'}
          </Button>
        </form>

        {error && (
          <Typography color="error" sx={{ marginTop: 2 }}>
            Error: {error}
          </Typography>
        )}

        {response && (
          <Box sx={{ marginTop: 3 }}>
            {response.summary && (
              <Typography variant="h6" gutterBottom>
                Resumen
                <Typography paragraph>{response.summary}</Typography>
              </Typography>
            )}
            
            {response.tacticalAnalysis && (
              <Typography variant="h6" gutterBottom>
                Análisis Táctico
                <Typography paragraph>{response.tacticalAnalysis}</Typography>
              </Typography>
            )}
            
            {response.keyPlayers && response.keyPlayers.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom>
                  Jugadores Clave
                </Typography>
                <ul>
                  {response.keyPlayers.map((player: string, index: number) => (
                    <li key={index}>{player}</li>
                  ))}
                </ul>
              </>
            )}
            
            {response.recommendations && response.recommendations.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom>
                  Recomendaciones
                </Typography>
                <ul>
                  {response.recommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </>
            )}
            
            {response.variants && response.variants.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom>
                  Variantes Tácticas
                </Typography>
                <ul>
                  {response.variants.map((variant: string, index: number) => (
                    <li key={index}>{variant}</li>
                  ))}
                </ul>
              </>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CoachAI;
