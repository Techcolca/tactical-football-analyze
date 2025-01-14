import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Tooltip,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useTheme,
} from '@mui/material';
import {
  SportsSoccer,
  Person,
  Timeline,
  Clear,
  Save,
  Undo,
  Redo,
  Create,
  PlayArrow,
  Pause,
  Stop,
} from '@mui/icons-material';
import { Stage, Layer, Circle, Arrow, Line, Group, Text } from 'react-konva';
import { Formation } from '../../types/collaboration';
import { IPlayer } from '../../types/player';
import styles from './TacticalBoard.module.css';
import soccerField from '../../assets/soccer-field.png';

// Definir las posiciones predefinidas para cada formación
const FORMATION_POSITIONS = {
  '4-4-2': [
    { x: 0.5, y: 0.1 },  // GK
    { x: 0.2, y: 0.3 },  // DEF
    { x: 0.4, y: 0.3 },  // DEF
    { x: 0.6, y: 0.3 },  // DEF
    { x: 0.8, y: 0.3 },  // DEF
    { x: 0.2, y: 0.6 },  // MID
    { x: 0.4, y: 0.6 },  // MID
    { x: 0.6, y: 0.6 },  // MID
    { x: 0.8, y: 0.6 },  // MID
    { x: 0.35, y: 0.8 }, // FWD
    { x: 0.65, y: 0.8 }, // FWD
  ],
  '4-3-3': [
    { x: 0.5, y: 0.1 },  // GK
    { x: 0.2, y: 0.3 },  // DEF
    { x: 0.4, y: 0.3 },  // DEF
    { x: 0.6, y: 0.3 },  // DEF
    { x: 0.8, y: 0.3 },  // DEF
    { x: 0.3, y: 0.6 },  // MID
    { x: 0.5, y: 0.6 },  // MID
    { x: 0.7, y: 0.6 },  // MID
    { x: 0.3, y: 0.8 },  // FWD
    { x: 0.5, y: 0.8 },  // FWD
    { x: 0.7, y: 0.8 },  // FWD
  ],
  '3-5-2': [
    { x: 0.5, y: 0.1 },  // GK
    { x: 0.3, y: 0.3 },  // DEF
    { x: 0.5, y: 0.3 },  // DEF
    { x: 0.7, y: 0.3 },  // DEF
    { x: 0.2, y: 0.6 },  // MID
    { x: 0.35, y: 0.6 }, // MID
    { x: 0.5, y: 0.6 },  // MID
    { x: 0.65, y: 0.6 }, // MID
    { x: 0.8, y: 0.6 },  // MID
    { x: 0.35, y: 0.8 }, // FWD
    { x: 0.65, y: 0.8 }, // FWD
  ],
  '5-3-2': [
    { x: 0.5, y: 0.1 },  // GK
    { x: 0.1, y: 0.3 },  // DEF
    { x: 0.3, y: 0.3 },  // DEF
    { x: 0.5, y: 0.3 },  // DEF
    { x: 0.7, y: 0.3 },  // DEF
    { x: 0.9, y: 0.3 },  // DEF
    { x: 0.3, y: 0.6 },  // MID
    { x: 0.5, y: 0.6 },  // MID
    { x: 0.7, y: 0.6 },  // MID
    { x: 0.35, y: 0.8 }, // FWD
    { x: 0.65, y: 0.8 }, // FWD
  ],
};

interface TacticalBoardProps {
  formation: Formation;
  players: IPlayer[];
  onSavePlay?: (play: any) => void;
  readOnly?: boolean;
  width?: number;
  height?: number;
}

interface PlayerMarker {
  id: string;
  x: number;
  y: number;
  color: string;
  player?: IPlayer;
}

interface Movement {
  playerId: string;
  points: number[];
}

interface Play {
  name: string;
  formation: Formation;
  players: PlayerMarker[];
  movements: Movement[];
  ballMovement?: number[];
}

const TacticalBoard: React.FC<TacticalBoardProps> = ({
  formation,
  players,
  onSavePlay,
  readOnly = false,
  width = 800,
  height = 600,
}) => {
  const theme = useTheme();
  const stageRef = useRef<any>(null);
  const [selectedTool, setSelectedTool] = useState<'player' | 'ball' | 'movement' | null>(null);
  const [playerMarkers, setPlayerMarkers] = useState<PlayerMarker[]>([]);
  const [ballPosition, setBallPosition] = useState<{ x: number; y: number } | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [currentMovement, setCurrentMovement] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [history, setHistory] = useState<Play[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Inicializar jugadores según la formación
  useEffect(() => {
    if (formation && players) {
      const initialMarkers = generateInitialPositions(formation, players, width, height);
      setPlayerMarkers(initialMarkers);
    }
  }, [formation, players]);

  const calculateFormationPositions = (
    formation: Formation,
    boardWidth: number,
    boardHeight: number
  ) => {
    const positions = FORMATION_POSITIONS[formation] || [];
    return positions.map(pos => ({
      x: pos.x * boardWidth,
      y: pos.y * boardHeight
    }));
  };

  const generateInitialPositions = (
    formation: Formation,
    players: IPlayer[],
    boardWidth: number,
    boardHeight: number
  ): PlayerMarker[] => {
    const markers: PlayerMarker[] = [];
    const positions = calculateFormationPositions(formation, boardWidth, boardHeight);
    
    positions.forEach((pos, index) => {
      if (players[index]) {
        markers.push({
          id: players[index].id,
          x: pos.x,
          y: pos.y,
          color: getPlayerColor(players[index].position),
          player: players[index],
        });
      }
    });

    return markers;
  };

  const getPlayerColor = (position: string): string => {
    switch (position.toLowerCase()) {
      case 'goalkeeper': return theme.palette.error.main;
      case 'defender': return theme.palette.primary.main;
      case 'midfielder': return theme.palette.success.main;
      case 'forward': return theme.palette.warning.main;
      default: return theme.palette.grey[500];
    }
  };

  const handleStageClick = (e: any) => {
    if (readOnly) return;

    const pos = e.target.getStage().getPointerPosition();
    
    switch (selectedTool) {
      case 'player':
        addPlayer(pos.x, pos.y);
        break;
      case 'ball':
        setBallPosition({ x: pos.x, y: pos.y });
        break;
      case 'movement':
        handleMovementDraw(pos.x, pos.y);
        break;
    }
  };

  const addPlayer = (x: number, y: number) => {
    const newPlayer: PlayerMarker = {
      id: `player-${playerMarkers.length + 1}`,
      x,
      y,
      color: theme.palette.primary.main,
    };
    setPlayerMarkers([...playerMarkers, newPlayer]);
    addToHistory();
  };

  const handleMovementDraw = (x: number, y: number) => {
    if (currentMovement.length === 0) {
      setCurrentMovement([x, y]);
    } else {
      const newMovement: Movement = {
        playerId: 'temp',
        points: [...currentMovement, x, y],
      };
      setMovements([...movements, newMovement]);
      setCurrentMovement([]);
    }
  };

  const handleDragEnd = (e: any, id: string) => {
    const newMarkers = playerMarkers.map(marker =>
      marker.id === id
        ? { ...marker, x: e.target.x(), y: e.target.y() }
        : marker
    );
    setPlayerMarkers(newMarkers);
    addToHistory();
  };

  const addToHistory = () => {
    const newPlay: Play = {
      name: `Play ${history.length + 1}`,
      formation,
      players: playerMarkers,
      movements,
      ballMovement: ballPosition ? [ballPosition.x, ballPosition.y] : undefined,
    };

    const newHistory = [...history.slice(0, historyIndex + 1), newPlay];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleClear = () => {
    setPlayerMarkers([]);
    setMovements([]);
    setBallPosition(null);
    setCurrentMovement([]);
    addToHistory();
  };

  const handleSave = () => {
    if (onSavePlay) {
      const play: Play = {
        name: `Play ${history.length}`,
        formation,
        players: playerMarkers,
        movements,
        ballMovement: ballPosition ? [ballPosition.x, ballPosition.y] : undefined,
      };
      onSavePlay(play);
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2,
        backgroundColor: 'background.paper',
        width: width + 40,
        height: height + 40,
      }}
    >
      <div 
        style={{
          width: width,
          height: height,
          position: 'relative',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <img
          src={soccerField}
          alt="Soccer Field"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        />
        <Stage
          width={width}
          height={height}
          ref={stageRef}
          onClick={handleStageClick}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
          }}
        >
          <Layer>
            {/* Jugadores */}
            {playerMarkers.map((marker, index) => (
              <Group
                key={marker.id}
                x={marker.x}
                y={marker.y}
                draggable={!readOnly}
                onDragEnd={(e) => handleDragEnd(e, marker.id)}
              >
                <Circle
                  radius={15}
                  fill={marker.color}
                  stroke="#000"
                  strokeWidth={2}
                  shadowColor="#000"
                  shadowBlur={5}
                  shadowOffset={{ x: 2, y: 2 }}
                  shadowOpacity={0.3}
                />
                <Text
                  text={marker.player?.number?.toString() || (index + 1).toString()}
                  fill="#fff"
                  fontSize={12}
                  fontStyle="bold"
                  align="center"
                  verticalAlign="middle"
                  width={30}
                  height={30}
                  offsetX={15}
                  offsetY={15}
                />
              </Group>
            ))}

            {/* Pelota */}
            {ballPosition && (
              <Circle
                x={ballPosition.x}
                y={ballPosition.y}
                radius={8}
                fill="#fff"
                stroke="#000"
                strokeWidth={2}
                shadowColor="#000"
                shadowBlur={5}
                shadowOffset={{ x: 2, y: 2 }}
                shadowOpacity={0.3}
                draggable={!readOnly}
              />
            )}

            {/* Movimientos */}
            {movements.map((movement, index) => (
              <Arrow
                key={`movement-${index}`}
                points={movement.points}
                stroke="#fff"
                fill="#fff"
                strokeWidth={3}
                shadowColor="#000"
                shadowBlur={5}
                shadowOffset={{ x: 2, y: 2 }}
                shadowOpacity={0.3}
              />
            ))}

            {/* Movimiento actual */}
            {currentMovement.length >= 4 && (
              <Arrow
                points={currentMovement}
                stroke="#fff"
                fill="#fff"
                strokeWidth={3}
                shadowColor="#000"
                shadowBlur={5}
                shadowOffset={{ x: 2, y: 2 }}
                shadowOpacity={0.3}
              />
            )}
          </Layer>
        </Stage>
      </div>

      {/* Controles */}
      <Box sx={{ position: 'absolute', right: 16, bottom: 16 }}>
        <SpeedDial
          ariaLabel="Tactical Board Controls"
          icon={<SpeedDialIcon />}
          direction="up"
        >
          <SpeedDialAction
            icon={<Person />}
            tooltipTitle="Add Player"
            onClick={() => setSelectedTool('player')}
          />
          <SpeedDialAction
            icon={<SportsSoccer />}
            tooltipTitle="Add Ball"
            onClick={() => setSelectedTool('ball')}
          />
          <SpeedDialAction
            icon={<Timeline />}
            tooltipTitle="Draw Movement"
            onClick={() => setSelectedTool('movement')}
          />
          <SpeedDialAction
            icon={<Clear />}
            tooltipTitle="Clear"
            onClick={handleClear}
          />
          {onSavePlay && (
            <SpeedDialAction
              icon={<Save />}
              tooltipTitle="Save Play"
              onClick={handleSave}
            />
          )}
        </SpeedDial>
      </Box>
    </Paper>
  );
};

export default TacticalBoard;
