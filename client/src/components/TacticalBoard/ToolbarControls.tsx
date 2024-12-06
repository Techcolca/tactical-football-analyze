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
  Menu,
  MenuItem,
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
  Clear,
  RadioButtonUnchecked,
  CropSquare,
  BackspaceOutlined,
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
  onToolSelect: (tool: string | null) => void;
  onColorSelect: (color: string) => void;
  onLineStyleSelect: (style: 'solid' | 'dashed') => void;
  onSaveFormation: () => void;
  onLoadFormation: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClearDrawings: () => void;
  selectedTool: string | null;
  selectedColor: string;
  selectedLineStyle: 'solid' | 'dashed';
  currentFormation?: string;
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
  onClearDrawings,
  selectedTool,
  selectedColor,
  selectedLineStyle,
  currentFormation = '4-4-2',
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleFormationClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFormationClose = () => {
    setAnchorEl(null);
  };

  const handleFormationSelect = (formation: string) => {
    onFormationSelect(formation);
    handleFormationClose();
  };

  const drawingTools = [
    { icon: <ArrowForward />, name: 'arrow', label: 'Flecha' },
    { icon: <Timeline />, name: 'line', label: 'Línea' },
    { icon: <LineStyle />, name: 'dottedLine', label: 'Línea Punteada' },
    { icon: <Square />, name: 'cone', label: 'Cono' },
    { icon: <Circle />, name: 'circle', label: 'Círculo' },
    { icon: <RadioButtonUnchecked />, name: 'circle', label: 'Círculo' },
    { icon: <CropSquare />, name: 'square', label: 'Cuadrado' },
    { icon: <BackspaceOutlined />, name: 'eraser', label: 'Borrador' },
  ];

  const formations = [
    { name: '4-4-2', label: '4-4-2' },
    { name: '4-3-3', label: '4-3-3' },
    { name: '3-5-2', label: '3-5-2' },
    { name: '4-2-3-1', label: '4-2-3-1' },
    { name: '5-3-2', label: '5-3-2' },
  ];

  const tools = [
    { name: 'line', icon: <Timeline />, tooltip: 'Línea' },
    { name: 'arrow', icon: <ArrowForward />, tooltip: 'Flecha' },
    { name: 'dottedLine', icon: <Create />, tooltip: 'Línea Punteada' },
    { name: 'cone', icon: <Square />, tooltip: 'Cono' },
    { name: 'circle', icon: <Circle />, tooltip: 'Círculo' },
    { name: 'square', icon: <CropSquare />, tooltip: 'Cuadrado' },
    { name: 'eraser', icon: <BackspaceOutlined />, tooltip: 'Borrador' },
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
            onClick={onClearDrawings}
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

      <Paper
        sx={{
          position: 'fixed',
          top: '50%',
          right: 16,
          transform: 'translateY(-50%)',
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Tooltip title="Formación" placement="left">
          <IconButton onClick={handleFormationClick}>
            <SportsSoccer />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleFormationClose}
        >
          {formations.map((formation) => (
            <MenuItem
              key={formation.name}
              onClick={() => handleFormationSelect(formation.name)}
              selected={formation.name === currentFormation}
            >
              {formation.label}
            </MenuItem>
          ))}
        </Menu>

        {tools.map((tool) => (
          <Tooltip key={tool.name} title={tool.tooltip} placement="left">
            <IconButton
              color={selectedTool === tool.name ? 'primary' : 'default'}
              onClick={() => onToolSelect(tool.name)}
            >
              {tool.icon}
            </IconButton>
          </Tooltip>
        ))}
        
        <Tooltip title="Borrar Todo" placement="left">
          <IconButton
            onClick={onClearDrawings}
            data-testid="clear-button"
            sx={{ color: 'error.main' }}
          >
            <Delete />
          </IconButton>
        </Tooltip>

        {selectedTool && (
          <Tooltip title="Cancelar dibujo" placement="left">
            <IconButton onClick={() => onToolSelect(null)}>
              <Clear />
            </IconButton>
          </Tooltip>
        )}
      </Paper>
    </>
  );
};

export default ToolbarControls;
