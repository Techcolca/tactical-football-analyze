import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface MatchPredictionProps {
  prediction: {
    result: {
      goalsFor: number;
      goalsAgainst: number;
      winProbability: number;
      drawProbability: number;
      lossProbability: number;
    };
    keyFactors: string[];
    confidence: number;
  };
  opponent: string;
}

const COLORS = {
  win: '#4caf50',
  draw: '#ff9800',
  loss: '#f44336',
  primary: '#2196f3',
  secondary: '#9c27b0',
};

const MatchPrediction: React.FC<MatchPredictionProps> = ({ prediction, opponent }) => {
  if (!prediction) return null;

  const { result, keyFactors, confidence } = prediction;

  const probabilityData = [
    { name: 'Victoria', value: result.winProbability },
    { name: 'Empate', value: result.drawProbability },
    { name: 'Derrota', value: result.lossProbability },
  ];

  const scoreData = [
    {
      name: 'Goles',
      'Goles a Favor': result.goalsFor,
      'Goles en Contra': result.goalsAgainst,
    },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Predicción del Partido
      </Typography>

      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Typography variant="subtitle1">vs {opponent}</Typography>
        <Chip
          label={`${confidence}% confianza`}
          color={confidence >= 70 ? 'success' : 'warning'}
          size="small"
        />
      </Box>

      <Grid container spacing={3}>
        {/* Probabilidades */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" gutterBottom>
              Probabilidades del Resultado
            </Typography>
            <Box height={200}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={probabilityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    label
                  >
                    {probabilityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={[COLORS.win, COLORS.draw, COLORS.loss][index]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Predicción de Goles */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" gutterBottom>
              Predicción de Goles
            </Typography>
            <Box height={200}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Goles a Favor" fill={COLORS.primary} />
                  <Bar dataKey="Goles en Contra" fill={COLORS.secondary} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Factores Clave */}
      <Typography variant="subtitle2" gutterBottom>
        Factores Clave
      </Typography>
      <Grid container spacing={1}>
        {keyFactors.map((factor, index) => (
          <Grid item xs={12} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 1,
                bgcolor: 'background.default',
                borderLeft: 4,
                borderColor: COLORS.primary,
              }}
            >
              <Typography variant="body2">{factor}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Indicador de Confianza */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        mt={3}
        position="relative"
      >
        <CircularProgress
          variant="determinate"
          value={confidence}
          size={60}
          thickness={4}
          sx={{
            color: confidence >= 70 ? COLORS.win : COLORS.draw,
          }}
        />
        <Typography
          variant="caption"
          component="div"
          color="text.secondary"
          sx={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {confidence}%
        </Typography>
      </Box>
    </Box>
  );
};

export default MatchPrediction;
