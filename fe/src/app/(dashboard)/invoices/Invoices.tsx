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
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
} from '@mui/material';
import {
    Add,
    Search,
    MoreVert,
    Edit,
    Delete,
    Visibility,
    Receipt,
    Person,
    Store,
    CalendarToday,
    AttachMoney,
    Discount,
    LocalOffer,
    Payment,
    Pending,
    CheckCircle,
    Inventory,
    Spa,
    ShoppingBag,
    Assignment,
    FilterList,
    TrendingUp,
    Download,
    Print,
    Share,
    ContentCopy,
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
type DiscountType = 'amount' | 'percent';
type PaymentStatus = 'pending' | 'paid';
type ItemType = 'service' | 'product' | 'package';

interface Customer {
    id: number;
    full_name: string;
    phone: string;
    email: string | null;
}

interface Store {
    id: number;
    name: string;
}

interface Booking {
    id: number;
    voucher: string;
    customer_id: number;
    store_id: number;
}

interface Staff {
    id: number;
    name: string;
}

interface InvoiceItem {
    id: number;
    invoice_id: number;
    item_type: ItemType;
    item_id: number;
    item_name: string;
    staff_id: number | null;
    staff_name?: string;
    quantity: number;
    unit_price: number;
    discount: number;
    total_price: number;
}

interface Invoice {
    id: number;
    voucher: string;
    booking_id: number | null;
    booking?: Booking;
    customer_id: number;
    customer?: Customer;
    store_id: number;
    store?: Store;
    subtotal: number;
    discount_amount: number;
    discount_type: DiscountType | null;
    tax_amount: number;
    total_amount: number;
    paid_amount: number;
    payment_status: PaymentStatus;
    notes: string | null;
    created_by: number | null;
    created_at: string;
    updated_at: string;
    items?: InvoiceItem[];
}

interface InvoiceFormData {
    customer_id: string;
    store_id: string;
    booking_id: string;
    discount_amount: string;
    discount_type: DiscountType | '';
    tax_amount: string;
    notes: string;
    payment_status: PaymentStatus;
}

interface InvoiceItemFormData {
    item_type: ItemType;
    item_id: string;
    item_name: string;
    staff_id: string;
    quantity: string;
    unit_price: string;
    discount: string;
}

// Mock Data
const mockCustomers: Customer[] = [
    { id: 1, full_name: 'Nguyen Thi Lan', phone: '+84 901 234 567', email: 'lan.nguyen@email.com' },
    { id: 2, full_name: 'Tran Van Minh', phone: '+84 902 345 678', email: 'minh.tran@email.com' },
    { id: 3, full_name: 'Le Thi Hoa', phone: '+84 903 456 789', email: null },
];

const mockStores: Store[] = [
    { id: 1, name: 'Spa Harmony Downtown' },
    { id: 2, name: 'Spa Serenity Garden' },
    { id: 3, name: 'Spa Wellness Center' },
];

const mockBookings: Booking[] = [
    { id: 1, voucher: 'BK001', customer_id: 1, store_id: 1 },
    { id: 2, voucher: 'BK002', customer_id: 2, store_id: 1 },
    { id: 3, voucher: 'BK003', customer_id: 3, store_id: 2 },
];

const mockStaff: Staff[] = [
    { id: 1, name: 'Tran Thi Mai' },
    { id: 2, name: 'Le Van Hung' },
    { id: 3, name: 'Pham Thi Thu' },
];

const mockServices = [
    { id: 1, name: 'Swedish Massage', price: 850000 },
    { id: 2, name: 'Deep Tissue Massage', price: 1200000 },
    { id: 3, name: 'Hydrating Facial', price: 650000 },
];

const mockProducts = [
    { id: 1, name: 'Face Cream', price: 350000 },
    { id: 2, name: 'Body Lotion', price: 280000 },
    { id: 3, name: 'Essential Oil Set', price: 520000 },
];

const mockInvoices: Invoice[] = [
    {
        id: 1,
        voucher: 'INV-2024-001',
        booking_id: 1,
        booking: mockBookings[0],
        customer_id: 1,
        customer: mockCustomers[0],
        store_id: 1,
        store: mockStores[0],
        subtotal: 2050000,
        discount_amount: 100000,
        discount_type: 'amount',
        tax_amount: 205000,
        total_amount: 2155000,
        paid_amount: 2155000,
        payment_status: 'paid',
        notes: 'VIP customer discount applied',
        created_by: 1,
        created_at: '2024-11-15T10:00:00',
        updated_at: '2024-11-15T10:30:00',
        items: [
            {
                id: 1,
                invoice_id: 1,
                item_type: 'service',
                item_id: 1,
                item_name: 'Swedish Massage',
                staff_id: 1,
                staff_name: 'Tran Thi Mai',
                quantity: 1,
                unit_price: 850000,
                discount: 0,
                total_price: 850000,
            },
            {
                id: 2,
                invoice_id: 1,
                item_type: 'service',
                item_id: 2,
                item_name: 'Deep Tissue Massage',
                staff_id: 2,
                staff_name: 'Le Van Hung',
                quantity: 1,
                unit_price: 1200000,
                discount: 100000,
                total_price: 1100000,
            },
        ],
    },
    {
        id: 2,
        voucher: 'INV-2024-002',
        booking_id: 2,
        booking: mockBookings[1],
        customer_id: 2,
        customer: mockCustomers[1],
        store_id: 1,
        store: mockStores[0],
        subtotal: 650000,
        discount_amount: 0,
        discount_type: null,
        tax_amount: 65000,
        total_amount: 715000,
        paid_amount: 0,
        payment_status: 'pending',
        notes: null,
        created_by: 1,
        created_at: '2024-11-16T14:00:00',
        updated_at: '2024-11-16T14:00:00',
        items: [
            {
                id: 3,
                invoice_id: 2,
                item_type: 'service',
                item_id: 3,
                item_name: 'Hydrating Facial',
                staff_id: 3,
                staff_name: 'Pham Thi Thu',
                quantity: 1,
                unit_price: 650000,
                discount: 0,
                total_price: 650000,
            },
        ],
    },
    {
        id: 3,
        voucher: 'INV-2024-003',
        booking_id: null,
        customer_id: 3,
        customer: mockCustomers[2],
        store_id: 2,
        store: mockStores[1],
        subtotal: 870000,
        discount_amount: 50,
        discount_type: 'percent',
        tax_amount: 43500,
        total_amount: 456750,
        paid_amount: 456750,
        payment_status: 'paid',
        notes: 'First-time customer 50% discount',
        created_by: 2,
        created_at: '2024-11-17T09:30:00',
        updated_at: '2024-11-17T09:45:00',
        items: [
            {
                id: 4,
                invoice_id: 3,
                item_type: 'service',
                item_id: 1,
                item_name: 'Swedish Massage',
                staff_id: 1,
                staff_name: 'Tran Thi Mai',
                quantity: 1,
                unit_price: 850000,
                discount: 425000,
                total_price: 425000,
            },
            {
                id: 5,
                invoice_id: 3,
                item_type: 'product',
                item_id: 1,
                item_name: 'Face Cream',
                staff_id: null,
                quantity: 1,
                unit_price: 350000,
                discount: 0,
                total_price: 350000,
            },
        ],
    },
];

const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
        case 'paid':
            return SUCCESS_COLOR;
        case 'pending':
            return WARNING_COLOR;
        default:
            return PRIMARY_COLOR;
    }
};

const getPaymentStatusLabel = (status: PaymentStatus) => {
    switch (status) {
        case 'paid':
            return 'Paid';
        case 'pending':
            return 'Pending';
        default:
            return status;
    }
};

const getItemTypeIcon = (type: ItemType) => {
    switch (type) {
        case 'service':
            return <Spa />;
        case 'product':
            return <ShoppingBag />;
        case 'package':
            return <Inventory />;
        default:
            return <Assignment />;
    }
};

const getItemTypeColor = (type: ItemType) => {
    switch (type) {
        case 'service':
            return PRIMARY_COLOR;
        case 'product':
            return INFO_COLOR;
        case 'package':
            return PURPLE_COLOR;
        default:
            return PRIMARY_COLOR;
    }
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

const generateVoucher = () => {
    const timestamp = new Date().getTime();
    return `INV-${timestamp}`;
};

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('all');
    const [filterStore, setFilterStore] = useState<number | 'all'>('all');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openItemsDialog, setOpenItemsDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const initialFormData: InvoiceFormData = {
        customer_id: '',
        store_id: '',
        booking_id: '',
        discount_amount: '0',
        discount_type: '',
        tax_amount: '0',
        notes: '',
        payment_status: 'pending',
    };

    const initialItemFormData: InvoiceItemFormData = {
        item_type: 'service',
        item_id: '',
        item_name: '',
        staff_id: '',
        quantity: '1',
        unit_price: '0',
        discount: '0',
    };

    const [formData, setFormData] = useState<InvoiceFormData>(initialFormData);
    const [items, setItems] = useState<InvoiceItemFormData[]>([]);
    const [currentItem, setCurrentItem] = useState<InvoiceItemFormData>(initialItemFormData);

    // Filter and search
    const filteredInvoices = invoices.filter((invoice) => {
        const matchesSearch =
            invoice.voucher.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.customer?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.customer?.phone.includes(searchQuery);
        const matchesStatus = filterStatus === 'all' || invoice.payment_status === filterStatus;
        const matchesStore = filterStore === 'all' || invoice.store_id === filterStore;

        return matchesSearch && matchesStatus && matchesStore;
    });

    // Pagination
    const paginatedInvoices = filteredInvoices.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // Stats
    const stats = {
        total: invoices.length,
        paid: invoices.filter((i) => i.payment_status === 'paid').length,
        pending: invoices.filter((i) => i.payment_status === 'pending').length,
        totalRevenue: invoices.reduce((sum, i) => sum + i.total_amount, 0),
        collectedRevenue: invoices.reduce((sum, i) => sum + i.paid_amount, 0),
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, invoice: Invoice) => {
        setAnchorEl(event.currentTarget);
        setSelectedInvoice(invoice);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleAddNew = () => {
        setDialogMode('add');
        setFormData(initialFormData);
        setItems([]);
        setOpenDialog(true);
    };

    const handleEdit = () => {
        if (selectedInvoice) {
            setDialogMode('edit');
            setFormData({
                customer_id: selectedInvoice.customer_id.toString(),
                store_id: selectedInvoice.store_id.toString(),
                booking_id: selectedInvoice.booking_id?.toString() || '',
                discount_amount: selectedInvoice.discount_amount.toString(),
                discount_type: selectedInvoice.discount_type || '',
                tax_amount: selectedInvoice.tax_amount.toString(),
                notes: selectedInvoice.notes || '',
                payment_status: selectedInvoice.payment_status,
            });
            setOpenDialog(true);
        }
        handleMenuClose();
    };

    const handleView = () => {
        if (selectedInvoice) {
            setDialogMode('view');
            setOpenDialog(true);
        }
        handleMenuClose();
    };

    const handleViewItems = () => {
        if (selectedInvoice) {
            setOpenItemsDialog(true);
        }
        handleMenuClose();
    };

    const handleDelete = () => {
        setDeleteConfirmOpen(true);
        handleMenuClose();
    };

    const confirmDelete = () => {
        if (selectedInvoice) {
            setInvoices(invoices.filter((i) => i.id !== selectedInvoice.id));
            setDeleteConfirmOpen(false);
            setSelectedInvoice(null);
        }
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setFormData(initialFormData);
        setItems([]);
    };

    const handleItemsDialogClose = () => {
        setOpenItemsDialog(false);
    };

    const handleFormChange = (field: keyof InvoiceFormData) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> 
    ) => {
        setFormData({ ...formData, [field]: event.target.value });
    };

    const handleItemChange = (field: keyof InvoiceItemFormData) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setCurrentItem({ ...currentItem, [field]: event.target.value });
    };

    const addItem = () => {
        if (currentItem.item_name && parseFloat(currentItem.unit_price) > 0) {
            setItems([...items, currentItem]);
            setCurrentItem(initialItemFormData);
        }
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => {
            const quantity = parseInt(item.quantity) || 1;
            const unitPrice = parseFloat(item.unit_price) || 0;
            const discount = parseFloat(item.discount) || 0;
            return sum + (unitPrice * quantity - discount);
        }, 0);

        const discountAmount = parseFloat(formData.discount_amount) || 0;
        const taxAmount = parseFloat(formData.tax_amount) || 0;

        let total = subtotal - discountAmount + taxAmount;

        if (formData.discount_type === 'percent' && discountAmount > 0) {
            total = subtotal * (1 - discountAmount / 100) + taxAmount;
        }

        return {
            subtotal,
            total: Math.max(0, total),
        };
    };

    const handleSubmit = () => {
        const { subtotal, total } = calculateTotals();

        if (dialogMode === 'add') {
            const newInvoice: Invoice = {
                id: invoices.length + 1,
                voucher: generateVoucher(),
                booking_id: formData.booking_id ? parseInt(formData.booking_id) : null,
                booking: mockBookings.find(b => b.id === parseInt(formData.booking_id)),
                customer_id: parseInt(formData.customer_id),
                customer: mockCustomers.find(c => c.id === parseInt(formData.customer_id)),
                store_id: parseInt(formData.store_id),
                store: mockStores.find(s => s.id === parseInt(formData.store_id)),
                subtotal,
                discount_amount: parseFloat(formData.discount_amount) || 0,
                discount_type: formData.discount_type as DiscountType | null,
                tax_amount: parseFloat(formData.tax_amount) || 0,
                total_amount: total,
                paid_amount: formData.payment_status === 'paid' ? total : 0,
                payment_status: formData.payment_status,
                notes: formData.notes || null,
                created_by: 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                items: items.map((item, index) => ({
                    id: index + 1,
                    invoice_id: invoices.length + 1,
                    item_type: item.item_type,
                    item_id: parseInt(item.item_id),
                    item_name: item.item_name,
                    staff_id: item.staff_id ? parseInt(item.staff_id) : null,
                    staff_name: mockStaff.find(s => s.id === parseInt(item.staff_id))?.name,
                    quantity: parseInt(item.quantity) || 1,
                    unit_price: parseFloat(item.unit_price) || 0,
                    discount: parseFloat(item.discount) || 0,
                    total_price: (parseFloat(item.unit_price) || 0) * (parseInt(item.quantity) || 1) - (parseFloat(item.discount) || 0),
                })),
            };
            setInvoices([...invoices, newInvoice]);
        } else if (dialogMode === 'edit' && selectedInvoice) {
            setInvoices(
                invoices.map((i) =>
                    i.id === selectedInvoice.id
                        ? {
                            ...i,
                            customer_id: parseInt(formData.customer_id),
                            customer: mockCustomers.find(c => c.id === parseInt(formData.customer_id)),
                            store_id: parseInt(formData.store_id),
                            store: mockStores.find(s => s.id === parseInt(formData.store_id)),
                            booking_id: formData.booking_id ? parseInt(formData.booking_id) : null,
                            booking: mockBookings.find(b => b.id === parseInt(formData.booking_id)),
                            subtotal,
                            discount_amount: parseFloat(formData.discount_amount) || 0,
                            discount_type: formData.discount_type as DiscountType | null,
                            tax_amount: parseFloat(formData.tax_amount) || 0,
                            total_amount: total,
                            paid_amount: formData.payment_status === 'paid' ? total : 0,
                            payment_status: formData.payment_status,
                            notes: formData.notes || null,
                            updated_at: new Date().toISOString(),
                        }
                        : i
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

    const markAsPaid = () => {
        if (selectedInvoice) {
            setInvoices(
                invoices.map((i) =>
                    i.id === selectedInvoice.id
                        ? {
                            ...i,
                            payment_status: 'paid',
                            paid_amount: i.total_amount,
                            updated_at: new Date().toISOString(),
                        }
                        : i
                )
            );
            handleMenuClose();
        }
    };

    const { subtotal, total } = calculateTotals();

    return (
        <>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Invoice Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage customer invoices and payments
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
                                        Total Invoices
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold">
                                        {stats.total}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.1), width: 56, height: 56 }}>
                                    <Receipt sx={{ color: PRIMARY_COLOR, fontSize: 28 }} />
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
                                        Paid Invoices
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold" color={SUCCESS_COLOR}>
                                        {stats.paid}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: alpha(SUCCESS_COLOR, 0.1), width: 56, height: 56 }}>
                                    <CheckCircle sx={{ color: SUCCESS_COLOR, fontSize: 28 }} />
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
                                        Pending Payments
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold" color={WARNING_COLOR}>
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
                                        Total Revenue
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold">
                                        {formatCurrency(stats.totalRevenue)}
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
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <TextField
                            placeholder="Search by voucher, customer name, phone..."
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
                            <InputLabel>Payment Status</InputLabel>
                            <Select
                                value={filterStatus}
                                label="Payment Status"
                                onChange={(e) => setFilterStatus(e.target.value as PaymentStatus | 'all')}
                            >
                                <MenuItem value="all">All Status</MenuItem>
                                <MenuItem value="paid">Paid</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
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
                            Create Invoice
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Invoices Table */}
            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.05) }}>
                                <TableCell sx={{ fontWeight: 700 }}>Voucher</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Store</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Booking</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Subtotal</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Discount</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Tax</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Paid</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedInvoices.length > 0 ? (
                                paginatedInvoices.map((invoice) => (
                                    <TableRow
                                        key={invoice.id}
                                        sx={{
                                            '&:hover': { bgcolor: alpha(PRIMARY_COLOR, 0.02) },
                                        }}
                                    >
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="600" color={PRIMARY_COLOR}>
                                                {invoice.voucher}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(invoice.created_at).toLocaleDateString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                {/* <Avatar
                                                    sx={{
                                                        bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                                        color: PRIMARY_COLOR,
                                                        width: 36,
                                                        height: 36,
                                                        fontSize: 14,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {invoice.customer?.full_name.charAt(0)}
                                                </Avatar> */}
                                                <Box>
                                                    <Typography variant="body2" fontWeight="600">
                                                        {invoice.customer?.full_name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {invoice.customer?.phone}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {invoice.store?.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {invoice.booking ? (
                                                <Chip
                                                    label={invoice.booking.voucher}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    No booking
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="600">
                                                {formatCurrency(invoice.subtotal)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {invoice.discount_amount > 0 ? (
                                                <Box>
                                                    <Typography variant="body2" color={SUCCESS_COLOR} fontWeight="600">
                                                        -{formatCurrency(invoice.discount_amount)}
                                                    </Typography>
                                                    {invoice.discount_type === 'percent' && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            ({invoice.discount_amount}%)
                                                        </Typography>
                                                    )}
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    No discount
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatCurrency(invoice.tax_amount)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="600" color={PRIMARY_COLOR}>
                                                {formatCurrency(invoice.total_amount)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="600">
                                                {formatCurrency(invoice.paid_amount)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getPaymentStatusLabel(invoice.payment_status)}
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha(getPaymentStatusColor(invoice.payment_status), 0.1),
                                                    color: getPaymentStatusColor(invoice.payment_status),
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, invoice)}>
                                                <MoreVert />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={11}>
                                        <Box sx={{ textAlign: 'center', py: 6 }}>
                                            <Receipt sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                                No invoices found
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {searchQuery || filterStatus !== 'all' || filterStore !== 'all'
                                                    ? 'Try adjusting your search or filters'
                                                    : 'Get started by creating your first invoice'}
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
                    count={filteredInvoices.length}
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
                <MenuItem onClick={handleViewItems}>
                    <Inventory sx={{ mr: 1, fontSize: 20 }} />
                    View Items
                </MenuItem>
                <MenuItem onClick={handleEdit}>
                    <Edit sx={{ mr: 1, fontSize: 20 }} />
                    Edit
                </MenuItem>
                <Divider />
                {selectedInvoice?.payment_status === 'pending' && (
                    <MenuItem onClick={markAsPaid}>
                        <Payment sx={{ mr: 1, fontSize: 20, color: SUCCESS_COLOR }} />
                        Mark as Paid
                    </MenuItem>
                )}
                <MenuItem>
                    <Download sx={{ mr: 1, fontSize: 20 }} />
                    Download PDF
                </MenuItem>
                <MenuItem>
                    <Print sx={{ mr: 1, fontSize: 20 }} />
                    Print
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleDelete} sx={{ color: ERROR_COLOR }}>
                    <Delete sx={{ mr: 1, fontSize: 20 }} />
                    Delete
                </MenuItem>
            </Menu>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="lg" fullWidth>
                <DialogTitle>
                    {dialogMode === 'add'
                        ? 'Create New Invoice'
                        : dialogMode === 'edit'
                            ? 'Edit Invoice'
                            : 'Invoice Details'}
                </DialogTitle>
                <DialogContent dividers>
                    {dialogMode === 'view' && selectedInvoice ? (
                        <Grid container spacing={3} sx={{ mt: 0.5 }}>
                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                            color: PRIMARY_COLOR,
                                            width: 80,
                                            height: 80,
                                        }}
                                    >
                                        <Receipt sx={{ fontSize: 32 }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h5" fontWeight="bold">
                                            {selectedInvoice.voucher}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                            <Chip
                                                label={getPaymentStatusLabel(selectedInvoice.payment_status)}
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha(getPaymentStatusColor(selectedInvoice.payment_status), 0.1),
                                                    color: getPaymentStatusColor(selectedInvoice.payment_status),
                                                }}
                                            />
                                            <Chip
                                                label={selectedInvoice.store?.name || ''}
                                                size="small"
                                                variant="outlined"
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
                                    {selectedInvoice.customer?.full_name}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Phone
                                </Typography>
                                <Typography variant="body1">
                                    {selectedInvoice.customer?.phone}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Store
                                </Typography>
                                <Typography variant="body1" fontWeight="600">
                                    {selectedInvoice.store?.name}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Booking
                                </Typography>
                                <Typography variant="body1">
                                    {selectedInvoice.booking ? selectedInvoice.booking.voucher : 'No booking'}
                                </Typography>
                            </Grid>

                            {/* Invoice Items */}
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                                    Invoice Items
                                </Typography>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Item</TableCell>
                                                <TableCell>Type</TableCell>
                                                <TableCell>Staff</TableCell>
                                                <TableCell align="right">Qty</TableCell>
                                                <TableCell align="right">Unit Price</TableCell>
                                                <TableCell align="right">Discount</TableCell>
                                                <TableCell align="right">Total</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedInvoice.items?.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Avatar sx={{
                                                                bgcolor: alpha(getItemTypeColor(item.item_type), 0.1),
                                                                color: getItemTypeColor(item.item_type),
                                                                width: 32,
                                                                height: 32
                                                            }}>
                                                                {getItemTypeIcon(item.item_type)}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="body2" fontWeight="600">
                                                                    {item.item_name}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={item.item_type}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: alpha(getItemTypeColor(item.item_type), 0.1),
                                                                color: getItemTypeColor(item.item_type),
                                                                textTransform: 'capitalize'
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.staff_name || '-'}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {item.quantity}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {formatCurrency(item.unit_price)}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ color: SUCCESS_COLOR }}>
                                                        -{formatCurrency(item.discount)}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                                                        {formatCurrency(item.total_price)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>

                            {/* Summary */}
                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                    <Box sx={{ minWidth: 300 }}>
                                        <Stack spacing={1}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography>Subtotal:</Typography>
                                                <Typography fontWeight="600">{formatCurrency(selectedInvoice.subtotal)}</Typography>
                                            </Box>
                                            {selectedInvoice.discount_amount > 0 && (
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography color={SUCCESS_COLOR}>
                                                        Discount {selectedInvoice.discount_type === 'percent' ? `(${selectedInvoice.discount_amount}%)` : ''}:
                                                    </Typography>
                                                    <Typography color={SUCCESS_COLOR} fontWeight="600">
                                                        -{formatCurrency(selectedInvoice.discount_amount)}
                                                    </Typography>
                                                </Box>
                                            )}
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography>Tax:</Typography>
                                                <Typography fontWeight="600">{formatCurrency(selectedInvoice.tax_amount)}</Typography>
                                            </Box>
                                            <Divider />
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="h6">Total Amount:</Typography>
                                                <Typography variant="h6" color={PRIMARY_COLOR}>
                                                    {formatCurrency(selectedInvoice.total_amount)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography>Paid Amount:</Typography>
                                                <Typography fontWeight="600" color={selectedInvoice.payment_status === 'paid' ? SUCCESS_COLOR : WARNING_COLOR}>
                                                    {formatCurrency(selectedInvoice.paid_amount)}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Box>
                                </Box>
                            </Grid>

                            {selectedInvoice.notes && (
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Notes
                                    </Typography>
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {selectedInvoice.notes}
                                    </Typography>
                                </Grid>
                            )}

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Created At
                                </Typography>
                                <Typography variant="body1">
                                    {new Date(selectedInvoice.created_at).toLocaleString()}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Last Updated
                                </Typography>
                                <Typography variant="body1">
                                    {new Date(selectedInvoice.updated_at).toLocaleString()}
                                </Typography>
                            </Grid>
                        </Grid>
                    ) : (
                        <Grid container spacing={3} sx={{ mt: 0.5 }}>
                            {/* Basic Information */}
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
                                <FormControl fullWidth>
                                    <InputLabel>Booking</InputLabel>
                                    <Select
                                        value={formData.booking_id}
                                        label="Booking"
                                        onChange={(e) =>
                                            setFormData({ ...formData, booking_id: e.target.value })
                                        }
                                    >
                                        <MenuItem value="">No Booking</MenuItem>
                                        {mockBookings.map((booking) => (
                                            <MenuItem key={booking.id} value={booking.id}>
                                                {booking.voucher} - {mockCustomers.find(c => c.id === booking.customer_id)?.full_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Payment Status</InputLabel>
                                    <Select
                                        value={formData.payment_status}
                                        label="Payment Status"
                                        onChange={(e) =>
                                            setFormData({ ...formData, payment_status: e.target.value as PaymentStatus })
                                        }
                                    >
                                        <MenuItem value="pending">Pending</MenuItem>
                                        <MenuItem value="paid">Paid</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Add Items Section */}
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Add Items
                                </Typography>
                                <Paper sx={{ p: 2, mb: 2 }}>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, sm: 3 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>Item Type</InputLabel>
                                                <Select
                                                    value={currentItem.item_type}
                                                    label="Item Type"
                                                    onChange={(e) =>
                                                        setCurrentItem({ ...currentItem, item_type: e.target.value as ItemType })
                                                    }
                                                >
                                                    <MenuItem value="service">Service</MenuItem>
                                                    <MenuItem value="product">Product</MenuItem>
                                                    <MenuItem value="package">Package</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 3 }}>
                                            <TextField
                                                fullWidth
                                                label="Item Name"
                                                value={currentItem.item_name}
                                                onChange={handleItemChange('item_name')}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 2 }}>
                                            <TextField
                                                fullWidth
                                                label="Quantity"
                                                type="number"
                                                value={currentItem.quantity}
                                                onChange={handleItemChange('quantity')}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 2 }}>
                                            <TextField
                                                fullWidth
                                                label="Unit Price"
                                                type="number"
                                                value={currentItem.unit_price}
                                                onChange={handleItemChange('unit_price')}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">₫</InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 2 }}>
                                            <TextField
                                                fullWidth
                                                label="Discount"
                                                type="number"
                                                value={currentItem.discount}
                                                onChange={handleItemChange('discount')}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">₫</InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 4 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>Staff</InputLabel>
                                                <Select
                                                    value={currentItem.staff_id}
                                                    label="Staff"
                                                    onChange={(e) =>
                                                        setCurrentItem({ ...currentItem, staff_id: e.target.value })
                                                    }
                                                >
                                                    <MenuItem value="">No Staff</MenuItem>
                                                    {mockStaff.map((staff) => (
                                                        <MenuItem key={staff.id} value={staff.id}>
                                                            {staff.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 2 }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                onClick={addItem}
                                                sx={{ height: '56px' }}
                                                disabled={!currentItem.item_name || parseFloat(currentItem.unit_price) <= 0}
                                            >
                                                Add Item
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Paper>

                                {/* Items List */}
                                {items.length > 0 && (
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Item</TableCell>
                                                    <TableCell>Type</TableCell>
                                                    <TableCell>Staff</TableCell>
                                                    <TableCell align="right">Qty</TableCell>
                                                    <TableCell align="right">Unit Price</TableCell>
                                                    <TableCell align="right">Discount</TableCell>
                                                    <TableCell align="right">Total</TableCell>
                                                    <TableCell align="center">Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {items.map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <Typography variant="body2" fontWeight="600">
                                                                {item.item_name}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={item.item_type}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: alpha(getItemTypeColor(item.item_type), 0.1),
                                                                    color: getItemTypeColor(item.item_type),
                                                                    textTransform: 'capitalize'
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            {mockStaff.find(s => s.id === parseInt(item.staff_id))?.name || '-'}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {item.quantity}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {formatCurrency(parseFloat(item.unit_price))}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ color: SUCCESS_COLOR }}>
                                                            -{formatCurrency(parseFloat(item.discount))}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                                                            {formatCurrency(parseFloat(item.unit_price) * parseInt(item.quantity) - parseFloat(item.discount))}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => removeItem(index)}
                                                                color="error"
                                                            >
                                                                <Delete />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Grid>

                            {/* Discount and Tax */}
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Discount Amount"
                                    type="number"
                                    value={formData.discount_amount}
                                    onChange={handleFormChange('discount_amount')}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">₫</InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Discount Type</InputLabel>
                                    <Select
                                        value={formData.discount_type}
                                        label="Discount Type"
                                        onChange={(e) =>
                                            setFormData({ ...formData, discount_type: e.target.value as DiscountType })
                                        }
                                    >
                                        <MenuItem value="">No Discount</MenuItem>
                                        <MenuItem value="amount">Amount</MenuItem>
                                        <MenuItem value="percent">Percentage</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Tax Amount"
                                    type="number"
                                    value={formData.tax_amount}
                                    onChange={handleFormChange('tax_amount')}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">₫</InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            {/* Summary */}
                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                    <Box sx={{ minWidth: 300, p: 2, bgcolor: alpha(PRIMARY_COLOR, 0.05), borderRadius: 1 }}>
                                        <Stack spacing={1}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography>Subtotal:</Typography>
                                                <Typography fontWeight="600">{formatCurrency(subtotal)}</Typography>
                                            </Box>
                                            {formData.discount_amount && parseFloat(formData.discount_amount) > 0 && (
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography color={SUCCESS_COLOR}>
                                                        Discount {formData.discount_type === 'percent' ? `(${formData.discount_amount}%)` : ''}:
                                                    </Typography>
                                                    <Typography color={SUCCESS_COLOR} fontWeight="600">
                                                        -{formatCurrency(parseFloat(formData.discount_amount))}
                                                    </Typography>
                                                </Box>
                                            )}
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography>Tax:</Typography>
                                                <Typography fontWeight="600">{formatCurrency(parseFloat(formData.tax_amount))}</Typography>
                                            </Box>
                                            <Divider />
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="h6">Total Amount:</Typography>
                                                <Typography variant="h6" color={PRIMARY_COLOR}>
                                                    {formatCurrency(total)}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Notes"
                                    multiline
                                    rows={3}
                                    value={formData.notes}
                                    onChange={handleFormChange('notes')}
                                    placeholder="Add any notes or special instructions..."
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
                                disabled={items.length === 0}
                                sx={{
                                    bgcolor: PRIMARY_COLOR,
                                    '&:hover': { bgcolor: PRIMARY_DARK },
                                }}
                            >
                                {dialogMode === 'add' ? 'Create Invoice' : 'Save Changes'}
                            </Button>
                        </>
                    )}
                    {dialogMode === 'view' && (
                        <Button onClick={handleDialogClose}>Close</Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* View Items Dialog */}
            <Dialog open={openItemsDialog} onClose={handleItemsDialogClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    Invoice Items - {selectedInvoice?.voucher}
                </DialogTitle>
                <DialogContent dividers>
                    {selectedInvoice?.items && selectedInvoice.items.length > 0 ? (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Item</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Staff</TableCell>
                                        <TableCell align="right">Qty</TableCell>
                                        <TableCell align="right">Unit Price</TableCell>
                                        <TableCell align="right">Discount</TableCell>
                                        <TableCell align="right">Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedInvoice.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{
                                                        bgcolor: alpha(getItemTypeColor(item.item_type), 0.1),
                                                        color: getItemTypeColor(item.item_type),
                                                        width: 32,
                                                        height: 32
                                                    }}>
                                                        {getItemTypeIcon(item.item_type)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="600">
                                                            {item.item_name}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={item.item_type}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: alpha(getItemTypeColor(item.item_type), 0.1),
                                                        color: getItemTypeColor(item.item_type),
                                                        textTransform: 'capitalize'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {item.staff_name || '-'}
                                            </TableCell>
                                            <TableCell align="right">
                                                {item.quantity}
                                            </TableCell>
                                            <TableCell align="right">
                                                {formatCurrency(item.unit_price)}
                                            </TableCell>
                                            <TableCell align="right" sx={{ color: SUCCESS_COLOR }}>
                                                -{formatCurrency(item.discount)}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                                                {formatCurrency(item.total_price)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Inventory sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                No items found
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleItemsDialogClose}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Are you sure you want to delete invoice  {selectedInvoice?.voucher} ?
                        This action cannot be undone.
                    </Alert>
                    {selectedInvoice && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                            <Avatar
                                sx={{
                                    bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                    color: PRIMARY_COLOR,
                                    width: 44,
                                    height: 44,
                                }}
                            >
                                <Receipt />
                            </Avatar>
                            <Box>
                                <Typography variant="body1" fontWeight="600">
                                    {selectedInvoice.voucher}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedInvoice.customer?.full_name} • {formatCurrency(selectedInvoice.total_amount)}
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
                        Delete Invoice
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}