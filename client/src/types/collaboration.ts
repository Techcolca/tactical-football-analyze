export interface RoomUser {
  id: string;
  name: string;
  role: 'coach' | 'analyst' | 'viewer';
  avatar?: string;
  isActive: boolean;
  lastAction?: 'formation_update' | 'analysis_update' | null;
  lastActionTimestamp?: number;
}

export interface CollaborationRoom {
  id: string;
  name: string;
  createdBy: string;
  users: RoomUser[];
  formation: Formation;
  analysis: Analysis;
  messages: ChatMessage[];
  lastUpdate: number;
}

export interface Formation {
  id: string;
  name: string;
  players: PlayerPosition[];
  tactics: TacticalInstruction[];
  version: number;
}

export interface PlayerPosition {
  id: string;
  number: number;
  position: string;
  x: number;
  y: number;
  instructions?: string[];
}

export interface TacticalInstruction {
  id: string;
  type: 'movement' | 'pressing' | 'marking';
  description: string;
  players: string[]; // IDs de los jugadores involucrados
  visualData?: any; // Datos para representación visual (flechas, áreas, etc.)
}

export interface Analysis {
  id: string;
  title: string;
  description: string;
  tags: string[];
  aiSuggestions?: string[];
  attachments?: string[];
  version: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  content: string;
  type: 'text' | 'system' | 'analysis';
  timestamp: number;
  replyTo?: string;
  attachments?: string[];
}

export interface CollaborationEvent {
  type: 'join' | 'leave' | 'update' | 'message';
  userId: string;
  data: any;
  timestamp: number;
}

export interface RoomInvitation {
  id: string;
  roomId: string;
  invitedBy: string;
  invitedUser: string;
  role: 'coach' | 'analyst' | 'viewer';
  status: 'pending' | 'accepted' | 'rejected';
  expiresAt: number;
}
