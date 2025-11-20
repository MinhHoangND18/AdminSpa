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
    Checkbox,
    FormControlLabel,
    Switch,
    Badge,
} from '@mui/material';
import {
    Add,
    Search,
    MoreVert,
    Edit,
    Delete,
    Visibility,
    Person,
    Store,
    Schedule,
    CalendarToday,
    CheckCircle,
    Cancel,
    AccessTime,
    Pending,
    PlayArrow,
    Done,
    NoAccounts,
    FilterList,
    Phone,
    Email,
    ConfirmationNumber,
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
type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

interface Customer {
    id: number;
    full_name: string;
    phone: string;
    email: string | null;
}

interface Store {
    id: number;
    name: string;
    address: string;
}

interface Booking {
    id: number;
    customer_id: number;
    customer?: Customer;
    store_id: number;
    store?: Store;
    booking_date: string;
    start_time: string;
    end_time: string | null;
    status: BookingStatus;
    source: string | null;
    notes: string | null;
    confirm: boolean;
    created_by: number | null;
    created_at: string;
    updated_at: string;
}

interface BookingFormData {
    customer_id: string;
    store_id: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    status: BookingStatus;
    source: string;
    notes: string;
    confirm: boolean;
}

// Mock Data
const mockCustomers: Customer[] = [
    { id: 1, full_name: 'Nguyen Thi Lan', phone: '+84 901 234 567', email: 'lan.nguyen@email.com' },
    { id: 2, full_name: 'Tran Van Minh', phone: '+84 902 345 678', email: 'minh.tran@email.com' },
    { id: 3, full_name: 'Le Thi Hoa', phone: '+84 903 456 789', email: null },
    { id: 4, full_name: 'Pham Van Tuan', phone: '+84 904 567 890', email: 'tuan.pham@email.com' },
];

const mockStores: Store[] = [
    { id: 1, name: 'Spa Harmony Downtown', address: '123 Nguyen Hue, District 1, HCMC' },
    { id: 2, name: 'Spa Serenity Garden', address: '456 Le Loi, District 3, HCMC' },
    { id: 3, name: 'Spa Wellness Center', address: '789 Tran Hung Dao, District 5, HCMC' },
];

const mockBookings: Booking[] = [
    {
        id: 1,
        customer_id: 1,
        customer: mockCustomers[0],
        store_id: 1,
        store: mockStores[0],
        booking_date: '2024-11-15',
        start_time: '09:00',
        end_time: '10:00',
        status: 'confirmed',
        source: 'website',
        notes: 'Prefers female therapist',
        confirm: true,
        created_by: 1,
        created_at: '2024-11-10T08:00:00',
        updated_at: '2024-11-10T14:30:00',
    },
    {
        id: 2,
        customer_id: 2,
        customer: mockCustomers[1],
        store_id: 1,
        store: mockStores[0],
        booking_date: '2024-11-15',
        start_time: '10:30',
        end_time: '11:30',
        status: 'pending',
        source: 'phone',
        notes: null,
        confirm: false,
        created_by: 1,
        created_at: '2024-11-10T09:00:00',
        updated_at: '2024-11-10T09:00:00',
    },
    {
        id: 3,
        customer_id: 3,
        customer: mockCustomers[2],
        store_id: 2,
        store: mockStores[1],
        booking_date: '2024-11-16',
        start_time: '14:00',
        end_time: '15:30',
        status: 'in_progress',
        source: 'mobile_app',
        notes: 'First-time customer',
        confirm: true,
        created_by: 2,
        created_at: '2024-11-09T10:00:00',
        updated_at: '2024-11-16T14:00:00',
    },
    {
        id: 4,
        customer_id: 4,
        customer: mockCustomers[3],
        store_id: 3,
        store: mockStores[2],
        booking_date: '2024-11-14',
        start_time: '11:00',
        end_time: '12:00',
        status: 'completed',
        source: 'website',
        notes: 'Regular customer',
        confirm: true,
        created_by: 1,
        created_at: '2024-11-08T11:00:00',
        updated_at: '2024-11-14T12:00:00',
    },
    {
        id: 5,
        customer_id: 1,
        customer: mockCustomers[0],
        store_id: 1,
        store: mockStores[0],
        booking_date: '2024-11-13',
        start_time: '16:00',
        end_time: null,
        status: 'cancelled',
        source: 'phone',
        notes: 'Customer called to cancel',
        confirm: false,
        created_by: 1,
        created_at: '2024-11-12T15:00:00',
        updated_at: '2024-11-12T16:00:00',
    },
];

const getStatusColor = (status: BookingStatus) => {
    switch (status) {
        case 'pending':
            return WARNING_COLOR;
        case 'confirmed':
            return INFO_COLOR;
        case 'in_progress':
            return PRIMARY_COLOR;
        case 'completed':
            return SUCCESS_COLOR;
        case 'cancelled':
            return ERROR_COLOR;
        case 'no_show':
            return '#6b7280';
        default:
            return PRIMARY_COLOR;
    }
};

const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
        case 'pending':
            return <Pending />;
        case 'confirmed':
            return <CheckCircle />;
        case 'in_progress':
            return <PlayArrow />;
        case 'completed':
            return <Done />;
        case 'cancelled':
            return <Cancel />;
        case 'no_show':
            return <NoAccounts />;
        default:
            return <Pending />;
    }
};

const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
        case 'pending':
            return 'Pending';
        case 'confirmed':
            return 'Confirmed';
        case 'in_progress':
            return 'In Progress';
        case 'completed':
            return 'Completed';
        case 'cancelled':
            return 'Cancelled';
        case 'no_show':
            return 'No Show';
        default:
            return status;
    }
};

const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>(mockBookings);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all');
    const [filterStore, setFilterStore] = useState<number | 'all'>('all');
    const [filterDate, setFilterDate] = useState<string>('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const initialFormData: BookingFormData = {
        customer_id: '',
        store_id: '',
        booking_date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '10:00',
        status: 'pending',
        source: '',
        notes: '',
        confirm: false,
    };

    const [formData, setFormData] = useState<BookingFormData>(initialFormData);

    // Filter and search
    const filteredBookings = bookings.filter((booking) => {
        const matchesSearch =
            booking.customer?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.customer?.phone.includes(searchQuery) ||
            booking.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
        const matchesStore = filterStore === 'all' || booking.store_id === filterStore;
        const matchesDate = !filterDate || booking.booking_date === filterDate;

        return matchesSearch && matchesStatus && matchesStore && matchesDate;
    });

    // Pagination
    const paginatedBookings = filteredBookings.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // Stats
    const stats = {
        total: bookings.length,
        pending: bookings.filter((b) => b.status === 'pending').length,
        confirmed: bookings.filter((b) => b.status === 'confirmed').length,
        today: bookings.filter((b) => b.booking_date === new Date().toISOString().split('T')[0]).length,
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, booking: Booking) => {
        setAnchorEl(event.currentTarget);
        setSelectedBooking(booking);
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
        if (selectedBooking) {
            setDialogMode('edit');
            setFormData({
                customer_id: selectedBooking.customer_id.toString(),
                store_id: selectedBooking.store_id.toString(),
                booking_date: selectedBooking.booking_date,
                start_time: selectedBooking.start_time,
                end_time: selectedBooking.end_time || '',
                status: selectedBooking.status,
                source: selectedBooking.source || '',
                notes: selectedBooking.notes || '',
                confirm: selectedBooking.confirm,
            });
            setOpenDialog(true);
        }
        handleMenuClose();
    };

    const handleView = () => {
        if (selectedBooking) {
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
        if (selectedBooking) {
            setBookings(bookings.filter((b) => b.id !== selectedBooking.id));
            setDeleteConfirmOpen(false);
            setSelectedBooking(null);
        }
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setFormData(initialFormData);
    };

    const handleFormChange = (field: keyof BookingFormData) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [field]: event.target.value });
    };

    const handleSwitchChange = (field: keyof BookingFormData) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData({ ...formData, [field]: event.target.checked });
    };

    const handleSubmit = () => {
        if (dialogMode === 'add') {
            const newBooking: Booking = {
                id: bookings.length + 1,
                customer_id: parseInt(formData.customer_id),
                customer: mockCustomers.find(c => c.id === parseInt(formData.customer_id)),
                store_id: parseInt(formData.store_id),
                store: mockStores.find(s => s.id === parseInt(formData.store_id)),
                booking_date: formData.booking_date,
                start_time: formData.start_time,
                end_time: formData.end_time || null,
                status: formData.status,
                source: formData.source || null,
                notes: formData.notes || null,
                confirm: formData.confirm,
                created_by: 1, // Mock user ID
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            setBookings([...bookings, newBooking]);
        } else if (dialogMode === 'edit' && selectedBooking) {
            setBookings(
                bookings.map((b) =>
                    b.id === selectedBooking.id
                        ? {
                            ...b,
                            customer_id: parseInt(formData.customer_id),
                            customer: mockCustomers.find(c => c.id === parseInt(formData.customer_id)),
                            store_id: parseInt(formData.store_id),
                            store: mockStores.find(s => s.id === parseInt(formData.store_id)),
                            booking_date: formData.booking_date,
                            start_time: formData.start_time,
                            end_time: formData.end_time || null,
                            status: formData.status,
                            source: formData.source || null,
                            notes: formData.notes || null,
                            confirm: formData.confirm,
                            updated_at: new Date().toISOString(),
                        }
                        : b
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

    const updateBookingStatus = (bookingId: number, newStatus: BookingStatus) => {
        setBookings(
            bookings.map((b) =>
                b.id === bookingId
                    ? {
                        ...b,
                        status: newStatus,
                        updated_at: new Date().toISOString(),
                    }
                    : b
            )
        );
    };

    return (
        <>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Booking Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage appointments and customer bookings
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
                                        Total Bookings
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold">
                                        {stats.total}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.1), width: 56, height: 56 }}>
                                    <ConfirmationNumber sx={{ color: PRIMARY_COLOR, fontSize: 28 }} />
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
                                        Pending
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold">
                                        {stats.pending}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: alpha(WARNING_COLOR, 0.1), width: 56, height: 56 }}>
                                    <Pending sx={{ color: WARNING_COLOR, fontSize: 28 }} />
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
                                        Confirmed
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold">
                                        {stats.confirmed}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: alpha(INFO_COLOR, 0.1), width: 56, height: 56 }}>
                                    <CheckCircle sx={{ color: INFO_COLOR, fontSize: 28 }} />
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
                                        Today&apos;s Bookings
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold">
                                        {stats.today}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: alpha(SUCCESS_COLOR, 0.1), width: 56, height: 56 }}>
                                    <CalendarToday sx={{ color: SUCCESS_COLOR, fontSize: 28 }} />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Actions Bar */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <TextField
                            placeholder="Search by customer name, phone, email..."
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
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={filterStatus}
                                label="Status"
                                onChange={(e) => setFilterStatus(e.target.value as BookingStatus | 'all')}
                            >
                                <MenuItem value="all">All Status</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="confirmed">Confirmed</MenuItem>
                                <MenuItem value="in_progress">In Progress</MenuItem>
                                <MenuItem value="completed">Completed</MenuItem>
                                <MenuItem value="cancelled">Cancelled</MenuItem>
                                <MenuItem value="no_show">No Show</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl sx={{ minWidth: 180 }}>
                            <InputLabel>Store</InputLabel>
                            <Select
                                value={filterStore}
                                label="Store"
                                onChange={(e) => setFilterStore(e.target.value as number | 'all')}
                            >
                                <MenuItem value="all">All Stores</MenuItem>
                                {mockStores.map((store) => (
                                    <MenuItem key={store.id} value={store.id}>
                                        {store.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Date"
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ minWidth: 150 }}
                        />
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
                            New Booking
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Bookings Table */}
            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.05) }}>
                                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Store</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Source</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Confirmed</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedBookings.length > 0 ? (
                                paginatedBookings.map((booking) => (
                                    <TableRow
                                        key={booking.id}
                                        sx={{
                                            '&:hover': { bgcolor: alpha(PRIMARY_COLOR, 0.02) },
                                        }}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                                        color: PRIMARY_COLOR,
                                                        width: 44,
                                                        height: 44,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {booking.customer?.full_name.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight="600">
                                                        {booking.customer?.full_name}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                        <Phone sx={{ fontSize: 12, color: 'text.secondary' }} />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {booking.customer?.phone}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Store sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                <Typography variant="body2">
                                                    {booking.store?.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight="600">
                                                    {formatDate(booking.booking_date)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatTime(booking.start_time)} - {booking.end_time ? formatTime(booking.end_time) : 'N/A'}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {booking.end_time ? (
                                                <Typography variant="body2">
                                                    {Math.round(
                                                        (new Date(`2000-01-01T${booking.end_time}`).getTime() -
                                                            new Date(`2000-01-01T${booking.start_time}`).getTime()) / (1000 * 60)
                                                    )} min
                                                </Typography>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Not set
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={booking.source || 'Unknown'}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={getStatusIcon(booking.status)}
                                                label={getStatusLabel(booking.status)}
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha(getStatusColor(booking.status), 0.1),
                                                    color: getStatusColor(booking.status),
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Checkbox
                                                checked={booking.confirm}
                                                icon={<Cancel sx={{ color: 'text.disabled' }} />}
                                                checkedIcon={<CheckCircle sx={{ color: SUCCESS_COLOR }} />}
                                                disabled
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, booking)}>
                                                <MoreVert />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8}>
                                        <Box sx={{ textAlign: 'center', py: 6 }}>
                                            <ConfirmationNumber sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                                No bookings found
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {searchQuery || filterStatus !== 'all' || filterStore !== 'all' || filterDate
                                                    ? 'Try adjusting your search or filters'
                                                    : 'Get started by creating your first booking'}
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
                    count={filteredBookings.length}
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
                <Divider />
                <MenuItem
                    onClick={() => selectedBooking && updateBookingStatus(selectedBooking.id, 'confirmed')}
                    disabled={selectedBooking?.status === 'confirmed'}
                >
                    <CheckCircle sx={{ mr: 1, fontSize: 20, color: INFO_COLOR }} />
                    Confirm
                </MenuItem>
                <MenuItem
                    onClick={() => selectedBooking && updateBookingStatus(selectedBooking.id, 'in_progress')}
                    disabled={selectedBooking?.status === 'in_progress'}
                >
                    <PlayArrow sx={{ mr: 1, fontSize: 20, color: PRIMARY_COLOR }} />
                    Start Service
                </MenuItem>
                <MenuItem
                    onClick={() => selectedBooking && updateBookingStatus(selectedBooking.id, 'completed')}
                    disabled={selectedBooking?.status === 'completed'}
                >
                    <Done sx={{ mr: 1, fontSize: 20, color: SUCCESS_COLOR }} />
                    Complete
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={() => selectedBooking && updateBookingStatus(selectedBooking.id, 'cancelled')}
                    disabled={selectedBooking?.status === 'cancelled'}
                    sx={{ color: ERROR_COLOR }}
                >
                    <Cancel sx={{ mr: 1, fontSize: 20 }} />
                    Cancel
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
                        ? 'Create New Booking'
                        : dialogMode === 'edit'
                            ? 'Edit Booking'
                            : 'Booking Details'}
                </DialogTitle>
                <DialogContent dividers>
                    {dialogMode === 'view' && selectedBooking ? (
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
                                        {selectedBooking.customer?.full_name.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h5" fontWeight="bold">
                                            {selectedBooking.customer?.full_name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                            <Chip
                                                label={getStatusLabel(selectedBooking.status)}
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha(getStatusColor(selectedBooking.status), 0.1),
                                                    color: getStatusColor(selectedBooking.status),
                                                }}
                                            />
                                            <Chip
                                                label={selectedBooking.confirm ? 'Confirmed' : 'Not Confirmed'}
                                                size="small"
                                                variant={selectedBooking.confirm ? "filled" : "outlined"}
                                                color={selectedBooking.confirm ? "success" : "default"}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Customer
                                </Typography>
                                <Typography variant="body1" fontWeight="600">
                                    {selectedBooking.customer?.full_name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedBooking.customer?.phone}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Store
                                </Typography>
                                <Typography variant="body1" fontWeight="600">
                                    {selectedBooking.store?.name}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Date
                                </Typography>
                                <Typography variant="body1">
                                    {formatDate(selectedBooking.booking_date)}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Time
                                </Typography>
                                <Typography variant="body1">
                                    {formatTime(selectedBooking.start_time)} - {selectedBooking.end_time ? formatTime(selectedBooking.end_time) : 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Source
                                </Typography>
                                <Typography variant="body1">
                                    {selectedBooking.source || 'Not specified'}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Duration
                                </Typography>
                                <Typography variant="body1">
                                    {selectedBooking.end_time
                                        ? `${Math.round(
                                            (new Date(`2000-01-01T${selectedBooking.end_time}`).getTime() -
                                                new Date(`2000-01-01T${selectedBooking.start_time}`).getTime()) / (1000 * 60)
                                        )} minutes`
                                        : 'Not set'
                                    }
                                </Typography>
                            </Grid>
                            {selectedBooking.notes && (
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Notes
                                    </Typography>
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {selectedBooking.notes}
                                    </Typography>
                                </Grid>
                            )}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Created At
                                </Typography>
                                <Typography variant="body1">
                                    {new Date(selectedBooking.created_at).toLocaleDateString()}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Last Updated
                                </Typography>
                                <Typography variant="body1">
                                    {new Date(selectedBooking.updated_at).toLocaleDateString()}
                                </Typography>
                            </Grid>
                        </Grid>
                    ) : (
                        <Grid container spacing={3} sx={{ mt: 0.5 }}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth required>
                                    <InputLabel>Customer</InputLabel>
                                    <Select
                                        value={formData.customer_id}
                                        label="Customer"
                                        onChange={(e) =>
                                            setFormData({ ...formData, customer_id: e.target.value })
                                        }
                                    >
                                        {mockCustomers.map((customer) => (
                                            <MenuItem key={customer.id} value={customer.id}>
                                                {customer.full_name} - {customer.phone}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth required>
                                    <InputLabel>Store</InputLabel>
                                    <Select
                                        value={formData.store_id}
                                        label="Store"
                                        onChange={(e) =>
                                            setFormData({ ...formData, store_id: e.target.value })
                                        }
                                    >
                                        {mockStores.map((store) => (
                                            <MenuItem key={store.id} value={store.id}>
                                                {store.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Booking Date"
                                    type="date"
                                    value={formData.booking_date}
                                    onChange={handleFormChange('booking_date')}
                                    required
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth required>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={formData.status}
                                        label="Status"
                                        onChange={(e) =>
                                            setFormData({ ...formData, status: e.target.value as BookingStatus })
                                        }
                                    >
                                        <MenuItem value="pending">Pending</MenuItem>
                                        <MenuItem value="confirmed">Confirmed</MenuItem>
                                        <MenuItem value="in_progress">In Progress</MenuItem>
                                        <MenuItem value="completed">Completed</MenuItem>
                                        <MenuItem value="cancelled">Cancelled</MenuItem>
                                        <MenuItem value="no_show">No Show</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Start Time"
                                    type="time"
                                    value={formData.start_time}
                                    onChange={handleFormChange('start_time')}
                                    required
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="End Time"
                                    type="time"
                                    value={formData.end_time}
                                    onChange={handleFormChange('end_time')}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Source</InputLabel>
                                    <Select
                                        value={formData.source}
                                        label="Source"
                                        onChange={(e) =>
                                            setFormData({ ...formData, source: e.target.value })
                                        }
                                    >
                                        <MenuItem value="website">Website</MenuItem>
                                        <MenuItem value="mobile_app">Mobile App</MenuItem>
                                        <MenuItem value="phone">Phone</MenuItem>
                                        <MenuItem value="walk_in">Walk-in</MenuItem>
                                        <MenuItem value="referral">Referral</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.confirm}
                                            onChange={handleSwitchChange('confirm')}
                                        />
                                    }
                                    label="Confirmed"
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
                                    placeholder="Add any special notes or instructions..."
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
                                {dialogMode === 'add' ? 'Create Booking' : 'Save Changes'}
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
                        Are you sure you want to delete this booking?
                        This action cannot be undone.
                    </Alert>
                    {selectedBooking && (
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
                                {selectedBooking.customer?.full_name.charAt(0)}
                            </Avatar>
                            <Box>
                                <Typography variant="body1" fontWeight="600">
                                    {selectedBooking.customer?.full_name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {formatDate(selectedBooking.booking_date)} at {formatTime(selectedBooking.start_time)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedBooking.store?.name}
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
                        Delete Booking
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Quick Actions Toolbar */}
            <Box sx={{ position: 'fixed', bottom: 24, left: "18%", zIndex: 1000 }}>
                <Card sx={{ boxShadow: 3 }}>
                    <CardContent sx={{ p: 2 }}>
                        <Stack direction="row" spacing={1}>
                            <Tooltip title="Today's Bookings">
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setFilterDate(new Date().toISOString().split('T')[0])}
                                    startIcon={<CalendarToday />}
                                >
                                    Today
                                </Button>
                            </Tooltip>
                            <Tooltip title="Pending Bookings">
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setFilterStatus('pending')}
                                    startIcon={<Pending />}
                                >
                                    Pending
                                </Button>
                            </Tooltip>
                            <Tooltip title="Create New Booking">
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={handleAddNew}
                                    startIcon={<Add />}
                                    sx={{
                                        bgcolor: PRIMARY_COLOR,
                                        '&:hover': { bgcolor: PRIMARY_DARK },
                                    }}
                                >
                                    New Booking
                                </Button>
                            </Tooltip>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </>
    );
}