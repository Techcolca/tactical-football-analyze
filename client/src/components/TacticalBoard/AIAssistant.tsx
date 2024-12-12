import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Button,
} from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CloseIcon from '@mui/icons-material/Close';
import { aiTacticalAssistant } from '../../services/aiTacticalAssistant';
import { Player, Formation } from '../../types/tacticalBoard';

interface AIAssistantProps {
  players: Player[];
  currentFormation: Formation;
  onSuggestionApply: (changes: any) => void;
  onClose: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  players,
  currentFormation,
  onSuggestionApply,
  onClose,
}) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatResponse, setChatResponse] = useState<string>('');
  const [animationPrompt, setAnimationPrompt] = useState('');
  const [isGeneratingAnimation, setIsGeneratingAnimation] = useState(false);

  useEffect(() => {
    analyzeTacticalSetup();
  }, [players, currentFormation]);

  const analyzeTacticalSetup = async () => {
    setIsLoading(true);
    try {
      const result = await aiTacticalAssistant.analyzeTacticalSetup(players, currentFormation);
      setAnalysis(
        `Fortalezas:\n${result.strengths.join('\n')}\n\n` +
        `Debilidades:\n${result.weaknesses.join('\n')}\n\n` +
        `Sugerencias:\n${result.suggestions.join('\n')}`
      );
    } catch (error) {
      console.error('Error analyzing tactical setup:', error);
      setAnalysis('Error al analizar la disposición táctica');
    }
    setIsLoading(false);
  };

  const handleQuerySubmit = async () => {
    if (!userQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await aiTacticalAssistant.chat(userQuery);
      setChatResponse(response);
      setUserQuery('');
    } catch (error) {
      console.error('Error getting suggestions:', error);
      setChatResponse('Error al procesar tu pregunta');
    }
    setIsLoading(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleQuerySubmit();
    }
  };

  const handleGenerateAnimation = async () => {
    if (!animationPrompt.trim()) return;
    
    setIsGeneratingAnimation(true);
    try {
      const response = await fetch('http://localhost:3000/api/ai/generate-animation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: animationPrompt,
          players,
          fieldDimensions: { width: 800, height: 600 }
        }),
      });

      if (!response.ok) {
        throw new Error('Error al generar la animación');
      }

      const animation = await response.json();
      
      // Guardar la animación
      const fileName = `tactica_${new Date().getTime()}.json`;
      const blob = new Blob([JSON.stringify(animation)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setChatResponse(`¡Animación generada y guardada como ${fileName}! 
                      Puedes cargarla desde los controles de animación.`);
      setAnimationPrompt('');
    } catch (error) {
      console.error('Error generando animación:', error);
      setChatResponse('Error al generar la animación táctica');
    }
    setIsGeneratingAnimation(false);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        right: 20,
        top: 20,
        width: 300,
        maxHeight: '80vh',
        overflow: 'auto',
        p: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        zIndex: 1000,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
          <LightbulbIcon sx={{ mr: 1 }} />
          Asistente Táctico
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" gutterBottom>
        Análisis Actual
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
        {isLoading ? 'Analizando...' : analysis}
      </Typography>

      <TextField
        fullWidth
        multiline
        rows={2}
        size="small"
        variant="outlined"
        placeholder="Pregunta sobre tácticas..."
        value={userQuery}
        onChange={(e) => setUserQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        sx={{ mb: 1 }}
      />
      <Button
        variant="contained"
        fullWidth
        onClick={handleQuerySubmit}
        disabled={isLoading}
        sx={{ mb: 2 }}
      >
        Consultar
      </Button>

      {chatResponse && (
        <>
          <Typography variant="subtitle2" gutterBottom>
            Respuesta
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
            {chatResponse}
          </Typography>
        </>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" gutterBottom>
        Generar Animación Táctica
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={3}
        size="small"
        variant="outlined"
        placeholder="Describe la jugada táctica que quieres animar..."
        value={animationPrompt}
        onChange={(e) => setAnimationPrompt(e.target.value)}
        sx={{ mb: 1 }}
      />
      <Button
        variant="contained"
        fullWidth
        onClick={handleGenerateAnimation}
        disabled={isGeneratingAnimation}
        sx={{ mb: 2 }}
      >
        {isGeneratingAnimation ? 'Generando...' : 'Generar Animación'}
      </Button>
    </Paper>
  );
};

export default AIAssistant;
