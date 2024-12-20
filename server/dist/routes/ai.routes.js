"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiService_1 = require("../services/aiService");
const router = (0, express_1.Router)();
router.post('/analyze', async (req, res) => {
    try {
        const { formation, playerPositions, context } = req.body;
        const analysis = await aiService_1.AIService.analyzeTactics(formation, playerPositions, context);
        res.json(analysis);
    }
    catch (error) {
        res.status(500).json({ error: 'Error en el análisis táctico' });
    }
});
router.post('/suggestions', async (req, res) => {
    try {
        const { playerPosition, gameContext } = req.body;
        const suggestions = await aiService_1.AIService.getMovementSuggestions(playerPosition, gameContext);
        res.json({ suggestions });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener sugerencias' });
    }
});
exports.default = router;
//# sourceMappingURL=ai.routes.js.map