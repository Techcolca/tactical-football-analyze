import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Line, Group, Arc, Arrow } from 'react-konva';
import { Box, Paper, IconButton, Tooltip, SpeedDial, SpeedDialAction, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
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
import TeamSelector from './TeamSelector';

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

const TacticalBoard = () => {
  // Estados existentes
  const [fieldDimensions, setFieldDimensions] = useState<FieldDimensions>({
    width: 800,
    height: 600,
    scale: 1,
  });

  // Nuevos estados para equipo y formación
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedFormation, setSelectedFormation] = useState('4-4-2');
  const formations = ['4-4-2', '4-3-3', '3-5-2', '5-3-2', '4-2-3-1'];

  return (
    <Box sx={{ width: '100%', height: '100%', p: 2 }}>
      {/* Panel de Control Superior */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ flex: 1 }}>
          <TeamSelector onTeamSelect={setSelectedTeam} />
        </Box>
        
        <Box sx={{ minWidth: 200 }}>
          <FormControl fullWidth>
            <InputLabel>Formación</InputLabel>
            <Select
              value={selectedFormation}
              label="Formación"
              onChange={(e) => setSelectedFormation(e.target.value)}
            >
              {formations.map((formation) => (
                <MenuItem key={formation} value={formation}>
                  {formation}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Campo de Fútbol */}
      <Paper 
        elevation={3}
        sx={{
          width: '100%',
          height: 'calc(100vh - 200px)',
          bgcolor: FIELD_COLOR,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Stage
          width={fieldDimensions.width}
          height={fieldDimensions.height}
        >
          <Layer>
            {/* Aquí va el código existente del campo */}
          </Layer>
        </Stage>

        {/* Controles existentes */}
        <SpeedDial
          ariaLabel="Controles del tablero"
          sx={{ position: 'absolute', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
        >
          <SpeedDialAction
            icon={<Person />}
            tooltipTitle="Añadir Jugador"
          />
          <SpeedDialAction
            icon={<SportsSoccer />}
            tooltipTitle="Añadir Balón"
          />
          <SpeedDialAction
            icon={<Timeline />}
            tooltipTitle="Dibujar Movimiento"
          />
        </SpeedDial>
      </Paper>
    </Box>
  );
};

export default TacticalBoard;
