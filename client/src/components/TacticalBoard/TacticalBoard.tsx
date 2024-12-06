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
import { Stage, Layer, Circle, Arrow, Line, Group } from 'react-konva';
import { Formation } from '../../types/collaboration';
import { IPlayer } from '../../types/player';

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

  const calculateFormationPositions = (
    formation: Formation,
    boardWidth: number,
    boardHeight: number
  ) => {
    // Implementar cálculo de posiciones según la formación
    return [];
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

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const previousState = history[historyIndex - 1];
      restoreState(previousState);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextState = history[historyIndex + 1];
      restoreState(nextState);
    }
  };

  const restoreState = (state: Play) => {
    setPlayerMarkers(state.players);
    setMovements(state.movements);
    if (state.ballMovement) {
      setBallPosition({ x: state.ballMovement[0], y: state.ballMovement[1] });
    }
  };

  const clearBoard = () => {
    setPlayerMarkers([]);
    setMovements([]);
    setBallPosition(null);
    setCurrentMovement([]);
    addToHistory();
  };

  const savePlay = () => {
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

  const playAnimation = () => {
    setIsPlaying(true);
    // Implementar animación de la jugada
  };

  const pauseAnimation = () => {
    setIsPlaying(false);
  };

  const stopAnimation = () => {
    setIsPlaying(false);
    // Restaurar posiciones iniciales
  };

  const actions = [
    { icon: <Person />, name: 'Add Player', action: () => setSelectedTool('player') },
    { icon: <SportsSoccer />, name: 'Add Ball', action: () => setSelectedTool('ball') },
    { icon: <Timeline />, name: 'Add Movement', action: () => setSelectedTool('movement') },
    { icon: <Clear />, name: 'Clear', action: clearBoard },
    { icon: <Save />, name: 'Save', action: savePlay },
  ];

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'relative',
        width: width,
        height: height,
        bgcolor: '#2c5530', // Color verde campo de fútbol
        overflow: 'hidden',
      }}
    >
      <Box position="absolute" top={16} right={16} zIndex={1}>
        <IconButton onClick={undo} disabled={historyIndex <= 0}>
          <Undo />
        </IconButton>
        <IconButton onClick={redo} disabled={historyIndex >= history.length - 1}>
          <Redo />
        </IconButton>
        {!readOnly && (
          <>
            <IconButton onClick={playAnimation} disabled={isPlaying}>
              <PlayArrow />
            </IconButton>
            <IconButton onClick={pauseAnimation} disabled={!isPlaying}>
              <Pause />
            </IconButton>
            <IconButton onClick={stopAnimation}>
              <Stop />
            </IconButton>
          </>
        )}
      </Box>

      <Stage
        width={width}
        height={height}
        ref={stageRef}
        onClick={handleStageClick}
      >
        <Layer>
          {/* Campo de fútbol */}
          <Line
            points={[0, height/2, width, height/2]}
            stroke="white"
            strokeWidth={2}
          />
          <Circle
            x={width/2}
            y={height/2}
            radius={50}
            stroke="white"
            strokeWidth={2}
          />
          {/* Áreas de penalti */}
          <Line
            points={[0, height/4, width/6, height/4, width/6, height*3/4, 0, height*3/4]}
            stroke="white"
            strokeWidth={2}
          />
          <Line
            points={[width, height/4, width*5/6, height/4, width*5/6, height*3/4, width, height*3/4]}
            stroke="white"
            strokeWidth={2}
          />

          {/* Jugadores */}
          {playerMarkers.map((marker) => (
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
                stroke="white"
                strokeWidth={2}
              />
              {marker.player && (
                <Circle
                  radius={5}
                  fill="white"
                  y={-20}
                />
              )}
            </Group>
          ))}

          {/* Balón */}
          {ballPosition && (
            <Circle
              x={ballPosition.x}
              y={ballPosition.y}
              radius={8}
              fill="white"
              draggable={!readOnly}
            />
          )}

          {/* Movimientos */}
          {movements.map((movement, i) => (
            <Arrow
              key={i}
              points={movement.points}
              stroke={theme.palette.secondary.main}
              strokeWidth={2}
              fill={theme.palette.secondary.main}
            />
          ))}

          {/* Movimiento actual */}
          {currentMovement.length > 0 && (
            <Line
              points={currentMovement}
              stroke={theme.palette.secondary.main}
              strokeWidth={2}
            />
          )}
        </Layer>
      </Stage>

      {!readOnly && (
        <SpeedDial
          ariaLabel="Tactical Board Tools"
          sx={{ position: 'absolute', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.action}
            />
          ))}
        </SpeedDial>
      )}
    </Paper>
  );
};

export default TacticalBoard;
