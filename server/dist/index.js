"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3017;
// Middleware for logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});
// CORS configuration
app.use((0, cors_1.default)());
// Body parser
app.use(express_1.default.json());
// Health check endpoint
app.get('/', (_req, res) => {
    res.json({
        message: 'Servidor funcionando',
        timestamp: new Date().toISOString()
    });
});
// Test endpoint
app.get('/test', (_req, res) => {
    res.json({ message: 'Test endpoint working' });
});
// AI routes
app.use('/api', aiRoutes_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[ERROR]', err);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: err.message
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        message: `No se puede ${req.method} ${req.url}`
    });
});
// Start server
const server = app.listen(port, () => {
    console.log(`[${new Date().toISOString()}] Servidor iniciado en puerto ${port}`);
    console.log('Variables de entorno cargadas:');
    console.log('- PORT:', port);
    console.log('- CLIENT_URL:', process.env.CLIENT_URL);
    console.log('- GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Presente' : 'No encontrada');
});
// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`[ERROR] Puerto ${port} está en uso. ¿El servidor ya está corriendo?`);
    }
    else {
        console.error('[ERROR] Error iniciando servidor:', error);
    }
    process.exit(1);
});
//# sourceMappingURL=index.js.map