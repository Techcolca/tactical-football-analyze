"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authMiddleware = exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key';
const REFRESH_TOKEN_EXPIRES_IN = '7d';
class AuthService {
    static async register(userData) {
        try {
            // Verificar si el usuario ya existe
            const existingUser = await User_1.User.findOne({ email: userData.email });
            if (existingUser) {
                throw new Error('El usuario ya existe');
            }
            // Crear nuevo usuario
            const user = new User_1.User(userData);
            await user.save();
            // Generar tokens
            const token = this.generateToken(user);
            const refreshToken = this.generateRefreshToken(user);
            // Actualizar último login
            user.lastLogin = new Date();
            await user.save();
            return {
                user: user.getProfile(),
                token,
                refreshToken
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async login(email, password) {
        try {
            // Buscar usuario
            const user = await User_1.User.findOne({ email });
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            // Verificar contraseña
            const isValid = await user.comparePassword(password);
            if (!isValid) {
                throw new Error('Contraseña incorrecta');
            }
            // Verificar si la cuenta está activa
            if (!user.isActive) {
                throw new Error('Cuenta desactivada');
            }
            // Generar tokens
            const token = this.generateToken(user);
            const refreshToken = this.generateRefreshToken(user);
            // Actualizar último login
            user.lastLogin = new Date();
            await user.save();
            return {
                user: user.getProfile(),
                token,
                refreshToken
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async refreshToken(refreshToken) {
        try {
            // Verificar refresh token
            const decoded = jsonwebtoken_1.default.verify(refreshToken, REFRESH_TOKEN_SECRET);
            const user = await User_1.User.findById(decoded.id);
            if (!user || !user.isActive) {
                throw new Error('Token inválido o cuenta desactivada');
            }
            // Generar nuevos tokens
            const newToken = this.generateToken(user);
            const newRefreshToken = this.generateRefreshToken(user);
            return {
                token: newToken,
                refreshToken: newRefreshToken
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async changePassword(userId, oldPassword, newPassword) {
        try {
            const user = await User_1.User.findById(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            const isValid = await user.comparePassword(oldPassword);
            if (!isValid) {
                throw new Error('Contraseña actual incorrecta');
            }
            user.password = newPassword;
            await user.save();
        }
        catch (error) {
            throw error;
        }
    }
    static async updateProfile(userId, updates) {
        try {
            const user = await User_1.User.findById(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            // Eliminar campos sensibles de las actualizaciones
            delete updates.password;
            delete updates.role;
            delete updates.email;
            Object.assign(user, updates);
            await user.save();
            return user.getProfile();
        }
        catch (error) {
            throw error;
        }
    }
    static generateToken(user) {
        return jsonwebtoken_1.default.sign({
            id: user._id,
            email: user.email,
            role: user.role
        }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }
    static generateRefreshToken(user) {
        return jsonwebtoken_1.default.sign({
            id: user._id,
        }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
    }
    static async validateToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            return decoded;
        }
        catch (error) {
            throw new Error('Token inválido');
        }
    }
}
exports.AuthService = AuthService;
// Middleware de autenticación
const authMiddleware = async (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            throw new Error('Token no proporcionado');
        }
        const decoded = await AuthService.validateToken(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'No autorizado' });
    }
};
exports.authMiddleware = authMiddleware;
// Middleware de autorización por rol
const authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Acceso denegado' });
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=authService.js.map