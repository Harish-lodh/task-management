import React, { useState } from 'react';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box className="flex min-h-screen bg-white">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} />
      <Box 
        component="main" 
        className="flex-grow transition-all duration-300"
        sx={{ mt: 8, ml: sidebarOpen ? '240px' : 0 }}
      >
        <Dashboard />
      </Box>
    </Box>
  );
}

export default App;