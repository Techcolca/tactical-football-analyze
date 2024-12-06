import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  ADMIN = 'admin',
  COACH = 'coach',
  ANALYST = 'analyst',
  VIEWER = 'viewer'
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.VIEWER
  },
  team: {
    type: String,
    required: false
  },
  avatar: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  preferences: {
    theme: {
      type: String,
      default: 'dark'
    },
    language: {
      type: String,
      default: 'es'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to generate profile data (excluding sensitive information)
userSchema.methods.getProfile = function() {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    role: this.role,
    team: this.team,
    avatar: this.avatar,
    preferences: this.preferences,
    createdAt: this.createdAt
  };
};

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  team?: string;
  avatar: string;
  isActive: boolean;
  lastLogin: Date | null;
  preferences: {
    theme: string;
    language: string;
    notifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getProfile(): any;
}

export const User = mongoose.model<IUser>('User', userSchema);
