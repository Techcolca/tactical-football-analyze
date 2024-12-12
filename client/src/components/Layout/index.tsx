import React from 'react';
import { Box, AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import { Outlet, Link } from 'react-router-dom';
import SportsIcon from '@mui/icons-material/Sports';
import ChatIcon from '@mui/icons-material/Chat';

const Layout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Tactical Football Analyzer
          </Typography>
          <Button
            component={Link}
            to="/"
            color="inherit"
            startIcon={<SportsIcon />}
            sx={{ mr: 2 }}
          >
            Pizarra Táctica
          </Button>
          <Button
            component={Link}
            to="/coach"
            color="inherit"
            startIcon={<ChatIcon />}
          >
            Coach AI
          </Button>
        </Toolbar>
      </AppBar>
      <Container 
        maxWidth={false} 
        sx={{ 
          flexGrow: 1, 
          py: 4,
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
};

export default Layout;
