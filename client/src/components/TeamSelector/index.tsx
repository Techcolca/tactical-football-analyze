import React, { useState, useEffect } from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { Team } from '../../types/team';
import { API_ENDPOINTS } from '../../config';

interface TeamSelectorProps {
  onTeamSelect: (team: Team) => void;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({ onTeamSelect }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.teams);
        if (!response.ok) {
          throw new Error('Error al cargar equipos');
        }
        const data = await response.json();
        setTeams(data);
      } catch (error) {
        console.error('Error al cargar equipos:', error);
        setError('Error al cargar los equipos. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const teamId = event.target.value;
    setSelectedTeamId(teamId);
    const selectedTeam = teams.find(team => team._id === teamId);
    if (selectedTeam) {
      onTeamSelect(selectedTeam);
    }
  };

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 2, mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)', display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 2, mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
      <Box sx={{ minWidth: 200 }}>
        <Typography variant="h6" gutterBottom>
          Seleccionar Equipo
        </Typography>
        
        <FormControl fullWidth>
          <InputLabel id="team-select-label">Equipo</InputLabel>
          <Select
            labelId="team-select-label"
            id="team-select"
            value={selectedTeamId}
            label="Equipo"
            onChange={handleChange}
          >
            {teams.map((team) => (
              <MenuItem key={team._id} value={team._id}>
                {team.name} ({team.category})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
};

export default TeamSelector;
