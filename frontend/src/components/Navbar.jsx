import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useUserStore } from '../store/useUserStore';

const Navbar = ({ onMenuClick }) => {
  const { user } = useUserStore();

  return (
    <AppBar position="fixed" className="bg-indigo-500" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Box className="flex items-center gap-2 flex-grow">
          <Box className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center">
            <Typography variant="body2" className="font-bold">C</Typography>
          </Box>
          <Typography variant="h6" className="font-semibold">
            Fintree ticket
          </Typography>
        </Box>
        <Avatar className="bg-purple-500 w-9 h-9">
          {user.initial}
        </Avatar>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;