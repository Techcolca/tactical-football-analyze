export interface PlayerPosition {
  id: string;
  x: number;
  y: number;
  role: string;
  name: string;
  number: number;
  stats?: PlayerStats;
}

export interface PlayerStats {
  speed: number;
  stamina: number;
  passing: number;
  shooting: number;
  defending: number;
  dribbling: number;
}

export interface TeamFormation {
  pattern: string;
  positions: PlayerPosition[];
  style: 'attacking' | 'defensive' | 'balanced';
  pressure: 'high' | 'medium' | 'low';
  width: 'wide' | 'narrow' | 'balanced';
}

export interface MatchAnalysis {
  strengths: string[];
  weaknesses: string[];
  attackingOpportunities: string[];
  defensiveVulnerabilities: string[];
  recommendations: string[];
}

export interface TacticalSuggestion {
  type: 'movement' | 'pressing' | 'positioning' | 'passing';
  priority: 'high' | 'medium' | 'low';
  description: string;
  players: string[];
  area: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

export interface PressureZone {
  x: number;
  y: number;
  intensity: number;
  recommendation: string;
}

export interface MovementPattern {
  playerId: string;
  path: Array<{ x: number; y: number; time: number }>;
  type: 'attacking' | 'defensive' | 'support';
  effectiveness: number;
}

export interface SetPieceStrategy {
  type: 'corner' | 'freekick';
  position: { x: number; y: number };
  playerRoles: Array<{
    playerId: string;
    role: string;
    startPosition: { x: number; y: number };
    movement: { x: number; y: number }[];
  }>;
  variations: string[];
}

export interface TacticalEvent {
  type: 'pass' | 'shot' | 'tackle' | 'interception' | 'pressure';
  timestamp: number;
  position: { x: number; y: number };
  player: string;
  success: boolean;
  details?: any;
}

export interface PerformanceMetrics {
  possessionPercentage: number;
  passAccuracy: number;
  shotsOnTarget: number;
  pressureSuccess: number;
  distanceCovered: number;
  sprintSpeed: number;
  heatmap: Array<{ x: number; y: number; intensity: number }>;
}
