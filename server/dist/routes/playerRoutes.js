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
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Configurar multer para el almacenamiento de imágenes
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/players';
        // Crear el directorio si no existe
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
        res.status(500).json({
            message: 'Error al eliminar el jugador',
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=playerRoutes.js.map