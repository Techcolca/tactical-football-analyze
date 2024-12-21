import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AUTH_ENDPOINTS } from '../../config';

interface RegisterProps {
  selectedLanguage: string;
}

const getTranslations = (language: string) => {
  switch (language) {
    case 'es':
      return {
        title: 'Registro de Club',
        clubInfo: 'Información del Club',
        clubName: 'Nombre del Club',
        country: 'País',
        city: 'Ciudad',
        coachInfo: 'Información del Entrenador',
        firstName: 'Nombre',
        lastName: 'Apellidos',
        email: 'Correo Electrónico',
        password: 'Contraseña',
        confirmPassword: 'Confirmar Contraseña',
        registerButton: 'Registrar',
        passwordMismatch: 'Las contraseñas no coinciden',
        registerError: 'Error en el registro',
        emailExists: 'El email ya está registrado',
        steps: ['Información del Club', 'Información del Entrenador'],
        back: 'Atrás',
        next: 'Siguiente',
        login: '¿Ya tienes una cuenta? Iniciar Sesión',
      };
    case 'fr':
      return {
        title: 'Enregistrer Club',
        clubInfo: 'Information du Club',
        clubName: 'Nom du Club',
        country: 'Pays',
        city: 'Ville',
        coachInfo: 'Information de l\'Entraîneur',
        firstName: 'Prénom',
        lastName: 'Nom',
        email: 'Adresse Email',
        password: 'Mot de Passe',
        confirmPassword: 'Confirmer le Mot de Passe',
        registerButton: 'Enregistrer',
        passwordMismatch: 'Les mots de passe ne correspondent pas',
        registerError: 'Erreur d\'enregistrement',
        emailExists: 'L\'email est déjà enregistré',
        steps: ['Information du Club', 'Information de l\'Entraîneur'],
        back: 'Précédent',
        next: 'Suivant',
        login: 'Vous avez déjà un compte ? Connectez-vous',
      };
    default:
      return {
        title: 'Register Club',
        clubInfo: 'Club Information',
        clubName: 'Club Name',
        country: 'Country',
        city: 'City',
        coachInfo: 'Coach Information',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        registerButton: 'Register',
        passwordMismatch: 'Passwords do not match',
        registerError: 'Registration error',
        emailExists: 'Email already exists',
        steps: ['Club Information', 'Coach Information'],
        back: 'Back',
        next: 'Next',
        login: 'Already have an account? Login',
      };
  }
};

const Register: React.FC<RegisterProps> = ({ selectedLanguage }) => {
  const navigate = useNavigate();
  const [translations, setTranslations] = useState(getTranslations(selectedLanguage));
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    setTranslations(getTranslations(selectedLanguage));
  }, [selectedLanguage]);

  // Club information
  const [clubName, setClubName] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  // Coach information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleNext = () => {
    if (activeStep === 0) {
      if (!clubName || !country || !city) {
        setError(translations.registerError);
        return;
      }
    }
    setActiveStep((prevStep) => prevStep + 1);
    setError('');
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError(translations.passwordMismatch);
      return;
    }

    try {
      const response = await fetch(AUTH_ENDPOINTS.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          club: {
            name: clubName,
            country,
            city,
          },
          coach: {
            firstName,
            lastName,
            email,
            password,
            role: 'HEAD_COACH',
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || translations.registerError);
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/coach-ai');
    } catch (error: any) {
      setError(error.message || translations.registerError);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '80vh',
        pt: 4,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 600 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          {translations.title}
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {translations.steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {activeStep === 0 ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={translations.clubName}
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={translations.country}
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={translations.city}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={translations.firstName}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={translations.lastName}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label={translations.email}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={translations.password}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={translations.confirmPassword}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </Grid>
            </Grid>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              {translations.back}
            </Button>
            {activeStep === translations.steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                type="submit"
              >
                {translations.registerButton}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                {translations.next}
              </Button>
            )}
          </Box>
        </form>

        <Typography align="center" sx={{ mt: 2 }}>
          {translations.login}{' '}
          <Link href="/login" underline="hover">
            {translations.login}
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Register;
