import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const registerSchema = z.object({
  club: z.object({
    name: z.string().min(1),
    country: z.string().min(1),
    city: z.string().min(1),
  }),
  coach: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['HEAD_COACH', 'ASSISTANT_COACH', 'YOUTH_COACH']),
  }),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
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
    const passwordHash = await bcrypt.hash(coach.password, 10);

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
    const token = jwt.sign(
      { id: newCoach.id, role: newCoach.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

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
  } catch (error) {
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
    const validPassword = await bcrypt.compare(password, coach.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: coach.id, role: coach.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

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
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(400).json({ message: 'Error en el login' });
  }
});

export default router;
