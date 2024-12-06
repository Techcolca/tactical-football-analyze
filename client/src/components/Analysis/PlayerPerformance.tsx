import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Collapse,
  Rating,
  LinearProgress,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
} from '@mui/lab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IPlayer } from '../../types/player';

interface PlayerPerformanceProps {
  predictions: {
    [key: string]: {
      rating: number;
      stats: {
        goals: number;
        assists: number;
        passAccuracy: number;
        tackles: number;
        interceptions: number;
      };
      confidence: number;
    };
  };
  players: IPlayer[];
}

const PlayerPerformance: React.FC<PlayerPerformanceProps> = ({
  predictions,
  players,
}) => {
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

  const handleExpandClick = (playerId: string) => {
    setExpandedPlayer(expandedPlayer === playerId ? null : playerId);
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 8) return 'success';
    if (value >= 6) return 'info';
    if (value >= 4) return 'warning';
    return 'error';
  };

  const formatStatValue = (value: number, type: string) => {
    switch (type) {
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;
      case 'decimal':
        return value.toFixed(2);
      default:
        return value.toString();
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Predicción de Rendimiento de Jugadores
      </Typography>

      <Grid container spacing={2}>
        {players.map((player) => {
          const prediction = predictions[player.id];
          if (!prediction) return null;

          return (
            <Grid item xs={12} md={6} key={player.id}>
              <Card
                sx={{
                  bgcolor: 'background.default',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      src={player.photoUrl}
                      sx={{ width: 60, height: 60 }}
                    />
                    <Box flex={1}>
                      <Typography variant="h6">{player.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {player.position}
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Rating
                        value={prediction.rating / 2}
                        precision={0.5}
                        readOnly
                        sx={{ mb: 1 }}
                      />
                      <Chip
                        label={`${prediction.confidence}% confianza`}
                        size="small"
                        color={prediction.confidence >= 70 ? 'success' : 'warning'}
                      />
                    </Box>
                    <IconButton
                      onClick={() => handleExpandClick(player.id)}
                      sx={{
                        transform: expandedPlayer === player.id ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.3s',
                      }}
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                  </Box>

                  <Collapse in={expandedPlayer === player.id}>
                    <Box mt={2}>
                      <Timeline>
                        <TimelineItem>
                          <TimelineSeparator>
                            <TimelineDot color="primary" />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography variant="subtitle2">Goles Esperados</Typography>
                            <Typography variant="h6">{prediction.stats.goals}</Typography>
                          </TimelineContent>
                        </TimelineItem>

                        <TimelineItem>
                          <TimelineSeparator>
                            <TimelineDot color="secondary" />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography variant="subtitle2">Asistencias Esperadas</Typography>
                            <Typography variant="h6">{prediction.stats.assists}</Typography>
                          </TimelineContent>
                        </TimelineItem>

                        <TimelineItem>
                          <TimelineSeparator>
                            <TimelineDot color="info" />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Box mb={2}>
                              <Typography variant="subtitle2">
                                Precisión de Pases
                              </Typography>
                              <Tooltip
                                title={formatStatValue(prediction.stats.passAccuracy, 'percentage')}
                              >
                                <LinearProgress
                                  variant="determinate"
                                  value={prediction.stats.passAccuracy * 100}
                                  color={getPerformanceColor(prediction.stats.passAccuracy * 10)}
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Tooltip>
                            </Box>

                            <Box mb={2}>
                              <Typography variant="subtitle2">Entradas</Typography>
                              <Tooltip
                                title={formatStatValue(prediction.stats.tackles, 'decimal')}
                              >
                                <LinearProgress
                                  variant="determinate"
                                  value={(prediction.stats.tackles / 10) * 100}
                                  color={getPerformanceColor(prediction.stats.tackles)}
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Tooltip>
                            </Box>

                            <Box>
                              <Typography variant="subtitle2">
                                Intercepciones
                              </Typography>
                              <Tooltip
                                title={formatStatValue(prediction.stats.interceptions, 'decimal')}
                              >
                                <LinearProgress
                                  variant="determinate"
                                  value={(prediction.stats.interceptions / 10) * 100}
                                  color={getPerformanceColor(prediction.stats.interceptions)}
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Tooltip>
                            </Box>
                          </TimelineContent>
                        </TimelineItem>
                      </Timeline>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default PlayerPerformance;
