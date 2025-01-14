import React from 'react';
import {
  Paper,
  IconButton,
  Divider,
  Box,
  Tooltip,
  Menu,
  MenuItem,
  Grid
} from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import UploadIcon from '@mui/icons-material/Upload';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import SportsIcon from '@mui/icons-material/Sports';
import PaletteIcon from '@mui/icons-material/Palette';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const COLORS = [
  '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'
];

interface DrawingToolbarProps {
  onToolSelect: (tool: string) => void;
  onColorSelect: (color: string) => void;
  onLineStyleSelect: (style: 'solid' | 'dashed') => void;
  onSaveStrategy: () => void;
  onLoadStrategy: (strategy: any) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClearDrawings: () => void;
  selectedTool: string;
  selectedColor: string;
  selectedLineStyle: 'solid' | 'dashed';
}

const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  onToolSelect,
  onColorSelect,
  onLineStyleSelect,
  onSaveStrategy,
  onLoadStrategy,
  onUndo,
  onRedo,
  onClearDrawings,
  selectedTool,
  selectedColor,
  selectedLineStyle,
}) => {
  const [colorMenu, setColorMenu] = React.useState<null | HTMLElement>(null);
  const [lineStyleMenu, setLineStyleMenu] = React.useState<null | HTMLElement>(null);

  const handleLoadStrategy = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const strategy = JSON.parse(e.target?.result as string);
          onLoadStrategy(strategy);
        } catch (error) {
          console.error('Error al cargar la estrategia:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Paper
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        p: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.9)'
      }}
    >
      <Tooltip title="Línea">
        <IconButton
          onClick={() => onToolSelect('line')}
          color={selectedTool === 'line' ? 'primary' : 'default'}
        >
          <TimelineIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Flecha">
        <IconButton
          onClick={() => onToolSelect('arrow')}
          color={selectedTool === 'arrow' ? 'primary' : 'default'}
        >
          <ArrowForwardIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Círculo">
        <IconButton
          onClick={() => onToolSelect('circle')}
          color={selectedTool === 'circle' ? 'primary' : 'default'}
        >
          <CircleOutlinedIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Rectángulo">
        <IconButton
          onClick={() => onToolSelect('rectangle')}
          color={selectedTool === 'rectangle' ? 'primary' : 'default'}
        >
          <CropSquareIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Cono">
        <IconButton
          onClick={() => onToolSelect('cone')}
          color={selectedTool === 'cone' ? 'primary' : 'default'}
        >
          <SportsIcon />
        </IconButton>
      </Tooltip>

      <Divider />

      <Tooltip title="Color">
        <IconButton onClick={(e) => setColorMenu(e.currentTarget)}>
          <PaletteIcon sx={{ color: selectedColor }} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={colorMenu}
        open={Boolean(colorMenu)}
        onClose={() => setColorMenu(null)}
      >
        <Box sx={{ p: 1 }}>
          <Grid container spacing={1}>
            {COLORS.map((color) => (
              <Grid item key={color}>
                <IconButton
                  onClick={() => {
                    onColorSelect(color);
                    setColorMenu(null);
                  }}
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: color,
                    border: selectedColor === color ? '2px solid #000' : '1px solid #ccc',
                    '&:hover': { backgroundColor: color }
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Menu>

      <Tooltip title="Estilo de línea">
        <IconButton onClick={(e) => setLineStyleMenu(e.currentTarget)}>
          {selectedLineStyle === 'dashed' ? '- -' : '—'}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={lineStyleMenu}
        open={Boolean(lineStyleMenu)}
        onClose={() => setLineStyleMenu(null)}
      >
        <MenuItem onClick={() => { onLineStyleSelect('solid'); setLineStyleMenu(null); }}>
          Sólida
        </MenuItem>
        <MenuItem onClick={() => { onLineStyleSelect('dashed'); setLineStyleMenu(null); }}>
          Punteada
        </MenuItem>
      </Menu>

      <Divider />

      <Tooltip title="Deshacer">
        <IconButton onClick={onUndo}>
          <UndoIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Rehacer">
        <IconButton onClick={onRedo}>
          <RedoIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Borrar todo">
        <IconButton onClick={onClearDrawings}>
          <DeleteOutlineIcon />
        </IconButton>
      </Tooltip>

      <Divider />

      <Tooltip title="Guardar estrategia">
        <IconButton onClick={onSaveStrategy}>
          <SaveIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Cargar estrategia">
        <IconButton component="label">
          <UploadIcon />
          <input
            type="file"
            hidden
            accept=".json"
            onChange={handleLoadStrategy}
          />
        </IconButton>
      </Tooltip>
    </Paper>
  );
};

export default DrawingToolbar;
