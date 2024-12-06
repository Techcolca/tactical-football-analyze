import React from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Slider,
  Paper,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  FiberManualRecord,
  Save,
  Upload,
  Speed
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
  onLoadAnimation: () => void;
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
  onLoadAnimation,
}) => {
  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 2,
        padding: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
      }}
    >
      <Tooltip title={isRecording ? "Stop Recording" : "Start Recording"}>
        <IconButton
          onClick={onRecord}
          color={isRecording ? "error" : "default"}
          sx={{ 
            bgcolor: isRecording ? 'rgba(244, 67, 54, 0.1)' : 'transparent',
            '&:hover': {
              bgcolor: isRecording ? 'rgba(244, 67, 54, 0.2)' : 'rgba(0, 0, 0, 0.04)',
            }
          }}
        >
          <FiberManualRecord />
        </IconButton>
      </Tooltip>

      <Tooltip title={isPlaying ? "Pause" : "Play"}>
        <IconButton
          onClick={isPlaying ? onPause : onPlay}
          color="primary"
          sx={{ 
            bgcolor: isPlaying ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
            '&:hover': {
              bgcolor: isPlaying ? 'rgba(33, 150, 243, 0.2)' : 'rgba(0, 0, 0, 0.04)',
            }
          }}
        >
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
      </Tooltip>

      <Tooltip title="Stop">
        <IconButton onClick={onStop}>
          <Stop />
        </IconButton>
      </Tooltip>

      <Box sx={{ width: 100, mx: 2, display: 'flex', alignItems: 'center' }}>
        <Speed sx={{ mr: 1, color: 'action.active' }} />
        <Slider
          value={animationSpeed}
          onChange={(_, value) => onSpeedChange(value as number)}
          min={0.5}
          max={2}
          step={0.1}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value}x`}
          sx={{
            color: 'primary.main',
            '& .MuiSlider-thumb': {
              width: 16,
              height: 16,
            },
          }}
        />
      </Box>

      <Tooltip title="Save Animation">
        <IconButton onClick={onSaveAnimation} color="primary">
          <Save />
        </IconButton>
      </Tooltip>

      <Tooltip title="Load Animation">
        <IconButton onClick={onLoadAnimation} color="primary">
          <Upload />
        </IconButton>
      </Tooltip>
    </Paper>
  );
};

export default AnimationControls;
