// components/UserProfile.tsx
'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  Button,
  Divider,
  Stack,
} from '@mui/material';
import { Edit, Security, Store, Person } from '@mui/icons-material';
import { User } from '@/types/user';

export const UserProfile: React.FC = () => {
  const { user } = useAuth() as unknown as { user: User | null };

  if (!user) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'error';
      case 'store_admin': return 'secondary';
      case 'manager': return 'info';
      case 'receptionist': return 'warning';
      case 'staff': return 'success';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              fontSize: 32,
              fontWeight: 'bold',
            }}
          >
            {user.username.charAt(0).toUpperCase()}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {user.username}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
              <Chip
                icon={<Security />}
                label={user.role.replace('_', ' ').toUpperCase()}
                color={getRoleColor(user.role)}
                size="small"
              />
              {user.is_locked && (
                <Chip label="LOCKED" color="error" size="small" />
              )}
            </Box>
            {user.email && (
              <Typography color="text.secondary">
                {user.email}
              </Typography>
            )}
          </Box>
          
          <Button startIcon={<Edit />} variant="outlined">
            Edit Profile
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Staff Profile
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {user.staff_id ? 'Linked' : 'Not Linked'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Store
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {user.store_id ? 'Assigned' : 'Not Assigned'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Last Login
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {user.last_login 
                ? new Date(user.last_login).toLocaleString()
                : 'Never'
              }
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Status
            </Typography>
            <Chip
              label={user.is_active ? 'ACTIVE' : 'INACTIVE'}
              color={user.is_active ? 'success' : 'default'}
              size="small"
            />
          </Box>

          {user.login_attempts > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Failed Logins
              </Typography>
              <Chip
                label={user.login_attempts.toString()}
                color="warning"
                size="small"
              />
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};