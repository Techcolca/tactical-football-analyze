import express from 'express';
import cors from 'cors';
import aiRoutes from './routes/aiRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/ai', aiRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        error: 'Internal server error'
    });
});

export default app;
