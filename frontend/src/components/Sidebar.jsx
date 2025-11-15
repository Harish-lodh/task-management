import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  IconButton,
  Typography,
  Divider,
} from '@mui/material';
import {
  Home as HomeIcon,
  Inbox as InboxIcon,
  Add as AddIcon,
  FolderOpen as ProjectIcon,
} from '@mui/icons-material';
import { useUserStore } from '../store/useUserStore';

const Sidebar = ({ open }) => {
  const { projects, currentProject, setCurrentProject } = useUserStore();
  const [selectedMenu, setSelectedMenu] = useState('board');

  const drawerWidth = 240;

  const menuItems = [
    { id: 'home', label: 'Home', icon: <HomeIcon /> },
    { id: 'inbox', label: 'Inbox', icon: <InboxIcon /> },
  ];

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          mt: 8,
          borderRight: '1px solid rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box className="overflow-auto p-4">
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.id}
              selected={selectedMenu === item.id}
              onClick={() => setSelectedMenu(item.id)}
              className="rounded mb-1"
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>

        <Divider className="my-4" />

        <Box className="flex items-center justify-between mb-2">
          <Typography variant="subtitle2" className="text-gray-500 px-4">
            Spaces
          </Typography>
          <IconButton size="small">
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>

        <List>
          <ListItem>
            <ListItemIcon>
              <ProjectIcon className="text-indigo-500" />
            </ListItemIcon>
            <ListItemText primary="Team Space" />
          </ListItem>

          <Box className="pl-8">
            <ListItem>
              <ListItemText primary="Projects" />
            </ListItem>
            {projects.map((project) => (
              <ListItemButton
                key={project.id}
                selected={currentProject?.id === project.id}
                onClick={() => setCurrentProject(project)}
                className="rounded mb-1 pl-8"
              >
                <ListItemText 
                  primary={project.name} 
                  secondary={project.taskCount}
                />
              </ListItemButton>
            ))}
          </Box>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;