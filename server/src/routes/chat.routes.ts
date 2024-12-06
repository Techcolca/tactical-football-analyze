import { Router } from 'express';
import { ChatService } from '../services/chatService';
import { authMiddleware } from '../services/authService';
import { body, validationResult } from 'express-validator';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

// Validaciones
const messageValidation = [
  body('message').trim().notEmpty().withMessage('El mensaje no puede estar vacío'),
  body('context').optional().isObject(),
];

const gameContextValidation = [
  body('score').trim().notEmpty(),
  body('minute').isInt({ min: 0, max: 120 }),
  body('possession').isFloat({ min: 0, max: 100 }),
  body('lastEvents').isArray(),
];

// Ruta para procesar mensajes del chat
router.post('/message', messageValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, context } = req.body;
    const response = await ChatService.generateResponse(message, {
      ...context,
      previousMessages: context.previousMessages || []
    });

    res.json(response);
  } catch (error: any) {
    console.error('Error al procesar mensaje:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para análisis de contexto de juego
router.post('/analyze-context', gameContextValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const gameContext = req.body;
    const analysis = await ChatService.analyzeGameContext(gameContext);

    res.json(analysis);
  } catch (error: any) {
    console.error('Error al analizar contexto:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
