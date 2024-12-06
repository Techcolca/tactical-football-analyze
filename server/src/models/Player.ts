import mongoose, { Document, Schema } from 'mongoose';

export interface IPlayer extends Document {
  name: string;
  number: number;
  position: string;
  team: string;
  nationality: string;
  age: number;
  height: number;
  weight: number;
  preferredFoot: 'left' | 'right';
  image?: string;
  stats: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
    // Estadísticas detalladas
    acceleration: number;
    sprintSpeed: number;
    finishing: number;
    shotPower: number;
    longShots: number;
    volleys: number;
    penalties: number;
    vision: number;
    crossing: number;
    freeKick: number;
    shortPassing: number;
    longPassing: number;
    curve: number;
    agility: number;
    balance: number;
    reactions: number;
    ballControl: number;
    composure: number;
    interceptions: number;
    headingAccuracy: number;
    marking: number;
    standingTackle: number;
    slidingTackle: number;
    jumping: number;
    stamina: number;
    strength: number;
    aggression: number;
  };
  specialTraits: string[];
  rating: number;
  potential: number;
  form: number;
  morale: number;
  fatigue: number;
  marketValue: number;
  contract: {
    startDate: Date;
    endDate: Date;
    salary: number;
  };
  performance: {
    matches: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    minutesPlayed: number;
    averageRating: number;
    manOfTheMatch: number;
    // Estadísticas avanzadas
    passAccuracy: number;
    shotsOnTarget: number;
    tackleSuccess: number;
    dribbleSuccess: number;
    aerialDuelsWon: number;
    interceptionRate: number;
    distanceCovered: number;
    sprintSpeed: number;
    heatmap?: {
      positions: Array<{
        x: number;
        y: number;
        intensity: number;
      }>;
      lastUpdated: Date;
    };
  };
  history: Array<{
    season: string;
    team: string;
    matches: number;
    goals: number;
    assists: number;
    averageRating: number;
  }>;
  injuries: Array<{
    type: string;
    startDate: Date;
    endDate: Date;
    severity: 'minor' | 'moderate' | 'severe';
    description: string;
  }>;
  training: {
    focus: string[];
    progress: Array<{
      date: Date;
      attribute: string;
      improvement: number;
    }>;
    schedule: Array<{
      day: string;
      activities: string[];
      intensity: number;
    }>;
  };
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerSchema = new Schema<IPlayer>({
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
PlayerSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Virtual para calcular la edad
PlayerSchema.virtual('currentAge').get(function() {
  return Math.floor((Date.now() - this.birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
});

// Virtual para calcular días restantes de contrato
PlayerSchema.virtual('contractDaysRemaining').get(function() {
  return Math.ceil((this.contract.endDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
});

// Método para actualizar estadísticas después de un partido
PlayerSchema.methods.updateMatchStats = async function(matchStats: any) {
  this.performance.matches++;
  this.performance.goals += matchStats.goals || 0;
  this.performance.assists += matchStats.assists || 0;
  // ... actualizar otras estadísticas
  await this.save();
};

const Player = mongoose.model<IPlayer>('Player', PlayerSchema);
export default Player;
