'use client';

import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Paper,
    Divider,
    Stack,
    alpha,
    SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
} from '@mui/material';
import {
    AttachMoney as MoneyIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    FileDownload as DownloadIcon,
    Receipt as ReceiptIcon,
    ShoppingCart as ShoppingCartIcon,
    CreditCard as CreditCardIcon,
    AccountBalance as BankIcon,
} from '@mui/icons-material';

// Types
interface RevenueCard {
    title: string;
    value: number;
    change: string;
    trend: 'up' | 'down';
    icon: React.ElementType;
    color: string;
}

interface ServiceRevenue {
    id: number;
    name: string;
    category: string;
    quantity: number;
    revenue: number;
    percentage: number;
}

interface PaymentSummary {
    method: string;
    amount: number;
    count: number;
    percentage: number;
    icon: React.ElementType;
    color: string;
}

interface DailyRevenue {
    date: string;
    invoices: number;
    services: number;
    products: number;
    total: number;
}

const PRIMARY_COLOR = '#8b5cf6';
const SUCCESS_COLOR = '#10b981';
const DANGER_COLOR = '#ef4444';
const INFO_COLOR = '#3b82f6';
const WARNING_COLOR = '#f59e0b';

const ReportPage: React.FC = () => {
    const [dateRange, setDateRange] = useState<string>('month');
    const [selectedStore, setSelectedStore] = useState<string>('all');

    const stores = [
        { id: 'all', name: 'All Stores' },
        { id: '1', name: 'Main Store' },
        { id: '2', name: 'Branch Store' },
    ];

    const revenueCards: RevenueCard[] = [
        {
            title: 'Total Revenue',
            value: 245680000,
            change: '+12.5%',
            trend: 'up',
            icon: MoneyIcon,
            color: PRIMARY_COLOR,
        },
        {
            title: 'Service Revenue',
            value: 178430000,
            change: '+8.3%',
            trend: 'up',
            icon: ShoppingCartIcon,
            color: SUCCESS_COLOR,
        },
        {
            title: 'Product Revenue',
            value: 45250000,
            change: '+15.7%',
            trend: 'up',
            icon: ReceiptIcon,
            color: INFO_COLOR,
        },
        {
            title: 'Package Revenue',
            value: 22000000,
            change: '-2.1%',
            trend: 'down',
            icon: CreditCardIcon,
            color: WARNING_COLOR,
        },
    ];

    const serviceRevenue: ServiceRevenue[] = [
        { id: 1, name: 'Massage Therapy', category: 'Body Treatment', quantity: 145, revenue: 72500000, percentage: 29.5 },
        { id: 2, name: 'Facial Treatment', category: 'Face Care', quantity: 128, revenue: 51200000, percentage: 20.8 },
        { id: 3, name: 'Body Scrub', category: 'Body Treatment', quantity: 98, revenue: 39200000, percentage: 16.0 },
        { id: 4, name: 'Manicure & Pedicure', category: 'Nail Care', quantity: 156, revenue: 31200000, percentage: 12.7 },
        { id: 5, name: 'Hair Treatment', category: 'Hair Care', quantity: 87, revenue: 26100000, percentage: 10.6 },
        { id: 6, name: 'Waxing', category: 'Body Treatment', quantity: 112, revenue: 16800000, percentage: 6.8 },
        { id: 7, name: 'Eyelash Extension', category: 'Eye Care', quantity: 45, revenue: 8680000, percentage: 3.6 },
    ];

    const paymentSummary: PaymentSummary[] = [
        { method: 'Cash', amount: 98500000, count: 234, percentage: 40.1, icon: MoneyIcon, color: SUCCESS_COLOR },
        { method: 'Card', amount: 73950000, count: 189, percentage: 30.1, icon: CreditCardIcon, color: INFO_COLOR },
        { method: 'Bank Transfer', amount: 52300000, count: 145, percentage: 21.3, icon: BankIcon, color: PRIMARY_COLOR },
        { method: 'MoMo', amount: 15680000, count: 87, percentage: 6.4, icon: CreditCardIcon, color: '#d91a60' },
        { method: 'VNPay', amount: 5250000, count: 34, percentage: 2.1, icon: CreditCardIcon, color: '#0066b2' },
    ];

    const dailyRevenue: DailyRevenue[] = [
        { date: '2024-11-14', invoices: 45, services: 8950000, products: 1250000, total: 10200000 },
        { date: '2024-11-13', invoices: 52, services: 10340000, products: 1680000, total: 12020000 },
        { date: '2024-11-12', invoices: 48, services: 9560000, products: 1420000, total: 10980000 },
        { date: '2024-11-11', invoices: 56, services: 11200000, products: 1890000, total: 13090000 },
        { date: '2024-11-10', invoices: 43, services: 8570000, products: 1120000, total: 9690000 },
    ];

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const RevenueCard: React.FC<{ item: RevenueCard }> = ({ item }) => {
        const Icon = item.icon;
        return (
            <Card
                elevation={0}
                sx={{
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 3,
                    transition: 'all 0.3s',
                    '&:hover': {
                        boxShadow: `0 8px 24px ${alpha(item.color, 0.15)}`,
                        transform: 'translateY(-4px)',
                    },
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                                {item.title}
                            </Typography>
                            <Typography variant="h4" fontWeight={700} mb={2}>
                                {formatCurrency(item.value)}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {item.trend === 'up' ? (
                                    <TrendingUpIcon sx={{ fontSize: 18, color: SUCCESS_COLOR }} />
                                ) : (
                                    <TrendingDownIcon sx={{ fontSize: 18, color: DANGER_COLOR }} />
                                )}
                                <Typography
                                    variant="body2"
                                    fontWeight={700}
                                    sx={{ color: item.trend === 'up' ? SUCCESS_COLOR : DANGER_COLOR }}
                                >
                                    {item.change}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    vs last period
                                </Typography>
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: 2,
                                bgcolor: alpha(item.color, 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Icon sx={{ fontSize: 32, color: item.color }} />
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', p: 3 }}>
            <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
                {/* Header */}
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h3" fontWeight={700} gutterBottom>
                            Revenue Reports
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Track your revenue and financial performance
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        sx={{
                            bgcolor: PRIMARY_COLOR,
                            px: 3,
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: 16,
                            fontWeight: 600,
                            boxShadow: `0 4px 14px ${alpha(PRIMARY_COLOR, 0.3)}`,
                            '&:hover': {
                                bgcolor: '#7c3aed',
                            },
                        }}
                    >
                        Export Report
                    </Button>
                </Box>

                {/* Filters */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 4,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'grey.200',
                    }}
                >
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Date Range</InputLabel>
                                <Select
                                    value={dateRange}
                                    label="Date Range"
                                    onChange={(e: SelectChangeEvent) => setDateRange(e.target.value)}
                                >
                                    <MenuItem value="today">Today</MenuItem>
                                    <MenuItem value="yesterday">Yesterday</MenuItem>
                                    <MenuItem value="week">This Week</MenuItem>
                                    <MenuItem value="month">This Month</MenuItem>
                                    <MenuItem value="quarter">This Quarter</MenuItem>
                                    <MenuItem value="year">This Year</MenuItem>
                                    <MenuItem value="custom">Custom Range</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Store</InputLabel>
                                <Select
                                    value={selectedStore}
                                    label="Store"
                                    onChange={(e: SelectChangeEvent) => setSelectedStore(e.target.value)}
                                >
                                    {stores.map((store) => (
                                        <MenuItem key={store.id} value={store.id}>
                                            {store.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Revenue Overview Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {revenueCards.map((card, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                            <RevenueCard item={card} />
                        </Grid>
                    ))}
                </Grid>

                <Grid container spacing={3}>
                    {/* Service Revenue Table */}
                      <Grid size={{xs:12, lg: 8}}>
                        <Card
                            elevation={0}
                            sx={{
                                border: '1px solid',
                                borderColor: 'grey.200',
                                borderRadius: 3,
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={700} mb={3}>
                                    Revenue by Service
                                </Typography>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 700 }}>Service Name</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 700 }}>Quantity</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>Revenue</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 700 }}>%</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {serviceRevenue.map((service) => (
                                                <TableRow key={service.id} hover>
                                                    <TableCell sx={{ fontWeight: 600 }}>{service.name}</TableCell>
                                                    <TableCell>
                                                        <Chip label={service.category} size="small" sx={{ bgcolor: 'grey.100' }} />
                                                    </TableCell>
                                                    <TableCell align="center">{service.quantity}</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700, color: PRIMARY_COLOR }}>
                                                        {formatCurrency(service.revenue)}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={`${service.percentage}%`}
                                                            size="small"
                                                            sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.1), color: PRIMARY_COLOR, fontWeight: 700 }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Payment Summary */}
                      <Grid size={{xs:12, lg: 4}}>
                        <Card
                            elevation={0}
                            sx={{
                                height: '100%',
                                border: '1px solid',
                                borderColor: 'grey.200',
                                borderRadius: 3,
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={700} mb={3}>
                                    Payment Methods
                                </Typography>
                                <Stack spacing={2}>
                                    {paymentSummary.map((payment, index) => {
                                        const Icon = payment.icon;
                                        return (
                                            <Paper
                                                key={index}
                                                elevation={0}
                                                sx={{
                                                    p: 2.5,
                                                    bgcolor: alpha(payment.color, 0.05),
                                                    borderRadius: 2,
                                                    border: '1px solid',
                                                    borderColor: alpha(payment.color, 0.2),
                                                    transition: 'all 0.3s',
                                                    '&:hover': {
                                                        borderColor: payment.color,
                                                        transform: 'translateX(4px)',
                                                    },
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                                                    <Box
                                                        sx={{
                                                            width: 40,
                                                            height: 40,
                                                            borderRadius: 2,
                                                            bgcolor: alpha(payment.color, 0.15),
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <Icon sx={{ fontSize: 24, color: payment.color }} />
                                                    </Box>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {payment.method}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {payment.count} transactions
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        label={`${payment.percentage}%`}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: payment.color,
                                                            color: 'white',
                                                            fontWeight: 700,
                                                        }}
                                                    />
                                                </Box>
                                                <Divider sx={{ my: 1.5 }} />
                                                <Typography variant="h6" fontWeight={700} sx={{ color: payment.color }}>
                                                    {formatCurrency(payment.amount)}
                                                </Typography>
                                            </Paper>
                                        );
                                    })}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Daily Revenue Table */}
                      <Grid size={{xs:12 }}>
                        <Card
                            elevation={0}
                            sx={{
                                border: '1px solid',
                                borderColor: 'grey.200',
                                borderRadius: 3,
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={700} mb={3}>
                                    Daily Revenue Breakdown
                                </Typography>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 700 }}>Invoices</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>Services</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>Products</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>Total Revenue</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {dailyRevenue.map((day, index) => (
                                                <TableRow key={index} hover>
                                                    <TableCell sx={{ fontWeight: 600 }}>
                                                        {new Date(day.date).toLocaleDateString('vi-VN', {
                                                            weekday: 'short',
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip label={day.invoices} size="small" sx={{ bgcolor: 'grey.100', fontWeight: 600 }} />
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ color: SUCCESS_COLOR, fontWeight: 600 }}>
                                                        {formatCurrency(day.services)}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ color: INFO_COLOR, fontWeight: 600 }}>
                                                        {formatCurrency(day.products)}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700, color: PRIMARY_COLOR, fontSize: 16 }}>
                                                        {formatCurrency(day.total)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.05) }}>
                                                <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>TOTAL</TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={dailyRevenue.reduce((sum, day) => sum + day.invoices, 0)}
                                                        sx={{ bgcolor: PRIMARY_COLOR, color: 'white', fontWeight: 700 }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700, fontSize: 16 }}>
                                                    {formatCurrency(dailyRevenue.reduce((sum, day) => sum + day.services, 0))}
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700, fontSize: 16 }}>
                                                    {formatCurrency(dailyRevenue.reduce((sum, day) => sum + day.products, 0))}
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700, fontSize: 18, color: PRIMARY_COLOR }}>
                                                    {formatCurrency(dailyRevenue.reduce((sum, day) => sum + day.total, 0))}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default ReportPage;