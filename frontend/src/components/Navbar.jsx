import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Badge,
  InputBase,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Typography,
} from "@mui/material";

import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

import { useUserStore } from "../store/useUserStore";
import { useThemeStore } from "../store/useThemeStore";

const Navbar = () => {
  const { user } = useUserStore();
  const { darkMode } = useThemeStore();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: darkMode
          ? "rgba(30,41,59,0.85)"
          : "rgba(255,255,255,0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: darkMode
          ? "1px solid rgba(255,255,255,0.1)"
          : "1px solid rgba(0,0,0,0.06)",
        zIndex: (theme) => theme.zIndex.drawer + 2,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>

        {/* Left side empty (logo is now in sidebar) */}
        <Box />

        {/* Search Bar */}
        <Paper
          elevation={0}
          sx={{
            alignItems: "center",
            px: 2,
            py: 0.5,
            width: "300px",
            borderRadius: "10px",
            display: { xs: "none", md: "flex" },
            backgroundColor: darkMode
              ? "rgba(255,255,255,0.12)"
              : "rgba(0,0,0,0.05)",
          }}
        >
          <InputBase
            placeholder="Search tasks..."
            sx={{
              width: "100%",
              fontSize: 14,
              color: darkMode ? "#fff" : "#000",
            }}
          />
        </Paper>

        {/* Right side */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Notification */}
          <Badge badgeContent={3} color="error" sx={{ cursor: "pointer" }}>
            <NotificationsOutlinedIcon
              sx={{
                fontSize: 26,
                color: darkMode ? "#e2e8f0" : "#334155",
                "&:hover": { transform: "scale(1.1)" },
                transition: "0.2s",
              }}
            />
          </Badge>

          {/* User */}
          <Box
            sx={{ position: "relative", cursor: "pointer" }}
            onClick={handleMenuOpen}
          >
            {/* Status Dot */}
            <Box
              sx={{
                position: "absolute",
                bottom: 1,
                right: 1,
                width: 10,
                height: 10,
                backgroundColor: "#22c55e",
                borderRadius: "50%",
                border: "2px solid white",
                zIndex: 10,
              }}
            />
            <AccountCircleOutlinedIcon
              sx={{
                fontSize: 38,
                color: darkMode ? "#e2e8f0" : "#334155",
              }}
            />
          </Box>
          <Typography variant="h6" className="font-semibold">
            Fintree ticket
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
