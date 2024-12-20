"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authService_1 = require("../services/authService");
const User_1 = require("../models/User");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// Validaciones
const registerValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 8 }),
    (0, express_validator_1.body)('name').trim().notEmpty(),
    (0, express_validator_1.body)('role').optional().isIn(Object.values(User_1.UserRole)),
    (0, express_validator_1.body)('team').optional().trim()
];
const loginValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty()
];
const passwordValidation = [
    (0, express_validator_1.body)('oldPassword').notEmpty(),
    (0, express_validator_1.body)('newPassword').isLength({ min: 8 })
];
// Rutas de autenticación
router.post('/register', registerValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password, name, role, team } = req.body;
        const result = await authService_1.AuthService.register({ email, password, name, role, team });
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.post('/login', loginValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        const result = await authService_1.AuthService.login(email, password);
        res.json(result);
    }
    catch (error) {
        res.status(401).json({ error: error.message });
    }
});
router.post('/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token requerido' });
        }
        const result = await authService_1.AuthService.refreshToken(refreshToken);
        res.json(result);
    }
    catch (error) {
        res.status(401).json({ error: error.message });
    }
});
// Rutas protegidas
router.use(authService_1.authMiddleware);
router.post('/change-password', passwordValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { oldPassword, newPassword } = req.body;
        await authService_1.AuthService.changePassword(req.user.id, oldPassword, newPassword);
        res.json({ message: 'Contraseña actualizada exitosamente' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.put('/profile', async (req, res) => {
    try {
        const updates = req.body;
        const profile = await authService_1.AuthService.updateProfile(req.user.id, updates);
        res.json(profile);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Rutas administrativas
router.get('/users', (0, authService_1.authorize)([User_1.UserRole.ADMIN]), async (req, res) => {
    try {
        // Implementar lógica para listar usuarios (solo admin)
        res.json({ message: 'Lista de usuarios' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map