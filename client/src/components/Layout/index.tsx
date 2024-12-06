import React from 'react';
import { Box, AppBar, Toolbar, Typography, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Tactical Football Analyzer
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} sx={{ 
        flexGrow: 1, 
        py: 4,
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default Layout;
