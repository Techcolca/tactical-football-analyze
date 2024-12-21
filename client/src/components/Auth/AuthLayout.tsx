import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Tabs, Tab } from '@mui/material';
import Login from './Login';
import Register from './Register';
import LanguageSelector from '../LanguageSelector';

interface AuthLayoutProps {
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
}

const getTabLabels = (language: string) => {
  switch (language) {
    case 'es':
      return {
        login: 'Iniciar Sesión',
        register: 'Registrar Club'
      };
    case 'fr':
      return {
        login: 'Se Connecter',
        register: 'Enregistrer Club'
      };
    default:
      return {
        login: 'Login',
        register: 'Register Club'
      };
  }
};

const AuthLayout: React.FC<AuthLayoutProps> = ({ selectedLanguage, setSelectedLanguage }) => {
  const [value, setValue] = useState(0);
  const [labels, setLabels] = useState(getTabLabels(selectedLanguage));

  // Actualizar las etiquetas cuando cambie el idioma
  useEffect(() => {
    setLabels(getTabLabels(selectedLanguage));
  }, [selectedLanguage]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
          />
        </Box>

        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label={labels.login} />
            <Tab label={labels.register} />
          </Tabs>
        </Paper>

        {value === 0 && <Login selectedLanguage={selectedLanguage} />}
        {value === 1 && <Register selectedLanguage={selectedLanguage} />}
      </Box>
    </Container>
  );
};

export default AuthLayout;
