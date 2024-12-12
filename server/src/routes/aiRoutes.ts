import express from 'express';
import { TacticalAnalysisService } from '../services/tacticalAnalysisService';

const router = express.Router();
const tacticalAnalysisService = new TacticalAnalysisService();

// Middleware para verificar la clave de API
const verifyApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log('Verificando API key...');
  if (!process.env.OPENAI_API_KEY) {
    console.error('API key no encontrada en las variables de entorno');
    return res.status(500).json({
      success: false,
      error: 'API key no configurada en el servidor'
    });
  }
  console.log('API key verificada correctamente');
  next();
};

// Ruta para el análisis táctico
router.post('/tactical-analysis', verifyApiKey, async (req, res) => {
  try {
    console.log(' Recibida consulta:', req.body);
    const { input } = req.body;
    
    // Validar input
    if (!input || typeof input !== 'string') {
      console.error('Input inválido recibido:', req.body);
      return res.status(400).json({
        success: false,
        error: 'Se requiere un input válido'
      });
    }

    console.log(' Procesando consulta con OpenAI...');
    const analysis = await tacticalAnalysisService.analyzeQuery(input);
    console.log(' Análisis generado:', analysis);
    
    const response = {
      success: true,
      data: {
        summary: analysis.summary || '',
        tacticalAnalysis: analysis.tacticalAnalysis || '',
        keyPlayers: analysis.keyPlayers || [],
        recommendations: analysis.recommendations || [],
        variants: analysis.variants || []
      }
    };

    console.log(' Enviando respuesta al cliente:', response);
    res.json(response);
  } catch (error: any) {
    console.error(' Error en el análisis táctico:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Error al procesar el análisis táctico',
      details: error.message
    });
  }
});

// Ruta para generar animaciones de entrenamiento
router.post('/generate-animation', verifyApiKey, async (req, res) => {
  try {
    console.log('Recibida solicitud de animación:', req.body);
    const { exerciseType, players, duration } = req.body;
    
    // Validar parámetros
    if (!exerciseType || !Array.isArray(players) || !duration) {
      return res.status(400).json({
        success: false,
        error: 'Parámetros inválidos'
      });
    }

    const animation = await tacticalAnalysisService.generateTrainingAnimation(
      exerciseType,
      players,
      duration
    );

    res.json({
      success: true,
      data: animation
    });
  } catch (error: any) {
    console.error('Error al generar la animación:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar la animación de entrenamiento',
      details: error.message
    });
  }
});

export default router;
