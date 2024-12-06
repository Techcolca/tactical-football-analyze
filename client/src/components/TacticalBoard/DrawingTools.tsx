import React from 'react';
import { Line, Circle, RegularPolygon } from 'react-konva';
import { Vector2d } from 'konva/lib/types';

export interface DrawingElement {
  id: string;
  type: 'arrow' | 'line' | 'cone' | 'circle' | 'dottedLine';
  points?: number[];
  position?: Vector2d;
  color: string;
  isDashed?: boolean;
  size?: number;
}

interface DrawingToolsProps {
  elements: DrawingElement[];
}

const DrawingTools: React.FC<DrawingToolsProps> = ({ elements }) => {
  const renderElement = (element: DrawingElement) => {
    switch (element.type) {
      case 'arrow':
        return (
          <Line
            key={element.id}
            points={element.points || []}
            stroke={element.color}
            strokeWidth={3}
            dash={element.isDashed ? [10, 5] : undefined}
            lineCap="round"
            lineJoin="round"
            pointerLength={20}
            pointerWidth={20}
            fill={element.color}
          />
        );
      
      case 'line':
      case 'dottedLine':
        return (
          <Line
            key={element.id}
            points={element.points || []}
            stroke={element.color}
            strokeWidth={3}
            dash={element.isDashed ? [10, 5] : undefined}
            lineCap="round"
            lineJoin="round"
          />
        );
      
      case 'cone':
        return (
          <RegularPolygon
            key={element.id}
            x={element.position?.x || 0}
            y={element.position?.y || 0}
            sides={3}
            radius={element.size || 15}
            fill={element.color}
            rotation={180}
          />
        );
      
      case 'circle':
        return (
          <Circle
            key={element.id}
            x={element.position?.x || 0}
            y={element.position?.y || 0}
            radius={element.size || 10}
            fill={element.color}
            opacity={0.5}
          />
        );
      
      default:
        return null;
    }
  };

  return <>{elements.map(renderElement)}</>;
};

export default DrawingTools;
