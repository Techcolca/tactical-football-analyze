export enum UserRole {
  ADMIN = 'admin',
  COACH = 'coach',
  ANALYST = 'analyst',
  VIEWER = 'viewer'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  team?: string;
  avatar: string;
  preferences: {
    theme: string;
    language: string;
    notifications: boolean;
  };
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  team?: string;
}

export interface ProfileUpdate {
  name?: string;
  team?: string;
  avatar?: string;
  preferences?: {
    theme?: string;
    language?: string;
    notifications?: boolean;
  };
}
