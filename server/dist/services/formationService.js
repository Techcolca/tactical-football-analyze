"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = require("openai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const configuration = new openai_1.Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new openai_1.OpenAIApi(configuration);
class FormationService {
    static generatePositionsForFormation(formation) {
        // Base positions for different formations
        const basePositions = {
            "4-4-2": [
                { x: 167.4, y: 318.85 }, // GK
                { x: 340.8, y: 125.54 }, // LB
                { x: 334.8, y: 255.08 }, // CB
                { x: 334.8, y: 382.62 }, // CB
                { x: 334.8, y: 510.16 }, // RB
                { x: 837.0, y: 127.54 }, // LM
                { x: 837.0, y: 255.08 }, // CM
                { x: 837.0, y: 382.62 }, // CM
                { x: 837.0, y: 510.16 }, // RM
                { x: 1339.2, y: 223.19 }, // ST
                { x: 1339.2, y: 414.51 } // ST
            ],
            // Add more formations as needed
        };
        const positions = formation in basePositions ? basePositions[formation] : basePositions["4-4-2"];
        return positions.map((pos, index) => ({
            id: `player-${index + 1}`,
            name: `Player ${index + 1}`,
            number: index + 1,
            position: this.getPositionForIndex(index, formation),
            rating: 80 + Math.floor(Math.random() * 15), // Random rating between 80-94
            x: pos.x,
            y: pos.y
        }));
    }
    static getPositionForIndex(index, formation) {
        const positions = {
            0: "GK",
            1: "LB",
            2: "CB",
            3: "CB",
            4: "RB",
            5: "LM",
            6: "CM",
            7: "CM",
            8: "RM",
            9: "ST",
            10: "ST"
        };
        return positions[index] || "CM";
    }
    static async generateFormation(formationString) {
        const players = this.generatePositionsForFormation(formationString);
        const timestamp = Date.now();
        const formation = {
            frames: Array(15).fill(null).map((_, i) => ({
                timestamp: timestamp + (i * 100),
                players: players,
                drawings: []
            }))
        };
        return formation;
    }
    static async generateTacticalAnalysis(formation) {
        try {
            const prompt = `Generate a detailed tactical analysis for a ${formation} formation in football. Include strengths, weaknesses, and key tactical considerations.`;
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: prompt,
                max_tokens: 500,
                temperature: 0.7,
            });
            return response.data.choices[0].text || "No analysis generated.";
        }
        catch (error) {
            console.error('Error generating tactical analysis:', error);
            return "Error generating tactical analysis. Please try again.";
        }
    }
}
exports.default = FormationService;
//# sourceMappingURL=formationService.js.map