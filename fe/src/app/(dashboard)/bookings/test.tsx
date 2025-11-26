'use client';

import React, { useState, useEffect } from 'react';
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
    Switch,
    FormControlLabel,
    CircularProgress,
} from '@mui/material';
import {
    Add,
    Search,
    MoreVert,
    Edit,
    Delete,
    Visibility,
    Store,
    Phone,
    CheckCircle,
    Cancel,
    Pending,
    PlayArrow,
    Done,
    NoAccounts,
    CalendarToday,
    ConfirmationNumber,
} from '@mui/icons-material';
import { getBookings, createBooking, updateBooking, deleteBooking, confirmBooking, cancelBooking } from '@/lib/api/bookings';
import { getCustomers } from '@/lib/api/customers';
import { storesApi } from '@/lib/api/stores';
import { Booking, BookingStatus, Customer, Store as StoreType, CreateBookingPayload, UpdateBookingPayload, BookingFilters } from '@/types/booking';

// Colors
const PRIMARY_COLOR = '#14b8a6';
const PRIMARY_DARK = '#0f766e';
const SUCCESS_COLOR = '#10b981';
const ERROR_COLOR = '#ef4444';
const WARNING_COLOR = '#f59e0b';
const INFO_COLOR = '#3b82f6';

interface BookingFormData {
    customerId: string;
    storeId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    status: BookingStatus;
    source: string;
    notes: string;
    confirm: boolean;
}

const getStatusColor = (status: BookingStatus) => {
    switch (status) {
        case BookingStatus.PENDING:
            return WARNING_COLOR;
        case BookingStatus.CONFIRMED:
            return INFO_COLOR;
        case BookingStatus.IN_PROGRESS:
            return PRIMARY_COLOR;
        case BookingStatus.COMPLETED:
            return SUCCESS_COLOR;
        case BookingStatus.CANCELLED:
            return ERROR_COLOR;
        case BookingStatus.NO_SHOW:
            return '#6b7280';
        default:
            return PRIMARY_COLOR;
    }
};

const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
        case BookingStatus.PENDING:
            return <Pending />;
        case BookingStatus.CONFIRMED:
            return <CheckCircle />;
        case BookingStatus.IN_PROGRESS:
            return <PlayArrow />;
        case BookingStatus.COMPLETED:
            return <Done />;
        case BookingStatus.CANCELLED:
            return <Cancel />;
        case BookingStatus.NO_SHOW:
            return <NoAccounts />;
        default:
            return <Pending />;
    }
};

const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
        case BookingStatus.PENDING:
            return 'Pending';
        case BookingStatus.CONFIRMED:
            return 'Confirmed';
        case BookingStatus.IN_PROGRESS:
            return 'In Progress';
        case BookingStatus.COMPLETED:
            return 'Completed';
        case BookingStatus.CANCELLED:
            return 'Cancelled';
        case BookingStatus.NO_SHOW:
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
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [stores, setStores] = useState<StoreType[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all');
    const [filterStore, setFilterStore] = useState<number | 'all'>('all');
    const [filterDate, setFilterDate] = useState<string>('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initialFormData: BookingFormData = {
        customerId: '',
        storeId: '',
        bookingDate: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        status: BookingStatus.PENDING,
        source: '',
        notes: '',
        confirm: false,
    };

    const [formData, setFormData] = useState<BookingFormData>(initialFormData);

    // Load initial data
    useEffect(() => {
        loadData();
    }, [page, rowsPerPage, filterStatus, filterStore, filterDate]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Build filters
            const filters: BookingFilters = {
                page: page + 1,
                limit: rowsPerPage,
            };

            if (filterStatus !== 'all') {
                filters.status = filterStatus;
            }
            if (filterStore !== 'all') {
                filters.storeId = filterStore;
            }
            if (filterDate) {
                filters.bookingDate = filterDate;
            }

            // Load bookings
            const bookingResponse = await getBookings(filters);
            setBookings(bookingResponse.data);
            setTotalRecords(bookingResponse.meta.total);
            setTotalPages(bookingResponse.meta.totalPages);

            // Load customers and stores if not loaded
            if (customers.length === 0) {
                const response: any = await getCustomers({ limit: 1000 });
                setCustomers(response.data || response);
            }

            if (stores.length === 0) {
                const storeResponse = await storesApi.getAll({ limit: 1000 });
                setStores(storeResponse.data);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load data');
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter bookings by search query (client-side)
    const filteredBookings = bookings.filter((booking) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            booking.customer?.full_name.toLowerCase().includes(query) ||
            booking.customer?.phone.includes(query) ||
            booking.customer?.email?.toLowerCase().includes(query)
        );
    });

    // Stats
    const stats = {
        total: totalRecords,
        pending: bookings.filter((b) => b.status === BookingStatus.PENDING).length,
        confirmed: bookings.filter((b) => b.status === BookingStatus.CONFIRMED).length,
        today: bookings.filter((b) => b.bookingDate === new Date().toISOString().split('T')[0]).length,
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
                customerId: selectedBooking.customerId.toString(),
                storeId: selectedBooking.storeId.toString(),
                bookingDate: selectedBooking.bookingDate,
                startTime: selectedBooking.startTime,
                endTime: selectedBooking.endTime || '',
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

    const confirmDelete = async () => {
        if (selectedBooking) {
            try {
                setSubmitting(true);
                await deleteBooking(selectedBooking.id);
                await loadData();
                setDeleteConfirmOpen(false);
                setSelectedBooking(null);
            } catch (err: any) {
                setError(err.message || 'Failed to delete booking');
            } finally {
                setSubmitting(false);
            }
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

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            setError(null);

            const payload: CreateBookingPayload | UpdateBookingPayload = {
                customerId: parseInt(formData.customerId),
                storeId: parseInt(formData.storeId),
                bookingDate: formData.bookingDate,
                startTime: formData.startTime,
                endTime: formData.endTime || undefined,
                status: formData.status,
                source: formData.source || undefined,
                notes: formData.notes || undefined,
                confirm: formData.confirm,
            };

            if (dialogMode === 'add') {
                await createBooking(payload as CreateBookingPayload);
            } else if (dialogMode === 'edit' && selectedBooking) {
                await updateBooking(selectedBooking.id, payload);
            }

            await loadData();
            handleDialogClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save booking');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const updateBookingStatus = async (bookingId: number, newStatus: BookingStatus) => {
        try {
            await updateBooking(bookingId, { status: newStatus });
            await loadData();
            handleMenuClose();
        } catch (err: any) {
            setError(err.message || 'Failed to update status');
        }
    };

    const handleConfirmBooking = async () => {
        if (selectedBooking) {
            try {
                await confirmBooking(selectedBooking.id);
                await loadData();
                handleMenuClose();
            } catch (err: any) {
                setError(err.message || 'Failed to confirm booking');
            }
        }
    };

    const handleCancelBooking = async () => {
        if (selectedBooking) {
            try {
                await cancelBooking(selectedBooking.id);
                await loadData();
                handleMenuClose();
            } catch (err: any) {
                setError(err.message || 'Failed to cancel booking');
            }
        }
    };

    if (loading && bookings.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

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

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

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
                                <MenuItem value={BookingStatus.PENDING}>Pending</MenuItem>
                                <MenuItem value={BookingStatus.CONFIRMED}>Confirmed</MenuItem>
                                <MenuItem value={BookingStatus.IN_PROGRESS}>In Progress</MenuItem>
                                <MenuItem value={BookingStatus.COMPLETED}>Completed</MenuItem>
                                <MenuItem value={BookingStatus.CANCELLED}>Cancelled</MenuItem>
                                <MenuItem value={BookingStatus.NO_SHOW}>No Show</MenuItem>
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
                                {stores.map((store) => (
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
                                height: 55,
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
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : filteredBookings.length > 0 ? (
                                filteredBookings.map((booking) => (
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
                                                    {formatDate(booking.bookingDate)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatTime(booking.startTime)} - {booking.endTime ? formatTime(booking.endTime) : 'N/A'}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {booking.endTime ? (
                                                <Typography variant="body2">
                                                    {Math.round(
                                                        (new Date(`2000-01-01T${booking.endTime}`).getTime() -
                                                            new Date(`2000-01-01T${booking.startTime}`).getTime()) / (1000 * 60)
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
                    count={totalRecords}
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
                    onClick={handleConfirmBooking}
                    disabled={selectedBooking?.status === BookingStatus.CONFIRMED}
                >
                    <CheckCircle sx={{ mr: 1, fontSize: 20, color: INFO_COLOR }} />
                    Confirm
                </MenuItem>
                <MenuItem
                    onClick={() => selectedBooking && updateBookingStatus(selectedBooking.id, BookingStatus.IN_PROGRESS)}
                    disabled={selectedBooking?.status === BookingStatus.IN_PROGRESS}
                >
                    <PlayArrow sx={{ mr: 1, fontSize: 20, color: PRIMARY_COLOR }} />
                    Start Service
                </MenuItem>
                <MenuItem
                    onClick={() => selectedBooking && updateBookingStatus(selectedBooking.id, BookingStatus.COMPLETED)}
                    disabled={selectedBooking?.status === BookingStatus.COMPLETED}
                >
                    <Done sx={{ mr: 1, fontSize: 20, color: SUCCESS_COLOR }} />
                    Complete
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={handleCancelBooking}
                    disabled={selectedBooking?.status === BookingStatus.CANCELLED}
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
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Phone
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
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
                                    {formatDate(selectedBooking.bookingDate)}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Time
                                </Typography>
                                <Typography variant="body1">
                                    {formatTime(selectedBooking.startTime)} - {selectedBooking.endTime ? formatTime(selectedBooking.endTime) : 'N/A'}
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
                                    {selectedBooking.endTime
                                        ? `${Math.round(
                                            (new Date(`2000-01-01T${selectedBooking.endTime}`).getTime() -
                                                new Date(`2000-01-01T${selectedBooking.startTime}`).getTime()) / (1000 * 60)
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
                                    {new Date(selectedBooking.createdAt).toLocaleDateString()}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Last Updated
                                </Typography>
                                <Typography variant="body1">
                                    {new Date(selectedBooking.updatedAt).toLocaleDateString()}
                                </Typography>
                            </Grid>
                        </Grid>
                    ) : (
                        <Grid container spacing={3} sx={{ mt: 0.5 }}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth required>
                                    <InputLabel>Customer</InputLabel>
                                    <Select
                                        value={formData.customerId}
                                        label="Customer"
                                        onChange={(e) =>
                                            setFormData({ ...formData, customerId: e.target.value })
                                        }
                                    >
                                        {customers.map((customer) => (
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
                                        value={formData.storeId}
                                        label="Store"
                                        onChange={(e) =>
                                            setFormData({ ...formData, storeId: e.target.value })
                                        }
                                    >
                                        {stores.map((store) => (
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
                                    value={formData.bookingDate}
                                    onChange={handleFormChange('bookingDate')}
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
                                        <MenuItem value={BookingStatus.PENDING}>Pending</MenuItem>
                                        <MenuItem value={BookingStatus.CONFIRMED}>Confirmed</MenuItem>
                                        <MenuItem value={BookingStatus.IN_PROGRESS}>In Progress</MenuItem>
                                        <MenuItem value={BookingStatus.COMPLETED}>Completed</MenuItem>
                                        <MenuItem value={BookingStatus.CANCELLED}>Cancelled</MenuItem>
                                        <MenuItem value={BookingStatus.NO_SHOW}>No Show</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Start Time"
                                    type="time"
                                    value={formData.startTime}
                                    onChange={handleFormChange('startTime')}
                                    required
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="End Time"
                                    type="time"
                                    value={formData.endTime}
                                    onChange={handleFormChange('endTime')}
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
                            <Button onClick={handleDialogClose} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                variant="contained"
                                disabled={submitting}
                                sx={{
                                    bgcolor: PRIMARY_COLOR,
                                    '&:hover': { bgcolor: PRIMARY_DARK },
                                }}
                            >
                                {submitting ? (
                                    <CircularProgress size={24} />
                                ) : dialogMode === 'add' ? (
                                    'Create Booking'
                                ) : (
                                    'Save Changes'
                                )}
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
                                    {formatDate(selectedBooking.bookingDate)} at {formatTime(selectedBooking.startTime)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedBooking.store?.name}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDelete}
                        variant="contained"
                        disabled={submitting}
                        sx={{ bgcolor: ERROR_COLOR, '&:hover': { bgcolor: '#dc2626' } }}
                    >
                        {submitting ? <CircularProgress size={24} /> : 'Delete Booking'}
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
                                    onClick={() => setFilterStatus(BookingStatus.PENDING)}
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