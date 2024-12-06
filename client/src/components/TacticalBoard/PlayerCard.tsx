import React from 'react';
import { Group, Rect, Text, Image } from 'react-konva';
import { motion } from 'framer-motion';

interface PlayerCardProps {
  x: number;
  y: number;
  player: {
    name: string;
    number: number;
    position: string;
    rating: number;
    image?: string;
  };
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragMove: (e: any) => void;
  selected: boolean;
  onSelect: () => void;
}

const CARD_WIDTH = 60;
const CARD_HEIGHT = 85;

const PlayerCard: React.FC<PlayerCardProps> = ({
  x,
  y,
  player,
  isDragging,
  onDragStart,
  onDragEnd,
  onDragMove,
  selected,
  onSelect,
}) => {
  const cardRef = React.useRef<any>(null);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    if (cardRef.current) {
      // Configurar la capa para movimiento más fluido
      cardRef.current.cache();
      cardRef.current.getLayer().batchDraw();
    }
  }, []);

  // Colores según la calificación del jugador
  const getCardColor = (rating: number) => {
    if (rating >= 90) return '#FFDA4F'; // Oro más realista
    if (rating >= 80) return '#E7E7E7'; // Plata más realista
    return '#CD7F32'; // Bronce
  };

  const getCardGradient = (rating: number) => {
    const baseColor = getCardColor(rating);
    return {
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: CARD_WIDTH, y: CARD_HEIGHT },
      fillLinearGradientColorStops: [
        0, baseColor,
        0.5, '#FFFFFF',
        1, baseColor
      ]
    };
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (cardRef.current) {
      cardRef.current.moveToTop();
      cardRef.current.getLayer().batchDraw();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <Group
      ref={cardRef}
      x={x}
      y={y}
      width={CARD_WIDTH}
      height={CARD_HEIGHT}
      draggable
      onDragStart={(e) => {
        // Prevenir el comportamiento predeterminado del navegador
        e.evt.preventDefault();
        // Mover la tarjeta al frente
        cardRef.current?.moveToTop();
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onDragMove={onDragMove}
      opacity={1}
      onClick={onSelect}
      onTap={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      scale={{
        x: isDragging ? 1.05 : isHovered || selected ? 1.02 : 1,
        y: isDragging ? 1.05 : isHovered || selected ? 1.02 : 1
      }}
      shadowColor="black"
      shadowBlur={isDragging ? 15 : isHovered || selected ? 10 : 5}
      shadowOpacity={0.3}
      shadowOffsetX={2}
      shadowOffsetY={2}
      dragBoundFunc={(pos) => {
        if (!cardRef.current?.getStage()) return pos;
        
        // Añadir un pequeño margen para que la tarjeta no se pegue a los bordes
        const margin = 5;
        const x = Math.max(margin, Math.min(pos.x, cardRef.current.getStage().width() - CARD_WIDTH - margin));
        const y = Math.max(margin, Math.min(pos.y, cardRef.current.getStage().height() - CARD_HEIGHT - margin));
        return { x, y };
      }}
    >
      {/* Fondo de la tarjeta con gradiente */}
      <Rect
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        {...getCardGradient(player.rating)}
        cornerRadius={5}
        stroke="#000"
        strokeWidth={1}
      />

      {/* Marco interior */}
      <Rect
        x={2}
        y={2}
        width={CARD_WIDTH - 4}
        height={CARD_HEIGHT - 4}
        stroke="#FFFFFF"
        strokeWidth={1}
        cornerRadius={4}
      />

      {/* Número del jugador con fondo */}
      <Rect
        x={5}
        y={5}
        width={20}
        height={20}
        fill="#FFFFFF"
        cornerRadius={3}
      />
      <Text
        text={player.number.toString()}
        fontSize={14}
        fontStyle="bold"
        fill="#000"
        x={5}
        y={7}
        width={20}
        align="center"
      />

      {/* Posición del jugador con fondo */}
      <Rect
        x={CARD_WIDTH - 25}
        y={5}
        width={20}
        height={20}
        fill="#FFFFFF"
        cornerRadius={3}
      />
      <Text
        text={player.position}
        fontSize={12}
        fontStyle="bold"
        fill="#000"
        x={CARD_WIDTH - 25}
        y={7}
        width={20}
        align="center"
      />

      {/* Rating con fondo */}
      <Rect
        x={CARD_WIDTH/2 - 12}
        y={CARD_HEIGHT - 25}
        width={24}
        height={18}
        fill="#FFFFFF"
        cornerRadius={3}
      />
      <Text
        text={player.rating.toString()}
        fontSize={13}
        fontStyle="bold"
        fill="#000"
        x={CARD_WIDTH/2 - 12}
        y={CARD_HEIGHT - 23}
        width={24}
        align="center"
      />

      {/* Nombre del jugador */}
      <Text
        text={player.name}
        fontSize={9}
        fontStyle="bold"
        fill="#000"
        width={CARD_WIDTH}
        align="center"
        y={CARD_HEIGHT/2}
      />
    </Group>
  );
};

export default PlayerCard;
