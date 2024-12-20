"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const PlayerSchema = new mongoose_1.Schema({
    name: { type: String, required: true, index: true },
    number: { type: Number, required: true },
    position: { type: String, required: true, index: true },
    team: { type: String, required: true, index: true },
    nationality: { type: String, required: true },
    age: { type: Number, required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    preferredFoot: { type: String, enum: ['left', 'right'], required: true },
    image: String,
    stats: {
        pace: { type: Number, required: true, min: 0, max: 99 },
        shooting: { type: Number, required: true, min: 0, max: 99 },
        passing: { type: Number, required: true, min: 0, max: 99 },
        dribbling: { type: Number, required: true, min: 0, max: 99 },
        defending: { type: Number, required: true, min: 0, max: 99 },
        physical: { type: Number, required: true, min: 0, max: 99 },
        // Estadísticas detalladas
        acceleration: { type: Number, required: true, min: 0, max: 99 },
        sprintSpeed: { type: Number, required: true, min: 0, max: 99 },
        finishing: { type: Number, required: true, min: 0, max: 99 },
        shotPower: { type: Number, required: true, min: 0, max: 99 },
        longShots: { type: Number, required: true, min: 0, max: 99 },
        volleys: { type: Number, required: true, min: 0, max: 99 },
        penalties: { type: Number, required: true, min: 0, max: 99 },
        vision: { type: Number, required: true, min: 0, max: 99 },
        crossing: { type: Number, required: true, min: 0, max: 99 },
        freeKick: { type: Number, required: true, min: 0, max: 99 },
        shortPassing: { type: Number, required: true, min: 0, max: 99 },
        longPassing: { type: Number, required: true, min: 0, max: 99 },
        curve: { type: Number, required: true, min: 0, max: 99 },
        agility: { type: Number, required: true, min: 0, max: 99 },
        balance: { type: Number, required: true, min: 0, max: 99 },
        reactions: { type: Number, required: true, min: 0, max: 99 },
        ballControl: { type: Number, required: true, min: 0, max: 99 },
        composure: { type: Number, required: true, min: 0, max: 99 },
        interceptions: { type: Number, required: true, min: 0, max: 99 },
        headingAccuracy: { type: Number, required: true, min: 0, max: 99 },
        marking: { type: Number, required: true, min: 0, max: 99 },
        standingTackle: { type: Number, required: true, min: 0, max: 99 },
        slidingTackle: { type: Number, required: true, min: 0, max: 99 },
        jumping: { type: Number, required: true, min: 0, max: 99 },
        stamina: { type: Number, required: true, min: 0, max: 99 },
        strength: { type: Number, required: true, min: 0, max: 99 },
        aggression: { type: Number, required: true, min: 0, max: 99 }
    },
    specialTraits: [String],
    rating: { type: Number, required: true, min: 0, max: 99 },
    potential: { type: Number, required: true, min: 0, max: 99 },
    form: { type: Number, required: true, min: 0, max: 100 },
    morale: { type: Number, required: true, min: 0, max: 100 },
    fatigue: { type: Number, required: true, min: 0, max: 100 },
    marketValue: { type: Number, required: true },
    contract: {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        salary: { type: Number, required: true }
    },
    performance: {
        matches: { type: Number, default: 0 },
        goals: { type: Number, default: 0 },
        assists: { type: Number, default: 0 },
        yellowCards: { type: Number, default: 0 },
        redCards: { type: Number, default: 0 },
        minutesPlayed: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
        manOfTheMatch: { type: Number, default: 0 },
        passAccuracy: { type: Number, default: 0 },
        shotsOnTarget: { type: Number, default: 0 },
        tackleSuccess: { type: Number, default: 0 },
        dribbleSuccess: { type: Number, default: 0 },
        aerialDuelsWon: { type: Number, default: 0 },
        interceptionRate: { type: Number, default: 0 },
        distanceCovered: { type: Number, default: 0 },
        sprintSpeed: { type: Number, default: 0 },
        heatmap: {
            positions: [{
                    x: Number,
                    y: Number,
                    intensity: Number
                }],
            lastUpdated: Date
        }
    },
    history: [{
            season: String,
            team: String,
            matches: Number,
            goals: Number,
            assists: Number,
            averageRating: Number
        }],
    injuries: [{
            type: String,
            startDate: Date,
            endDate: Date,
            severity: { type: String, enum: ['minor', 'moderate', 'severe'] },
            description: String
        }],
    training: {
        focus: [String],
        progress: [{
                date: Date,
                attribute: String,
                improvement: Number
            }],
        schedule: [{
                day: String,
                activities: [String],
                intensity: Number
            }]
    },
    lastUpdated: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Índices
PlayerSchema.index({ name: 'text', team: 'text', position: 'text' });
PlayerSchema.index({ 'stats.rating': -1 });
PlayerSchema.index({ 'performance.averageRating': -1 });
PlayerSchema.index({ lastUpdated: -1 });
// Middleware para actualizar lastUpdated
PlayerSchema.pre('save', function (next) {
    this.lastUpdated = new Date();
    next();
});
// Virtual para calcular la edad
PlayerSchema.virtual('currentAge').get(function () {
    return Math.floor((Date.now() - this.birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
});
// Virtual para calcular días restantes de contrato
PlayerSchema.virtual('contractDaysRemaining').get(function () {
    return Math.ceil((this.contract.endDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
});
// Método para actualizar estadísticas después de un partido
PlayerSchema.methods.updateMatchStats = async function (matchStats) {
    this.performance.matches++;
    this.performance.goals += matchStats.goals || 0;
    this.performance.assists += matchStats.assists || 0;
    // ... actualizar otras estadísticas
    await this.save();
};
const Player = mongoose_1.default.model('Player', PlayerSchema);
exports.default = Player;
//# sourceMappingURL=Player.js.map