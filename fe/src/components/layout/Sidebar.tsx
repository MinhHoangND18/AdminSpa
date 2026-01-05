'use client';

import React, { useState, useEffect } from 'react'; //
import { usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  alpha,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Store as StoreIcon,
  People as PeopleIcon,
  PersonOutline as PersonOutlineIcon,
  EventNote as EventNoteIcon,
  Receipt as ReceiptIcon,
  LocalOffer as LocalOfferIcon,

  AccountBox as AccountBoxIcon,
  Category as CategoryOutlinedIcon,
} from '@mui/icons-material';
import Link from 'next/link';

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Stores', icon: <StoreIcon />, path: '/stores' },
  { text: 'User', icon: <AccountBoxIcon />, path: '/users' },
  { text: 'Staff', icon: <PeopleIcon />, path: '/staff' },
  { text: 'Customers', icon: <PersonOutlineIcon />, path: '/customers' },
  { text: 'Category', icon: <CategoryOutlinedIcon />, path: '/category' },
  { text: 'Services', icon: <LocalOfferIcon />, path: '/services' },
  { text: 'Bookings', icon: <EventNoteIcon />, path: '/bookings' },
  { text: 'Invoices', icon: <ReceiptIcon />, path: '/invoices' },
];

interface SidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  selectedMenu: string;
  onMenuSelect: (menuText: string) => void;
  drawerWidth: number;
}


const PRIMARY_COLOR = '#3b82f6';
// const PRIMARY_LIGHT = '#60a5fa';
const PRIMARY_DARK = '#1e40af';

export default function Sidebar({
  mobileOpen,
  onDrawerToggle,

  onMenuSelect,
  drawerWidth,
}: SidebarProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); 

    return () => clearTimeout(timer);
  }, [pathname]);

  const isSelected = (itemPath: string) => {
    if (itemPath === '/dashboard' && pathname === '/dashboard') return true;
    if (itemPath !== '/#' && pathname.startsWith(itemPath)) return true;
    return false;
  };

  const handleLinkClick = (path: string) => {
    if (path !== pathname && !isSelected(path)) {
      setIsLoading(true);
    }

  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2.5 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: PRIMARY_COLOR }}>
          💆 Spa Manager
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Comprehensive management
        </Typography>
      </Box>
      <Divider />
      <List sx={{ flex: 1, px: 1.5, pt: 2 }}>
        {menuItems.map((item) => {
          const active = isSelected(item.path);

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <Link
                href={item.path}
                style={{ textDecoration: 'none', width: '100%' }}
                onClick={() => handleLinkClick(item.path)}
              >
                <ListItemButton
                  selected={active}
                  onClick={() => onMenuSelect(item.text)}
                  sx={{
                    borderRadius: 0,
                    '&.Mui-selected': {
                      bgcolor: PRIMARY_COLOR,
                      color: 'white',
                      '&:hover': {
                        bgcolor: PRIMARY_DARK,
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                    '&:hover': {
                      bgcolor: alpha(PRIMARY_COLOR, 0.08),
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: active ? 'white' : PRIMARY_COLOR
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    sx={{
                      color: active ? 'white' : PRIMARY_COLOR
                    }}
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: active ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </Link>
            </ListItem>
          )
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Paper sx={{
          p: 2,
          bgcolor: alpha(PRIMARY_COLOR, 0.08),
          border: `1px solid ${alpha(PRIMARY_COLOR, 0.2)}`
        }}>
          <Typography variant="body2" fontWeight="medium" gutterBottom sx={{ color: PRIMARY_COLOR }}>
            📊 Quick Statistics
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Today: 24 appointments | 18 completed
          </Typography>
        </Paper>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Component Loading toàn màn hình */}
      <Backdrop
        sx={{
          color: PRIMARY_COLOR,
          zIndex: (theme) => theme.zIndex.drawer + 999, 
          bgcolor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
        open={isLoading}
      >
        <CircularProgress color="inherit" size={40} thickness={4} />
        <Typography variant="h6" color="text.secondary"></Typography>
      </Backdrop>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: `1px solid ${alpha(PRIMARY_COLOR, 0.12)}`,
            bgcolor: '#fefefe',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}