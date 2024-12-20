"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeTactics = void 0;
const groqClient_1 = require("../services/groqClient");
const analyzeTactics = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        const analysis = await groqClient_1.groqClient.generateTacticalAnalysis(prompt);
        res.json({ analysis });
    }
    catch (error) {
        console.error('Error in tactical analysis:', error);
        res.status(500).json({ error: 'Failed to generate tactical analysis' });
    }
};
exports.analyzeTactics = analyzeTactics;
//# sourceMappingURL=analysisController.js.map