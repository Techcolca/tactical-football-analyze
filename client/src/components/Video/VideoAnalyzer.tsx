import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';

interface VideoAnalyzerProps {
  videoUrl: string;
  analysis?: {
    players: Array<{
      id: string;
      positions: Array<{ time: number; x: number; y: number }>;
      heatmap: Array<{ x: number; y: number; intensity: number }>;
    }>;
    events: Array<{
      time: number;
      type: string;
      players: string[];
      position: { x: number; y: number };
    }>;
  };
  onTimeUpdate?: (time: number) => void;
  onEventClick?: (event: any) => void;
}

const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({
  videoUrl,
  analysis,
  onTimeUpdate,
  onEventClick
}) => {
  const playerRef = useRef<ReactPlayer>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);

  // Dibujar overlay de análisis
  useEffect(() => {
    if (!canvasRef.current || !analysis) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (showHeatmap) {
      // Dibujar heatmap
      analysis.players.forEach(player => {
        if (!selectedPlayer || player.id === selectedPlayer) {
          drawHeatmap(ctx, player.heatmap);
        }
      });
    } else {
      // Dibujar posiciones de jugadores
      analysis.players.forEach(player => {
        if (!selectedPlayer || player.id === selectedPlayer) {
          const position = getCurrentPosition(player.positions, currentTime);
          if (position) {
            drawPlayer(ctx, position, player.id === selectedPlayer);
          }
        }
      });

      // Dibujar eventos cercanos al tiempo actual
      analysis.events
        .filter(event => Math.abs(event.time - currentTime) < 5)
        .forEach(event => {
          drawEvent(ctx, event);
        });
    }
  }, [currentTime, analysis, showHeatmap, selectedPlayer]);

  // Funciones de dibujo
  const drawPlayer = (ctx: CanvasRenderingContext2D, position: { x: number; y: number }, isSelected: boolean) => {
    const x = position.x * ctx.canvas.width;
    const y = position.y * ctx.canvas.height;

    ctx.beginPath();
    ctx.arc(x, y, isSelected ? 8 : 6, 0, Math.PI * 2);
    ctx.fillStyle = isSelected ? '#DAA520' : '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawEvent = (ctx: CanvasRenderingContext2D, event: any) => {
    const x = event.position.x * ctx.canvas.width;
    const y = event.position.y * ctx.canvas.height;

    // Dibujar icono de evento
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 10);
    ctx.lineTo(x + 10, y + 10);
    ctx.moveTo(x + 10, y - 10);
    ctx.lineTo(x - 10, y + 10);
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Texto del evento
    ctx.font = '12px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(event.type, x + 15, y);
  };

  const drawHeatmap = (ctx: CanvasRenderingContext2D, heatmap: Array<{ x: number; y: number; intensity: number }>) => {
    heatmap.forEach(point => {
      const x = point.x * ctx.canvas.width;
      const y = point.y * ctx.canvas.height;
      const radius = 20;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

      gradient.addColorStop(0, `rgba(255, 0, 0, ${point.intensity})`);
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const getCurrentPosition = (positions: Array<{ time: number; x: number; y: number }>, time: number) => {
    return positions.reduce((prev, curr) => {
      return Math.abs(curr.time - time) < Math.abs(prev.time - time) ? curr : prev;
    });
  };

  // Controles de reproducción
  const handleProgress = ({ playedSeconds }: { playedSeconds: number }) => {
    setCurrentTime(playedSeconds);
    onTimeUpdate?.(playedSeconds);
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    const time = percent * duration;
    playerRef.current?.seekTo(time);
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      {/* Video principal */}
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        width="100%"
        height="100%"
        playing={playing}
        playbackRate={playbackSpeed}
        onProgress={handleProgress}
        onDuration={handleDuration}
      />

      {/* Canvas para overlay de análisis */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />

      {/* Controles */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent"
          >
            {/* Barra de progreso */}
            <div
              className="w-full h-2 bg-gray-700 rounded-full mb-4 cursor-pointer"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-[#DAA520] rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            {/* Controles principales */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPlaying(!playing)}
                  className="text-white"
                >
                  <span className="material-icons">
                    {playing ? 'pause' : 'play_arrow'}
                  </span>
                </motion.button>

                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="bg-transparent text-white border border-white rounded px-2 py-1"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>

                <span className="text-white">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`text-white ${showHeatmap ? 'text-[#DAA520]' : ''}`}
                >
                  <span className="material-icons">
                    local_fire_department
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPlayer(null)}
                  className="text-white"
                >
                  <span className="material-icons">
                    group
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Función auxiliar para formatear tiempo
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default VideoAnalyzer;
