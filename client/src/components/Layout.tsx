import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import LanguageSelector from './LanguageSelector';

interface LayoutProps {
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ selectedLanguage, setSelectedLanguage }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const getTitle = () => {
    const location = useLocation();
    switch (location.pathname) {
      case '/coach-ai':
        return 'Coach AI';
      case '/tactical-board':
        return 'Tactical Board';
      case '/dashboard':
        return 'Dashboard';
      default:
        return 'Tactical Football Analyzer';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {getTitle()}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              color="inherit"
              component={Link}
              to="/coach-ai"
            >
              Coach AI
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/tactical-board"
            >
              Tactical Board
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/dashboard"
            >
              Dashboard
            </Button>
            <Button
              color="inherit"
              onClick={handleLogout}
            >
              Cerrar Sesión
            </Button>
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
            />
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, px: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
