import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Formation, PlayerPosition, TacticalInstruction } from '../../types/collaboration';
import { useSocket } from '../../contexts/SocketContext';

interface TacticalBoardProps {
  roomId: string;
  formation: Formation;
  editable: boolean;
}

const TacticalBoard: React.FC<TacticalBoardProps> = ({ roomId, formation, editable }) => {
  const { socket } = useSocket();
  const boardRef = useRef<HTMLDivElement>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [drawingMode, setDrawingMode] = useState<'none' | 'movement' | 'pressing' | 'marking'>('none');
  const [drawingPath, setDrawingPath] = useState<{ x: number; y: number }[]>([]);

  // Convertir coordenadas del mouse a posición relativa en el tablero
  const getRelativePosition = (event: React.MouseEvent): { x: number; y: number } => {
    if (!boardRef.current) return { x: 0, y: 0 };

    const rect = boardRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  // Manejar movimiento de jugadores
  const handlePlayerDrag = (playerId: string, event: React.MouseEvent) => {
    if (!editable) return;

    const position = getRelativePosition(event);
    socket?.emit('player:move', {
      roomId,
      playerId,
      position
    });
  };

  // Manejar dibujo de instrucciones tácticas
  const handleBoardMouseDown = (event: React.MouseEvent) => {
    if (!editable || drawingMode === 'none' || !selectedPlayer) return;

    const position = getRelativePosition(event);
    setDrawingPath([position]);
  };

  const handleBoardMouseMove = (event: React.MouseEvent) => {
    if (!editable || drawingMode === 'none' || drawingPath.length === 0) return;

    const position = getRelativePosition(event);
    setDrawingPath(prev => [...prev, position]);
  };

  const handleBoardMouseUp = () => {
    if (!editable || drawingMode === 'none' || !selectedPlayer || drawingPath.length === 0) return;

    const instruction: TacticalInstruction = {
      id: `${Date.now()}`,
      type: drawingMode,
      description: `${drawingMode} instruction for player ${selectedPlayer}`,
      players: [selectedPlayer],
      visualData: {
        path: drawingPath
      }
    };

    socket?.emit('tactics:update', {
      roomId,
      instruction
    });

    setDrawingPath([]);
  };

  // Renderizar jugadores
  const renderPlayers = () => {
    return formation.players.map((player) => (
      <motion.div
        key={player.id}
        className={`absolute w-12 h-12 flex items-center justify-center 
          ${editable ? 'cursor-move' : 'cursor-default'}
          ${selectedPlayer === player.id ? 'ring-2 ring-[#DAA520]' : ''}`}
        style={{
          left: `${player.x}%`,
          top: `${player.y}%`,
          transform: 'translate(-50%, -50%)'
        }}
        drag={editable}
        dragMomentum={false}
        onDragEnd={(_, info) => handlePlayerDrag(player.id, info as any)}
        onClick={() => setSelectedPlayer(player.id)}
        whileHover={editable ? { scale: 1.1 } : {}}
        whileTap={editable ? { scale: 0.95 } : {}}
      >
        <div className="bg-[#1A1A1A] rounded-full w-10 h-10 flex items-center justify-center
          border-2 border-[#DAA520] shadow-lg">
          <span className="text-white font-bold">{player.number}</span>
        </div>
        <div className="absolute -bottom-6 text-xs text-white bg-[#1A1A1A] px-2 py-0.5 rounded-full">
          {player.position}
        </div>
      </motion.div>
    ));
  };

  // Renderizar instrucciones tácticas
  const renderTacticalInstructions = () => {
    return formation.tactics.map((instruction) => (
      <svg
        key={instruction.id}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      >
        {instruction.visualData?.path && (
          <path
            d={`M ${instruction.visualData.path
              .map((p, i) => `${i === 0 ? '' : 'L '}${p.x} ${p.y}`)
              .join(' ')}`}
            stroke={
              instruction.type === 'movement' ? '#DAA520' :
              instruction.type === 'pressing' ? '#FF4444' :
              '#44FF44'
            }
            strokeWidth="2"
            fill="none"
            strokeDasharray={instruction.type === 'movement' ? '0' : '5,5'}
          />
        )}
      </svg>
    ));
  };

  return (
    <div className="relative w-full aspect-[3/2] bg-[#0A3B0A] rounded-lg overflow-hidden">
      {/* Campo de fútbol */}
      <div className="absolute inset-0 border-2 border-white opacity-50">
        {/* Línea central */}
        <div className="absolute top-0 left-1/2 h-full w-0.5 bg-white opacity-50" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white opacity-50 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        
        {/* Áreas */}
        <div className="absolute top-1/2 left-0 w-24 h-48 border-2 border-white opacity-50 transform -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-24 h-48 border-2 border-white opacity-50 transform -translate-y-1/2" />
      </div>

      {/* Tablero táctico */}
      <div
        ref={boardRef}
        className="absolute inset-0"
        onMouseDown={handleBoardMouseDown}
        onMouseMove={handleBoardMouseMove}
        onMouseUp={handleBoardMouseUp}
        onMouseLeave={handleBoardMouseUp}
      >
        {renderTacticalInstructions()}
        {renderPlayers()}
        
        {/* Path de dibujo actual */}
        {drawingPath.length > 0 && (
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <path
              d={`M ${drawingPath.map((p, i) => `${i === 0 ? '' : 'L '}${p.x} ${p.y}`).join(' ')}`}
              stroke="#DAA520"
              strokeWidth="2"
              fill="none"
              strokeDasharray={drawingMode === 'movement' ? '0' : '5,5'}
            />
          </svg>
        )}
      </div>

      {/* Controles de dibujo */}
      {editable && (
        <div className="absolute top-4 right-4 space-y-2">
          <motion.button
            className={`w-10 h-10 rounded-full flex items-center justify-center
              ${drawingMode === 'movement' ? 'bg-[#DAA520]' : 'bg-[#1A1A1A]'}`}
            onClick={() => setDrawingMode(drawingMode === 'movement' ? 'none' : 'movement')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="material-icons text-white">
              arrow_forward
            </span>
          </motion.button>
          <motion.button
            className={`w-10 h-10 rounded-full flex items-center justify-center
              ${drawingMode === 'pressing' ? 'bg-[#FF4444]' : 'bg-[#1A1A1A]'}`}
            onClick={() => setDrawingMode(drawingMode === 'pressing' ? 'none' : 'pressing')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="material-icons text-white">
              radio_button_checked
            </span>
          </motion.button>
          <motion.button
            className={`w-10 h-10 rounded-full flex items-center justify-center
              ${drawingMode === 'marking' ? 'bg-[#44FF44]' : 'bg-[#1A1A1A]'}`}
            onClick={() => setDrawingMode(drawingMode === 'marking' ? 'none' : 'marking')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="material-icons text-white">
              person
            </span>
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default TacticalBoard;
