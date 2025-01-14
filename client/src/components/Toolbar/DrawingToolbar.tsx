import React from 'react';
import { 
  Box, 
  IconButton, 
  Tooltip, 
  Paper,
  Grid,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Timeline as ArrowIcon,
  Remove as LineIcon,
  RadioButtonUnchecked as CircleIcon,
  CropSquare as RectangleIcon,
  Close as XIcon,
  ChangeHistory as ConeIcon,
  SportsBaseball as BallIcon,
  PanTool as SelectIcon,
} from '@mui/icons-material';
import { DrawingToolType } from '../../types/drawing';

interface DrawingToolbarProps {
  selectedTool: DrawingToolType;
  onToolSelect: (tool: DrawingToolType) => void;
  selectedColor: string;
  onColorSelect: (color: string) => void;
  selectedLineStyle: 'solid' | 'dashed';
  onLineStyleSelect: (style: 'solid' | 'dashed') => void;
}

const COLORS = [
  '#ffffff', // blanco
  '#ff0000', // rojo
  '#00ff00', // verde
  '#0000ff', // azul
  '#ffff00', // amarillo
  '#ff00ff', // magenta
  '#00ffff', // cyan
  '#ff8c00', // naranja
  '#8b008b', // morado
  '#000000', // negro
  '#ff69b4', // rosa
];

const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  selectedTool,
  onToolSelect,
  selectedColor,
  onColorSelect,
  selectedLineStyle,
  onLineStyleSelect,
}) => {
  const handleToolChange = (
    event: React.MouseEvent<HTMLElement>,
    newTool: DrawingToolType | null
  ) => {
    if (newTool !== null) {
      onToolSelect(newTool);
    }
  };

  const handleLineStyleChange = (
    event: React.MouseEvent<HTMLElement>,
    newStyle: 'solid' | 'dashed' | null
  ) => {
    if (newStyle !== null) {
      onLineStyleSelect(newStyle);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        right: 20,
        top: '50%',
        transform: 'translateY(-50%)',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        maxWidth: '80px',
      }}
    >
      {/* Herramientas de dibujo */}
      <ToggleButtonGroup
        orientation="vertical"
        value={selectedTool}
        exclusive
        onChange={handleToolChange}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="select" aria-label="seleccionar">
          <Tooltip title="Seleccionar" placement="left">
            <SelectIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="arrow" aria-label="flecha">
          <Tooltip title="Flecha" placement="left">
            <ArrowIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="line" aria-label="línea">
          <Tooltip title="Línea" placement="left">
            <LineIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="circle" aria-label="círculo">
          <Tooltip title="Círculo" placement="left">
            <CircleIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="rectangle" aria-label="rectángulo">
          <Tooltip title="Rectángulo" placement="left">
            <RectangleIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="x" aria-label="x">
          <Tooltip title="X" placement="left">
            <XIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="cone" aria-label="cono">
          <Tooltip title="Cono" placement="left">
            <ConeIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="ball" aria-label="balón">
          <Tooltip title="Balón" placement="left">
            <BallIcon />
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Estilo de línea */}
      <ToggleButtonGroup
        orientation="vertical"
        value={selectedLineStyle}
        exclusive
        onChange={handleLineStyleChange}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="solid" aria-label="línea sólida">
          <Tooltip title="Línea sólida" placement="left">
            <LineIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="dashed" aria-label="línea punteada">
          <Tooltip title="Línea punteada" placement="left">
            <LineIcon sx={{ borderStyle: 'dashed' }} />
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Selector de colores */}
      <Grid container spacing={2} sx={{ maxWidth: '100%', p: 1 }}>
        {COLORS.map((color) => (
          <Grid item xs={6} key={color} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title={color} placement="left">
              <Box
                onClick={() => onColorSelect(color)}
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: color,
                  border: `2px solid ${
                    selectedColor === color ? '#666' : 'transparent'
                  }`,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              />
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default DrawingToolbar;
