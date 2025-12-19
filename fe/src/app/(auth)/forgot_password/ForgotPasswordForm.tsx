'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Typography,
    TextField,
    Button,
    Stack,
    Alert,
    CircularProgress,
    InputAdornment,
    alpha,
} from '@mui/material';
import {
    Email,
    ArrowBack,
} from '@mui/icons-material';
import api from '@/lib/api/axios';

// Màu chủ đạo
const PRIMARY_COLOR = '#3b82f6';
const PRIMARY_DARK = '#0f766e';
const SUCCESS_COLOR = '#10b981';

interface ForgotPasswordFormValues {
    email: string;
}

interface ForgotPasswordResponse {
    message?: string;
}

const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object') {
        const maybeAxios = error as { response?: { data?: { message?: string } } };
        const axiosMessage = maybeAxios.response?.data?.message;
        if (axiosMessage) return axiosMessage;

        if ('message' in error && typeof (error as { message?: unknown }).message === 'string') {
            return (error as { message: string }).message;
        }
    }

    return 'Failed to send reset email, please try again.';
};

export default function ForgotPasswordForm() {
    const router = useRouter();

    const [values, setValues] = useState<ForgotPasswordFormValues>({
        email: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValues({ email: event.target.value });
        if (error) {
            setError(null);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!values.email) {
            setError('Please enter your email address.');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(values.email)) {
            setError('Please enter a valid email address.');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await api.post<ForgotPasswordResponse>('/auth/forgot-password', values);
            setSuccess(true);
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        router.push('/login');
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
                        bgcolor: 'rgba(0, 0, 0, 0.4)',
                    },
                }}
            />

            {/* Forgot Password Form Container */}
            <Box
                sx={{
                    position: 'relative',
                    zIndex: 10,
                    width: '100%',
                    maxWidth: 480,
                    ml: { xs: 3, md: 8, lg: 12 }, 
                    mr: 'auto', 
                    mx: 3,
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
                        Forgot Password?
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'white',
                            opacity: 0.95,
                            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        No worries, we will send you reset instructions
                    </Typography>
                </Box>

                {/* Form Card */}
                <Box
                    sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(10px)',
                        p: 4,
                        borderRadius: 4,
                        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.4)',
                    }}
                >
                    {success ? (
                        // Success Message
                        <Box sx={{ textAlign: 'center' }}>
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    bgcolor: alpha(SUCCESS_COLOR, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto',
                                    mb: 3,
                                }}
                            >
                                <Email sx={{ fontSize: 40, color: SUCCESS_COLOR }} />
                            </Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                Check your email
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                We have sent password reset instructions to{' '}
                                <Box component="span" sx={{ fontWeight: 600, color: PRIMARY_COLOR }}>
                                    {values.email}
                                </Box>
                            </Typography>
                            <Alert severity="success" sx={{ mb: 3 }}>
                                Password reset link has been sent successfully!
                            </Alert>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Didnot receive the email? Check your spam folder or try again.
                            </Typography>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={handleBackToLogin}
                                startIcon={<ArrowBack />}
                                sx={{
                                    py: 1.5,
                                    borderColor: PRIMARY_COLOR,
                                    color: PRIMARY_COLOR,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    borderRadius: 2.5,
                                    '&:hover': {
                                        borderColor: PRIMARY_DARK,
                                        bgcolor: alpha(PRIMARY_COLOR, 0.05),
                                    },
                                }}
                            >
                                Back to Login
                            </Button>
                        </Box>
                    ) : (
                        // Form
                        <>
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
                                            Email Address *
                                        </Typography>
                                        <TextField
                                            name="email"
                                            type="email"
                                            value={values.email}
                                            onChange={handleChange}
                                            autoComplete="email"
                                            placeholder="Enter your email address"
                                            required
                                            fullWidth
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Email sx={{ color: PRIMARY_COLOR, fontSize: 22 }} />
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
                                            'Send Reset Link'
                                        )}
                                    </Button>

                                    <Button
                                        fullWidth
                                        variant="text"
                                        onClick={handleBackToLogin}
                                        startIcon={<ArrowBack />}
                                        sx={{
                                            py: 1.5,
                                            color: PRIMARY_COLOR,
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            '&:hover': {
                                                bgcolor: alpha(PRIMARY_COLOR, 0.05),
                                            },
                                        }}
                                    >
                                        Back to Login
                                    </Button>
                                </Stack>
                            </Box>
                        </>
                    )}
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