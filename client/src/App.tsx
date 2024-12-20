import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Container, CssBaseline, ThemeProvider, createTheme, AppBar, Toolbar, Typography, Box } from '@mui/material';
import TacticalBoard from './components/TacticalBoard';
import Layout from './components/Layout';
import CoachAI from './components/CoachAI';
import LanguageSelector from './components/LanguageSelector';

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
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');

  const getTitle = () => {
    switch (selectedLanguage) {
      case 'es':
        return 'Analizador Táctico de Fútbol';
      case 'fr':
        return 'Analyseur Tactique de Football';
      default:
        return 'Tactical Football Analyzer';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {getTitle()}
            </Typography>
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />
          </Toolbar>
        </AppBar>
        <BrowserRouter>
          <Container maxWidth={false} sx={{ height: '100vh', p: 2, mt: 4 }}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<CoachAI selectedLanguage={selectedLanguage} />} />
                <Route path="/board" element={<TacticalBoard />} />
              </Route>
            </Routes>
          </Container>
        </BrowserRouter>
      </Box>
    </ThemeProvider>
  );
};

export default App;
