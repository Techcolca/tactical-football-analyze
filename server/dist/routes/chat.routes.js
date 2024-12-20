"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatService_1 = require("../services/chatService");
const authService_1 = require("../services/authService");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// Middleware de autenticación para todas las rutas
router.use(authService_1.authMiddleware);
// Validaciones
const messageValidation = [
    (0, express_validator_1.body)('message').trim().notEmpty().withMessage('El mensaje no puede estar vacío'),
    (0, express_validator_1.body)('context').optional().isObject(),
];
const gameContextValidation = [
    (0, express_validator_1.body)('score').trim().notEmpty(),
    (0, express_validator_1.body)('minute').isInt({ min: 0, max: 120 }),
    (0, express_validator_1.body)('possession').isFloat({ min: 0, max: 100 }),
    (0, express_validator_1.body)('lastEvents').isArray(),
];
// Ruta para procesar mensajes del chat
router.post('/message', messageValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { message, context } = req.body;
        const response = await chatService_1.ChatService.generateResponse(message, {
            ...context,
            previousMessages: context.previousMessages || []
        });
        res.json(response);
    }
    catch (error) {
        console.error('Error al procesar mensaje:', error);
        res.status(500).json({ error: error.message });
    }
});
// Ruta para análisis de contexto de juego
router.post('/analyze-context', gameContextValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const gameContext = req.body;
        const analysis = await chatService_1.ChatService.analyzeGameContext(gameContext);
        res.json(analysis);
    }
    catch (error) {
        console.error('Error al analizar contexto:', error);
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=chat.routes.js.map