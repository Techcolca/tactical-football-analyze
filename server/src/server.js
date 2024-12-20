require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const port = 3006;

// Verificar API key
if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY no está configurada en el archivo .env');
    process.exit(1);
}

// Configuración de OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rutas básicas
app.get('/', (req, res) => {
    res.json({ message: 'Tactical Football Analyzer API' });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        openai: process.env.OPENAI_API_KEY ? 'configured' : 'missing'
    });
});

// Ruta para análisis táctico
app.post('/api/ai/tactical-analysis', async (req, res) => {
    try {
        console.log('📨 Recibida petición de análisis táctico:', req.body);
        
        const prompt = req.body.prompt || req.body.input;
        if (!prompt) {
            console.warn('⚠️ Petición sin prompt/input');
            return res.status(400).json({
                success: false,
                error: 'Se requiere un prompt o input en el cuerpo de la petición'
            });
        }

        console.log('🤖 Enviando prompt a OpenAI:', prompt);
        
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Eres un entrenador de fútbol experto que proporciona análisis tácticos detallados y recomendaciones de entrenamiento."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        console.log('✅ Respuesta recibida de OpenAI');
        
        const response = {
            success: true,
            data: {
                summary: completion.choices[0].message.content,
                tacticalAnalysis: completion.choices[0].message.content,
                keyPlayers: [],
                recommendations: [],
                variants: []
            }
        };

        console.log('📤 Enviando respuesta al cliente');
        res.json(response);
        
    } catch (error) {
        console.error('❌ Error en análisis táctico:', error);
        
        // Determinar el tipo de error
        let errorMessage = 'Error interno del servidor';
        let statusCode = 500;
        
        if (error.response?.status === 401) {
            errorMessage = 'Error de autenticación con OpenAI';
            statusCode = 401;
        } else if (error.code === 'ECONNREFUSED') {
            errorMessage = 'No se pudo conectar con OpenAI';
            statusCode = 503;
        }

        res.status(statusCode).json({
            success: false,
            error: errorMessage,
            details: error.message
        });
    }
});

// Ruta para generar animaciones
app.post('/api/ai/generate-animation', async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) {
            return res.status(400).json({ error: 'Se requiere una descripción' });
        }

        res.json({
            success: true,
            message: 'Animación solicitada',
            description: description
        });
    } catch (error) {
        console.error('Error en generación de animación:', error);
        res.status(500).json({
            success: false,
            error: 'Error al generar la animación',
            details: error.message
        });
    }
});

// Routes
const formationRoutes = require('./routes/formationRoutes').default;
app.use('/api/formations', formationRoutes);

const tacticalPlayRoutes = require('./routes/tacticalPlayRoutes').default;
app.use('/api/tactical-plays', tacticalPlayRoutes);

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error('❌ Error global:', err);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: err.message
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`\n🚀 Servidor corriendo en http://localhost:${port}`);
    console.log('🔑 Verificando configuración de OpenAI API...');
    console.log(process.env.OPENAI_API_KEY ? '✅ API Key configurada' : '❌ API Key no encontrada');
    
    console.log('\n📡 Rutas disponibles:');
    console.log('GET  /');
    console.log('GET  /health');
    console.log('POST /api/ai/tactical-analysis');
    console.log('POST /api/ai/generate-animation');
    console.log('GET  /api/formations');
    console.log('GET  /api/tactical-plays');
});
