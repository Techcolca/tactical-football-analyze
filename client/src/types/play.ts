import { Formation } from './collaboration';

export interface Play {
  id: string;
  name: string;
  formation: Formation;
  description: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  data: PlayData;
}

export interface PlayData {
  players: PlayerPosition[];
  ballPosition?: Position;
  movements: Movement[];
  annotations: Annotation[];
}

export interface PlayerPosition {
  playerId: string;
  position: Position;
  role?: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Movement {
  type: 'player' | 'ball';
  id: string;
  from: Position;
  to: Position;
  style?: MovementStyle;
}

export interface MovementStyle {
  color?: string;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  arrowStyle?: 'none' | 'start' | 'end' | 'both';
}

export interface Annotation {
  id: string;
  type: 'text' | 'shape';
  position: Position;
  content: string;
  style?: AnnotationStyle;
}

export interface AnnotationStyle {
  color?: string;
  fontSize?: number;
  shape?: 'circle' | 'rectangle' | 'triangle';
  size?: number;
}
