import React from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import {
  BookmarkAdd,
  BookmarkRemove,
  Restore,
  Delete,
  Edit,
} from '@mui/icons-material';

export interface Checkpoint {
  id: string;
  name: string;
  timestamp: number;
  state: {
    players: any[];
    drawings: any[];
    recordedFrames: any[];
  };
}

interface CheckpointManagerProps {
  checkpoints: Checkpoint[];
  onCreateCheckpoint: (name: string) => void;
  onRestoreCheckpoint: (checkpoint: Checkpoint) => void;
  onDeleteCheckpoint: (checkpointId: string) => void;
  onRenameCheckpoint: (checkpointId: string, newName: string) => void;
}

const CheckpointManager: React.FC<CheckpointManagerProps> = ({
  checkpoints,
  onCreateCheckpoint,
  onRestoreCheckpoint,
  onDeleteCheckpoint,
  onRenameCheckpoint,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isCreateDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [isRenameDialogOpen, setRenameDialogOpen] = React.useState(false);
  const [selectedCheckpoint, setSelectedCheckpoint] = React.useState<Checkpoint | null>(null);
  const [checkpointName, setCheckpointName] = React.useState('');

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCreateClick = () => {
    setCheckpointName('');
    setCreateDialogOpen(true);
    handleClose();
  };

  const handleCreateConfirm = () => {
    if (checkpointName.trim()) {
      onCreateCheckpoint(checkpointName.trim());
      setCreateDialogOpen(false);
    }
  };

  const handleRenameClick = (checkpoint: Checkpoint) => {
    setSelectedCheckpoint(checkpoint);
    setCheckpointName(checkpoint.name);
    setRenameDialogOpen(true);
    handleClose();
  };

  const handleRenameConfirm = () => {
    if (selectedCheckpoint && checkpointName.trim()) {
      onRenameCheckpoint(selectedCheckpoint.id, checkpointName.trim());
      setRenameDialogOpen(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Gestionar Checkpoints">
          <IconButton onClick={handleClick}>
            <BookmarkAdd />
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleCreateClick}>
            <ListItemIcon>
              <BookmarkAdd fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Crear Checkpoint" />
          </MenuItem>
          
          {checkpoints.map((checkpoint) => (
            <MenuItem key={checkpoint.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {checkpoint.name}
                  <Typography variant="caption" display="block" color="text.secondary">
                    {formatTimestamp(checkpoint.timestamp)}
                  </Typography>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Restaurar">
                    <IconButton
                      size="small"
                      onClick={() => onRestoreCheckpoint(checkpoint)}
                    >
                      <Restore fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Renombrar">
                    <IconButton
                      size="small"
                      onClick={() => handleRenameClick(checkpoint)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton
                      size="small"
                      onClick={() => onDeleteCheckpoint(checkpoint.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Create Checkpoint Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      >
        <DialogTitle>Crear Nuevo Checkpoint</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del Checkpoint"
            fullWidth
            value={checkpointName}
            onChange={(e) => setCheckpointName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreateConfirm}>Crear</Button>
        </DialogActions>
      </Dialog>

      {/* Rename Checkpoint Dialog */}
      <Dialog
        open={isRenameDialogOpen}
        onClose={() => setRenameDialogOpen(false)}
      >
        <DialogTitle>Renombrar Checkpoint</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nuevo Nombre"
            fullWidth
            value={checkpointName}
            onChange={(e) => setCheckpointName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleRenameConfirm}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CheckpointManager;
