import React from 'react';
import { Box, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import TeamSelector from './TeamSelector';

interface ControlPanelProps {
  onTeamSelect: (team: any) => void;
  selectedFormation: string;
  onFormationChange: (formation: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onTeamSelect,
  selectedFormation,
  onFormationChange,
}) => {
  const formations = ['4-4-2', '4-3-3', '3-5-2', '5-3-2', '4-2-3-1'];

  return (
    <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, bgcolor: 'background.paper' }}>
      <Box sx={{ flex: 1 }}>
        <TeamSelector onTeamSelect={onTeamSelect} />
      </Box>
      
      <Box sx={{ minWidth: 200 }}>
        <FormControl fullWidth>
          <InputLabel>Formación</InputLabel>
          <Select
            value={selectedFormation}
            label="Formación"
            onChange={(e) => onFormationChange(e.target.value)}
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
  );
};

export default ControlPanel;
