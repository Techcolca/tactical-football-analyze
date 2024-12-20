"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserRole = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["COACH"] = "coach";
    UserRole["ANALYST"] = "analyst";
    UserRole["VIEWER"] = "viewer";
})(UserRole || (exports.UserRole = UserRole = {}));
const userSchema = new mongoose_1.default.Schema({
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
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcryptjs_1.default.compare(candidatePassword, this.password);
    }
    catch (error) {
        throw error;
    }
};
// Method to generate profile data (excluding sensitive information)
userSchema.methods.getProfile = function () {
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
exports.User = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=User.js.map