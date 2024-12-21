import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Grid,
  Alert,
} from '@mui/material';
import { API_ENDPOINTS } from '../../config';

interface AddPlayerFormProps {
  teamId: string;
  onPlayerAdded: () => void;
}

const AddPlayerForm: React.FC<AddPlayerFormProps> = ({ teamId, onPlayerAdded }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    number: '',
    position: 'GK',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
      const response = await fetch(`${API_ENDPOINTS.teams}/${teamId}/players`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear jugador');
      }

      setFormData({
        firstName: '',
        lastName: '',
        number: '',
        position: 'GK',
      });
      setSelectedImage(null);
      setPreviewUrl(null);
      onPlayerAdded();
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
            id="player-photo"
            type="file"
            onChange={handleImageChange}
          />
          <label htmlFor="player-photo">
            <Button variant="outlined" component="span" fullWidth>
              {selectedImage ? 'Cambiar Foto' : 'Subir Foto'}
            </Button>
          </label>
        </Grid>
        {previewUrl && (
          <Grid item xs={12}>
            <Box
              component="img"
              src={previewUrl}
              alt="Vista previa"
              sx={{
                width: '100%',
                maxHeight: 200,
                objectFit: 'contain',
                mt: 1,
              }}
            />
          </Grid>
        )}
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Jugador'}
        </Button>
      </Box>
    </Box>
  );
};

export default AddPlayerForm;
