import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Build,
  Speed,
  EmojiEvents,
  Warning,
} from '@mui/icons-material';

interface TeamAnalysisProps {
  analysis: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    confidence: number;
  };
}

const TeamAnalysis: React.FC<TeamAnalysisProps> = ({ analysis }) => {
  if (!analysis) return null;

  const { strengths, weaknesses, recommendations, confidence } = analysis;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'success';
    if (confidence >= 60) return 'info';
    return 'warning';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Análisis del Equipo</Typography>
        <Chip
          label={`${confidence}% confianza`}
          color={getConfidenceColor(confidence)}
          variant="outlined"
        />
      </Box>

      <Grid container spacing={3}>
        {/* Fortalezas */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: 'background.default',
              height: '100%',
              borderLeft: 4,
              borderColor: 'success.main',
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <TrendingUp color="success" />
              <Typography variant="subtitle1">Fortalezas</Typography>
            </Box>
            <List dense>
              {strengths.map((strength, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <EmojiEvents fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={strength}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '0.9rem',
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Debilidades */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: 'background.default',
              height: '100%',
              borderLeft: 4,
              borderColor: 'error.main',
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <TrendingDown color="error" />
              <Typography variant="subtitle1">Áreas de Mejora</Typography>
            </Box>
            <List dense>
              {weaknesses.map((weakness, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Warning fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={weakness}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '0.9rem',
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recomendaciones */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: 'background.default',
              borderLeft: 4,
              borderColor: 'info.main',
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Build color="info" />
              <Typography variant="subtitle1">Recomendaciones Tácticas</Typography>
            </Box>
            <List dense>
              {recommendations.map((recommendation, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <Speed fontSize="small" color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary={recommendation}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontSize: '0.9rem',
                        },
                      }}
                    />
                  </ListItem>
                  {index < recommendations.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Indicador de Confianza */}
      <Box mt={3}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Nivel de Confianza del Análisis
        </Typography>
        <LinearProgress
          variant="determinate"
          value={confidence}
          color={getConfidenceColor(confidence)}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {confidence < 70 && (
        <Typography
          variant="body2"
          color="warning.main"
          sx={{ mt: 2, fontStyle: 'italic' }}
        >
          Nota: Este análisis tiene un nivel de confianza moderado. Considere
          factores adicionales y consulte con el equipo técnico antes de tomar
          decisiones importantes.
        </Typography>
      )}
    </Box>
  );
};

export default TeamAnalysis;
