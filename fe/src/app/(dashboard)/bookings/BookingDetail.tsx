"use client";

import React, { useState, useMemo } from "react";
import {
    Box, Typography, Avatar, Stack, Chip, Divider,
    Button, Grid, Paper, Autocomplete, TextField, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    alpha, Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import { Delete, Inventory, ExpandLess, ExpandMore } from "@mui/icons-material";
import { NumericFormat } from 'react-number-format';
import {
    PlayArrow, Store, Add, ArrowBack,
    Print, Edit, History, Storefront,
    Done, Cancel, Close
} from "@mui/icons-material";
import { Booking, BookingStatus, PendingInvoiceItem } from "@/types/booking";
import { Staff as StaffType } from "@/types/staff";
import { ItemType } from "@/types/invoice-item";
import { Service as ServiceType } from "@/types/service";
import { Product as ProductType } from "@/types/product";


const PRIMARY_COLOR = "#3b82f6";
const SUCCESS_COLOR = "#10b981";
const ERROR_COLOR = "#ef4444";

interface BookingDetailProps {
    booking: Booking;
    staff: StaffType[];
    services: ServiceType[];
    products: ProductType[];
    onBack: () => void;
    onUpdateStatus: (id: number, status: BookingStatus) => void;
    onStartService: (id: number) => void;
    onCompleteService: (id: number, data: { orderDiscount?: number; discountReason?: string; }) => void;
    onEdit: (booking: Booking) => void;
    onUpdateBookingItems: (id: number, items: PendingInvoiceItem[]) => void;
}

export default function BookingDetail({
    booking,
    staff,
    services,
    products,
    onBack,
    onUpdateStatus,
    onStartService,
    onCompleteService,
    onEdit,
    onUpdateBookingItems
}: BookingDetailProps) {
    const [note, setNote] = useState("");
    const [itemDialogOpen, setItemDialogOpen] = useState(false);
    const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
    const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

    // State cho discount toàn đơn hàng
    const [orderDiscount, setOrderDiscount] = useState<number>(Number(booking.orderDiscount) || 0);
    const [tempOrderDiscount, setTempOrderDiscount] = useState<number>(Number(booking.orderDiscount) || 0);
    const [discountReason, setDiscountReason] = useState(booking.discountReason || "");
    const [tempDiscountReason, setTempDiscountReason] = useState(booking.discountReason || "");

    const initialItemFormData = {
        itemType: ItemType.SERVICE,
        itemId: "",
        itemName: "",
        staffId: "" as string | number,
        quantity: 1,
        unitPrice: 0,
        discount: 0,
    };

    const [currentItem, setCurrentItem] = useState(initialItemFormData);

    const financialSummary = useMemo(() => {
        const subtotal = booking.pendingInvoiceItems?.reduce(
            (sum, item) => sum + (item.unitPrice * item.quantity - (item.discount || 0)), 0
        ) || 0;

        // Sử dụng orderDiscount thay vì tính từ items
        const totalDiscount = orderDiscount || 0;

        const afterDiscount = subtotal - totalDiscount;

        const taxRate = 0.08;
        const tax = afterDiscount * taxRate;
        const taxAmount = Math.round(afterDiscount * taxRate);

        const finalAmount = afterDiscount + taxAmount;

        return { subtotal, totalDiscount, taxAmount, finalAmount, tax };
    }, [booking.pendingInvoiceItems, orderDiscount]);

    const handleOpenAddDialog = () => {
        if (booking.status === BookingStatus.COMPLETED) return;
        setEditingItemIndex(null);
        setCurrentItem(initialItemFormData);
        setItemDialogOpen(true);
    };

    const handleOpenEditItem = (index: number) => {
        if (booking.status === BookingStatus.COMPLETED) return;
        const item = booking.pendingInvoiceItems![index];
        setCurrentItem({
            itemType: item.itemType,
            itemId: item.itemId.toString(),
            itemName: item.itemName,
            staffId: item.staffId ? item.staffId : "",
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
        });
        setEditingItemIndex(index);
        setItemDialogOpen(true);
    };

    const handleOpenDiscountDialog = () => {
        if (booking.status === BookingStatus.COMPLETED) return;
        setTempOrderDiscount(orderDiscount);
        setTempDiscountReason(discountReason);
        setDiscountDialogOpen(true);
    };

    const handleSaveItem = () => {
        const newItem: PendingInvoiceItem = {
            id: editingItemIndex !== null ? booking.pendingInvoiceItems![editingItemIndex].id : Date.now(),
            itemType: currentItem.itemType,
            itemId: Number(currentItem.itemId),
            itemName: currentItem.itemName,
            quantity: Number(currentItem.quantity),
            unitPrice: Number(currentItem.unitPrice),
            discount: Number(currentItem.discount || 0),
            totalPrice: (Number(currentItem.unitPrice) * Number(currentItem.quantity)) - Number(currentItem.discount || 0),
            staffId: currentItem.staffId ? Number(currentItem.staffId) : undefined,
            staff_name: staff.find(s => s.id === Number(currentItem.staffId))?.full_name
        };
        const updatedItems = [...(booking.pendingInvoiceItems || [])];
        if (editingItemIndex !== null) {
            updatedItems[editingItemIndex] = newItem;
        } else {
            updatedItems.push(newItem);
        }

        onUpdateBookingItems(booking.id, updatedItems);
        setItemDialogOpen(false);
    };

    const handleDeleteItem = (index: number) => {
        const updatedItems = booking.pendingInvoiceItems!.filter((_, i) => i !== index);
        onUpdateBookingItems(booking.id, updatedItems);
        setItemDialogOpen(false);
    };

    const handleSaveDiscount = () => {
        setOrderDiscount(tempOrderDiscount);
        setDiscountReason(tempDiscountReason);
        setDiscountDialogOpen(false);

        onEdit({ 
          ...booking, 
          orderDiscount: tempOrderDiscount, 
          discountReason: tempDiscountReason 
        });
    };

    const selectableItems = useMemo(() => {
        const currentServices = services || [];
        const currentProducts = products || [];
        if (currentItem.itemType === ItemType.PRODUCT) {
            return products.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                discount: p.discount || 0
            }));
        }
        return services.map(s => ({
            id: s.id,
            name: s.name,
            price: s.price,
            discount: s.discountPrice ? (s.price - s.discountPrice) : 0,
        }));
    }, [currentItem.itemType, products, services]);

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6f8", pb: 5 }}>
            <Paper elevation={0} sx={{ p: 0, borderRadius: 0, bgcolor: "#fff" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <IconButton onClick={onBack} sx={{ bgcolor: 'background.paper' }}>
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h6" fontWeight={700}>Booking Details #BK{booking.id}</Typography>
                    </Stack>
                </Stack>
            </Paper>

            <Box sx={{ py: 2 }}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 9 }}>
                        <Stack spacing={3}>
                            <Paper sx={{ borderRadius: 0, overflow: 'hidden' }} elevation={0}>
                                <Box sx={{ px: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f4f6f8' }}>
                                    <Typography variant="subtitle1" fontWeight={700}>Services Items</Typography>
                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            startIcon={<Add />}
                                            size="small"
                                            variant="contained"
                                            onClick={handleOpenAddDialog}
                                            disabled={booking.status === BookingStatus.COMPLETED}
                                            sx={{ bgcolor: "#3b82f6", borderRadius: 0 }}
                                        >
                                            ADD Items
                                        </Button>
                                    </Stack>
                                </Box>
                                <TableContainer sx={{ py: 2 }}>
                                    <Table size="small">
                                        <TableHead sx={{ bgcolor: "#fafafa" }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 700 }}>Item ID</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Unit Price</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }} align="center">Qty</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Discount</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {booking.pendingInvoiceItems?.map((item, index) => (
                                                <TableRow
                                                    key={index}
                                                    hover
                                                    onClick={() => handleOpenEditItem(index)}
                                                    sx={{ cursor: 'pointer' }}
                                                >
                                                    <TableCell>#{index + 1}</TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" color="#1957bd" fontWeight={600}>{item.itemName}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{item.itemType.toUpperCase()}</Typography>
                                                    </TableCell>
                                                    <TableCell>{item.unitPrice.toLocaleString()}₫</TableCell>
                                                    <TableCell align="center">{item.quantity}</TableCell>
                                                    <TableCell>{(item.discount || 0).toLocaleString()}₫</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>{item.totalPrice.toLocaleString()}₫</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>

                            <Paper sx={{ py: 0, px: 1, borderRadius: 0 }} elevation={0}>
                                <Grid container spacing={4}>
                                    <Grid size={{ xs: 12, md: 7 }}>
                                        <Typography variant="subtitle1" fontWeight={700} gutterBottom>General Information</Typography>
                                        <Grid container spacing={1.5} sx={{ mt: 1, px: 1 }}>
                                            {[
                                                { label: "Booking ID", value: `#BK${booking.id}` },
                                                { label: "Branch", value: booking.store?.name || "N/A" },
                                                { label: "Source", value: booking.source || "Website" },
                                                { label: "Booking Date", value: booking.bookingDate },
                                                { label: "Time Slot", value: booking.startTime },
                                                { label: "Notes", value: booking.notes || "No note now" },
                                            ].map((row, i) => (
                                                <React.Fragment key={i}>
                                                    <Grid size={{ xs: 4 }}><Typography variant="body2" color="text.secondary">{row.label}</Typography></Grid>
                                                    <Grid size={{ xs: 8 }}><Typography variant="body2" fontWeight={600}>{row.value}</Typography></Grid>
                                                </React.Fragment>
                                            ))}
                                        </Grid>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 5 }}>
                                        <Typography variant="subtitle1" fontWeight={700} gutterBottom align="right">Payment Summary</Typography>
                                        <Stack spacing={1} sx={{ mt: 2 }}>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2">Subtotal</Typography>
                                                <Typography variant="body2" fontWeight={600}>{financialSummary.subtotal.toLocaleString('en-US')}₫</Typography>
                                            </Stack>
                                            <Stack
                                                direction="row"
                                                justifyContent="space-between"
                                                onClick={handleOpenDiscountDialog}
                                                sx={{
                                                    cursor: booking.status === BookingStatus.COMPLETED ? 'default' : 'pointer',
                                                    pointerEvents: booking.status === BookingStatus.COMPLETED ? 'none' : 'auto',
                                                    '&:hover': booking.status !== BookingStatus.COMPLETED ? {
                                                        bgcolor: alpha(PRIMARY_COLOR, 0.05),
                                                        borderRadius: 1,
                                                        px: 1,
                                                        mx: -1
                                                    } : {}
                                                }}
                                            >
                                                <Typography variant="body2" sx={{ color: PRIMARY_COLOR }}>
                                                    Discount {discountReason && `(${discountReason})`}
                                                </Typography>
                                                <Typography variant="body2" fontWeight={600} color="success.main">-{financialSummary.totalDiscount.toLocaleString('en-US')}₫</Typography>
                                            </Stack>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2">Tax (8%)</Typography>
                                                <Typography variant="body2" fontWeight={600}>{financialSummary.taxAmount.toLocaleString('en-US')}₫</Typography>
                                            </Stack>
                                            <Divider sx={{ my: 1 }} />
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography variant="subtitle1" fontWeight={700} >Total Amount Due</Typography>
                                                <Typography variant="subtitle1" fontWeight={700} >{financialSummary.finalAmount.toLocaleString('en-US')}₫</Typography>
                                            </Stack>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Paper>

                            <Paper sx={{ p: 2, borderRadius: 0 }} elevation={0}>
                                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Internal History & Notes</Typography>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
                                    <Avatar sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.1), color: PRIMARY_COLOR }}><History /></Avatar>
                                    <TextField
                                        fullWidth
                                        placeholder="Add internal notes for this booking..."
                                        size="small"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        sx={{ "& fieldset": { borderRadius: 0 } }}
                                    />
                                    <Button variant="contained" sx={{ bgcolor: "#3498db", borderRadius: 0, height: 40, }}>Save Note</Button>
                                </Stack>
                            </Paper>
                        </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                        <Stack spacing={3}>
                            <Paper sx={{ borderRadius: 0, overflow: 'hidden' }} elevation={0}>
                                <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                                    <Typography variant="body1" fontWeight={800}>Customer</Typography>
                                </Box>
                                <Box sx={{ p: 1 }}>
                                    <Stack direction="row" spacing={3} sx={{ mb: 2 }} >
                                        <Box sx={{ spacing: 2 }}>
                                            <Typography variant="body1" fontWeight={800} >{booking.customer?.fullName || booking.customerName}</Typography>
                                            <Typography variant="body1" display="block">{booking?.customerEmail || "No email provided"}</Typography>
                                            <Typography variant="body1" fontWeight={700}>{booking.customer?.phone || booking.customerPhone}</Typography>
                                        </Box>
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="flex-start">
                                        <Storefront sx={{ fontSize: 16, mt: 0.3, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">{booking.customer?.address || "No address updated"}</Typography>
                                    </Stack>
                                </Box>
                            </Paper>

                            <Paper sx={{ p: 2, borderRadius: 0 }} elevation={0}>
                                <Typography variant="subtitle2" fontWeight={700} gutterBottom>Order Status</Typography>
                                <Box sx={{ textAlign: 'center', py: 2 }}>
                                    <Typography variant="h6" color="text.secondary" sx={{ opacity: 0.6 }}>
                                        ✌️ {booking.status.toUpperCase()}
                                    </Typography>
                                </Box>
                                <Stack spacing={1}>
                                    <Button
                                        fullWidth variant="contained" startIcon={<PlayArrow />}
                                        disabled={booking.status !== BookingStatus.PENDING}
                                        onClick={() => onStartService(booking.id)}
                                        sx={{ bgcolor: "#3498db", borderRadius: 0, fontWeight: 700 }}
                                    >
                                        In Progress
                                    </Button>
                                    <Button
                                        fullWidth variant="contained" startIcon={<Done />}
                                        disabled={booking.status !== BookingStatus.IN_PROGRESS}
                                        onClick={() => onCompleteService(booking.id, { orderDiscount, discountReason })}
                                        sx={{ bgcolor: SUCCESS_COLOR, borderRadius: 0, fontWeight: 700 }}
                                    >
                                        Complete
                                    </Button>
                                    <Button
                                        fullWidth variant="contained" startIcon={<Cancel />}
                                        onClick={() => onUpdateStatus(booking.id, BookingStatus.CANCELLED)}
                                        sx={{ bgcolor: ERROR_COLOR, borderRadius: 0, fontWeight: 700 }}
                                    >
                                        Cancel Order
                                    </Button>
                                </Stack>

                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="caption" color="text.secondary">Assigned Staff:</Typography>
                                    <Autocomplete
                                        size="small"
                                        options={staff}
                                        getOptionLabel={(o) => o.full_name}
                                        renderInput={(params) => <TextField {...params} sx={{ mt: 0.5, "& fieldset": { borderRadius: 0 } }} />}
                                    />
                                </Box>
                            </Paper>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>

            {/* Dialog thêm/sửa item */}
            <Dialog
                open={itemDialogOpen}
                onClose={() => setItemDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 2 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, bgcolor: alpha(PRIMARY_COLOR, 0.05), py: 2 }}>
                    {editingItemIndex !== null ? "Edit Item Details" : "Add Service or Product"}
                </DialogTitle>

                <DialogContent dividers sx={{ p: 3 }}>
                    <Stack spacing={3}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Category Type</InputLabel>
                                    <Select
                                        value={currentItem.itemType}
                                        label="Category Type"
                                        onChange={(e) => setCurrentItem({ ...currentItem, itemType: e.target.value as ItemType, itemId: "" })}
                                    >
                                        <MenuItem value="service">Service</MenuItem>
                                        <MenuItem value="product">Product</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Assign Staff</InputLabel>
                                    <Select
                                        value={currentItem.staffId}
                                        label="Assign Staff"
                                        onChange={(e) => setCurrentItem({ ...currentItem, staffId: e.target.value === "" ? "" : Number(e.target.value) })}
                                    >
                                        <MenuItem value=""><em>Not Assigned</em></MenuItem>
                                        {staff.map((s) => (
                                            <MenuItem key={s.id} value={s.id}>{s.full_name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Autocomplete
                            options={selectableItems}
                            getOptionLabel={(option) => option.name}
                            value={selectableItems.find(i => i.id.toString() === currentItem.itemId) || null}
                            onChange={(_, newValue) => {
                                if (newValue) {
                                    setCurrentItem({
                                        ...currentItem,
                                        itemId: newValue.id.toString(),
                                        itemName: newValue.name,
                                        unitPrice: newValue.price,
                                        discount: newValue.discount
                                    });
                                }
                            }}
                            renderInput={(params) => <TextField {...params} label="Search Service/Product" size="small" />}
                        />

                        <Paper variant="outlined" sx={{ p: 2, bgcolor: "#fafafa", borderStyle: 'dashed' }}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700}>PRICING DETAILS</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Unit Price (₫)"
                                        type="number"
                                        size="small"
                                        value={currentItem.unitPrice}
                                        onChange={(e) => setCurrentItem({ ...currentItem, unitPrice: Number(e.target.value) })}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Item Discount (₫)"
                                        type="number"
                                        size="small"
                                        value={currentItem.discount}
                                        onChange={(e) => setCurrentItem({ ...currentItem, discount: Number(e.target.value) })}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Quantity"
                                        type="number"
                                        size="small"
                                        value={currentItem.quantity}
                                        onChange={(e) => setCurrentItem({ ...currentItem, quantity: Number(e.target.value) })}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 2.5, bgcolor: "#fcfcfc" }}>
                    <Box sx={{ flexGrow: 1 }}>
                        {editingItemIndex !== null && (
                            <Button color="error" startIcon={<Delete />} onClick={() => handleDeleteItem(editingItemIndex)}>
                                Remove Item
                            </Button>
                        )}
                    </Box>
                    <Stack direction="row" spacing={1.5}>
                        <Button onClick={() => setItemDialogOpen(false)} variant="outlined" color="inherit">
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSaveItem}
                            sx={{ bgcolor: PRIMARY_COLOR, px: 3, fontWeight: 700 }}
                            disabled={!currentItem.itemId || currentItem.quantity <= 0}
                        >
                            {editingItemIndex !== null ? "Update Item" : "Add to Invoice"}
                        </Button>
                    </Stack>
                </DialogActions>
            </Dialog>

            {/* Dialog cập nhật discount toàn đơn */}
            <Dialog
                open={discountDialogOpen}
                onClose={() => setDiscountDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 0,
                        position: 'absolute',
                        top: 80,

                        m: 0
                    }
                }}
            >
                <DialogTitle sx={{
                    fontWeight: 700,
                    bgcolor: "#fff",
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pb: 1.5,
                    pt: 2
                }}>
                    Cập nhật khuyến mãi
                    <IconButton
                        onClick={() => setDiscountDialogOpen(false)}
                        size="small"
                        sx={{ color: 'text.secondary' }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ pt: 2, pb: 2 }}>
                    <Stack spacing={2}>
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Giá trị khuyến mại
                            </Typography>
                            <NumericFormat
                                customInput={TextField}
                                fullWidth
                                size="small"
                                value={tempOrderDiscount}
                                thousandSeparator=","
                                onValueChange={(values) => {
                                    setTempOrderDiscount(values.floatValue || 0);
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <Box sx={{
                                            bgcolor: '#1976d2',
                                            color: 'white',
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 0,
                                            ml: 1
                                        }}>
                                            <Typography variant="body2" fontWeight={600}>
                                                đ
                                            </Typography>
                                        </Box>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 0,
                                    }
                                }}
                            />
                        </Box>

                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Lý do
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Giảm giá sản phẩm, khách hàng thân thiết"
                                value={tempDiscountReason}
                                onChange={(e) => setTempDiscountReason(e.target.value)}
                                multiline
                                rows={2}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 0,
                                    }
                                }}
                            />
                        </Box>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 2, pt: 1.5, justifyContent: 'space-between' }}>
                    <Button
                        onClick={() => setDiscountDialogOpen(false)}
                        variant="outlined"
                        color="inherit"
                        sx={{ borderRadius: 0, px: 3 }}
                    >
                        Đóng
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveDiscount}
                        sx={{
                            bgcolor: '#5bc0de',
                            borderRadius: 0,
                            px: 3,
                            fontWeight: 600,
                            '&:hover': {
                                bgcolor: '#46b8da'
                            }
                        }}
                    >
                        Cập nhật
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}