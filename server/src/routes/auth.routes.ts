import { Router } from 'express';
import { AuthService, authMiddleware, authorize } from '../services/authService';
import { UserRole } from '../models/User';
import { body, validationResult } from 'express-validator';

const router = Router();

// Validaciones
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').trim().notEmpty(),
  body('role').optional().isIn(Object.values(UserRole)),
  body('team').optional().trim()
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

const passwordValidation = [
  body('oldPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 })
];

// Rutas de autenticación
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, role, team } = req.body;
    const result = await AuthService.register({ email, password, name, role, team });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token requerido' });
    }

    const result = await AuthService.refreshToken(refreshToken);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

// Rutas protegidas
router.use(authMiddleware);

router.post('/change-password', passwordValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { oldPassword, newPassword } = req.body;
    await AuthService.changePassword(req.user.id, oldPassword, newPassword);
    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const updates = req.body;
    const profile = await AuthService.updateProfile(req.user.id, updates);
    res.json(profile);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Rutas administrativas
router.get('/users', authorize([UserRole.ADMIN]), async (req, res) => {
  try {
    // Implementar lógica para listar usuarios (solo admin)
    res.json({ message: 'Lista de usuarios' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
