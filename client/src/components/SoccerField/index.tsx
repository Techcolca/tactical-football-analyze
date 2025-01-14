import React from 'react';
import { Group, Rect, Circle, Line } from 'react-konva';

interface SoccerFieldProps {
  width: number;
  height: number;
}

const SoccerField: React.FC<SoccerFieldProps> = ({ width, height }) => {
  const fieldColor = '#2e7d32';
  const lineColor = '#ffffff';
  const lineWidth = 2;

  // Dimensiones relativas del campo
  const margin = 20;
  const fieldWidth = width - (margin * 2);
  const fieldHeight = height - (margin * 2);
  const penaltyBoxWidth = fieldWidth * 0.165;
  const penaltyBoxHeight = fieldHeight * 0.4;
  const goalBoxWidth = fieldWidth * 0.055;
  const goalBoxHeight = fieldHeight * 0.186;
  const centerCircleRadius = Math.min(fieldWidth, fieldHeight) * 0.1;
  const penaltySpotDistance = fieldWidth * 0.11;
  const cornerArcRadius = Math.min(fieldWidth, fieldHeight) * 0.02;

  return (
    <Group>
      {/* Campo principal */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={fieldColor}
        shadowColor="black"
        shadowBlur={10}
        shadowOpacity={0.3}
      />

      {/* Líneas del campo */}
      <Group stroke={lineColor} strokeWidth={lineWidth}>
        {/* Borde del campo */}
        <Rect
          x={margin}
          y={margin}
          width={fieldWidth}
          height={fieldHeight}
        />

        {/* Línea central */}
        <Line
          points={[width / 2, margin, width / 2, height - margin]}
        />

        {/* Círculo central */}
        <Circle
          x={width / 2}
          y={height / 2}
          radius={centerCircleRadius}
        />

        {/* Punto central */}
        <Circle
          x={width / 2}
          y={height / 2}
          radius={2}
          fill={lineColor}
        />

        {/* Área de penalti izquierda */}
        <Rect
          x={margin}
          y={(height - penaltyBoxHeight) / 2}
          width={penaltyBoxWidth}
          height={penaltyBoxHeight}
        />

        {/* Área de gol izquierda */}
        <Rect
          x={margin}
          y={(height - goalBoxHeight) / 2}
          width={goalBoxWidth}
          height={goalBoxHeight}
        />

        {/* Punto de penalti izquierdo */}
        <Circle
          x={margin + penaltySpotDistance}
          y={height / 2}
          radius={2}
          fill={lineColor}
        />

        {/* Área de penalti derecha */}
        <Rect
          x={width - margin - penaltyBoxWidth}
          y={(height - penaltyBoxHeight) / 2}
          width={penaltyBoxWidth}
          height={penaltyBoxHeight}
        />

        {/* Área de gol derecha */}
        <Rect
          x={width - margin - goalBoxWidth}
          y={(height - goalBoxHeight) / 2}
          width={goalBoxWidth}
          height={goalBoxHeight}
        />

        {/* Punto de penalti derecho */}
        <Circle
          x={width - margin - penaltySpotDistance}
          y={height / 2}
          radius={2}
          fill={lineColor}
        />

        {/* Arcos de esquina */}
        {[
          [margin, margin],
          [width - margin, margin],
          [margin, height - margin],
          [width - margin, height - margin]
        ].map(([x, y], i) => (
          <Arc
            key={i}
            x={x}
            y={y}
            angle={90}
            rotation={i * 90}
            radius={cornerArcRadius}
            stroke={lineColor}
            strokeWidth={lineWidth}
          />
        ))}

        {/* Semicírculos de área */}
        <Arc
          x={margin + penaltyBoxWidth}
          y={height / 2}
          angle={90}
          rotation={-45}
          radius={penaltyBoxHeight / 3}
          stroke={lineColor}
          strokeWidth={lineWidth}
        />
        <Arc
          x={width - margin - penaltyBoxWidth}
          y={height / 2}
          angle={90}
          rotation={135}
          radius={penaltyBoxHeight / 3}
          stroke={lineColor}
          strokeWidth={lineWidth}
        />
      </Group>
    </Group>
  );
};

// Componente auxiliar para dibujar arcos
const Arc: React.FC<{
  x: number;
  y: number;
  radius: number;
  angle: number;
  rotation: number;
  stroke: string;
  strokeWidth: number;
}> = ({ x, y, radius, angle, rotation, stroke, strokeWidth }) => {
  const angleRad = (angle * Math.PI) / 180;
  const endX = x + radius * Math.cos(angleRad);
  const endY = y + radius * Math.sin(angleRad);

  return (
    <Group rotation={rotation} x={x} y={y}>
      <Line
        points={[
          0,
          0,
          radius,
          0,
          endX - x,
          endY - y,
        ]}
        stroke={stroke}
        strokeWidth={strokeWidth}
        tension={0.5}
        bezier
      />
    </Group>
  );
};

export default SoccerField;
