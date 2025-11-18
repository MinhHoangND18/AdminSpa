'use client';

import React from 'react';
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
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Store as StoreIcon,
  People as PeopleIcon,
  PersonOutline as PersonOutlineIcon,
  EventNote as EventNoteIcon,
  Receipt as ReceiptIcon,
  LocalOffer as LocalOfferIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  AccountBox as AccountBoxIcon,
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
  { text: 'Services', icon: <LocalOfferIcon />, path: '/services' },
  { text: 'Bookings', icon: <EventNoteIcon />, path: '/bookings' },
  { text: 'Invoices', icon: <ReceiptIcon />, path: '/invoices' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/report' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/#' },
];

interface SidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  selectedMenu: string;
  onMenuSelect: (menuText: string) => void;
  drawerWidth: number;
}

//Teal/Cyan
const PRIMARY_COLOR = '#14b8a6'; 
const PRIMARY_LIGHT = '#2dd4bf';
const PRIMARY_DARK = '#0f766e'; 
const ACCENT_COLOR = '#ec4899'; 

// Purple
// const PRIMARY_COLOR = '#a855f7';
// const PRIMARY_LIGHT = '#c084fc';
// const PRIMARY_DARK = '#7e22ce';

// Blue 
// const PRIMARY_COLOR = '#3b82f6';
// const PRIMARY_LIGHT = '#60a5fa';
// const PRIMARY_DARK = '#1e40af';

// Green 
// const PRIMARY_COLOR = '#10b981';
// const PRIMARY_LIGHT = '#34d399';
// const PRIMARY_DARK = '#047857';

export default function Sidebar({
  mobileOpen,
  onDrawerToggle,
  selectedMenu,
  onMenuSelect,
  drawerWidth,
}: SidebarProps) {
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
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <Link href={item.path} style={{ textDecoration: 'none', width: '100%' }}>
              <ListItemButton
                selected={selectedMenu === item.text}
                onClick={() => onMenuSelect(item.text)}
                sx={{
                  borderRadius: 2,
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
                    color: selectedMenu === item.text ? 'white' : PRIMARY_COLOR 
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  sx={{ 
                    color: selectedMenu === item.text ? 'white' : PRIMARY_COLOR 
                  }}
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: selectedMenu === item.text ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
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