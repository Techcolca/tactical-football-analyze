import { Router } from 'express';
import { predictionService } from '../services/predictionService';
import { validateTeam, validateFormation } from '../middleware/validation';

const router = Router();

// Predecir formación óptima
router.post('/formation', validateTeam, async (req, res) => {
  try {
    const { players, opponent } = req.body;
    const prediction = await predictionService.predictOptimalFormation(players, opponent);
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Predecir rendimiento de jugador
router.post('/player-performance', validateTeam, validateFormation, async (req, res) => {
  try {
    const { player, formation, opponent } = req.body;
    const prediction = await predictionService.predictPlayerPerformance(player, formation, opponent);
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Predecir resultado del partido
router.post('/match-outcome', validateTeam, validateFormation, async (req, res) => {
  try {
    const { team, formation, opponent } = req.body;
    const prediction = await predictionService.predictMatchOutcome(team, formation, opponent);
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analizar fortalezas y debilidades del equipo
router.post('/team-analysis', validateTeam, validateFormation, async (req, res) => {
  try {
    const { team, formation } = req.body;
    const analysis = await predictionService.analyzeTeamStrengths(team, formation);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
