import React, { useState } from 'react';
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import TacticalBoard from '../components/TacticalBoard';
import TeamSelector from '../components/TacticalBoard/TeamSelector';

interface Team {
  id: string;
  name: string;
  category: string;
  players: Player[];
}

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  number: number;
  position: string;
  photoUrl?: string;
}

const TacticalBoardPage: React.FC = () => {
  const [selectedFormation, setSelectedFormation] = useState<string>('4-4-2');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const formations = ['4-4-2', '4-3-3', '3-5-2', '5-3-2', '4-2-3-1'];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Pizarra Táctica
      </Typography>
      
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          {/* Selector de Equipo */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              Seleccionar Equipo
            </Typography>
            <TeamSelector onTeamSelect={setSelectedTeam} />
          </Box>

          {/* Selector de Formación */}
          <Box sx={{ minWidth: 200 }}>
            <Typography variant="h6" gutterBottom>
              Formación
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="formation-select-label">Formación</InputLabel>
              <Select
                labelId="formation-select-label"
                id="formation-select"
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
        </Box>
      </Paper>

      <TacticalBoard 
        formation={selectedFormation} 
        selectedTeam={selectedTeam}
      />
    </Box>
  );
};

export default TacticalBoardPage;
