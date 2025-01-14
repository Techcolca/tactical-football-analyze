export interface Point {
  x: number;
  y: number;
}

export type DrawingToolType = 
  | 'select'
  | 'arrow'
  | 'line'
  | 'circle'
  | 'rectangle'
  | 'x'
  | 'cone'
  | 'ball';

export interface DrawingElement {
  type: DrawingToolType;
  color: string;
  lineStyle?: 'solid' | 'dashed';
  points?: number[];  // Para líneas y flechas: [x1, y1, x2, y2]
  position?: Point;   // Para x, cono y balón
  start?: Point;      // Para círculo y rectángulo
  end?: Point;        // Para círculo y rectángulo
}
