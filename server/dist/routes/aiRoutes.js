"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const groqClient_1 = require("../services/groqClient");
const router = express_1.default.Router();
// Test endpoint
router.get('/test', (req, res) => {
    res.json({ message: 'AI routes test endpoint working' });
});
// Main tactical analysis endpoint
router.post('/tactical-analysis', async (req, res) => {
    try {
        console.log('Received request body:', req.body);
        const { prompt, language = 'en' } = req.body;
        if (!prompt) {
            return res.status(400).json({
                error: language === 'es' ? 'Se requiere una pregunta' :
                    language === 'fr' ? 'Une question est requise' :
                        'A question is required'
            });
        }
        console.log('Processing request with language:', language);
        console.log('Prompt:', prompt);
        // Asegurarse de que el idioma sea válido
        const validLanguages = ['es', 'en', 'fr'];
        const selectedLanguage = validLanguages.includes(language) ? language : 'en';
        const response = await groqClient_1.groqClient.generateTacticalAnalysis(prompt, selectedLanguage);
        console.log('Generated response in language:', selectedLanguage);
        console.log('Response preview:', response.substring(0, 100) + '...');
        return res.json({ response });
    }
    catch (error) {
        console.error('Error in tactical analysis route:', error);
        const errorMessage = req.body.language === 'es' ? 'Error al generar el análisis táctico' :
            req.body.language === 'fr' ? 'Erreur lors de la génération de l\'analyse tactique' :
                'Error generating tactical analysis';
        return res.status(500).json({ error: errorMessage });
    }
});
exports.default = router;
//# sourceMappingURL=aiRoutes.js.map