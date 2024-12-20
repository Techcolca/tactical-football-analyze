"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const predictionService_1 = require("../services/predictionService");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Predecir formación óptima
router.post('/formation', validation_1.validateTeam, async (req, res) => {
    try {
        const { players, opponent } = req.body;
        const prediction = await predictionService_1.predictionService.predictOptimalFormation(players, opponent);
        res.json(prediction);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Predecir rendimiento de jugador
router.post('/player-performance', validation_1.validateTeam, validation_1.validateFormation, async (req, res) => {
    try {
        const { player, formation, opponent } = req.body;
        const prediction = await predictionService_1.predictionService.predictPlayerPerformance(player, formation, opponent);
        res.json(prediction);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Predecir resultado del partido
router.post('/match-outcome', validation_1.validateTeam, validation_1.validateFormation, async (req, res) => {
    try {
        const { team, formation, opponent } = req.body;
        const prediction = await predictionService_1.predictionService.predictMatchOutcome(team, formation, opponent);
        res.json(prediction);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Analizar fortalezas y debilidades del equipo
router.post('/team-analysis', validation_1.validateTeam, validation_1.validateFormation, async (req, res) => {
    try {
        const { team, formation } = req.body;
        const analysis = await predictionService_1.predictionService.analyzeTeamStrengths(team, formation);
        res.json(analysis);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=predictionRoutes.js.map