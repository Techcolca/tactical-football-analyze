import React from 'react';
import { motion } from 'framer-motion';
import { tacticalLineVariants } from './transitions';

interface Point {
  x: number;
  y: number;
}

interface MotionPathProps {
  points: Point[];
  color?: string;
  width?: number;
  dashed?: boolean;
  animated?: boolean;
  arrowHead?: boolean;
}

const MotionPath: React.FC<MotionPathProps> = ({
  points,
  color = '#DAA520',
  width = 2,
  dashed = false,
  animated = true,
  arrowHead = false,
}) => {
  // Generar el path SVG
  const generatePath = () => {
    if (points.length < 2) return '';

    const path = points.reduce((acc, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }
      
      // Calcular puntos de control para curvas Bezier
      const prevPoint = points[index - 1];
      const nextPoint = points[index + 1];
      
      if (nextPoint) {
        // Punto medio para control de curva
        const midX = (prevPoint.x + point.x) / 2;
        const midY = (prevPoint.y + point.y) / 2;
        return `${acc} Q ${midX} ${midY}, ${point.x} ${point.y}`;
      }
      
      return `${acc} L ${point.x} ${point.y}`;
    }, '');

    return path;
  };

  // Calcular la punta de flecha si es necesaria
  const generateArrowHead = () => {
    if (!arrowHead || points.length < 2) return null;

    const lastPoint = points[points.length - 1];
    const prevPoint = points[points.length - 2];

    // Calcular ángulo de la flecha
    const angle = Math.atan2(
      lastPoint.y - prevPoint.y,
      lastPoint.x - prevPoint.x
    );

    // Puntos para la punta de flecha
    const arrowLength = 15;
    const arrowWidth = 8;

    const arrowPoints = [
      {
        x: lastPoint.x - arrowLength * Math.cos(angle - Math.PI / 6),
        y: lastPoint.y - arrowLength * Math.sin(angle - Math.PI / 6),
      },
      lastPoint,
      {
        x: lastPoint.x - arrowLength * Math.cos(angle + Math.PI / 6),
        y: lastPoint.y - arrowLength * Math.sin(angle + Math.PI / 6),
      },
    ];

    return (
      <motion.path
        d={`M ${arrowPoints[0].x} ${arrowPoints[0].y} 
            L ${arrowPoints[1].x} ${arrowPoints[1].y} 
            L ${arrowPoints[2].x} ${arrowPoints[2].y}`}
        stroke={color}
        strokeWidth={width}
        fill="none"
        variants={tacticalLineVariants}
        initial="initial"
        animate="animate"
      />
    );
  };

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {animated && (
          <motion.linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <motion.stop
              offset="0%"
              stopColor={color}
              stopOpacity="0"
              animate={{
                stopOpacity: [0, 1, 0],
                offset: ['0%', '50%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <motion.stop
              offset="50%"
              stopColor={color}
              stopOpacity="1"
              animate={{
                offset: ['0%', '50%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <motion.stop
              offset="100%"
              stopColor={color}
              stopOpacity="0"
              animate={{
                stopOpacity: [0, 1, 0],
                offset: ['0%', '50%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </motion.linearGradient>
        )}
        {dashed && (
          <pattern
            id="dashedPattern"
            x="0"
            y="0"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="5"
              x2="10"
              y2="5"
              stroke={color}
              strokeWidth={width}
              strokeDasharray="5,5"
            />
          </pattern>
        )}
      </defs>

      <motion.path
        d={generatePath()}
        stroke={animated ? "url(#lineGradient)" : dashed ? "url(#dashedPattern)" : color}
        strokeWidth={width}
        fill="none"
        variants={tacticalLineVariants}
        initial="initial"
        animate="animate"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {generateArrowHead()}
    </svg>
  );
};

export default MotionPath;
