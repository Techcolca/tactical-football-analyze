import mongoose from 'mongoose';
import { Team } from '../models/team';

const initializeDatabase = async () => {
    try {
        // Conectar a MongoDB
        await mongoose.connect('mongodb://localhost:27017/tactical-football');
        console.log('Conectado a MongoDB');

        // Verificar si ya existen equipos
        const teamsCount = await Team.countDocuments();
        if (teamsCount === 0) {
            // Crear equipos de ejemplo
            const teams = [
                {
                    name: 'Equipo A',
                    category: 'Sub-12',
                    players: [
                        { name: 'Juan', number: 1, position: 'Portero' },
                        { name: 'Pedro', number: 4, position: 'Defensa' },
                        { name: 'Luis', number: 10, position: 'Mediocampista' },
                    ]
                },
                {
                    name: 'Equipo B',
                    category: 'Sub-12',
                    players: [
                        { name: 'Carlos', number: 1, position: 'Portero' },
                        { name: 'Miguel', number: 5, position: 'Defensa' },
                        { name: 'Roberto', number: 9, position: 'Delantero' },
                    ]
                }
            ];

            await Team.insertMany(teams);
            console.log('Datos de ejemplo insertados correctamente');
        } else {
            console.log('La base de datos ya contiene equipos');
        }

    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
    }
};

export default initializeDatabase;
