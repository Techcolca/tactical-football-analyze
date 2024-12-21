"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Configuración de multer para subida de imágenes
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/players';
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB límite
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten imágenes (jpg, jpeg, png)'));
    }
});
// Esquemas de validación
const createTeamSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'El nombre es requerido'),
    category: zod_1.z.enum(['FIRST_TEAM', 'RESERVES', 'U19', 'U17', 'U15']),
    season: zod_1.z.string().min(1, 'La temporada es requerida'),
});
const createPlayerSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, 'El nombre es requerido'),
    lastName: zod_1.z.string().min(1, 'El apellido es requerido'),
    number: zod_1.z.string().transform(num => parseInt(num)),
    position: zod_1.z.enum(['GK', 'DF', 'MF', 'FW']),
});
// Obtener todos los equipos
router.get('/', auth_1.authenticate, async (req, res) => {
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
    }
    catch (error) {
        console.error('Error al obtener equipos:', error);
        res.status(500).json({
            message: 'Error al obtener equipos',
            error: error.message,
        });
    }
});
// Crear equipo
router.post('/', auth_1.authenticate, async (req, res) => {
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
    }
    catch (error) {
        console.error('Error detallado al crear equipo:', error);
        if (error instanceof zod_1.z.ZodError) {
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
router.get('/:teamId/players', auth_1.authenticate, async (req, res) => {
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
    }
    catch (error) {
        console.error('Error al obtener jugadores:', error);
        res.status(500).json({
            message: 'Error al obtener jugadores',
            error: error.message,
        });
    }
});
// Agregar jugador a un equipo
router.post('/:teamId/players', auth_1.authenticate, upload.single('image'), async (req, res) => {
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
    }
    catch (error) {
        console.error('Error detallado al crear jugador:', error);
        if (error instanceof zod_1.z.ZodError) {
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
exports.default = router;
//# sourceMappingURL=teamRoutes.js.map