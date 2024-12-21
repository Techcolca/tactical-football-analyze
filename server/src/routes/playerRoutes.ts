import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

// Configurar multer para el almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/players';
    // Crear el directorio si no existe
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

// Crear jugador
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { firstName, lastName, number, position, teamId } = req.body;
    const imagePath = req.file ? req.file.path : null;

    const player = await prisma.player.create({
      data: {
        firstName,
        lastName,
        number: parseInt(number),
        position,
        teamId,
        photoUrl: imagePath,
      },
    });

    res.json(player);
  } catch (error: any) {
    console.error('Error al crear jugador:', error);
    res.status(500).json({
      message: 'Error al crear el jugador',
      error: error.message
    });
  }
});

// Obtener jugadores por equipo
router.get('/team/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const players = await prisma.player.findMany({
      where: {
        teamId: teamId
      }
    });
    res.json(players);
  } catch (error: any) {
    res.status(500).json({
      message: 'Error al obtener los jugadores',
      error: error.message
    });
  }
});

// Actualizar jugador
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, number, position } = req.body;
    const imagePath = req.file ? req.file.path : undefined;

    const player = await prisma.player.update({
      where: { id },
      data: {
        firstName,
        lastName,
        number: parseInt(number),
        position,
        ...(imagePath && { photoUrl: imagePath }),
      },
    });

    res.json(player);
  } catch (error: any) {
    res.status(500).json({
      message: 'Error al actualizar el jugador',
      error: error.message
    });
  }
});

// Eliminar jugador
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.player.delete({
      where: { id },
    });
    res.json({ message: 'Jugador eliminado exitosamente' });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error al eliminar el jugador',
      error: error.message
    });
  }
});

export default router;
