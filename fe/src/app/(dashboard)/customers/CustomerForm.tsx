'use client';

import React, { useState } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    TextField,
    InputAdornment,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    alpha,
    Avatar,
    Divider,
    Alert,
    Select,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Tooltip,
    LinearProgress,
    Badge,
} from '@mui/material';
import {
    Add,
    Search,
    MoreVert,
    Edit,
    Delete,
    Visibility,
    PersonAdd,
    Phone,
    Email,
    Store as StoreIcon,
    CheckCircle,
    Cancel,
    Block,
    Star,
    CalendarToday,
    AttachMoney,
    Spa,
    FilterList,
    TrendingUp,
    PersonOutline,
} from '@mui/icons-material';

// Colors
const PRIMARY_COLOR = '#14b8a6';
const PRIMARY_DARK = '#0f766e';
const SUCCESS_COLOR = '#10b981';
const ERROR_COLOR = '#ef4444';
const WARNING_COLOR = '#f59e0b';
const INFO_COLOR = '#3b82f6';
const PURPLE_COLOR = '#a855f7';

// Types
type Gender = 'male' | 'female' | 'other';
type CustomerType = 'new' | 'regular' | 'vip';
type Status = 'active' | 'inactive' | 'blocked';

interface Customer {
    id: number;
    full_name: string;
    phone: string;
    email: string | null;
    gender: Gender;
    birthday: string | null;
    address: string | null;
    avatar: string | null;
    customer_type: CustomerType;
    total_spent: number;
    total_visits: number;
    last_visit_date: string | null;
    notes: string | null;
    store_id: number | null;
    store_name?: string;
    status: Status;
    created_at: string;
    updated_at: string;
}

interface CustomerFormData {
    full_name: string;
    phone: string;
    email: string;
    gender: Gender;
    birthday: string;
    address: string;
    customer_type: CustomerType;
    notes: string;
    store_id: string;
    status: Status;
}

// Mock Data
const mockCustomers: Customer[] = [
    {
        id: 1,
        full_name: 'Nguyen Thi Lan',
        phone: '+84 901 234 567',
        email: 'lan.nguyen@email.com',
        gender: 'female',
        birthday: '1990-05-15',
        address: '123 Nguyen Hue, District 1, HCMC',
        avatar: null,
        customer_type: 'vip',
        total_spent: 25000000,
        total_visits: 45,
        last_visit_date: '2024-11-10',
        notes: 'Prefers aromatherapy massage',
        store_id: 1,
        store_name: 'Spa Harmony Downtown',
        status: 'active',
        created_at: '2023-01-15T08:00:00',
        updated_at: '2024-11-10T14:30:00',
    },
    {
        id: 2,
        full_name: 'Tran Van Minh',
        phone: '+84 902 345 678',
        email: 'minh.tran@email.com',
        gender: 'male',
        birthday: '1985-08-20',
        address: '456 Le Loi, District 3, HCMC',
        avatar: null,
        customer_type: 'regular',
        total_spent: 12000000,
        total_visits: 28,
        last_visit_date: '2024-11-08',
        notes: null,
        store_id: 1,
        store_name: 'Spa Harmony Downtown',
        status: 'active',
        created_at: '2023-03-20T10:00:00',
        updated_at: '2024-11-08T16:00:00',
    },
    {
        id: 3,
        full_name: 'Le Thi Hoa',
        phone: '+84 903 456 789',
        email: null,
        gender: 'female',
        birthday: '1995-12-10',
        address: '789 Tran Hung Dao, District 5, HCMC',
        avatar: null,
        customer_type: 'new',
        total_spent: 850000,
        total_visits: 2,
        last_visit_date: '2024-11-05',
        notes: 'First-time customer, referred by friend',
        store_id: 2,
        store_name: 'Spa Serenity Garden',
        status: 'active',
        created_at: '2024-10-28T09:30:00',
        updated_at: '2024-11-05T11:00:00',
    },
    {
        id: 4,
        full_name: 'Pham Van Tuan',
        phone: '+84 904 567 890',
        email: 'tuan.pham@email.com',
        gender: 'male',
        birthday: '1988-03-25',
        address: null,
        avatar: null,
        customer_type: 'regular',
        total_spent: 8500000,
        total_visits: 15,
        last_visit_date: '2024-09-20',
        notes: null,
        store_id: 2,
        store_name: 'Spa Serenity Garden',
        status: 'inactive',
        created_at: '2023-06-10T14:00:00',
        updated_at: '2024-09-20T18:00:00',
    },
];

const getStatusColor = (status: Status) => {
    switch (status) {
        case 'active':
            return SUCCESS_COLOR;
        case 'inactive':
            return WARNING_COLOR;
        case 'blocked':
            return ERROR_COLOR;
        default:
            return PRIMARY_COLOR;
    }
};

const getCustomerTypeColor = (type: CustomerType) => {
    switch (type) {
        case 'vip':
            return PURPLE_COLOR;
        case 'regular':
            return INFO_COLOR;
        case 'new':
            return SUCCESS_COLOR;
        default:
            return PRIMARY_COLOR;
    }
};

const getStatusLabel = (status: Status) => {
    switch (status) {
        case 'active':
            return 'Active';
        case 'inactive':
            return 'Inactive';
        case 'blocked':
            return 'Blocked';
        default:
            return status;
    }
};

const getCustomerTypeLabel = (type: CustomerType) => {
    switch (type) {
        case 'vip':
            return 'VIP';
        case 'regular':
            return 'Regular';
        case 'new':
            return 'New';
        default:
            return type;
    }
};

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<CustomerType | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const initialFormData: CustomerFormData = {
        full_name: '',
        phone: '',
        email: '',
        gender: 'male',
        birthday: '',
        address: '',
        customer_type: 'new',
        notes: '',
        store_id: '',
        status: 'active',
    };

    const [formData, setFormData] = useState<CustomerFormData>(initialFormData);

    // Filter and search
    const filteredCustomers = customers.filter((c) => {
        const matchesSearch =
            c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.phone.includes(searchQuery) ||
            c.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || c.customer_type === filterType;
        const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    // Pagination
    const paginatedCustomers = filteredCustomers.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // Stats
    const stats = {
        total: customers.length,
        new: customers.filter((c) => c.customer_type === 'new').length,
        regular: customers.filter((c) => c.customer_type === 'regular').length,
        vip: customers.filter((c) => c.customer_type === 'vip').length,
        totalRevenue: customers.reduce((sum, c) => sum + c.total_spent, 0),
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, customer: Customer) => {
        setAnchorEl(event.currentTarget);
        setSelectedCustomer(customer);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleAddNew = () => {
        setDialogMode('add');
        setFormData(initialFormData);
        setOpenDialog(true);
    };

    const handleEdit = () => {
        if (selectedCustomer) {
            setDialogMode('edit');
            setFormData({
                full_name: selectedCustomer.full_name,
                phone: selectedCustomer.phone,
                email: selectedCustomer.email || '',
                gender: selectedCustomer.gender,
                birthday: selectedCustomer.birthday || '',
                address: selectedCustomer.address || '',
                customer_type: selectedCustomer.customer_type,
                notes: selectedCustomer.notes || '',
                store_id: selectedCustomer.store_id?.toString() || '',
                status: selectedCustomer.status,
            });
            setOpenDialog(true);
        }
        handleMenuClose();
    };

    const handleView = () => {
        if (selectedCustomer) {
            setDialogMode('view');
            setOpenDialog(true);
        }
        handleMenuClose();
    };

    const handleDelete = () => {
        setDeleteConfirmOpen(true);
        handleMenuClose();
    };

    const confirmDelete = () => {
        if (selectedCustomer) {
            setCustomers(customers.filter((c) => c.id !== selectedCustomer.id));
            setDeleteConfirmOpen(false);
            setSelectedCustomer(null);
        }
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setFormData(initialFormData);
    };

    const handleFormChange = (field: keyof CustomerFormData) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }
    ) => {
        setFormData({ ...formData, [field]: event.target.value });
    };

    const handleSubmit = () => {
        if (dialogMode === 'add') {
            const newCustomer: Customer = {
                id: customers.length + 1,
                ...formData,
                email: formData.email || null,
                birthday: formData.birthday || null,
                address: formData.address || null,
                avatar: null,
                total_spent: 0,
                total_visits: 0,
                last_visit_date: null,
                notes: formData.notes || null,
                store_id: formData.store_id ? parseInt(formData.store_id) : null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            setCustomers([...customers, newCustomer]);
        } else if (dialogMode === 'edit' && selectedCustomer) {
            setCustomers(
                customers.map((c) =>
                    c.id === selectedCustomer.id
                        ? {
                            ...c,
                            ...formData,
                            email: formData.email || null,
                            birthday: formData.birthday || null,
                            address: formData.address || null,
                            notes: formData.notes || null,
                            store_id: formData.store_id ? parseInt(formData.store_id) : null,
                            updated_at: new Date().toISOString(),
                        }
                        : c
                )
            );
        }
        handleDialogClose();
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Customer Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage your customer database and relationships
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" variant="body2" gutterBottom>
                                        Total Customers
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold">
                                        {stats.total}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.1), width: 56, height: 56 }}>
                                    <PersonOutline sx={{ color: PRIMARY_COLOR, fontSize: 28 }} />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" variant="body2" gutterBottom>
                                        VIP Customers
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold">
                                        {stats.vip}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: alpha(PURPLE_COLOR, 0.1), width: 56, height: 56 }}>
                                    <Star sx={{ color: PURPLE_COLOR, fontSize: 28 }} />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" variant="body2" gutterBottom>
                                        New Customers
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold">
                                        {stats.new}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: alpha(SUCCESS_COLOR, 0.1), width: 56, height: 56 }}>
                                    <PersonAdd sx={{ color: SUCCESS_COLOR, fontSize: 28 }} />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" variant="body2" gutterBottom>
                                        Total Revenue
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold">
                                        ${(stats.totalRevenue / 1000000).toFixed(1)}M
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: alpha(INFO_COLOR, 0.1), width: 56, height: 56 }}>
                                    <TrendingUp sx={{ color: INFO_COLOR, fontSize: 28 }} />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Actions Bar */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                            placeholder="Search customers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ flex: 1, minWidth: 250 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ color: PRIMARY_COLOR }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={filterType}
                                label="Type"
                                onChange={(e) => setFilterType(e.target.value as CustomerType | 'all')}
                            >
                                <MenuItem value="all">All Types</MenuItem>
                                <MenuItem value="new">New</MenuItem>
                                <MenuItem value="regular">Regular</MenuItem>
                                <MenuItem value="vip">VIP</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={filterStatus}
                                label="Status"
                                onChange={(e) => setFilterStatus(e.target.value as Status | 'all')}
                            >
                                <MenuItem value="all">All Status</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                                <MenuItem value="blocked">Blocked</MenuItem>
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={handleAddNew}
                            sx={{
                                bgcolor: PRIMARY_COLOR,
                                '&:hover': { bgcolor: PRIMARY_DARK },
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            Add New Customer
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Customer Table */}
            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.05) }}>
                                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Visits</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Total Spent</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Last Visit</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedCustomers.length > 0 ? (
                                paginatedCustomers.map((customer) => (
                                    <TableRow
                                        key={customer.id}
                                        sx={{
                                            '&:hover': { bgcolor: alpha(PRIMARY_COLOR, 0.02) },
                                        }}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Badge
                                                    overlap="circular"
                                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                    badgeContent={
                                                        customer.customer_type === 'vip' ? (
                                                            <Star
                                                                sx={{
                                                                    fontSize: 16,
                                                                    color: PURPLE_COLOR,
                                                                    bgcolor: 'white',
                                                                    borderRadius: '50%',
                                                                    p: 0.3,
                                                                }}
                                                            />
                                                        ) : null
                                                    }
                                                >
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                                            color: PRIMARY_COLOR,
                                                            width: 44,
                                                            height: 44,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {customer.full_name.charAt(0)}
                                                    </Avatar>
                                                </Badge>
                                                <Box>
                                                    <Typography variant="body2" fontWeight="600">
                                                        {customer.full_name}
                                                    </Typography>
                                                    {customer.store_name && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {customer.store_name}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Stack spacing={0.5}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                    <Typography variant="body2">{customer.phone}</Typography>
                                                </Box>
                                                {customer.email && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {customer.email}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getCustomerTypeLabel(customer.customer_type)}
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha(getCustomerTypeColor(customer.customer_type), 0.1),
                                                    color: getCustomerTypeColor(customer.customer_type),
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight="600">
                                                    {customer.total_visits}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    visits
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight="600" color={SUCCESS_COLOR}>
                                                    ${customer.total_spent.toLocaleString()}
                                                </Typography>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={Math.min((customer.total_spent / 30000000) * 100, 100)}
                                                    sx={{
                                                        height: 4,
                                                        borderRadius: 2,
                                                        bgcolor: alpha(SUCCESS_COLOR, 0.1),
                                                        '& .MuiLinearProgress-bar': {
                                                            bgcolor: SUCCESS_COLOR,
                                                            borderRadius: 2,
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {customer.last_visit_date ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                    <Typography variant="body2">
                                                        {new Date(customer.last_visit_date).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Never
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getStatusLabel(customer.status)}
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha(getStatusColor(customer.status), 0.1),
                                                    color: getStatusColor(customer.status),
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, customer)}>
                                                <MoreVert />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8}>
                                        <Box sx={{ textAlign: 'center', py: 6 }}>
                                            <PersonOutline sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                                No customers found
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                                                    ? 'Try adjusting your search or filters'
                                                    : 'Get started by adding your first customer'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredCustomers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Card>

            {/* Menu */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleView}>
                    <Visibility sx={{ mr: 1, fontSize: 20 }} />
                    View Details
                </MenuItem>
                <MenuItem onClick={handleEdit}>
                    <Edit sx={{ mr: 1, fontSize: 20 }} />
                    Edit
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: ERROR_COLOR }}>
                    <Delete sx={{ mr: 1, fontSize: 20 }} />
                    Delete
                </MenuItem>
            </Menu>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {dialogMode === 'add'
                        ? 'Add New Customer'
                        : dialogMode === 'edit'
                            ? 'Edit Customer'
                            : 'Customer Details'}
                </DialogTitle>
                <DialogContent dividers>
                    {dialogMode === 'view' && selectedCustomer ? (
                        <Grid container spacing={3} sx={{ mt: 0.5 }}>
                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                            color: PRIMARY_COLOR,
                                            width: 80,
                                            height: 80,
                                            fontSize: 32,
                                            fontWeight: 700,
                                        }}
                                    >
                                        {selectedCustomer.full_name.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h5" fontWeight="bold">
                                            {selectedCustomer.full_name}
                                        </Typography>
                                        <Chip
                                            label={getCustomerTypeLabel(selectedCustomer.customer_type)}
                                            size="small"
                                            sx={{
                                                bgcolor: alpha(
                                                    getCustomerTypeColor(selectedCustomer.customer_type),
                                                    0.1
                                                ),
                                                color: getCustomerTypeColor(selectedCustomer.customer_type),
                                                fontWeight: 600,
                                                mt: 1,
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Phone
                                </Typography>
                                <Typography variant="body1">{selectedCustomer.phone}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Email
                                </Typography>
                                <Typography variant="body1">
                                    {selectedCustomer.email || 'Not provided'}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Gender
                                </Typography>
                                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                    {selectedCustomer.gender}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Birthday
                                </Typography>
                                <Typography variant="body1">
                                    {selectedCustomer.birthday
                                        ? new Date(selectedCustomer.birthday).toLocaleDateString()
                                        : 'Not provided'}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Address
                                </Typography>
                                <Typography variant="body1">
                                    {selectedCustomer.address || 'Not provided'}
                                </Typography>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Total Visits
                                </Typography>
                                <Typography variant="body1" fontWeight="600">
                                    {selectedCustomer.total_visits} visits
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Total Spent
                                </Typography>
                                <Typography variant="body1" fontWeight="600" color={SUCCESS_COLOR}>
                                    ${selectedCustomer.total_spent.toLocaleString()}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Last Visit
                                </Typography>
                                <Typography variant="body1">
                                    {selectedCustomer.last_visit_date
                                        ? new Date(selectedCustomer.last_visit_date).toLocaleDateString()
                                        : 'Never visited'}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Status
                                </Typography>
                                <Chip
                                    label={getStatusLabel(selectedCustomer.status)}
                                    size="small"
                                    sx={{
                                        bgcolor: alpha(getStatusColor(selectedCustomer.status), 0.1),
                                        color: getStatusColor(selectedCustomer.status),
                                        fontWeight: 600,
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Store
                                </Typography>
                                <Typography variant="body1">
                                    {selectedCustomer.store_name || 'Not assigned'}
                                </Typography>
                            </Grid>
                            {selectedCustomer.notes && (
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Notes
                                    </Typography>
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {selectedCustomer.notes}
                                    </Typography>
                                </Grid>
                            )}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Created At
                                </Typography>
                                <Typography variant="body1">
                                    {new Date(selectedCustomer.created_at).toLocaleDateString()}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Last Updated
                                </Typography>
                                <Typography variant="body1">
                                    {new Date(selectedCustomer.updated_at).toLocaleDateString()}
                                </Typography>
                            </Grid>
                        </Grid>
                    ) : (
                        <Grid container spacing={3} sx={{ mt: 0.5 }}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    value={formData.full_name}
                                    onChange={handleFormChange('full_name')}
                                    required
                                    disabled={dialogMode === 'view'}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Phone"
                                    value={formData.phone}
                                    onChange={handleFormChange('phone')}
                                    required
                                    disabled={dialogMode === 'view'}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Phone sx={{ color: 'text.secondary' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleFormChange('email')}
                                    disabled={dialogMode === 'view'}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email sx={{ color: 'text.secondary' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth disabled={dialogMode === 'view'}>
                                    <InputLabel>Gender</InputLabel>
                                    <Select
                                        value={formData.gender}
                                        label="Gender"
                                        onChange={(e) =>
                                            setFormData({ ...formData, gender: e.target.value as Gender })
                                        }
                                    >
                                        <MenuItem value="male">Male</MenuItem>
                                        <MenuItem value="female">Female</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Birthday"
                                    type="date"
                                    value={formData.birthday}
                                    onChange={handleFormChange('birthday')}
                                    disabled={dialogMode === 'view'}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth disabled={dialogMode === 'view'}>
                                    <InputLabel>Customer Type</InputLabel>
                                    <Select
                                        value={formData.customer_type}
                                        label="Customer Type"
                                        onChange={(e) =>
                                            setFormData({ ...formData, customer_type: e.target.value as CustomerType })
                                        }
                                    >
                                        <MenuItem value="new">New</MenuItem>
                                        <MenuItem value="regular">Regular</MenuItem>
                                        <MenuItem value="vip">VIP</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth disabled={dialogMode === 'view'}>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={formData.status}
                                        label="Status"
                                        onChange={(e) =>
                                            setFormData({ ...formData, status: e.target.value as Status })
                                        }
                                    >
                                        <MenuItem value="active">Active</MenuItem>
                                        <MenuItem value="inactive">Inactive</MenuItem>
                                        <MenuItem value="blocked">Blocked</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Store ID"
                                    value={formData.store_id}
                                    onChange={handleFormChange('store_id')}
                                    disabled={dialogMode === 'view'}
                                    type="number"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <StoreIcon sx={{ color: 'text.secondary' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Address"
                                    multiline
                                    rows={2}
                                    value={formData.address}
                                    onChange={handleFormChange('address')}
                                    disabled={dialogMode === 'view'}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Notes"
                                    multiline
                                    rows={3}
                                    value={formData.notes}
                                    onChange={handleFormChange('notes')}
                                    disabled={dialogMode === 'view'}
                                    placeholder="Add any additional notes about the customer..."
                                />
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    {dialogMode !== 'view' && (
                        <>
                            <Button onClick={handleDialogClose}>Cancel</Button>
                            <Button
                                onClick={handleSubmit}
                                variant="contained"
                                sx={{
                                    bgcolor: PRIMARY_COLOR,
                                    '&:hover': { bgcolor: PRIMARY_DARK },
                                }}
                            >
                                {dialogMode === 'add' ? 'Add Customer' : 'Save Changes'}
                            </Button>
                        </>
                    )}
                    {dialogMode === 'view' && (
                        <Button onClick={handleDialogClose}>Close</Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Are you sure you want to delete customer {selectedCustomer?.full_name} ?
                        This action cannot be undone.
                    </Alert>
                    {selectedCustomer && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                            <Avatar
                                sx={{
                                    bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                    color: PRIMARY_COLOR,
                                    width: 44,
                                    height: 44,
                                    fontWeight: 600,
                                }}
                            >
                                {selectedCustomer.full_name.charAt(0)}
                            </Avatar>
                            <Box>
                                <Typography variant="body1" fontWeight="600">
                                    {selectedCustomer.full_name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedCustomer.phone}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                    <Button
                        onClick={confirmDelete}
                        variant="contained"
                        sx={{ bgcolor: ERROR_COLOR, '&:hover': { bgcolor: '#dc2626' } }}
                    >
                        Delete Customer
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}