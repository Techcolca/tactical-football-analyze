import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tooltip,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { IPlayer } from '../../types/player';

interface MetricData {
  name: string;
  value: number;
  benchmark: number;
  description: string;
}

interface AdvancedMetricsProps {
  player: IPlayer;
  matchData: {
    pressureEvents: any[];
    possessionData: any[];
    progressiveActions: any[];
    xG: number;
    xA: number;
    pxG: number;
    fieldControl: number[][];
  };
}

const AdvancedMetrics: React.FC<AdvancedMetricsProps> = ({
  player,
  matchData,
}) => {
  const theme = useTheme();

  // Métricas avanzadas calculadas
  const metrics: MetricData[] = [
    {
      name: 'Presión',
      value: calculatePressureScore(matchData.pressureEvents),
      benchmark: 75,
      description: 'Efectividad en la presión y recuperación',
    },
    {
      name: 'Progresión',
      value: calculateProgressionScore(matchData.progressiveActions),
      benchmark: 80,
      description: 'Capacidad de hacer avanzar el juego',
    },
    {
      name: 'Posesión',
      value: calculatePossessionScore(matchData.possessionData),
      benchmark: 70,
      description: 'Control y retención del balón',
    },
    {
      name: 'xG',
      value: matchData.xG,
      benchmark: 0.5,
      description: 'Goles esperados',
    },
    {
      name: 'xA',
      value: matchData.xA,
      benchmark: 0.3,
      description: 'Asistencias esperadas',
    },
    {
      name: 'pxG',
      value: matchData.pxG,
      benchmark: 0.4,
      description: 'Goles esperados por posesión',
    },
  ];

  // Datos para el gráfico de control de campo
  const fieldControlData = processFieldControlData(matchData.fieldControl);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Métricas Avanzadas
      </Typography>

      <Grid container spacing={3}>
        {/* Gráfico Radar de Métricas */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: 'background.default',
              height: '400px',
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Perfil de Rendimiento
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={metrics}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Jugador"
                  dataKey="value"
                  stroke={theme.palette.primary.main}
                  fill={theme.palette.primary.main}
                  fillOpacity={0.6}
                />
                <Radar
                  name="Benchmark"
                  dataKey="benchmark"
                  stroke={theme.palette.secondary.main}
                  fill={theme.palette.secondary.main}
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Gráfico de Control de Campo */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: 'background.default',
              height: '400px',
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Control de Campo
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fieldControlData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="zone" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="control"
                  stroke={theme.palette.success.main}
                  fill={theme.palette.success.main}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Métricas Individuales */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {metrics.map((metric) => (
              <Grid item xs={6} sm={4} md={2} key={metric.name}>
                <Tooltip title={metric.description}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: 'background.default',
                      textAlign: 'center',
                    }}
                  >
                    <Box position="relative" display="inline-flex">
                      <CircularProgress
                        variant="determinate"
                        value={(metric.value / metric.benchmark) * 100}
                        size={80}
                        thickness={4}
                        sx={{
                          color: (metric.value / metric.benchmark) >= 1
                            ? 'success.main'
                            : 'warning.main',
                        }}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="caption" component="div">
                          {metric.value.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {metric.name}
                    </Typography>
                  </Paper>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

// Funciones auxiliares de cálculo
function calculatePressureScore(events: any[]): number {
  // Implementar cálculo de score de presión
  return 0;
}

function calculateProgressionScore(actions: any[]): number {
  // Implementar cálculo de score de progresión
  return 0;
}

function calculatePossessionScore(data: any[]): number {
  // Implementar cálculo de score de posesión
  return 0;
}

function processFieldControlData(data: number[][]): any[] {
  // Procesar datos de control de campo
  return [];
}

export default AdvancedMetrics;
