import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Layout from './components/Layout';
import Dashboard from './components/dashboard/Dashboard';
import CoachAI from './components/CoachAI';
import TacticalBoard from './components/TacticalBoard';
import AuthLayout from './components/auth/AuthLayout';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

export type Language = 'en' | 'es' | 'fr';

const App: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(() => {
    // Recuperar el idioma guardado en localStorage o usar 'es' como predeterminado
    const savedLanguage = localStorage.getItem('preferredLanguage');
    return (savedLanguage as Language) || 'es';
  });

  // Verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  // Actualizar localStorage cuando cambie el idioma
  useEffect(() => {
    localStorage.setItem('preferredLanguage', selectedLanguage);
  }, [selectedLanguage]);

  // Componente para proteger rutas
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/auth" replace />;
    }
    return <>{children}</>;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Ruta pública de autenticación */}
          <Route
            path="/auth"
            element={
              <AuthLayout
                selectedLanguage={selectedLanguage}
                setSelectedLanguage={setSelectedLanguage}
              />
            }
          />

          {/* Todas las demás rutas protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout
                  selectedLanguage={selectedLanguage}
                  setSelectedLanguage={setSelectedLanguage}
                />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/coach-ai" replace />} />
            <Route
              path="/coach-ai"
              element={<CoachAI selectedLanguage={selectedLanguage} />}
            />
            <Route path="/tactical-board" element={<TacticalBoard />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* Redirigir cualquier otra ruta a /auth */}
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
