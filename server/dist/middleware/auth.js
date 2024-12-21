"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const authenticate = async (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            throw new Error();
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const coach = await prisma.coach.findUnique({
            where: { id: decoded.id },
        });
        if (!coach) {
            throw new Error();
        }
        req.user = { id: decoded.id, role: decoded.role };
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Por favor autentíquese' });
    }
};
exports.authenticate = authenticate;
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Por favor autentíquese' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'No tiene permiso para esta acción' });
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map