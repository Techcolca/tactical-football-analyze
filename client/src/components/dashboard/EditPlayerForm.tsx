import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Grid,
  Alert,
  Avatar,
} from '@mui/material';
import { API_ENDPOINTS } from '../../config';

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  number: number;
  position: string;
  photoUrl?: string;
}

interface EditPlayerFormProps {
  teamId: string;
  player: Player;
  onPlayerUpdated: () => void;
}

const EditPlayerForm: React.FC<EditPlayerFormProps> = ({ teamId, player, onPlayerUpdated }) => {
  const [formData, setFormData] = useState({
    firstName: player.firstName,
    lastName: player.lastName,
    number: player.number.toString(),
    position: player.position,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    player.photoUrl ? `http://localhost:3017${player.photoUrl}` : null
  );
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validar tamaño del archivo (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar los 5MB');
        return;
      }

      // Validar tipo de archivo
      if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
        setError('Solo se permiten imágenes en formato JPG o PNG');
        return;
      }

      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('number', formData.number);
      formDataToSend.append('position', formData.position);
      
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.teams}/${teamId}/players/${player.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar jugador');
      }

      onPlayerUpdated();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} display="flex" justifyContent="center">
          <Avatar
            src={previewUrl || undefined}
            alt={`${player.firstName} ${player.lastName}`}
            sx={{ width: 100, height: 100, mb: 2 }}
          >
            {player.firstName[0]}
          </Avatar>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            name="firstName"
            label="Nombre"
            value={formData.firstName}
            onChange={handleInputChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="lastName"
            label="Apellido"
            value={formData.lastName}
            onChange={handleInputChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="number"
            label="Número"
            type="number"
            value={formData.number}
            onChange={handleInputChange}
            fullWidth
            required
            inputProps={{ min: 1, max: 99 }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="position"
            select
            label="Posición"
            value={formData.position}
            onChange={handleInputChange}
            fullWidth
            required
          >
            <MenuItem value="GK">Portero</MenuItem>
            <MenuItem value="DF">Defensa</MenuItem>
            <MenuItem value="MF">Mediocampista</MenuItem>
            <MenuItem value="FW">Delantero</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="player-photo-edit"
            type="file"
            onChange={handleImageChange}
          />
          <label htmlFor="player-photo-edit">
            <Button variant="outlined" component="span" fullWidth>
              {selectedImage ? 'Cambiar Foto' : 'Actualizar Foto'}
            </Button>
          </label>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </Box>
    </Box>
  );
};

export default EditPlayerForm;
