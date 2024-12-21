"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const registerSchema = zod_1.z.object({
    club: zod_1.z.object({
        name: zod_1.z.string().min(1),
        country: zod_1.z.string().min(1),
        city: zod_1.z.string().min(1),
    }),
    coach: zod_1.z.object({
        firstName: zod_1.z.string().min(1),
        lastName: zod_1.z.string().min(1),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(6),
        role: zod_1.z.enum(['HEAD_COACH', 'ASSISTANT_COACH', 'YOUTH_COACH']),
    }),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
router.post('/register', async (req, res) => {
    try {
        const { club, coach } = registerSchema.parse(req.body);
        // Verificar si el email ya existe
        const existingCoach = await prisma.coach.findUnique({
            where: { email: coach.email },
        });
        if (existingCoach) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }
        // Crear el club
        const newClub = await prisma.club.create({
            data: {
                name: club.name,
                country: club.country,
                city: club.city,
            },
        });
        // Hash de la contraseña
        const passwordHash = await bcryptjs_1.default.hash(coach.password, 10);
        // Crear el entrenador
        const newCoach = await prisma.coach.create({
            data: {
                clubId: newClub.id,
                firstName: coach.firstName,
                lastName: coach.lastName,
                email: coach.email,
                passwordHash,
                role: coach.role,
            },
        });
        // Generar token JWT
        const token = jsonwebtoken_1.default.sign({ id: newCoach.id, role: newCoach.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
        res.status(201).json({
            token,
            user: {
                id: newCoach.id,
                firstName: newCoach.firstName,
                lastName: newCoach.lastName,
                email: newCoach.email,
                role: newCoach.role,
                clubId: newCoach.clubId,
            },
        });
    }
    catch (error) {
        console.error('Error en el registro:', error);
        res.status(400).json({ message: 'Error en el registro' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        // Buscar el entrenador
        const coach = await prisma.coach.findUnique({
            where: { email },
        });
        if (!coach) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        // Verificar contraseña
        const validPassword = await bcryptjs_1.default.compare(password, coach.passwordHash);
        if (!validPassword) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        // Generar token JWT
        const token = jsonwebtoken_1.default.sign({ id: coach.id, role: coach.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
        res.json({
            token,
            user: {
                id: coach.id,
                firstName: coach.firstName,
                lastName: coach.lastName,
                email: coach.email,
                role: coach.role,
                clubId: coach.clubId,
            },
        });
    }
    catch (error) {
        console.error('Error en el login:', error);
        res.status(400).json({ message: 'Error en el login' });
    }
});
exports.default = router;
//# sourceMappingURL=authRoutes.js.map