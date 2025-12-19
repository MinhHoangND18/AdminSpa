'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  alpha,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
} from '@mui/icons-material';
import api from '@/lib/api/axios';
import { useAuth } from '@/lib/hooks/useAuth';
import { User } from '@/types/user';

const PRIMARY_COLOR = '#3b82f6';
const PRIMARY_DARK = '#0f766e';

interface LoginFormValues {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object') {
    const maybeAxios = error as {
      response?: { data?: { message?: string | string[] } };
    };
    const axiosMessage = maybeAxios.response?.data?.message;
    if (axiosMessage) {
      if (Array.isArray(axiosMessage)) {
        return axiosMessage.join(', ');
      }
      return axiosMessage;
    }

    if (
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string'
    ) {
      return (error as { message: string }).message;
    }
  }

  return 'Login failed, please try again.';
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [values, setValues] = useState<LoginFormValues>({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange =
    (field: keyof LoginFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      if (error) {
        setError(null);
      }
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values.username || !values.password) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.post<LoginResponse>('/auth/login', values);
      
      const { user, token } = response.data.data;

      if (user && token) {
        login(user, token);
      } else {
        throw new Error('Login response did not contain user or token.');
      }
      
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'hidden',
      }}
    >
      {/* Background Image*/}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/images/sen1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.4)', // Dark overlay để text dễ đọc
          },
        }}
      />

      {/* Login Form Container - Floating on top */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 480,
          ml: { xs: 3, md: 8, lg: 12 },
          mr: 'auto',
        }}
      >
        {/* Logo & Title */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          {/* Lotus Icon */}
          <Box
            sx={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            <svg width="52" height="52" viewBox="0 0 48 48" fill="none">
              <path
                d="M24 8C24 8 16 16 16 24C16 28.4183 19.5817 32 24 32C28.4183 32 32 28.4183 32 24C32 16 24 8 24 8Z"
                fill={PRIMARY_COLOR}
              />
              <path
                d="M24 32C24 32 18 28 12 28C7.58172 28 4 31.5817 4 36C4 40.4183 7.58172 44 12 44C20 44 24 36 24 32Z"
                fill={PRIMARY_COLOR}
                opacity="0.7"
              />
              <path
                d="M24 32C24 32 30 28 36 28C40.4183 28 44 31.5817 44 36C44 40.4183 40.4183 44 36 44C28 44 24 36 24 32Z"
                fill={PRIMARY_COLOR}
                opacity="0.7"
              />
            </svg>
          </Box>

          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{
              color: 'white',
              mb: 1,
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            }}
          >
            Spa Manager
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              opacity: 0.95,
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
            }}
          >
            Welcome back! Please login to your account
          </Typography>
        </Box>

        {/* Login Form Card */}
        <Box
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            p: 4,
            borderRadius: 4,
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.4)',
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}
                >
                  Username *
                </Typography>
                <TextField
                  name="username"
                  value={values.username}
                  onChange={handleChange('username')}
                  autoComplete="username"
                  placeholder="Enter your username"
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: PRIMARY_COLOR, fontSize: 22 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white',
                      '&:hover fieldset': {
                        borderColor: PRIMARY_COLOR,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: PRIMARY_COLOR,
                        borderWidth: 2,
                      },
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}
                >
                  Password *
                </Typography>
                <TextField
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={values.password}
                  onChange={handleChange('password')}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: PRIMARY_COLOR, fontSize: 22 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white',
                      '&:hover fieldset': {
                        borderColor: PRIMARY_COLOR,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: PRIMARY_COLOR,
                        borderWidth: 2,
                      },
                    },
                  }}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.8,
                  bgcolor: PRIMARY_COLOR,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 2.5,
                  boxShadow: `0 6px 20px ${alpha(PRIMARY_COLOR, 0.4)}`,
                  '&:hover': {
                    bgcolor: PRIMARY_DARK,
                    boxShadow: `0 8px 24px ${alpha(PRIMARY_COLOR, 0.5)}`,
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&:disabled': {
                    bgcolor: alpha(PRIMARY_COLOR, 0.5),
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? (
                  <CircularProgress size={26} sx={{ color: 'white' }} />
                ) : (
                  'Sign In'
                )}
              </Button>
            </Stack>
          </Box>

          {/* Footer Link */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Forgot your password?{' '}
              <Box
                component="span"
                onClick={() => router.push('/forgot_password')}
                sx={{
                  color: PRIMARY_COLOR,
                  cursor: 'pointer',
                  fontWeight: 700,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Reset here
              </Box>
            </Typography>
          </Box>
        </Box>

        {/* Copyright */}
        <Typography
          variant="body2"
          sx={{
            display: 'block',
            textAlign: 'center',
            mt: 3,
            color: 'white',
            fontWeight: 500,
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
          }}
        >
          © 2024 Spa Manager. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}