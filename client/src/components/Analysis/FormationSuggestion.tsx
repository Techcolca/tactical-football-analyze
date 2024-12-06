import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { Formation } from '../../types/collaboration';
import TacticalBoard from '../Formation/EnhancedTacticalBoard';

interface FormationSuggestionProps {
  prediction: {
    formation: Formation;
    confidence: number;
    reasoning: string[];
  };
  currentFormation: Formation;
}

const FormationSuggestion: React.FC<FormationSuggestionProps> = ({
  prediction,
  currentFormation,
}) => {
  if (!prediction) return null;

  const { formation, confidence, reasoning } = prediction;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'success';
    if (confidence >= 60) return 'info';
    return 'warning';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Sugerencia de Formación
      </Typography>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1">
          Formación Recomendada: {formation.name}
        </Typography>
        <Tooltip title={`Nivel de confianza: ${confidence}%`}>
          <Chip
            label={`${confidence}%`}
            color={getConfidenceColor(confidence)}
            variant="outlined"
          />
        </Tooltip>
      </Box>

      <Box mb={3}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Nivel de Confianza
        </Typography>
        <LinearProgress
          variant="determinate"
          value={confidence}
          color={getConfidenceColor(confidence)}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      <Box display="flex" gap={2} mb={3}>
        <Box flex={1}>
          <Typography variant="subtitle2" gutterBottom>
            Formación Actual
          </Typography>
          <TacticalBoard
            formation={currentFormation}
            players={[]}
            isInteractive={false}
            scale={0.7}
          />
        </Box>
        <Box flex={1}>
          <Typography variant="subtitle2" gutterBottom>
            Formación Sugerida
          </Typography>
          <TacticalBoard
            formation={formation}
            players={[]}
            isInteractive={false}
            scale={0.7}
          />
        </Box>
      </Box>

      <Typography variant="subtitle2" gutterBottom>
        Análisis Táctico
      </Typography>
      <List dense>
        {reasoning.map((reason, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={reason}
              sx={{
                '& .MuiListItemText-primary': {
                  fontSize: '0.9rem',
                },
              }}
            />
          </ListItem>
        ))}
      </List>

      {confidence < 70 && (
        <Typography
          variant="body2"
          color="warning.main"
          sx={{ mt: 2, fontStyle: 'italic' }}
        >
          Nota: Esta sugerencia tiene un nivel de confianza moderado. Considere
          factores adicionales antes de implementar cambios.
        </Typography>
      )}
    </Box>
  );
};

export default FormationSuggestion;
