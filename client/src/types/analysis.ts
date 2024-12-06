export interface PlayerPosition {
  id: string;
  name: string;
  number: number;
  x: number;
  y: number;
  role: string;
}

export interface TeamFormation {
  pattern: string;
  positions: PlayerPosition[];
}

export interface MatchAnalysis {
  strengths: string[];
  weaknesses: string[];
  attackingOpportunities: string[];
  defensiveVulnerabilities: string[];
  tacticalRecommendations: string[];
}

export interface PerformanceMetrics {
  possession: {
    team: number;
    opponent: number;
  };
  passes: {
    completed: number;
    attempted: number;
    accuracy: number;
  };
  shots: {
    onTarget: number;
    total: number;
    accuracy: number;
  };
  pressure: {
    high: number;
    medium: number;
    low: number;
  };
  duels: {
    won: number;
    lost: number;
    ratio: number;
  };
}

export interface TacticalEvent {
  id: string;
  type: 'goal' | 'shot' | 'pass' | 'tackle' | 'pressure' | 'formation_change';
  timestamp: number;
  player: {
    id: string;
    name: string;
    number: number;
  };
  position: {
    x: number;
    y: number;
  };
  description: string;
  impact: 'high' | 'medium' | 'low';
  relatedPlayers?: {
    id: string;
    name: string;
    number: number;
  }[];
}
