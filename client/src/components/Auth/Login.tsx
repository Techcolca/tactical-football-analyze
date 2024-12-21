import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
} from '@mui/material';

interface LoginProps {
  selectedLanguage: string;
}

const getTranslations = (language: string) => {
  switch (language) {
    case 'es':
      return {
        title: 'Iniciar Sesión',
        email: 'Correo Electrónico',
        password: 'Contraseña',
        loginButton: 'Iniciar Sesión',
        invalidCredentials: 'Credenciales inválidas',
        loginError: 'Error al iniciar sesión',
        noAccount: '¿No tienes una cuenta?',
        register: 'Registrar Club',
      };
    case 'fr':
      return {
        title: 'Se Connecter',
        email: 'Adresse Email',
        password: 'Mot de Passe',
        loginButton: 'Se Connecter',
        invalidCredentials: 'Identifiants invalides',
        loginError: 'Erreur de connexion',
        noAccount: 'Vous n\'avez pas de compte?',
        register: 'Inscrire un Club',
      };
    default:
      return {
        title: 'Login',
        email: 'Email',
        password: 'Password',
        loginButton: 'Login',
        invalidCredentials: 'Invalid credentials',
        loginError: 'Login error',
        noAccount: 'Don\'t have an account?',
        register: 'Register Club',
      };
  }
};

const Login: React.FC<LoginProps> = ({ selectedLanguage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [translations, setTranslations] = useState(getTranslations(selectedLanguage));

  // Actualizar traducciones cuando cambie el idioma
  useEffect(() => {
    setTranslations(getTranslations(selectedLanguage));
  }, [selectedLanguage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3017/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || translations.invalidCredentials);
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message || translations.loginError);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          {translations.title}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label={translations.email}
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label={translations.password}
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {translations.loginButton}
          </Button>
        </Box>

        <Typography align="center">
          {translations.noAccount}{' '}
          <Link href="/register" underline="hover">
            {translations.register}
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
