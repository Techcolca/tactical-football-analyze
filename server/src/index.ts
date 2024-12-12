import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware básico
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  console.log('Recibida petición en /');
  res.json({ message: 'Servidor funcionando' });
});

app.get('/health', (req, res) => {
  console.log('Recibida petición en /health');
  res.json({ status: 'ok' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
  console.log(`Prueba estas URLs:`);
  console.log(`1. http://localhost:${PORT}`);
  console.log(`2. http://localhost:${PORT}/health`);
});
