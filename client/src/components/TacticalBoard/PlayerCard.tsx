import React, { useEffect, useRef, useState } from 'react';
import { Group, Rect, Text, Circle } from 'react-konva';
import Konva from 'konva';

interface PlayerCardProps {
  id: string;
  x: number;
  y: number;
  number: number;
  isDragging?: boolean;
  isSelected?: boolean;
  onDragStart?: () => void;
  onDragEnd?: (event: any) => void;
  onClick?: () => void;
  rating?: number;
  position: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  id,
  x,
  y,
  number,
  isDragging = false,
  isSelected = false,
  onDragStart,
  onDragEnd,
  onClick,
  rating = 80,
  position,
}) => {
  const groupRef = useRef<Konva.Group>(null);
  const cardWidth = 60;
  const cardHeight = 80;
  const cornerRadius = 5;
  
  // Colores basados en el rating (estilo FIFA)
  const getCardColor = (rating: number) => {
    if (rating >= 90) return '#f1bf0f'; // Oro especial
    if (rating >= 85) return '#f8df24'; // Oro
    if (rating >= 80) return '#c0c0c0'; // Plata
    return '#cd7f32'; // Bronce
  };

  const cardColor = getCardColor(rating);
  const shadowColor = isDragging ? 'black' : 'rgba(0,0,0,0.5)';
  const shadowBlur = isDragging ? 15 : 5;

  // Efecto de brillo dinámico
  const [glowOpacity, setGlowOpacity] = React.useState(0);
  
  useEffect(() => {
    if (!isSelected) return;
    
    // Animación de brillo pulsante
    const anim = new Konva.Animation((frame) => {
      if (!frame) return;
      const opacity = Math.abs(Math.sin(frame.time / 1000));
      setGlowOpacity(opacity * 0.4);
    });

    anim.start();
    return () => anim.stop();
  }, [isSelected]);

  // Efecto para animar el movimiento
  useEffect(() => {
    if (!groupRef.current) return;

    // Animación suave al mover
    groupRef.current.to({
      x: x,
      y: y,
      duration: 0.3,
      easing: Konva.Easings.EaseInOut,
    });
  }, [x, y]);

  // Efecto para animar la selección
  useEffect(() => {
    if (!groupRef.current) return;

    groupRef.current.to({
      scaleX: isSelected ? 1.1 : 1,
      scaleY: isSelected ? 1.1 : 1,
      duration: 0.2,
      easing: Konva.Easings.EaseInOut,
    });
  }, [isSelected]);

  return (
    <Group
      ref={groupRef}
      x={x}
      y={y}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onTap={onClick}
    >
      {/* Efecto de brillo */}
      <Rect
        width={cardWidth + 10}
        height={cardHeight + 10}
        cornerRadius={cornerRadius + 2}
        fill="transparent"
        stroke="#fff"
        strokeWidth={2}
        shadowColor="#fff"
        shadowBlur={20}
        shadowOpacity={glowOpacity}
        offsetX={(cardWidth + 10) / 2}
        offsetY={(cardHeight + 10) / 2}
      />

      {/* Sombra y brillo de la tarjeta */}
      <Rect
        width={cardWidth}
        height={cardHeight}
        cornerRadius={cornerRadius}
        fill={cardColor}
        shadowColor={shadowColor}
        shadowBlur={shadowBlur}
        shadowOffset={{ x: 2, y: 2 }}
        shadowOpacity={0.4}
        stroke={isSelected ? '#2196f3' : cardColor}
        strokeWidth={2}
        offsetX={cardWidth / 2}
        offsetY={cardHeight / 2}
      />

      {/* Rating */}
      <Text
        text={rating.toString()}
        fontSize={16}
        fontStyle="bold"
        fill="#000"
        align="center"
        width={cardWidth}
        height={20}
        offsetX={cardWidth / 2}
        offsetY={cardHeight / 2 + 10}
      />

      {/* Posición */}
      <Text
        text={position}
        fontSize={14}
        fill="#000"
        align="center"
        width={cardWidth}
        height={20}
        offsetX={cardWidth / 2}
        offsetY={cardHeight / 2 - 25}
      />

      {/* Número */}
      <Text
        text={number.toString()}
        fontSize={18}
        fontStyle="bold"
        fill="#000"
        align="center"
        width={cardWidth}
        height={20}
        offsetX={cardWidth / 2}
        offsetY={cardHeight / 2 - 5}
      />
    </Group>
  );
};

export default PlayerCard;
