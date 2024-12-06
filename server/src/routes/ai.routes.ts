import { Router } from 'express';
import { AIService } from '../services/aiService';

const router = Router();

router.post('/analyze', async (req, res) => {
  try {
    const { formation, playerPositions, context } = req.body;
    const analysis = await AIService.analyzeTactics(
      formation,
      playerPositions,
      context
    );
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Error en el análisis táctico' });
  }
});

router.post('/suggestions', async (req, res) => {
  try {
    const { playerPosition, gameContext } = req.body;
    const suggestions = await AIService.getMovementSuggestions(
      playerPosition,
      gameContext
    );
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener sugerencias' });
  }
});

export default router;
