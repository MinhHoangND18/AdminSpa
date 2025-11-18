'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

interface TopBarProps {
  selectedMenu: string;
  onDrawerToggle: () => void;
  drawerWidth: number;
}

export default function TopBar({
  selectedMenu,
  onDrawerToggle,
  drawerWidth,
}: TopBarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('token'); 
      // await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
    } finally {
      router.replace('/login');
      handleClose();
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        bgcolor: 'white',
        color: 'text.primary',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ flexGrow: 1, fontWeight: 600, color: "#14b8a6" }}
        >
          {selectedMenu}
        </Typography>

        <Box display="flex" gap={1} alignItems="center">
          <Chip
            label="Super Admin"
            size="small"
            color="primary"
            sx={{ fontWeight: 500, bgcolor: '#14b8a6' }}
          />

          <IconButton sx={{ color: '#14b8a6' }}>
            <NotificationsIcon />
          </IconButton>

          <IconButton onClick={handleMenu} sx={{ ml: 1 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: '#14b8a6' }}>
              A
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleClose}>Profile </MenuItem>
            <MenuItem onClick={handleClose}>Setting</MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Log Out</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}