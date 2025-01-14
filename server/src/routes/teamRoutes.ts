import express from 'express';
import { Team } from '../models/team';

const router = express.Router();

// Obtener todos los equipos
router.get('/teams', async (req, res) => {
    try {
        const teams = await Team.find();
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener equipos' });
    }
});

// Obtener un equipo específico
router.get('/teams/:id', async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }
        res.json(team);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el equipo' });
    }
});

// Crear un nuevo equipo
router.post('/teams', async (req, res) => {
    try {
        const team = new Team(req.body);
        await team.save();
        res.status(201).json(team);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el equipo' });
    }
});

// Actualizar un equipo
router.put('/teams/:id', async (req, res) => {
    try {
        const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!team) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }
        res.json(team);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el equipo' });
    }
});

// Eliminar un equipo
router.delete('/teams/:id', async (req, res) => {
    try {
        const team = await Team.findByIdAndDelete(req.params.id);
        if (!team) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }
        res.json({ message: 'Equipo eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el equipo' });
    }
});

export default router;
