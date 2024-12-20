import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { SportsSoccer, SportsScore } from '@mui/icons-material';

const Layout: React.FC = () => {
  return (
    <>
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          <SportsSoccer sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Tactical Football Analyzer
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              color="inherit"
              component={Link}
              to="/"
              startIcon={<SportsSoccer />}
            >
              Coach AI
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/board"
              startIcon={<SportsScore />}
            >
              Tactical Board
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Outlet />
    </>
  );
};

export default Layout;
