import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Line, Rect, Circle, Arc } from 'react-konva';

interface FieldProps {
  onPositionClick: (x: number, y: number) => void;
  width: number;
  height: number;
}

const Field: React.FC<FieldProps> = ({ onPositionClick, width, height }) => {
  const fieldRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (fieldRef.current) {
      // Animación inicial del campo
      gsap.from(fieldRef.current.children, {
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power2.inOut"
      });
    }
  }, []);

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = fieldRef.current?.getBoundingClientRect();
    if (rect) {
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      onPositionClick(x, y);
    }
  };

  // Colores del campo
  const FIELD_COLOR = '#2E7D32';
  const LINE_COLOR = '#FFFFFF';
  const LINE_WIDTH = 2;

  // Dimensiones relativas del campo
  const fieldWidth = width * 0.9;
  const fieldHeight = (fieldWidth * 2) / 3; // Proporción FIFA estándar
  const startX = (width - fieldWidth) / 2;
  const startY = (height - fieldHeight) / 2;

  // Áreas
  const penaltyAreaWidth = fieldWidth * 0.16;
  const penaltyAreaHeight = fieldHeight * 0.44;
  const goalAreaWidth = fieldWidth * 0.06;
  const goalAreaHeight = fieldHeight * 0.2;

  // Círculo central y punto central
  const centerCircleRadius = fieldHeight * 0.1;
  const centerPointRadius = 3;

  // Puntos de penalti
  const penaltySpotDistance = fieldWidth * 0.11;
  const penaltySpotRadius = 2;

  // Arcos de esquina
  const cornerRadius = fieldHeight * 0.02;

  return (
    <svg
      ref={fieldRef}
      className="w-full h-full"
      viewBox={`0 0 ${width} ${height}`}
      onClick={handleClick}
    >
      {/* Campo principal */}
      <Rect
        x={startX}
        y={startY}
        width={fieldWidth}
        height={fieldHeight}
        fill={FIELD_COLOR}
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
      />

      {/* Línea central */}
      <Line
        points={[
          width / 2,
          startY,
          width / 2,
          startY + fieldHeight
        ]}
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
      />

      {/* Círculo central */}
      <Circle
        x={width / 2}
        y={startY + fieldHeight / 2}
        radius={centerCircleRadius}
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
      />

      {/* Punto central */}
      <Circle
        x={width / 2}
        y={startY + fieldHeight / 2}
        radius={centerPointRadius}
        fill={LINE_COLOR}
      />

      {/* Área de penalti izquierda */}
      <Rect
        x={startX}
        y={startY + (fieldHeight - penaltyAreaHeight) / 2}
        width={penaltyAreaWidth}
        height={penaltyAreaHeight}
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
      />

      {/* Área pequeña izquierda */}
      <Rect
        x={startX}
        y={startY + (fieldHeight - goalAreaHeight) / 2}
        width={goalAreaWidth}
        height={goalAreaHeight}
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
      />

      {/* Punto de penalti izquierdo */}
      <Circle
        x={startX + penaltySpotDistance}
        y={startY + fieldHeight / 2}
        radius={penaltySpotRadius}
        fill={LINE_COLOR}
      />

      {/* Área de penalti derecha */}
      <Rect
        x={startX + fieldWidth - penaltyAreaWidth}
        y={startY + (fieldHeight - penaltyAreaHeight) / 2}
        width={penaltyAreaWidth}
        height={penaltyAreaHeight}
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
      />

      {/* Área pequeña derecha */}
      <Rect
        x={startX + fieldWidth - goalAreaWidth}
        y={startY + (fieldHeight - goalAreaHeight) / 2}
        width={goalAreaWidth}
        height={goalAreaHeight}
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
      />

      {/* Punto de penalti derecho */}
      <Circle
        x={startX + fieldWidth - penaltySpotDistance}
        y={startY + fieldHeight / 2}
        radius={penaltySpotRadius}
        fill={LINE_COLOR}
      />

      {/* Arcos de esquina */}
      {[
        [startX, startY],
        [startX + fieldWidth, startY],
        [startX, startY + fieldHeight],
        [startX + fieldWidth, startY + fieldHeight]
      ].map(([x, y], i) => (
        <Arc
          key={i}
          x={x}
          y={y}
          angle={90}
          rotation={i * 90}
          innerRadius={cornerRadius}
          outerRadius={cornerRadius}
          stroke={LINE_COLOR}
          strokeWidth={LINE_WIDTH}
        />
      ))}

      {/* Semicírculo área penal izquierda */}
      <Arc
        x={startX + penaltySpotDistance}
        y={startY + fieldHeight / 2}
        angle={120}
        rotation={-60}
        innerRadius={centerCircleRadius}
        outerRadius={centerCircleRadius}
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
      />

      {/* Semicírculo área penal derecha */}
      <Arc
        x={startX + fieldWidth - penaltySpotDistance}
        y={startY + fieldHeight / 2}
        angle={120}
        rotation={120}
        innerRadius={centerCircleRadius}
        outerRadius={centerCircleRadius}
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
      />
    </svg>
  );
};

export default Field;
