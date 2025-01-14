import React from 'react';
import { Group, Line, Circle, Rect, Arc } from 'react-konva';

interface SoccerFieldProps {
  width: number;
  height: number;
}

const SoccerField: React.FC<SoccerFieldProps> = ({ width, height }) => {
  const FIELD_RATIO = 1.54; // Proporción FIFA estándar
  const fieldWidth = width;
  const fieldHeight = height;
  const offsetX = (width - fieldWidth) / 2;
  const offsetY = (height - fieldHeight) / 2;

  // Colores
  const GRASS_COLOR = '#2E7D32';
  const GRASS_LINES_COLOR = '#1B5E20';
  const LINE_COLOR = '#FFFFFF';
  const LINE_WIDTH = 2;

  // Dimensiones relativas
  const PENALTY_AREA_WIDTH = fieldWidth * 0.165;
  const PENALTY_AREA_HEIGHT = fieldHeight * 0.40;
  const GOAL_AREA_WIDTH = fieldWidth * 0.055;
  const GOAL_AREA_HEIGHT = fieldHeight * 0.185;
  const CENTER_CIRCLE_RADIUS = fieldHeight * 0.09;
  const CORNER_RADIUS = fieldHeight * 0.02;
  const GOAL_WIDTH = fieldWidth * 0.075;
  const GOAL_DEPTH = fieldHeight * 0.04;

  return (
    <Group x={offsetX} y={offsetY}>
      {/* Campo base con gradiente */}
      <Rect
        width={fieldWidth}
        height={fieldHeight}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: fieldWidth, y: fieldHeight }}
        fillLinearGradientColorStops={[0, GRASS_COLOR, 1, '#1B5E20']}
        shadowColor="black"
        shadowBlur={10}
        shadowOpacity={0.3}
        cornerRadius={5}
      />

      {/* Líneas de césped con efecto */}
      {Array.from({ length: 24 }).map((_, i) => (
        <Line
          key={`grass-${i}`}
          points={[0, (fieldHeight / 24) * i, fieldWidth, (fieldHeight / 24) * i]}
          stroke={GRASS_LINES_COLOR}
          strokeWidth={1}
          opacity={0.15}
          shadowColor="black"
          shadowBlur={2}
          shadowOpacity={0.1}
        />
      ))}

      {/* Borde del campo */}
      <Rect
        width={fieldWidth}
        height={fieldHeight}
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
        cornerRadius={5}
      />

      {/* Línea central */}
      <Line
        points={[fieldWidth / 2, 0, fieldWidth / 2, fieldHeight]}
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
      />

      {/* Círculo central */}
      <Circle
        x={fieldWidth / 2}
        y={fieldHeight / 2}
        radius={CENTER_CIRCLE_RADIUS}
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
      />

      {/* Punto central */}
      <Circle
        x={fieldWidth / 2}
        y={fieldHeight / 2}
        radius={3}
        fill={LINE_COLOR}
      />

      {/* Área de penalti izquierda */}
      <Rect
        x={0}
        y={(fieldHeight - PENALTY_AREA_HEIGHT) / 2}
        width={PENALTY_AREA_WIDTH}
        height={PENALTY_AREA_HEIGHT}
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
      />

      {/* Área pequeña izquierda */}
      <Rect
        x={0}
        y={(fieldHeight - GOAL_AREA_HEIGHT) / 2}
        width={GOAL_AREA_WIDTH}
        height={GOAL_AREA_HEIGHT}
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
      />

      {/* Punto de penalti izquierdo */}
      <Circle
        x={fieldWidth * 0.11}
        y={fieldHeight / 2}
        radius={3}
        fill={LINE_COLOR}
      />

      {/* Área de penalti derecha */}
      <Rect
        x={fieldWidth - PENALTY_AREA_WIDTH}
        y={(fieldHeight - PENALTY_AREA_HEIGHT) / 2}
        width={PENALTY_AREA_WIDTH}
        height={PENALTY_AREA_HEIGHT}
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
      />

      {/* Área pequeña derecha */}
      <Rect
        x={fieldWidth - GOAL_AREA_WIDTH}
        y={(fieldHeight - GOAL_AREA_HEIGHT) / 2}
        width={GOAL_AREA_WIDTH}
        height={GOAL_AREA_HEIGHT}
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
      />

      {/* Punto de penalti derecho */}
      <Circle
        x={fieldWidth * 0.89}
        y={fieldHeight / 2}
        radius={3}
        fill={LINE_COLOR}
      />

      {/* Arcos de esquina */}
      {[
        [0, 0],
        [fieldWidth, 0],
        [0, fieldHeight],
        [fieldWidth, fieldHeight]
      ].map(([x, y], i) => (
        <Arc
          key={i}
          x={x}
          y={y}
          angle={90}
          rotation={i * 90}
          radius={CORNER_RADIUS}
          stroke={LINE_COLOR}
          strokeWidth={LINE_WIDTH}
        />
      ))}

      {/* Porterías */}
      {/* Portería izquierda */}
      <Group>
        <Line
          points={[
            -GOAL_DEPTH,
            fieldHeight / 2 - GOAL_WIDTH / 2,
            0,
            fieldHeight / 2 - GOAL_WIDTH / 2
          ]}
          stroke={LINE_COLOR}
          strokeWidth={LINE_WIDTH}
        />
        <Line
          points={[
            -GOAL_DEPTH,
            fieldHeight / 2 + GOAL_WIDTH / 2,
            0,
            fieldHeight / 2 + GOAL_WIDTH / 2
          ]}
          stroke={LINE_COLOR}
          strokeWidth={LINE_WIDTH}
        />
        <Line
          points={[
            -GOAL_DEPTH,
            fieldHeight / 2 - GOAL_WIDTH / 2,
            -GOAL_DEPTH,
            fieldHeight / 2 + GOAL_WIDTH / 2
          ]}
          stroke={LINE_COLOR}
          strokeWidth={LINE_WIDTH}
        />
      </Group>

      {/* Portería derecha */}
      <Group>
        <Line
          points={[
            fieldWidth,
            fieldHeight / 2 - GOAL_WIDTH / 2,
            fieldWidth + GOAL_DEPTH,
            fieldHeight / 2 - GOAL_WIDTH / 2
          ]}
          stroke={LINE_COLOR}
          strokeWidth={LINE_WIDTH}
        />
        <Line
          points={[
            fieldWidth,
            fieldHeight / 2 + GOAL_WIDTH / 2,
            fieldWidth + GOAL_DEPTH,
            fieldHeight / 2 + GOAL_WIDTH / 2
          ]}
          stroke={LINE_COLOR}
          strokeWidth={LINE_WIDTH}
        />
        <Line
          points={[
            fieldWidth + GOAL_DEPTH,
            fieldHeight / 2 - GOAL_WIDTH / 2,
            fieldWidth + GOAL_DEPTH,
            fieldHeight / 2 + GOAL_WIDTH / 2
          ]}
          stroke={LINE_COLOR}
          strokeWidth={LINE_WIDTH}
        />
      </Group>
    </Group>
  );
};

export default SoccerField;
