"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tacticalPlayService_1 = __importDefault(require("../services/tacticalPlayService"));
const router = express_1.default.Router();
router.post('/generate', async (req, res) => {
    try {
        const { tacticalPrompt } = req.body;
        if (!tacticalPrompt) {
            return res.status(400).json({ error: 'Tactical play description is required' });
        }
        const tacticalPlay = await tacticalPlayService_1.default.generateTacticalPlay(tacticalPrompt);
        const analysis = await tacticalPlayService_1.default.analyzeTacticalPlay(tacticalPrompt);
        res.json({
            tacticalPlay,
            analysis
        });
    }
    catch (error) {
        console.error('Error generating tactical play:', error);
        res.status(500).json({ error: 'Error generating tactical play' });
    }
});
exports.default = router;
//# sourceMappingURL=tacticalPlayRoutes.js.map