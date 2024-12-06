import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { Formation, PlayerPosition } from '../../types/collaboration';
import { useSocket } from '../../contexts/SocketContext';
import PlayerCard from './PlayerCard';

interface EnhancedTacticalBoardProps {
  roomId: string;
  formation: Formation;
  editable: boolean;
}

const EnhancedTacticalBoard: React.FC<EnhancedTacticalBoardProps> = ({
  roomId,
  formation,
  editable
}) => {
  const { socket } = useSocket();
  const boardRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showPlayerCard, setShowPlayerCard] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  // Sonidos
  const sounds = {
    click: new Audio('/sounds/click.mp3'),
    hover: new Audio('/sounds/hover.mp3'),
    select: new Audio('/sounds/select.mp3'),
    move: new Audio('/sounds/move.mp3')
  };

  // Reproducir sonido
  const playSound = (soundName: keyof typeof sounds) => {
    if (audioEnabled) {
      sounds[soundName].currentTime = 0;
      sounds[soundName].play().catch(() => {});
    }
  };

  // Control de zoom con rueda del mouse
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    setZoom(prev => Math.min(Math.max(0.5, prev + delta), 2));
    playSound('click');
  };

  // Rotación con teclas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editable) return;

      switch (e.key) {
        case 'r':
          setRotation(prev => (prev + 90) % 360);
          playSound('move');
          break;
        case 'R':
          setRotation(prev => (prev - 90) % 360);
          playSound('move');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editable]);

  // Posición del mouse para tarjeta de jugador
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  // Renderizar jugadores
  const renderPlayers = () => {
    return formation.players.map((player) => (
      <motion.div
        key={player.id}
        className={`absolute ${editable ? 'cursor-move' : 'cursor-pointer'}`}
        style={{
          left: `${player.x}%`,
          top: `${player.y}%`,
          transform: `translate(-50%, -50%) scale(${1/zoom})`
        }}
        whileHover={{ scale: 1.1 / zoom }}
        whileTap={{ scale: 0.95 / zoom }}
        onHoverStart={() => {
          playSound('hover');
          setShowPlayerCard(player.id);
        }}
        onHoverEnd={() => setShowPlayerCard(null)}
        onClick={() => {
          playSound('select');
          setSelectedPlayer(player.id);
        }}
        drag={editable}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          if (!boardRef.current) return;
          
          const rect = boardRef.current.getBoundingClientRect();
          const x = ((info.point.x - rect.left) / rect.width) * 100;
          const y = ((info.point.y - rect.top) / rect.height) * 100;
          
          socket?.emit('player:move', {
            roomId,
            playerId: player.id,
            position: { x, y }
          });
          
          playSound('move');
        }}
      >
        {/* Número y posición del jugador */}
        <div className="relative">
          <div className="w-12 h-12 bg-[#1A1A1A] rounded-full border-2 border-[#DAA520] shadow-lg
            flex items-center justify-center">
            <span className="text-white font-bold">{player.number}</span>
          </div>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2
            bg-[#1A1A1A] px-2 py-0.5 rounded-full text-xs text-white whitespace-nowrap">
            {player.position}
          </div>
        </div>

        {/* Tarjeta de jugador en hover */}
        <AnimatePresence>
          {showPlayerCard === player.id && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute z-50"
              style={{
                left: mouseX.get(),
                top: mouseY.get(),
                pointerEvents: 'none'
              }}
            >
              <PlayerCard
                player={{
                  ...player,
                  name: 'John Doe', // Ejemplo
                  stats: {
                    pace: 85,
                    shooting: 78,
                    passing: 82,
                    dribbling: 80,
                    defending: 75,
                    physical: 79
                  },
                  rating: 82
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    ));
  };

  return (
    <div className="relative w-full h-full">
      {/* Controles de zoom y rotación */}
      <div className="absolute top-4 right-4 space-y-2 z-10">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setZoom(prev => Math.min(prev + 0.1, 2));
            playSound('click');
          }}
          className="w-10 h-10 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white"
        >
          <span className="material-icons">add</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setZoom(prev => Math.max(prev - 0.1, 0.5));
            playSound('click');
          }}
          className="w-10 h-10 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white"
        >
          <span className="material-icons">remove</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setRotation(prev => (prev + 90) % 360);
            playSound('move');
          }}
          className="w-10 h-10 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white"
        >
          <span className="material-icons">rotate_right</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAudioEnabled(prev => !prev)}
          className="w-10 h-10 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white"
        >
          <span className="material-icons">
            {audioEnabled ? 'volume_up' : 'volume_off'}
          </span>
        </motion.button>
      </div>

      {/* Campo de fútbol con zoom y rotación */}
      <motion.div
        ref={boardRef}
        className="relative w-full aspect-[3/2] bg-[#0A3B0A] rounded-lg overflow-hidden"
        style={{
          scale: zoom,
          rotate: rotation,
          transformOrigin: 'center center'
        }}
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
      >
        {/* Líneas del campo */}
        <div className="absolute inset-0">
          {/* Línea central */}
          <div className="absolute top-0 left-1/2 h-full w-0.5 bg-white opacity-50" />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white opacity-50 rounded-full
            transform -translate-x-1/2 -translate-y-1/2" />
          
          {/* Áreas */}
          <div className="absolute top-1/2 left-0 w-24 h-48 border-2 border-white opacity-50
            transform -translate-y-1/2" />
          <div className="absolute top-1/2 right-0 w-24 h-48 border-2 border-white opacity-50
            transform -translate-y-1/2" />
          
          {/* Porterías */}
          <div className="absolute top-1/2 left-0 w-8 h-24 border-2 border-white opacity-50
            transform -translate-y-1/2" />
          <div className="absolute top-1/2 right-0 w-8 h-24 border-2 border-white opacity-50
            transform -translate-y-1/2" />
        </div>

        {/* Jugadores */}
        {renderPlayers()}
      </motion.div>
    </div>
  );
};

export default EnhancedTacticalBoard;
