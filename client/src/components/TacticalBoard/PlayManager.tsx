import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  PlayArrow,
  Edit,
  Delete,
  Share,
  Folder,
  Add,
  Save,
} from '@mui/icons-material';
import TacticalBoard from './TacticalBoard';
import { Formation } from '../../types/collaboration';
import { IPlayer } from '../../types/player';

interface PlayManagerProps {
  players: IPlayer[];
  formations: Formation[];
  onSavePlay?: (play: any) => void;
  onDeletePlay?: (playId: string) => void;
  onSharePlay?: (playId: string) => void;
}

interface Play {
  id: string;
  name: string;
  formation: Formation;
  description: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  data: any;
}

const PlayManager: React.FC<PlayManagerProps> = ({
  players,
  formations,
  onSavePlay,
  onDeletePlay,
  onSharePlay,
}) => {
  const [plays, setPlays] = useState<Play[]>([]);
  const [selectedPlay, setSelectedPlay] = useState<Play | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newPlayData, setNewPlayData] = useState({
    name: '',
    description: '',
    tags: '',
    formation: formations[0],
  });

  const handleCreatePlay = () => {
    const newPlay: Play = {
      id: `play-${Date.now()}`,
      name: newPlayData.name,
      formation: newPlayData.formation,
      description: newPlayData.description,
      tags: newPlayData.tags.split(',').map(tag => tag.trim()),
      createdAt: new Date(),
      updatedAt: new Date(),
      data: {},
    };

    setPlays([...plays, newPlay]);
    setIsCreateDialogOpen(false);
    resetNewPlayData();
  };

  const handleEditPlay = (play: Play) => {
    setSelectedPlay(play);
    setNewPlayData({
      name: play.name,
      description: play.description,
      tags: play.tags.join(', '),
      formation: play.formation,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePlay = () => {
    if (!selectedPlay) return;

    const updatedPlay: Play = {
      ...selectedPlay,
      name: newPlayData.name,
      description: newPlayData.description,
      tags: newPlayData.tags.split(',').map(tag => tag.trim()),
      formation: newPlayData.formation,
      updatedAt: new Date(),
    };

    const updatedPlays = plays.map(play =>
      play.id === selectedPlay.id ? updatedPlay : play
    );

    setPlays(updatedPlays);
    setIsEditDialogOpen(false);
    setSelectedPlay(null);
    resetNewPlayData();
  };

  const handleDeletePlay = (playId: string) => {
    const updatedPlays = plays.filter(play => play.id !== playId);
    setPlays(updatedPlays);
    if (onDeletePlay) onDeletePlay(playId);
  };

  const handleSharePlay = (playId: string) => {
    if (onSharePlay) onSharePlay(playId);
  };

  const resetNewPlayData = () => {
    setNewPlayData({
      name: '',
      description: '',
      tags: '',
      formation: formations[0],
    });
  };

  const renderPlayDialog = (isEdit: boolean) => {
    const title = isEdit ? 'Editar Jugada' : 'Nueva Jugada';
    const handleSave = isEdit ? handleUpdatePlay : handleCreatePlay;
    const handleClose = () => {
      if (isEdit) {
        setIsEditDialogOpen(false);
      } else {
        setIsCreateDialogOpen(false);
      }
      resetNewPlayData();
    };

    return (
      <Dialog
        open={isEdit ? isEditDialogOpen : isCreateDialogOpen}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              label="Nombre"
              value={newPlayData.name}
              onChange={(e) => setNewPlayData({ ...newPlayData, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Descripción"
              value={newPlayData.description}
              onChange={(e) => setNewPlayData({ ...newPlayData, description: e.target.value })}
              multiline
              rows={4}
              fullWidth
            />
            <TextField
              label="Tags (separados por coma)"
              value={newPlayData.tags}
              onChange={(e) => setNewPlayData({ ...newPlayData, tags: e.target.value })}
              fullWidth
            />
            {/* Selector de formación */}
            {/* Aquí iría un componente para seleccionar la formación */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {isEdit ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Gestor de Jugadas</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Nueva Jugada
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Lista de Jugadas */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ height: '70vh', overflow: 'auto' }}>
            <List>
              {plays.map((play) => (
                <ListItem
                  key={play.id}
                  button
                  selected={selectedPlay?.id === play.id}
                  onClick={() => setSelectedPlay(play)}
                >
                  <ListItemText
                    primary={play.name}
                    secondary={
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(play.updatedAt).toLocaleDateString()}
                        </Typography>
                        <Box mt={1}>
                          {play.tags.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Editar">
                      <IconButton
                        edge="end"
                        onClick={() => handleEditPlay(play)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        edge="end"
                        onClick={() => handleDeletePlay(play.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Compartir">
                      <IconButton
                        edge="end"
                        onClick={() => handleSharePlay(play.id)}
                      >
                        <Share />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Pizarra Táctica */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2 }}>
            {selectedPlay ? (
              <TacticalBoard
                formation={selectedPlay.formation}
                players={players}
                onSavePlay={(playData) => {
                  const updatedPlay = {
                    ...selectedPlay,
                    data: playData,
                    updatedAt: new Date(),
                  };
                  const updatedPlays = plays.map(play =>
                    play.id === selectedPlay.id ? updatedPlay : play
                  );
                  setPlays(updatedPlays);
                  if (onSavePlay) onSavePlay(updatedPlay);
                }}
              />
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="600px"
              >
                <Typography variant="h6" color="textSecondary">
                  Selecciona una jugada para visualizarla
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Diálogos */}
      {renderPlayDialog(false)} {/* Diálogo de creación */}
      {renderPlayDialog(true)} {/* Diálogo de edición */}
    </Box>
  );
};

export default PlayManager;
