import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Line, Group, Arc } from 'react-konva';
import { Box, Paper, IconButton, Tooltip, SpeedDial, SpeedDialAction } from '@mui/material';
import {
  SportsSoccer,
  Person,
  Create,
  Delete,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Rotate90DegreesCcw,
  GridOn,
  Save,
  PlayArrow,
} from '@mui/icons-material';
import PlayerCard from './PlayerCard';
import DrawingTools, { DrawingElement } from './DrawingTools';
import ToolbarControls from './ToolbarControls';
import AnimationControls from './AnimationControls';

const FIELD_COLOR = '#2F7B2F';
const LINE_COLOR = '#FFFFFF';
const TOOLBAR_WIDTH = 60;

interface FieldDimensions {
  width: number;
  height: number;
  scale: number;
}

interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  rating: number;
  x: number;
  y: number;
}

interface Formation {
  name: string;
  positions: Array<{
    x: number;
    y: number;
    position: string;
  }>;
}

const FORMATIONS: { [key: string]: Formation } = {
  '4-4-2': {
    name: '4-4-2',
    positions: [
      { x: 0.1, y: 0.5, position: 'GK' },
      // Defenders
      { x: 0.25, y: 0.2, position: 'LB' },
      { x: 0.25, y: 0.4, position: 'CB' },
      { x: 0.25, y: 0.6, position: 'CB' },
      { x: 0.25, y: 0.8, position: 'RB' },
      // Midfielders
      { x: 0.5, y: 0.2, position: 'LM' },
      { x: 0.5, y: 0.4, position: 'CM' },
      { x: 0.5, y: 0.6, position: 'CM' },
      { x: 0.5, y: 0.8, position: 'RM' },
      // Forwards
      { x: 0.75, y: 0.35, position: 'ST' },
      { x: 0.75, y: 0.65, position: 'ST' },
    ]
  },
  '4-3-3': {
    name: '4-3-3',
    positions: [
      { x: 0.1, y: 0.5, position: 'GK' },
      // Defenders
      { x: 0.25, y: 0.2, position: 'LB' },
      { x: 0.25, y: 0.4, position: 'CB' },
      { x: 0.25, y: 0.6, position: 'CB' },
      { x: 0.25, y: 0.8, position: 'RB' },
      // Midfielders
      { x: 0.5, y: 0.3, position: 'CM' },
      { x: 0.45, y: 0.5, position: 'CDM' },
      { x: 0.5, y: 0.7, position: 'CM' },
      // Forwards
      { x: 0.75, y: 0.2, position: 'LW' },
      { x: 0.8, y: 0.5, position: 'ST' },
      { x: 0.75, y: 0.8, position: 'RW' },
    ]
  },
  '3-5-2': {
    name: '3-5-2',
    positions: [
      { x: 0.1, y: 0.5, position: 'GK' },
      // Defenders
      { x: 0.25, y: 0.3, position: 'CB' },
      { x: 0.25, y: 0.5, position: 'CB' },
      { x: 0.25, y: 0.7, position: 'CB' },
      // Midfielders
      { x: 0.5, y: 0.2, position: 'LM' },
      { x: 0.45, y: 0.35, position: 'CM' },
      { x: 0.4, y: 0.5, position: 'CDM' },
      { x: 0.45, y: 0.65, position: 'CM' },
      { x: 0.5, y: 0.8, position: 'RM' },
      // Forwards
      { x: 0.75, y: 0.35, position: 'ST' },
      { x: 0.75, y: 0.65, position: 'ST' },
    ]
  }
};

const TacticalBoard: React.FC = () => {
  const stageRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState<FieldDimensions>({ 
    width: window.innerWidth - TOOLBAR_WIDTH,
    height: window.innerHeight,
    scale: 1
  });
  const [tool, setTool] = useState<'player' | 'ball' | 'draw' | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [currentFormation, setCurrentFormation] = useState<string>('4-4-2');
  const [players, setPlayers] = useState<Player[]>([]);
  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024 && window.innerWidth > 768);
  const [drawingElements, setDrawingElements] = useState<DrawingElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('#ff0000');
  const [selectedLineStyle, setSelectedLineStyle] = useState<'solid' | 'dashed'>('solid');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<number[]>([]);
  const [history, setHistory] = useState<DrawingElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [recordedFrames, setRecordedFrames] = useState<Array<{
    timestamp: number;
    players: Player[];
    drawings: DrawingElement[];
  }>>([]);
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth - TOOLBAR_WIDTH;
      const height = window.innerHeight;
      const isMobileView = window.innerWidth <= 768;
      const isTabletView = window.innerWidth <= 1024 && window.innerWidth > 768;
      
      setIsMobile(isMobileView);
      setIsTablet(isTabletView);

      // Para móvil y tablet, hacemos el campo vertical
      if (isMobileView || isTabletView) {
        setDimensions({
          width: Math.min(width, height * 0.7),  // El campo ocupa 70% del alto
          height: height * 0.9,  // Dejamos algo de espacio para controles
          scale: 1
        });
      } else {
        // Para PC, campo horizontal
        setDimensions({
          width: width * 0.9,  // Dejamos espacio para controles
          height: height * 0.7,  // El campo ocupa 70% del alto
          scale: 1
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getFormationPositions = () => {
    const formation = FORMATIONS[currentFormation];
    if (!formation) return [];

    return formation.positions.map((pos, index) => {
      let adjustedX = pos.x;
      let adjustedY = pos.y;

      // Invertir las coordenadas para móvil y tablet
      if (isMobile || isTablet) {
        [adjustedX, adjustedY] = [pos.y, pos.x];
      }

      return {
        id: `player-${index + 1}`,
        name: `Player ${index + 1}`,
        number: index + 1,
        position: pos.position,
        rating: 80 + Math.floor(Math.random() * 15),
        x: adjustedX * dimensions.width,
        y: adjustedY * dimensions.height,
      };
    });
  };

  const applyFormation = (formationName: string) => {
    setCurrentFormation(formationName);
    setPlayers(getFormationPositions());
  };

  const handlePlayerDragStart = (playerId: string) => {
    setDraggedPlayerId(playerId);
    setSelectedPlayerId(playerId);
  };

  const handlePlayerDragEnd = () => {
    setDraggedPlayerId(null);
  };

  const handlePlayerDragMove = (playerId: string, e: any) => {
    const { x, y } = e.target.position();
    setPlayers(players.map(player => 
      player.id === playerId ? { ...player, x, y } : player
    ));
  };

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayerId(selectedPlayerId === playerId ? null : playerId);
  };

  const handleMouseDown = (e: any) => {
    if (!selectedTool || selectedTool === 'select') return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    setIsDrawing(true);
    setCurrentPoints([point.x, point.y]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    setCurrentPoints([...currentPoints, point.x, point.y]);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;

    const newElement: DrawingElement = {
      id: Date.now().toString(),
      type: selectedTool as any,
      points: currentPoints,
      color: selectedColor,
      isDashed: selectedLineStyle === 'dashed',
      position: selectedTool === 'cone' || selectedTool === 'circle' 
        ? { x: currentPoints[0], y: currentPoints[1] }
        : undefined,
    };

    const newElements = [...drawingElements, newElement];
    setDrawingElements(newElements);
    setHistory([...history.slice(0, historyIndex + 1), newElements]);
    setHistoryIndex(historyIndex + 1);
    setIsDrawing(false);
    setCurrentPoints([]);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setDrawingElements(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setDrawingElements(history[historyIndex + 1]);
    }
  };

  const handleClear = () => {
    setDrawingElements([]);
    setHistory([[]]);
    setHistoryIndex(0);
  };

  const handleSaveFormation = () => {
    const formation = {
      players,
      drawingElements,
      name: prompt('Nombre de la formación:')
    };
    
    if (formation.name) {
      const savedFormations = JSON.parse(localStorage.getItem('savedFormations') || '[]');
      savedFormations.push(formation);
      localStorage.setItem('savedFormations', JSON.stringify(savedFormations));
    }
  };

  const handleLoadFormation = () => {
    const savedFormations = JSON.parse(localStorage.getItem('savedFormations') || '[]');
    if (savedFormations.length === 0) {
      alert('No hay formaciones guardadas');
      return;
    }

    // Aquí podrías mostrar un diálogo para seleccionar la formación
    const formation = savedFormations[savedFormations.length - 1];
    setPlayers(formation.players);
    setDrawingElements(formation.drawingElements);
  };

  const recordFrame = useCallback(() => {
    if (isRecording) {
      setRecordedFrames(prev => [
        ...prev,
        {
          timestamp: Date.now(),
          players: players,
          drawings: drawingElements
        }
      ]);
    }
  }, [isRecording, players, drawingElements]);

  useEffect(() => {
    let animationFrame: number;
    if (isPlaying && recordedFrames.length > 0) {
      const animate = () => {
        setCurrentFrame(prev => {
          if (prev >= recordedFrames.length - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
        animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    }
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isPlaying, recordedFrames.length]);

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(recordFrame, 1000 / (30 * animationSpeed));
      return () => clearInterval(interval);
    }
  }, [isRecording, recordFrame, animationSpeed]);

  const handleRecord = () => {
    if (!isRecording) {
      setRecordedFrames([]);
      setCurrentFrame(0);
    }
    setIsRecording(!isRecording);
    setIsPlaying(false);
  };

  const handlePlay = () => {
    if (recordedFrames.length > 0) {
      setIsPlaying(true);
      setIsRecording(false);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentFrame(0);
  };

  const handleSaveAnimation = () => {
    const animationData = {
      frames: recordedFrames,
      speed: animationSpeed
    };
    const blob = new Blob([JSON.stringify(animationData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tactical-animation.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const Field = () => (
    <Group>
      {/* Campo principal con gradiente */}
      <Rect
        width={dimensions.width}
        height={dimensions.height}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 0, y: dimensions.height }}
        fillLinearGradientColorStops={[
          0, '#2F7B2F',
          0.5, '#3C8C3C',
          1, '#2F7B2F'
        ]}
        stroke={LINE_COLOR}
        strokeWidth={2}
      />

      {/* Líneas de grid */}
      {showGrid && Array.from({ length: 5 }).map((_, i) => (
        <Line
          key={`horizontal-${i}`}
          points={[
            0,
            (dimensions.height / 6) * (i + 1),
            dimensions.width,
            (dimensions.height / 6) * (i + 1)
          ]}
          stroke={'rgba(255,255,255,0.1)'}
          strokeWidth={1}
        />
      ))}

      {/* Línea central */}
      <Line
        points={[
          dimensions.width / 2,
          0,
          dimensions.width / 2,
          dimensions.height,
        ]}
        stroke={LINE_COLOR}
        strokeWidth={2}
      />

      {/* Círculo central */}
      <Circle
        x={dimensions.width / 2}
        y={dimensions.height / 2}
        radius={dimensions.height * 0.1}
        stroke={LINE_COLOR}
        strokeWidth={2}
      />

      {/* Punto central */}
      <Circle
        x={dimensions.width / 2}
        y={dimensions.height / 2}
        radius={4}
        fill={LINE_COLOR}
      />

      {/* Áreas de penalti */}
      {/* Área grande izquierda */}
      <Rect
        x={0}
        y={dimensions.height * 0.15}
        width={dimensions.width * 0.16}
        height={dimensions.height * 0.7}
        stroke={LINE_COLOR}
        strokeWidth={2}
      />
      {/* Área pequeña izquierda */}
      <Rect
        x={0}
        y={dimensions.height * 0.35}
        width={dimensions.width * 0.06}
        height={dimensions.height * 0.3}
        stroke={LINE_COLOR}
        strokeWidth={2}
      />
      {/* Semicírculo izquierdo */}
      <Arc
        x={dimensions.width * 0.16}
        y={dimensions.height * 0.5}
        angle={90}
        rotation={-45}
        innerRadius={dimensions.height * 0.2}
        outerRadius={dimensions.height * 0.2}
        stroke={LINE_COLOR}
        strokeWidth={2}
      />

      {/* Área grande derecha */}
      <Rect
        x={dimensions.width * 0.84}
        y={dimensions.height * 0.15}
        width={dimensions.width * 0.16}
        height={dimensions.height * 0.7}
        stroke={LINE_COLOR}
        strokeWidth={2}
      />
      {/* Área pequeña derecha */}
      <Rect
        x={dimensions.width * 0.94}
        y={dimensions.height * 0.35}
        width={dimensions.width * 0.06}
        height={dimensions.height * 0.3}
        stroke={LINE_COLOR}
        strokeWidth={2}
      />
      {/* Semicírculo derecho */}
      <Arc
        x={dimensions.width * 0.84}
        y={dimensions.height * 0.5}
        angle={90}
        rotation={135}
        innerRadius={dimensions.height * 0.2}
        outerRadius={dimensions.height * 0.2}
        stroke={LINE_COLOR}
        strokeWidth={2}
      />

      {/* Puntos de penalti */}
      <Circle
        x={dimensions.width * 0.11}
        y={dimensions.height * 0.5}
        radius={3}
        fill={LINE_COLOR}
      />
      <Circle
        x={dimensions.width * 0.89}
        y={dimensions.height * 0.5}
        radius={3}
        fill={LINE_COLOR}
      />

      {/* Esquinas */}
      {[0, 1].map(x => [0, 1].map(y => (
        <Arc
          key={`corner-${x}-${y}`}
          x={x * dimensions.width}
          y={y * dimensions.height}
          angle={90}
          rotation={x ? (y ? 180 : 90) : (y ? 270 : 0)}
          innerRadius={10}
          outerRadius={10}
          stroke={LINE_COLOR}
          strokeWidth={2}
        />
      )))}

      {/* Players */}
      {players.map(player => (
        <PlayerCard
          key={player.id}
          x={player.x}
          y={player.y}
          player={player}
          isDragging={draggedPlayerId === player.id}
          selected={selectedPlayerId === player.id}
          onSelect={() => handlePlayerSelect(player.id)}
          onDragStart={() => handlePlayerDragStart(player.id)}
          onDragEnd={handlePlayerDragEnd}
          onDragMove={(e) => handlePlayerDragMove(player.id, e)}
        />
      ))}
    </Group>
  );

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Stage 
        width={dimensions.width} 
        height={dimensions.height}
        style={{
          margin: 'auto',
          cursor: draggedPlayerId ? 'grabbing' : 'default'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <Layer listening={true} perfectDrawEnabled={false}>
          <Field />
          <DrawingTools elements={drawingElements} />
          {isDrawing && (
            <DrawingTools
              elements={[
                {
                  id: 'current',
                  type: selectedTool as any,
                  points: currentPoints,
                  color: selectedColor,
                  isDashed: selectedLineStyle === 'dashed',
                  position: selectedTool === 'cone' || selectedTool === 'circle'
                    ? { x: currentPoints[0], y: currentPoints[1] }
                    : undefined,
                },
              ]}
            />
          )}
          {players.map(player => (
            <PlayerCard
              key={player.id}
              x={player.x}
              y={player.y}
              player={player}
              isDragging={draggedPlayerId === player.id}
              selected={selectedPlayerId === player.id}
              onSelect={() => handlePlayerSelect(player.id)}
              onDragStart={() => handlePlayerDragStart(player.id)}
              onDragEnd={handlePlayerDragEnd}
              onDragMove={(e) => handlePlayerDragMove(player.id, e)}
            />
          ))}
        </Layer>
      </Stage>

      <ToolbarControls
        onFormationSelect={applyFormation}
        onToolSelect={setSelectedTool}
        onColorSelect={setSelectedColor}
        onLineStyleSelect={setSelectedLineStyle}
        onSaveFormation={handleSaveFormation}
        onLoadFormation={handleLoadFormation}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        selectedTool={selectedTool}
        selectedColor={selectedColor}
        selectedLineStyle={selectedLineStyle}
      />

      <AnimationControls
        isRecording={isRecording}
        isPlaying={isPlaying}
        animationSpeed={animationSpeed}
        onRecord={handleRecord}
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={handleStop}
        onSpeedChange={setAnimationSpeed}
        onSaveAnimation={handleSaveAnimation}
      />
    </Box>
  );
};

export default TacticalBoard;
