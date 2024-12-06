import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IPlayer } from '../../types/player';
import { Formation } from '../../types/collaboration';
import MatchPrediction from './MatchPrediction';
import FormationSuggestion from './FormationSuggestion';
import PlayerPerformance from './PlayerPerformance';
import TeamAnalysis from './TeamAnalysis';
import { predictionApi } from '../../services/api';

interface PredictionDashboardProps {
  team: IPlayer[];
  currentFormation: Formation;
  opponent: string;
}

const PredictionDashboard: React.FC<PredictionDashboardProps> = ({
  team,
  currentFormation,
  opponent,
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState({
    formation: null,
    matchOutcome: null,
    playerPerformance: {},
    teamAnalysis: null,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener predicciones en paralelo
        const [formationPred, matchPred, teamAnalysis] = await Promise.all([
          predictionApi.predictFormation(team, opponent),
          predictionApi.predictMatch(team, currentFormation, opponent),
          predictionApi.analyzeTeam(team, currentFormation),
        ]);

        // Obtener predicciones de rendimiento para jugadores clave
        const playerPerformances = await Promise.all(
          team
            .filter(player => player.rating >= 80) // Solo jugadores clave
            .map(player =>
              predictionApi.predictPlayerPerformance(player, currentFormation, opponent)
            )
        );

        setPredictions({
          formation: formationPred,
          matchOutcome: matchPred,
          playerPerformance: Object.fromEntries(
            playerPerformances.map((perf, idx) => [team[idx].id, perf])
          ),
          teamAnalysis,
        });
      } catch (err) {
        setError('Error al obtener predicciones: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [team, currentFormation, opponent]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {/* Predicción de Formación */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              height: '100%',
              background: theme.palette.background.paper,
              borderRadius: 2,
            }}
          >
            <FormationSuggestion
              prediction={predictions.formation}
              currentFormation={currentFormation}
            />
          </Paper>
        </Grid>

        {/* Predicción de Partido */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              height: '100%',
              background: theme.palette.background.paper,
              borderRadius: 2,
            }}
          >
            <MatchPrediction
              prediction={predictions.matchOutcome}
              opponent={opponent}
            />
          </Paper>
        </Grid>

        {/* Rendimiento de Jugadores */}
        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              background: theme.palette.background.paper,
              borderRadius: 2,
            }}
          >
            <PlayerPerformance
              predictions={predictions.playerPerformance}
              players={team}
            />
          </Paper>
        </Grid>

        {/* Análisis del Equipo */}
        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              background: theme.palette.background.paper,
              borderRadius: 2,
            }}
          >
            <TeamAnalysis analysis={predictions.teamAnalysis} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PredictionDashboard;
