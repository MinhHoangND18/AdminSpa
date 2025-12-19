'use client';

import React, { useState, useMemo } from 'react'; // Thêm useMemo để tối ưu
import { useRouter, usePathname } from 'next/navigation'; // <--- 1. IMPORT usePathname
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
import { useAuth } from '@/lib/hooks/useAuth';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';


const MENU_TITLES = [
  { text: 'Dashboard', path: '/dashboard' },
  { text: 'Stores', path: '/stores' },
  { text: 'Users', path: '/users' },
  { text: 'Staff', path: '/staff' },
  { text: 'Customers', path: '/customers' },
  { text: 'Services', path: '/services' },
  { text: 'Bookings', path: '/bookings' },
  { text: 'Invoices', path: '/invoices' },
  { text: 'Reports', path: '/report' },
  { text: 'Settings', path: '/#' },
];

interface TopBarProps {
  selectedMenu?: string; 
  onDrawerToggle: () => void;
  drawerWidth: number;
}

export default function TopBar({
  selectedMenu: propSelectedMenu, 
  onDrawerToggle,
  drawerWidth,
}: TopBarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();


 
  const currentTitle = useMemo(() => {
   
    const activeItem = MENU_TITLES.find(item =>
      item.path !== '/#' && pathname.startsWith(item.path)
    );

 
    return activeItem ? activeItem.text : (propSelectedMenu || 'Dashboard');
  }, [pathname, propSelectedMenu]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
    handleClose();
    router.replace('/login');
    router.refresh();
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
          sx={{ flexGrow: 1, fontWeight: 600, color: "#1957bd" }}
        >
          {currentTitle} 
        </Typography>

        {!loading && user && (
          <Box display="flex" gap={1} alignItems="center">
            <Chip
              label={user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              size="small"
              color="primary"
              sx={{ fontWeight: 500, bgcolor: '#1957bd' }}
            />

            <IconButton sx={{ color: '#1957bd' }}>
              <NotificationsIcon />
            </IconButton>

            <IconButton onClick={handleMenu} sx={{ ml: 1 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: '#1957bd' }}>
                {(user.username || 'A').charAt(0).toUpperCase()}
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
        )}
      </Toolbar>
    </AppBar>
  );
}