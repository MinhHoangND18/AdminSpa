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
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

// --- COPY DANH SÁCH MENU TỪ SIDEBAR SANG ĐỂ MAPPING ---
// (Lưu ý: Tốt nhất bạn nên tách cái mảng này ra 1 file riêng ví dụ: constants/menu.ts rồi import vào cả 2 nơi)
const MENU_TITLES = [
  { text: 'Dashboard', path: '/dashboard' },
  { text: 'Stores', path: '/stores' },
  { text: 'User', path: '/users' },
  { text: 'Staff', path: '/staff' },
  { text: 'Customers', path: '/customers' },
  { text: 'Services', path: '/services' },
  { text: 'Bookings', path: '/bookings' },
  { text: 'Invoices', path: '/invoices' },
  { text: 'Reports', path: '/report' },
  { text: 'Settings', path: '/#' },
];

interface TopBarProps {
  selectedMenu?: string; // Đánh dấu là optional vì giờ chúng ta tự tính toán
  onDrawerToggle: () => void;
  drawerWidth: number;
}

export default function TopBar({
  selectedMenu: propSelectedMenu, // Đổi tên prop để tránh nhầm lẫn
  onDrawerToggle,
  drawerWidth,
}: TopBarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const pathname = usePathname(); // <--- 2. LẤY URL HIỆN TẠI

  // <--- 3. TÍNH TOÁN TIÊU ĐỀ DỰA TRÊN URL
  const currentTitle = useMemo(() => {
    // Tìm item nào có path khớp với đầu của pathname hiện tại
    const activeItem = MENU_TITLES.find(item =>
      item.path !== '/#' && pathname.startsWith(item.path)
    );

    // Nếu tìm thấy thì lấy text, nếu không thì fallback về Dashboard hoặc prop cũ
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
          sx={{ flexGrow: 1, fontWeight: 600, color: "#14b8a6" }}
        >
          {currentTitle} {/* <--- 4. HIỂN THỊ TITLE ĐÃ TÍNH TOÁN */}
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