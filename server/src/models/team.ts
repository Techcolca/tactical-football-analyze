import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
    name: String,
    number: Number,
    position: String,
    photo: String
});

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    players: [playerSchema]
});

export const Team = mongoose.model('Team', teamSchema);
