import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
  Typography
} from '@mui/material';
import { API_ENDPOINTS } from '../../config';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  number: number;
  position: string;
  photoUrl?: string;
}

interface Team {
  id: string;
  name: string;
  category: string;
  players: Player[];
}

interface TeamSelectorProps {
  onTeamSelect: (team: Team | null) => void;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({ onTeamSelect }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay sesión activa. Por favor, inicia sesión.');
        navigate('/login');
        return;
      }

      const response = await axios.get(API_ENDPOINTS.teams, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && Array.isArray(response.data)) {
        console.log('Equipos cargados:', response.data);
        setTeams(response.data);
        setError(null);
      } else {
        console.error('Formato de datos inválido:', response.data);
        setError('Formato de datos inválido');
      }
    } catch (error: any) {
      console.error('Error al obtener equipos:', error);
      if (error.response?.status === 401) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Error al obtener equipos. Por favor, intenta nuevamente.');
      }
    }
  };

  const handleTeamChange = (event: SelectChangeEvent<string>) => {
    const teamId = event.target.value;
    setSelectedTeamId(teamId);
    
    const selectedTeam = teams.find(team => team.id === teamId) || null;
    console.log('Equipo seleccionado:', selectedTeam);
    onTeamSelect(selectedTeam);
  };

  return (
    <Box sx={{ minWidth: 200, mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Seleccionar Equipo
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <FormControl fullWidth>
        <InputLabel id="team-select-label">Equipo</InputLabel>
        <Select
          labelId="team-select-label"
          id="team-select"
          value={selectedTeamId}
          label="Equipo"
          onChange={handleTeamChange}
        >
          <MenuItem value="">
            <em>Ninguno</em>
          </MenuItem>
          {teams.map((team) => (
            <MenuItem key={team.id} value={team.id}>
              {team.name} ({team.category})
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default TeamSelector;
