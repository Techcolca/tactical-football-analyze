import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import AddPlayerForm from './AddPlayerForm';
import EditPlayerForm from './EditPlayerForm';
import { API_ENDPOINTS } from '../../config';

interface Team {
  id: string;
  name: string;
  category: string;
  season: string;
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

const Dashboard: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [openTeamDialog, setOpenTeamDialog] = useState(false);
  const [openPlayerDialog, setOpenPlayerDialog] = useState(false);
  const [openEditPlayerDialog, setOpenEditPlayerDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string>('');
  const [newTeam, setNewTeam] = useState({
    name: '',
    category: 'FIRST_TEAM',
    season: '',
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.teams, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener equipos');
      }
      
      const data = await response.json();
      setTeams(data);
    } catch (error: any) {
      console.error('Error al obtener equipos:', error);
      setError('Error al cargar los equipos');
    }
  };

  const handleCreateTeam = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Enviando datos del equipo:', newTeam);
      
      const response = await fetch(API_ENDPOINTS.teams, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newTeam),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear equipo');
      }

      const data = await response.json();
      console.log('Equipo creado:', data);
      
      setTeams(prevTeams => [...prevTeams, { ...data, players: [] }]);
      setOpenTeamDialog(false);
      setNewTeam({ name: '', category: 'FIRST_TEAM', season: '' });
    } catch (error: any) {
      console.error('Error detallado al crear equipo:', error);
      setError(error.message);
    }
  };

  const handlePlayerAdded = async (teamId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.teams}/${teamId}/players`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener jugadores');
      }

      const players = await response.json();
      setTeams(teams.map(team => 
        team.id === teamId 
          ? { ...team, players }
          : team
      ));
    } catch (error: any) {
      console.error('Error al actualizar jugadores:', error);
      setError('Error al actualizar la lista de jugadores');
    }
  };

  const handleEditPlayer = (team: Team, player: Player) => {
    setSelectedTeam(team);
    setSelectedPlayer(player);
    setOpenEditPlayerDialog(true);
  };

  const handlePlayerUpdated = async (teamId: string) => {
    await handlePlayerAdded(teamId);
    setOpenEditPlayerDialog(false);
    setSelectedPlayer(null);
  };

  const getPositionLabel = (position: string) => {
    const positions: { [key: string]: string } = {
      'GK': 'Portero',
      'DF': 'Defensa',
      'MF': 'Mediocampista',
      'FW': 'Delantero'
    };
    return positions[position] || position;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Mis Equipos</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenTeamDialog(true)}
            >
              Nuevo Equipo
            </Button>
          </Paper>
        </Grid>

        {teams.map((team) => (
          <Grid item xs={12} md={6} lg={4} key={team.id}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {team.name}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                {team.category} - {team.season}
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Jugadores ({team.players?.length || 0})
                </Typography>
                <List>
                  {team.players?.map((player) => (
                    <ListItem key={player.id}>
                      <ListItemAvatar>
                        <Avatar
                          src={player.photoUrl ? `http://localhost:3017${player.photoUrl}` : undefined}
                          alt={`${player.firstName} ${player.lastName}`}
                        >
                          {player.firstName[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${player.firstName} ${player.lastName}`}
                        secondary={`#${player.number} - ${getPositionLabel(player.position)}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          aria-label="edit"
                          onClick={() => handleEditPlayer(team, player)}
                        >
                          <EditIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setSelectedTeam(team);
                    setOpenPlayerDialog(true);
                  }}
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Agregar Jugador
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Dialog para crear equipo */}
      <Dialog open={openTeamDialog} onClose={() => setOpenTeamDialog(false)}>
        <DialogTitle>Crear Nuevo Equipo</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del Equipo"
            fullWidth
            value={newTeam.name}
            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
          />
          <TextField
            select
            margin="dense"
            label="Categoría"
            fullWidth
            value={newTeam.category}
            onChange={(e) => setNewTeam({ ...newTeam, category: e.target.value })}
          >
            <MenuItem value="FIRST_TEAM">Primer Equipo</MenuItem>
            <MenuItem value="RESERVES">Reservas</MenuItem>
            <MenuItem value="U19">Sub-19</MenuItem>
            <MenuItem value="U17">Sub-17</MenuItem>
            <MenuItem value="U15">Sub-15</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="Temporada"
            fullWidth
            value={newTeam.season}
            onChange={(e) => setNewTeam({ ...newTeam, season: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTeamDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateTeam} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para agregar jugador */}
      <Dialog
        open={openPlayerDialog}
        onClose={() => setOpenPlayerDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Agregar Jugador</DialogTitle>
        <DialogContent>
          {selectedTeam && (
            <AddPlayerForm
              teamId={selectedTeam.id}
              onPlayerAdded={() => {
                handlePlayerAdded(selectedTeam.id);
                setOpenPlayerDialog(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para editar jugador */}
      <Dialog
        open={openEditPlayerDialog}
        onClose={() => setOpenEditPlayerDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Editar Jugador</DialogTitle>
        <DialogContent>
          {selectedTeam && selectedPlayer && (
            <EditPlayerForm
              teamId={selectedTeam.id}
              player={selectedPlayer}
              onPlayerUpdated={() => handlePlayerUpdated(selectedTeam.id)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
