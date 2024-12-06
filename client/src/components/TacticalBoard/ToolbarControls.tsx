import React from 'react';
import {
  Box,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Divider,
  Paper,
  ButtonGroup,
  Button,
} from '@mui/material';
import {
  SportsSoccer,
  Create,
  Save,
  Folder,
  Timeline,
  Circle,
  Square,
  Undo,
  Redo,
  Delete,
  LineStyle,
  ArrowForward,
  Palette,
} from '@mui/icons-material';

export interface Formation {
  name: string;
  positions: Array<{
    x: number;
    y: number;
    position: string;
  }>;
}

interface ToolbarControlsProps {
  onFormationSelect: (formation: string) => void;
  onToolSelect: (tool: string) => void;
  onColorSelect: (color: string) => void;
  onLineStyleSelect: (style: 'solid' | 'dashed') => void;
  onSaveFormation: () => void;
  onLoadFormation: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  selectedTool: string;
  selectedColor: string;
  selectedLineStyle: 'solid' | 'dashed';
}

const COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#000000'];

const ToolbarControls: React.FC<ToolbarControlsProps> = ({
  onFormationSelect,
  onToolSelect,
  onColorSelect,
  onLineStyleSelect,
  onSaveFormation,
  onLoadFormation,
  onUndo,
  onRedo,
  onClear,
  selectedTool,
  selectedColor,
  selectedLineStyle,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const drawingTools = [
    { icon: <ArrowForward />, name: 'arrow', label: 'Flecha' },
    { icon: <Timeline />, name: 'line', label: 'Línea' },
    { icon: <LineStyle />, name: 'dottedLine', label: 'Línea Punteada' },
    { icon: <Square />, name: 'cone', label: 'Cono' },
    { icon: <Circle />, name: 'circle', label: 'Círculo' },
  ];

  const formations = [
    { name: '4-4-2', label: '4-4-2' },
    { name: '4-3-3', label: '4-3-3' },
    { name: '3-5-2', label: '3-5-2' },
    { name: '4-2-3-1', label: '4-2-3-1' },
    { name: '5-3-2', label: '5-3-2' },
  ];

  return (
    <>
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }}>
          <List>
            <ListItem>
              <ListItemText primary="Herramientas de Dibujo" />
            </ListItem>
            <Divider />
            {drawingTools.map((tool) => (
              <ListItem
                button
                key={tool.name}
                selected={selectedTool === tool.name}
                onClick={() => onToolSelect(tool.name)}
              >
                <ListItemIcon>{tool.icon}</ListItemIcon>
                <ListItemText primary={tool.label} />
              </ListItem>
            ))}
            
            <ListItem>
              <ListItemText primary="Colores" />
            </ListItem>
            <ListItem>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {COLORS.map((color) => (
                  <IconButton
                    key={color}
                    size="small"
                    onClick={() => onColorSelect(color)}
                    sx={{
                      bgcolor: color,
                      border: selectedColor === color ? '2px solid #fff' : 'none',
                      '&:hover': { bgcolor: color },
                    }}
                  />
                ))}
              </Box>
            </ListItem>

            <ListItem>
              <ListItemText primary="Estilo de Línea" />
            </ListItem>
            <ListItem>
              <ButtonGroup>
                <Button
                  variant={selectedLineStyle === 'solid' ? 'contained' : 'outlined'}
                  onClick={() => onLineStyleSelect('solid')}
                >
                  Sólida
                </Button>
                <Button
                  variant={selectedLineStyle === 'dashed' ? 'contained' : 'outlined'}
                  onClick={() => onLineStyleSelect('dashed')}
                >
                  Punteada
                </Button>
              </ButtonGroup>
            </ListItem>

            <Divider />
            
            <ListItem>
              <ListItemText primary="Formaciones" />
            </ListItem>
            {formations.map((formation) => (
              <ListItem
                button
                key={formation.name}
                onClick={() => onFormationSelect(formation.name)}
              >
                <ListItemIcon>
                  <SportsSoccer />
                </ListItemIcon>
                <ListItemText primary={formation.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box sx={{ position: 'fixed', right: 16, bottom: 16 }}>
        <SpeedDial
          ariaLabel="Controles del tablero"
          icon={<SpeedDialIcon />}
          direction="up"
        >
          <SpeedDialAction
            icon={<Create />}
            tooltipTitle="Herramientas"
            onClick={() => setIsDrawerOpen(true)}
          />
          <SpeedDialAction
            icon={<Save />}
            tooltipTitle="Guardar Formación"
            onClick={onSaveFormation}
          />
          <SpeedDialAction
            icon={<Folder />}
            tooltipTitle="Cargar Formación"
            onClick={onLoadFormation}
          />
          <SpeedDialAction
            icon={<Delete />}
            tooltipTitle="Limpiar Todo"
            onClick={onClear}
          />
        </SpeedDial>
      </Box>

      <Paper
        sx={{
          position: 'fixed',
          top: '50%',
          left: 16,
          transform: 'translateY(-50%)',
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Tooltip title="Deshacer" placement="right">
          <IconButton onClick={onUndo}>
            <Undo />
          </IconButton>
        </Tooltip>
        <Tooltip title="Rehacer" placement="right">
          <IconButton onClick={onRedo}>
            <Redo />
          </IconButton>
        </Tooltip>
      </Paper>
    </>
  );
};

export default ToolbarControls;
