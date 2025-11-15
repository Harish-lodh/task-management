import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Typography,
} from "@mui/material";
import {
  Home as HomeIcon,
  Inbox as InboxIcon,
  ViewKanban as BoardIcon,
} from "@mui/icons-material";

const Sidebar = ({ open }) => {
  const [selectedMenu, setSelectedMenu] = useState("board");
  const drawerWidth = 240;

  const menuItems = [
    { id: "home", label: "Home", icon: <HomeIcon /> },
    { id: "inbox", label: "Inbox", icon: <InboxIcon /> },
    { id: "board", label: "Board", icon: <BoardIcon /> }, // your main tickets board
  ];

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          mt: 8,
          borderRight: "1px solid rgba(0,0,0,0.1)",
        },
      }}
    >
      <Box className="overflow-auto p-4">
        <Typography
          variant="h6"
          className="mb-4 font-semibold text-gray-700 px-1"
        >
          Ticket Manager
        </Typography>

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
      </Box>
    </Drawer>
  );
};

export default Sidebar;
