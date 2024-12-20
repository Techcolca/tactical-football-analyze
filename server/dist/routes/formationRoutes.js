"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const formationService_1 = __importDefault(require("../services/formationService"));
const router = express_1.default.Router();
router.post('/generate', async (req, res) => {
    try {
        const { formation } = req.body;
        if (!formation) {
            return res.status(400).json({ error: 'Formation string is required' });
        }
        const formationData = await formationService_1.default.generateFormation(formation);
        const analysis = await formationService_1.default.generateTacticalAnalysis(formation);
        res.json({
            formation: formationData,
            analysis: analysis
        });
    }
    catch (error) {
        console.error('Error generating formation:', error);
        res.status(500).json({ error: 'Error generating formation' });
    }
});
exports.default = router;
//# sourceMappingURL=formationRoutes.js.map