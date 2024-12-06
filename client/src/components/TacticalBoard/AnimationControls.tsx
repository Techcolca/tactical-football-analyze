import React from 'react';
import {
  Box,
  IconButton,
  Paper,
  Tooltip,
  Slider,
  Typography,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Speed,
  Save,
  FiberManualRecord,
} from '@mui/icons-material';

interface AnimationControlsProps {
  isRecording: boolean;
  isPlaying: boolean;
  animationSpeed: number;
  onRecord: () => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSpeedChange: (speed: number) => void;
  onSaveAnimation: () => void;
}

const AnimationControls: React.FC<AnimationControlsProps> = ({
  isRecording,
  isPlaying,
  animationSpeed,
  onRecord,
  onPlay,
  onPause,
  onStop,
  onSpeedChange,
  onSaveAnimation,
}) => {
  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        p: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: 'rgba(0, 0, 0, 0.8)',
      }}
    >
      <Tooltip title={isRecording ? "Detener Grabación" : "Grabar Movimientos"}>
        <IconButton
          color={isRecording ? "error" : "default"}
          onClick={onRecord}
        >
          <FiberManualRecord />
        </IconButton>
      </Tooltip>

      <Tooltip title={isPlaying ? "Pausar" : "Reproducir"}>
        <IconButton
          onClick={isPlaying ? onPause : onPlay}
        >
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
      </Tooltip>

      <Tooltip title="Detener">
        <IconButton onClick={onStop}>
          <Stop />
        </IconButton>
      </Tooltip>

      <Box sx={{ width: 150, display: 'flex', alignItems: 'center' }}>
        <Speed sx={{ mr: 1, color: 'white' }} />
        <Slider
          value={animationSpeed}
          min={0.5}
          max={2}
          step={0.1}
          onChange={(_, value) => onSpeedChange(value as number)}
          sx={{
            '& .MuiSlider-thumb': {
              backgroundColor: '#fff',
            },
            '& .MuiSlider-track': {
              backgroundColor: '#fff',
            },
            '& .MuiSlider-rail': {
              backgroundColor: '#666',
            },
          }}
        />
        <Typography sx={{ ml: 1, color: 'white', minWidth: 40 }}>
          {animationSpeed.toFixed(1)}x
        </Typography>
      </Box>

      <Tooltip title="Guardar Animación">
        <IconButton onClick={onSaveAnimation}>
          <Save />
        </IconButton>
      </Tooltip>
    </Paper>
  );
};

export default AnimationControls;
