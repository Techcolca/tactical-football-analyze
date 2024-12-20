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
class TacticalPlayService {
    static generateInitialPlayers() {
        const positions = this.basePositions["4-4-2"];
        const players = [];
        let playerCount = 1;
        for (const [position, coords] of Object.entries(positions)) {
            players.push({
                id: `player-${playerCount}`,
                name: `Player ${playerCount}`,
                number: playerCount,
                position: position.replace(/[0-9]/g, ''),
                rating: 80 + Math.floor(Math.random() * 15),
                x: coords.x,
                y: coords.y
            });
            playerCount++;
        }
        return players;
    }
    static async generateMovementDescription(tacticalPrompt) {
        try {
            const prompt = `Given this tactical play description: "${tacticalPrompt}", generate a detailed sequence of player movements in the following format:
      Frame 1: [describe exact positions]
      Frame 2: [describe movements]
      ...etc.
      Focus on specific player movements and coordinates. Keep it under 5 frames.`;
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: prompt,
                max_tokens: 500,
                temperature: 0.7,
            });
            return response.data.choices[0].text || "";
        }
        catch (error) {
            console.error('Error generating movement description:', error);
            throw error;
        }
    }
    static calculateNewPositions(players, movementDescription) {
        // This is a simplified movement calculation
        // In a real implementation, you would parse the movement description
        // and calculate precise coordinates based on the described movements
        return players.map(player => ({
            ...player,
            x: player.x + (Math.random() * 20 - 10),
            y: player.y + (Math.random() * 20 - 10)
        }));
    }
    static async generateTacticalPlay(tacticalPrompt) {
        try {
            const movementDescription = await this.generateMovementDescription(tacticalPrompt);
            const initialPlayers = this.generateInitialPlayers();
            const frames = [];
            const numFrames = 15; // Number of frames to generate
            const baseTimestamp = Date.now();
            // Generate frames with progressive player movements
            for (let i = 0; i < numFrames; i++) {
                const timestamp = baseTimestamp + (i * 100);
                let framePlayers;
                if (i === 0) {
                    framePlayers = initialPlayers;
                }
                else {
                    framePlayers = this.calculateNewPositions(frames[i - 1].players, movementDescription);
                }
                frames.push({
                    timestamp,
                    players: framePlayers,
                    drawings: []
                });
            }
            return { frames };
        }
        catch (error) {
            console.error('Error generating tactical play:', error);
            throw error;
        }
    }
    static async analyzeTacticalPlay(tacticalPrompt) {
        try {
            const prompt = `Analyze this football tactical play: "${tacticalPrompt}". 
      Provide insights on:
      1. Strategic advantages
      2. Potential risks
      3. Key player movements
      4. Alternative variations`;
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
TacticalPlayService.basePositions = {
    "4-4-2": {
        "GK": { x: 167.4, y: 318.85 },
        "LB": { x: 340.8, y: 125.54 },
        "CB1": { x: 334.8, y: 255.08 },
        "CB2": { x: 334.8, y: 382.62 },
        "RB": { x: 334.8, y: 510.16 },
        "LM": { x: 837.0, y: 127.54 },
        "CM1": { x: 837.0, y: 255.08 },
        "CM2": { x: 837.0, y: 382.62 },
        "RM": { x: 837.0, y: 510.16 },
        "ST1": { x: 1339.2, y: 223.19 },
        "ST2": { x: 1339.2, y: 414.51 }
    }
};
exports.default = TacticalPlayService;
//# sourceMappingURL=tacticalPlayService.js.map