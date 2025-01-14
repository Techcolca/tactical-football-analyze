// Interfaces para el equipo y jugadores
export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  number: number;
  position: string;
  photoUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  category: string;
  players: Player[];
}

// Interfaces para el dibujo
export interface Position {
  x: number;
  y: number;
}

export interface DrawingElement {
  id: string;
  type: 'arrow' | 'circle' | 'rectangle' | 'line' | 'curve' | 'cone' | 'curvedArrow' | 'x' | 'ball';
  points: Position[];
  color: string;
  lineStyle: 'solid' | 'dashed';
}

// Interfaces para la animación
export interface AnimationFrame {
  timestamp: string;
  elements: DrawingElement[];
  players: (Player & Position)[];
}

// Formaciones predefinidas
export const FORMATIONS = {
  '4-4-2': {
    positions: [
      { x: 0.3, y: 0.2 }, { x: 0.3, y: 0.4 }, { x: 0.3, y: 0.6 }, { x: 0.3, y: 0.8 },
      { x: 0.5, y: 0.3 }, { x: 0.5, y: 0.4 }, { x: 0.5, y: 0.6 }, { x: 0.5, y: 0.7 },
      { x: 0.7, y: 0.4 }, { x: 0.7, y: 0.6 }
    ]
  },
  '4-3-3': {
    positions: [
      { x: 0.3, y: 0.2 }, { x: 0.3, y: 0.4 }, { x: 0.3, y: 0.6 }, { x: 0.3, y: 0.8 },
      { x: 0.5, y: 0.3 }, { x: 0.5, y: 0.5 }, { x: 0.5, y: 0.7 },
      { x: 0.7, y: 0.3 }, { x: 0.7, y: 0.5 }, { x: 0.7, y: 0.7 }
    ]
  },
  '3-5-2': {
    positions: [
      { x: 0.3, y: 0.3 }, { x: 0.3, y: 0.5 }, { x: 0.3, y: 0.7 },
      { x: 0.5, y: 0.2 }, { x: 0.5, y: 0.35 }, { x: 0.5, y: 0.5 }, { x: 0.5, y: 0.65 }, { x: 0.5, y: 0.8 },
      { x: 0.7, y: 0.4 }, { x: 0.7, y: 0.6 }
    ]
  }
};
