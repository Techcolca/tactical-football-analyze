import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Line, Group, Arc, Arrow } from 'react-konva';
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
      { x: 0.2, y: 0.2, position: 'LB' },
      { x: 0.2, y: 0.4, position: 'CB' },
      { x: 0.2, y: 0.6, position: 'CB' },
      { x: 0.2, y: 0.8, position: 'RB' },
      // Midfielders
      { x: 0.5, y: 0.2, position: 'LM' },
      { x: 0.5, y: 0.4, position: 'CM' },
      { x: 0.5, y: 0.6, position: 'CM' },
      { x: 0.5, y: 0.8, position: 'RM' },
      // Forwards
      { x: 0.8, y: 0.35, position: 'ST' },
      { x: 0.8, y: 0.65, position: 'ST' },
    ]
  },
  '4-3-3': {
    name: '4-3-3',
    positions: [
      { x: 0.1, y: 0.5, position: 'GK' },
      // Defenders
      { x: 0.2, y: 0.2, position: 'LB' },
      { x: 0.2, y: 0.4, position: 'CB' },
      { x: 0.2, y: 0.6, position: 'CB' },
      { x: 0.2, y: 0.8, position: 'RB' },
      // Midfielders
      { x: 0.5, y: 0.3, position: 'CM' },
      { x: 0.5, y: 0.5, position: 'CDM' },
      { x: 0.5, y: 0.7, position: 'CM' },
      // Forwards
      { x: 0.8, y: 0.2, position: 'LW' },
      { x: 0.8, y: 0.5, position: 'ST' },
      { x: 0.8, y: 0.8, position: 'RW' },
    ]
  },
  '3-5-2': {
    name: '3-5-2',
    positions: [
      { x: 0.1, y: 0.5, position: 'GK' },
      // Defenders
      { x: 0.2, y: 0.3, position: 'CB' },
      { x: 0.2, y: 0.5, position: 'CB' },
      { x: 0.2, y: 0.7, position: 'CB' },
      // Midfielders
      { x: 0.5, y: 0.2, position: 'LM' },
      { x: 0.5, y: 0.35, position: 'CM' },
      { x: 0.5, y: 0.5, position: 'CDM' },
      { x: 0.5, y: 0.65, position: 'CM' },
      { x: 0.5, y: 0.8, position: 'RM' },
      // Forwards
      { x: 0.8, y: 0.35, position: 'ST' },
      { x: 0.8, y: 0.65, position: 'ST' },
    ]
  },
  '4-2-3-1': {
    name: '4-2-3-1',
    positions: [
      { x: 0.1, y: 0.5, position: 'GK' },
      // Defenders
      { x: 0.2, y: 0.2, position: 'LB' },
      { x: 0.2, y: 0.4, position: 'CB' },
      { x: 0.2, y: 0.6, position: 'CB' },
      { x: 0.2, y: 0.8, position: 'RB' },
      // Defensive Midfielders
      { x: 0.4, y: 0.4, position: 'CDM' },
      { x: 0.4, y: 0.6, position: 'CDM' },
      // Attacking Midfielders
      { x: 0.6, y: 0.2, position: 'CAM' },
      { x: 0.6, y: 0.5, position: 'CAM' },
      { x: 0.6, y: 0.8, position: 'CAM' },
      // Forward
      { x: 0.8, y: 0.5, position: 'ST' },
    ]
  },
  '4-1-2-1-2': {
    name: '4-1-2-1-2',
    positions: [
      { x: 0.1, y: 0.5, position: 'GK' },
      // Defenders
      { x: 0.2, y: 0.2, position: 'LB' },
      { x: 0.2, y: 0.4, position: 'CB' },
      { x: 0.2, y: 0.6, position: 'CB' },
      { x: 0.2, y: 0.8, position: 'RB' },
      // Defensive Midfielder
      { x: 0.4, y: 0.5, position: 'CDM' },
      // Central Midfielders
      { x: 0.5, y: 0.3, position: 'CM' },
      { x: 0.5, y: 0.7, position: 'CM' },
      // Attacking Midfielder
      { x: 0.6, y: 0.5, position: 'CAM' },
      // Forwards
      { x: 0.8, y: 0.35, position: 'ST' },
      { x: 0.8, y: 0.65, position: 'ST' },
    ]
  },
  '5-3-2': {
    name: '5-3-2',
    positions: [
      { x: 0.1, y: 0.5, position: 'GK' },
      // Defenders
      { x: 0.2, y: 0.2, position: 'LWB' },
      { x: 0.2, y: 0.35, position: 'CB' },
      { x: 0.2, y: 0.5, position: 'CB' },
      { x: 0.2, y: 0.65, position: 'CB' },
      { x: 0.2, y: 0.8, position: 'RWB' },
      // Midfielders
      { x: 0.5, y: 0.3, position: 'CM' },
      { x: 0.5, y: 0.5, position: 'CM' },
      { x: 0.5, y: 0.7, position: 'CM' },
      // Forwards
      { x: 0.8, y: 0.35, position: 'ST' },
      { x: 0.8, y: 0.65, position: 'ST' },
    ]
  },
  '4-5-1': {
    name: '4-5-1',
    positions: [
      { x: 0.1, y: 0.5, position: 'GK' },
      // Defenders
      { x: 0.2, y: 0.2, position: 'LB' },
      { x: 0.2, y: 0.4, position: 'CB' },
      { x: 0.2, y: 0.6, position: 'CB' },
      { x: 0.2, y: 0.8, position: 'RB' },
      // Midfielders
      { x: 0.4, y: 0.2, position: 'LM' },
      { x: 0.5, y: 0.35, position: 'CM' },
      { x: 0.5, y: 0.5, position: 'CM' },
      { x: 0.5, y: 0.65, position: 'CM' },
      { x: 0.4, y: 0.8, position: 'RM' },
      // Forward
      { x: 0.8, y: 0.5, position: 'ST' },
    ]
  },
  '3-4-3': {
    name: '3-4-3',
    positions: [
      { x: 0.1, y: 0.5, position: 'GK' },
      // Defenders
      { x: 0.2, y: 0.3, position: 'CB' },
      { x: 0.2, y: 0.5, position: 'CB' },
      { x: 0.2, y: 0.7, position: 'CB' },
      // Midfielders
      { x: 0.5, y: 0.2, position: 'LM' },
      { x: 0.5, y: 0.4, position: 'CM' },
      { x: 0.5, y: 0.6, position: 'CM' },
      { x: 0.5, y: 0.8, position: 'RM' },
      // Forwards
      { x: 0.8, y: 0.2, position: 'LW' },
      { x: 0.8, y: 0.5, position: 'ST' },
      { x: 0.8, y: 0.8, position: 'RW' },
    ]
  },
  '4-4-1-1': {
    name: '4-4-1-1',
    positions: [
      { x: 0.1, y: 0.5, position: 'GK' },
      // Defenders
      { x: 0.2, y: 0.2, position: 'LB' },
      { x: 0.2, y: 0.4, position: 'CB' },
      { x: 0.2, y: 0.6, position: 'CB' },
      { x: 0.2, y: 0.8, position: 'RB' },
      // Midfielders
      { x: 0.5, y: 0.2, position: 'LM' },
      { x: 0.5, y: 0.4, position: 'CM' },
      { x: 0.5, y: 0.6, position: 'CM' },
      { x: 0.5, y: 0.8, position: 'RM' },
      // Forwards
      { x: 0.7, y: 0.5, position: 'CF' },
      { x: 0.85, y: 0.5, position: 'ST' },
    ]
  }
};

interface DrawingElement {
  tool: string;
  points: number[];
  id?: string;
}

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
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [drawingElements, setDrawingElements] = useState<DrawingElement[]>([]);
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

  useEffect(() => {
    const positions = getFormationPositions();
    setPlayers(positions);
  }, [currentFormation, dimensions.width, dimensions.height]);

  const getFormationPositions = () => {
    const formation = FORMATIONS[currentFormation];
    if (!formation) return [];

    return formation.positions.map((pos, index) => {
      // Calcular las coordenadas basadas en el tamaño del campo
      const x = pos.x * dimensions.width;
      const y = pos.y * dimensions.height;

      return {
        id: `player-${index + 1}`,
        name: `Player ${index + 1}`,
        number: index + 1,
        position: pos.position,
        rating: 80 + Math.floor(Math.random() * 15),
        x: x,
        y: y,
      };
    });
  };

  const applyFormation = (formationName: string) => {
    setCurrentFormation(formationName);
    const positions = getFormationPositions();
    setPlayers(positions);
  };

  const handleDragStart = (id: string) => {
    setDraggedPlayerId(id);
    setSelectedPlayerId(id);
  };

  const handleDragEnd = (e: any, id: string) => {
    setDraggedPlayerId(null);
    
    // Actualizar la posición del jugador
    setPlayers(prevPlayers =>
      prevPlayers.map(player =>
        player.id === id
          ? {
              ...player,
              x: e.target.x(),
              y: e.target.y(),
            }
          : player
      )
    );

    // Si estamos grabando, registrar el frame
    if (isRecording) {
      recordFrame();
    }
  };

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayerId(selectedPlayerId === playerId ? null : playerId);
  };

  const handleMouseDown = (e: any) => {
    if (!selectedTool) return;

    const pos = e.target.getStage().getPointerPosition();

    if (selectedTool === 'eraser') {
      setIsDrawing(true);
      const elementsToKeep = deleteNearbyElements(pos.x, pos.y);
      if (elementsToKeep.length < drawingElements.length) {
        setDrawingElements(elementsToKeep);
        saveToHistory(elementsToKeep);
      }
    } else if (['line', 'arrow', 'dottedLine', 'circle', 'square', 'cone'].includes(selectedTool)) {
      setIsDrawing(true);
      setCurrentPoints([pos.x, pos.y]);
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;

    const pos = e.target.getStage().getPointerPosition();

    if (selectedTool === 'eraser') {
      const elementsToKeep = deleteNearbyElements(pos.x, pos.y);
      if (elementsToKeep.length < drawingElements.length) {
        setDrawingElements(elementsToKeep);
      }
    } else {
      setCurrentPoints([currentPoints[0], currentPoints[1], pos.x, pos.y]);
    }
  };

  const deleteNearbyElements = (x: number, y: number) => {
    const tolerance = 15; // pixels de tolerancia para borrar
    return drawingElements.filter(element => {
      // Para círculos y conos
      if (element.tool === 'circle' || element.tool === 'cone') {
        const [x1, y1] = element.points;
        const dx = x1 - x;
        const dy = y1 - y;
        return Math.sqrt(dx * dx + dy * dy) > tolerance;
      }
      
      // Para líneas, flechas y líneas punteadas
      for (let i = 0; i < element.points.length - 1; i += 2) {
        const x1 = element.points[i];
        const y1 = element.points[i + 1];
        const x2 = element.points[i + 2] || x1;
        const y2 = element.points[i + 3] || y1;
        
        // Calcular la distancia del punto a la línea
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        
        if (lenSq !== 0) param = dot / lenSq;
        
        let xx, yy;
        
        if (param < 0) {
          xx = x1;
          yy = y1;
        } else if (param > 1) {
          xx = x2;
          yy = y2;
        } else {
          xx = x1 + param * C;
          yy = y1 + param * D;
        }
        
        const dx = x - xx;
        const dy = y - yy;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < tolerance) return false;
      }
      return true;
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;

    setIsDrawing(false);
    if (currentPoints.length >= 4) {
      const newElement: DrawingElement = {
        tool: selectedTool,
        points: currentPoints,
        id: Date.now().toString(),
      };
      const newElements = [...drawingElements, newElement];
      setDrawingElements(newElements);
      saveToHistory(newElements);
    }
    setCurrentPoints([]);
  };

  const renderDrawingElement = (element: DrawingElement) => {
    const { tool, points } = element;
    
    switch (tool) {
      case 'line':
        return (
          <Line
            key={element.id}
            points={points}
            stroke="#ff0000"
            strokeWidth={2}
          />
        );
      case 'dottedLine':
        return (
          <Line
            key={element.id}
            points={points}
            stroke="#ff0000"
            strokeWidth={2}
            dash={[5, 5]}
          />
        );
      case 'arrow':
        return (
          <Arrow
            key={element.id}
            points={points}
            stroke="#ff0000"
            strokeWidth={2}
            fill="#ff0000"
            pointerLength={10}
            pointerWidth={10}
          />
        );
      case 'circle': {
        const [x1, y1, x2, y2] = points;
        const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        return (
          <Circle
            key={element.id}
            x={x1}
            y={y1}
            radius={radius}
            stroke="#ff0000"
            strokeWidth={2}
          />
        );
      }
      case 'square': {
        const [x1, y1, x2, y2] = points;
        return (
          <Rect
            key={element.id}
            x={Math.min(x1, x2)}
            y={Math.min(y1, y2)}
            width={Math.abs(x2 - x1)}
            height={Math.abs(y2 - y1)}
            stroke="#ff0000"
            strokeWidth={2}
          />
        );
      }
      case 'cone': {
        const [x1, y1, x2, y2] = points;
        const width = Math.abs(x2 - x1);
        const height = Math.abs(y2 - y1);
        const centerX = Math.min(x1, x2) + width / 2;
        
        return (
          <Group key={element.id}>
            {/* Base del cono (círculo) */}
            <Circle
              x={centerX}
              y={Math.max(y1, y2)}
              radius={width / 2}
              fill="#ff9800"
              opacity={0.6}
            />
            {/* Cuerpo del cono (triángulo) */}
            <Line
              points={[
                centerX, Math.min(y1, y2), // Punta
                Math.min(x1, x2), Math.max(y1, y2), // Esquina izquierda
                Math.max(x1, x2), Math.max(y1, y2), // Esquina derecha
                centerX, Math.min(y1, y2), // Volver a la punta
              ]}
              fill="#ff9800"
              stroke="#ff5722"
              strokeWidth={2}
              closed={true}
              opacity={0.8}
            />
          </Group>
        );
      }
      default:
        return null;
    }
  };

  const handleClearDrawings = useCallback(() => {
    // Limpiar todos los elementos de dibujo
    setDrawingElements([]);
    
    // Reiniciar el historial
    setHistory([[]]);
    setHistoryIndex(0);
    
    // Limpiar el estado de dibujo actual
    setCurrentPoints([]);
    setIsDrawing(false);
    
    // Limpiar jugadores y sus posiciones
    setPlayers([]);
    
    // Limpiar animación
    setRecordedFrames([]);
    setCurrentFrame(0);
    setIsPlaying(false);
    setIsRecording(false);
    
    // Limpiar selección
    setSelectedTool(null);
    setSelectedPlayerId(null);
  }, []);

  useEffect(() => {
    const clearButton = document.querySelector('[data-testid="clear-button"]');
    if (clearButton) {
      clearButton.addEventListener('click', handleClearDrawings);
      return () => clearButton.removeEventListener('click', handleClearDrawings);
    }
  }, [handleClearDrawings]);

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

  // Guardar en el historial después de cada dibujo
  const saveToHistory = (elements: DrawingElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...elements]);
    setHistory(newHistory);
    setHistoryIndex(historyIndex + 1);
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

  const handleRecord = () => {
    if (isRecording) {
      // Detener la grabación
      setIsRecording(false);
    } else {
      // Iniciar la grabación
      setIsRecording(true);
      setRecordedFrames([{
        timestamp: Date.now(),
        players: [...players],
        drawings: drawingElements || []
      }]);
    }
  };

  const recordFrame = useCallback(() => {
    if (isRecording) {
      setRecordedFrames(prev => [
        ...prev,
        {
          timestamp: Date.now(),
          players: [...players],
          drawings: drawingElements || []
        }
      ]);
    }
  }, [isRecording, players, drawingElements]);

  useEffect(() => {
    let recordInterval: NodeJS.Timeout | null = null;
    if (isRecording) {
      recordInterval = setInterval(recordFrame, 100); // Grabar cada 100ms
    }
    return () => {
      if (recordInterval) {
        clearInterval(recordInterval);
      }
    };
  }, [isRecording, recordFrame]);

  const handlePlay = () => {
    if (recordedFrames.length > 0) {
      setIsPlaying(true);
      setCurrentFrame(0);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentFrame(0);
    if (recordedFrames.length > 0) {
      const firstFrame = recordedFrames[0];
      setPlayers(firstFrame.players);
      setDrawingElements(firstFrame.drawings);
    }
  };

  const handleSaveAnimation = useCallback(() => {
    if (recordedFrames.length === 0) return;

    const data = {
      frames: recordedFrames,
      version: '1.0',
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `tactical-animation-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [recordedFrames]);

  const handleLoadAnimation = useCallback(async () => {
    try {
      // Crear un input de archivo invisible
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result;
            if (typeof content === 'string') {
              const data = JSON.parse(content);
              if (data.frames && Array.isArray(data.frames)) {
                setRecordedFrames(data.frames);
                setCurrentFrame(0);
                setIsPlaying(false);
              }
            }
          } catch (error) {
            console.error('Error al cargar la animación:', error);
          }
        };
        reader.readAsText(file);
      };

      input.click();
    } catch (error) {
      console.error('Error al cargar la animación:', error);
    }
  }, []);

  useEffect(() => {
    let animationInterval: NodeJS.Timeout | null = null;

    if (isPlaying && recordedFrames.length > 0) {
      animationInterval = setInterval(() => {
        setCurrentFrame(prevFrame => {
          const nextFrame = prevFrame + 1;
          if (nextFrame >= recordedFrames.length) {
            setIsPlaying(false);
            return 0;
          }
          
          // Aplicar el frame actual
          const frame = recordedFrames[nextFrame];
          if (frame.players) {
            setPlayers(frame.players);
          }
          if (frame.drawings) {
            setDrawingElements(frame.drawings);
          }
          
          return nextFrame;
        });
      }, 1000 / (animationSpeed * 10)); // Ajustamos la velocidad de reproducción
    }

    return () => {
      if (animationInterval) {
        clearInterval(animationInterval);
      }
    };
  }, [isPlaying, recordedFrames, animationSpeed]);

  const getCursorStyle = useCallback(() => {
    switch (selectedTool) {
      case 'line':
      case 'dottedLine':
      case 'arrow':
        return 'crosshair';
      case 'circle':
      case 'square':
      case 'cone':
        return 'crosshair';
      case 'eraser':
        return 'cell';
      default:
        return 'default';
    }
  }, [selectedTool]);

  const Field = () => (
    <Group>
      {/* Campo principal */}
      <Rect
        width={dimensions.width}
        height={dimensions.height}
        fill={FIELD_COLOR}
      />
      
      {/* Líneas del campo */}
      {/* Línea central */}
      <Line
        points={[dimensions.width / 2, 0, dimensions.width / 2, dimensions.height]}
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
      
      {/* Áreas de penalti */}
      {/* Área izquierda */}
      <Rect
        x={0}
        y={dimensions.height * 0.2}
        width={dimensions.width * 0.16}
        height={dimensions.height * 0.6}
        stroke={LINE_COLOR}
        strokeWidth={2}
      />
      <Rect
        x={0}
        y={dimensions.height * 0.35}
        width={dimensions.width * 0.05}
        height={dimensions.height * 0.3}
        stroke={LINE_COLOR}
        strokeWidth={2}
      />
      <Arc
        x={dimensions.width * 0.16}
        y={dimensions.height / 2}
        angle={90}
        rotation={-45}
        innerRadius={dimensions.height * 0.1}
        outerRadius={dimensions.height * 0.1}
        stroke={LINE_COLOR}
        strokeWidth={2}
      />
      
      {/* Área derecha */}
      <Rect
        x={dimensions.width * 0.84}
        y={dimensions.height * 0.2}
        width={dimensions.width * 0.16}
        height={dimensions.height * 0.6}
        stroke={LINE_COLOR}
        strokeWidth={2}
      />
      <Rect
        x={dimensions.width * 0.95}
        y={dimensions.height * 0.35}
        width={dimensions.width * 0.05}
        height={dimensions.height * 0.3}
        stroke={LINE_COLOR}
        strokeWidth={2}
      />
      <Arc
        x={dimensions.width * 0.84}
        y={dimensions.height / 2}
        angle={90}
        rotation={135}
        innerRadius={dimensions.height * 0.1}
        outerRadius={dimensions.height * 0.1}
        stroke={LINE_COLOR}
        strokeWidth={2}
      />
    </Group>
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedTool(null);
        setIsDrawing(false);
        setCurrentPoints([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleContextMenu = useCallback((e: any) => {
    e.preventDefault(); // Prevenir el menú contextual por defecto
    setSelectedTool(null);
    setIsDrawing(false);
    setCurrentPoints([]);
  }, []);

  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%', position: 'relative' }}>
      <Box sx={{ width: TOOLBAR_WIDTH, bgcolor: 'background.paper' }}>
        <ToolbarControls
          selectedTool={selectedTool}
          onToolSelect={setSelectedTool}
          onClearDrawings={handleClearDrawings}
          onUndo={handleUndo}
          onRedo={handleRedo}
          currentFormation={currentFormation}
          onFormationSelect={applyFormation}
        />
      </Box>
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        style={{ cursor: getCursorStyle() }}
      >
        <Layer>
          <Field />
          
          {/* Renderizar jugadores */}
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              {...player}
              isDragging={draggedPlayerId === player.id}
              isSelected={selectedPlayerId === player.id}
              onDragStart={() => handleDragStart(player.id)}
              onDragEnd={(e) => handleDragEnd(e, player.id)}
              onClick={() => handlePlayerSelect(player.id)}
            />
          ))}

          {/* Renderizar elementos de dibujo */}
          {drawingElements.map(renderDrawingElement)}

          {/* Renderizar elemento actual mientras se dibuja */}
          {isDrawing && currentPoints.length >= 4 && (
            renderDrawingElement({
              tool: selectedTool,
              points: currentPoints,
              id: 'current'
            })
          )}
        </Layer>
      </Stage>

      {/* Controles de animación */}
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
        onLoadAnimation={handleLoadAnimation}
      />
    </Box>
  );
};

export default TacticalBoard;
