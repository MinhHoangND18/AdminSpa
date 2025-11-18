'use client';

import React, { useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './Topbar';

const drawerWidth = 240;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('Dashboard');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuSelect = (menuText: string) => {
    setSelectedMenu(menuText);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <TopBar
        selectedMenu={selectedMenu}
        onDrawerToggle={handleDrawerToggle}
        drawerWidth={drawerWidth}
      />
      
      <Sidebar
        mobileOpen={mobileOpen}
        onDrawerToggle={handleDrawerToggle}
        selectedMenu={selectedMenu}
        onMenuSelect={handleMenuSelect}
        drawerWidth={drawerWidth}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}