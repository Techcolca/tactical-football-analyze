import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import aiRoutes from './routes/aiRoutes';
import teamRoutes from './routes/teamRoutes';
import dotenv from 'dotenv';
import initializeDatabase from './db/init';

dotenv.config();

const app = express();
const port = process.env.PORT || 3017;

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tactical-football')
  .then(() => {
    console.log('Conectado a MongoDB');
    // Inicializar la base de datos con datos de ejemplo
    initializeDatabase();
  })
  .catch((error) => {
    console.error('Error conectando a MongoDB:', error);
  });

// Middleware for logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// CORS configuration
app.use(cors());

// Body parser
app.use(express.json());

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

// Routes
app.use('/api', aiRoutes);
app.use('/api', teamRoutes);

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
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
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`[ERROR] Puerto ${port} está en uso. ¿El servidor ya está corriendo?`);
  } else {
    console.error('[ERROR] Error iniciando servidor:', error);
  }
  process.exit(1);
});
