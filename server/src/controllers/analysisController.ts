import { Request, Response } from 'express';
import { groqClient } from '../services/groqClient';

export const analyzeTactics = async (req: Request, res: Response) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const analysis = await groqClient.generateTacticalAnalysis(prompt);
        res.json({ analysis });
    } catch (error) {
        console.error('Error in tactical analysis:', error);
        res.status(500).json({ error: 'Failed to generate tactical analysis' });
    }
};
