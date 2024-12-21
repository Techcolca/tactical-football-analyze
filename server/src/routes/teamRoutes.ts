import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/players';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (jpg, jpeg, png)'));
  }
});

// Esquemas de validación
const createTeamSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  category: z.enum(['FIRST_TEAM', 'RESERVES', 'U19', 'U17', 'U15']),
  season: z.string().min(1, 'La temporada es requerida'),
});

const createPlayerSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  number: z.string().transform(num => parseInt(num)),
  position: z.enum(['GK', 'DF', 'MF', 'FW']),
});

// Obtener todos los equipos
router.get('/', authenticate, async (req: any, res) => {
  try {
    // Primero obtenemos el entrenador con su club
    const coach = await prisma.coach.findUnique({
      where: { id: req.user.id },
      include: { club: true }
    });

    if (!coach) {
      return res.status(404).json({
        message: 'Entrenador no encontrado',
      });
    }

    const teams = await prisma.team.findMany({
      where: {
        coachId: req.user.id,
        clubId: coach.clubId
      },
      include: {
        players: true,
      },
    });
    res.json(teams);
  } catch (error: any) {
    console.error('Error al obtener equipos:', error);
    res.status(500).json({
      message: 'Error al obtener equipos',
      error: error.message,
    });
  }
});

// Crear equipo
router.post('/', authenticate, async (req: any, res) => {
  try {
    console.log('Datos recibidos:', req.body);
    const validatedData = createTeamSchema.parse(req.body);
    console.log('Datos validados:', validatedData);

    // Primero obtenemos el entrenador con su club
    const coach = await prisma.coach.findUnique({
      where: { id: req.user.id },
      include: { club: true }
    });

    if (!coach) {
      return res.status(404).json({
        message: 'Entrenador no encontrado',
      });
    }

    const team = await prisma.team.create({
      data: {
        ...validatedData,
        coachId: coach.id,
        clubId: coach.clubId,
      },
      include: {
        players: true,
      },
    });

    console.log('Equipo creado:', team);
    res.json(team);
  } catch (error: any) {
    console.error('Error detallado al crear equipo:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: error.errors,
      });
    }

    if (error.code === 'P2002') {
      return res.status(400).json({
        message: 'Ya existe un equipo con ese nombre',
      });
    }

    res.status(400).json({
      message: 'Error al crear equipo',
      error: error.message,
    });
  }
});

// Obtener jugadores de un equipo
router.get('/:teamId/players', authenticate, async (req: any, res) => {
  try {
    const { teamId } = req.params;
    
    // Verificar que el equipo pertenece al entrenador
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        coachId: req.user.id,
      },
    });

    if (!team) {
      return res.status(404).json({
        message: 'Equipo no encontrado',
      });
    }

    const players = await prisma.player.findMany({
      where: {
        teamId,
      },
    });
    res.json(players);
  } catch (error: any) {
    console.error('Error al obtener jugadores:', error);
    res.status(500).json({
      message: 'Error al obtener jugadores',
      error: error.message,
    });
  }
});

// Agregar jugador a un equipo
router.post('/:teamId/players', authenticate, upload.single('image'), async (req: any, res) => {
  try {
    console.log('Datos recibidos del jugador:', req.body);
    const { teamId } = req.params;
    
    // Verificar que el equipo pertenece al entrenador
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        coachId: req.user.id,
      },
    });

    if (!team) {
      return res.status(404).json({
        message: 'Equipo no encontrado',
      });
    }

    const playerData = createPlayerSchema.parse(req.body);
    console.log('Datos validados del jugador:', playerData);

    const imagePath = req.file ? `/uploads/players/${req.file.filename}` : null;

    const player = await prisma.player.create({
      data: {
        ...playerData,
        teamId,
        photoUrl: imagePath,
      },
    });

    console.log('Jugador creado:', player);
    res.json(player);
  } catch (error: any) {
    console.error('Error detallado al crear jugador:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: error.errors,
      });
    }

    res.status(400).json({
      message: 'Error al crear jugador',
      error: error.message,
    });
  }
});

// Editar jugador
router.put('/:teamId/players/:playerId', authenticate, upload.single('image'), async (req: any, res) => {
  try {
    console.log('Datos recibidos para actualizar jugador:', req.body);
    const { teamId, playerId } = req.params;
    
    // Verificar que el equipo pertenece al entrenador
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        coachId: req.user.id,
      },
    });

    if (!team) {
      return res.status(404).json({
        message: 'Equipo no encontrado',
      });
    }

    // Verificar que el jugador existe y pertenece al equipo
    const existingPlayer = await prisma.player.findFirst({
      where: {
        id: playerId,
        teamId,
      },
    });

    if (!existingPlayer) {
      return res.status(404).json({
        message: 'Jugador no encontrado',
      });
    }

    const playerData = createPlayerSchema.parse(req.body);
    console.log('Datos validados del jugador:', playerData);

    let imagePath = existingPlayer.photoUrl;
    if (req.file) {
      // Si hay una nueva imagen, actualizar la ruta
      imagePath = `/uploads/players/${req.file.filename}`;
      
      // Eliminar la imagen anterior si existe
      if (existingPlayer.photoUrl) {
        const oldImagePath = path.join(__dirname, '../../', existingPlayer.photoUrl);
        try {
          fs.unlinkSync(oldImagePath);
        } catch (error) {
          console.error('Error al eliminar imagen anterior:', error);
        }
      }
    }

    const player = await prisma.player.update({
      where: {
        id: playerId,
      },
      data: {
        ...playerData,
        photoUrl: imagePath,
      },
    });

    console.log('Jugador actualizado:', player);
    res.json(player);
  } catch (error: any) {
    console.error('Error detallado al actualizar jugador:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: error.errors,
      });
    }

    res.status(400).json({
      message: 'Error al actualizar jugador',
      error: error.message,
    });
  }
});

export default router;
