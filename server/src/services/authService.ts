import jwt from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models/User';
import { createHash } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export class AuthService {
  static async register(userData: {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
    team?: string;
  }): Promise<{ user: any; token: string; refreshToken: string }> {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('El usuario ya existe');
      }

      // Crear nuevo usuario
      const user = new User(userData);
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
    } catch (error) {
      throw error;
    }
  }

  static async login(email: string, password: string): Promise<{ user: any; token: string; refreshToken: string }> {
    try {
      // Buscar usuario
      const user = await User.findOne({ email });
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
    } catch (error) {
      throw error;
    }
  }

  static async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      // Verificar refresh token
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { id: string };
      const user = await User.findById(decoded.id);

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
    } catch (error) {
      throw error;
    }
  }

  static async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const isValid = await user.comparePassword(oldPassword);
      if (!isValid) {
        throw new Error('Contraseña actual incorrecta');
      }

      user.password = newPassword;
      await user.save();
    } catch (error) {
      throw error;
    }
  }

  static async updateProfile(userId: string, updates: Partial<IUser>): Promise<any> {
    try {
      const user = await User.findById(userId);
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
    } catch (error) {
      throw error;
    }
  }

  private static generateToken(user: IUser): string {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  private static generateRefreshToken(user: IUser): string {
    return jwt.sign(
      {
        id: user._id,
      },
      REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );
  }

  static async validateToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
}

// Middleware de autenticación
export const authMiddleware = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new Error('Token no proporcionado');
    }

    const decoded = await AuthService.validateToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'No autorizado' });
  }
};

// Middleware de autorización por rol
export const authorize = (roles: UserRole[]) => {
  return (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
  };
};
