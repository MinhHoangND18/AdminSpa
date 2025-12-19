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
import {
    PlayArrow, Store, Add, ArrowBack,
    Print, Edit, History, Storefront,
    Done, Cancel
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
    onCompleteService: (id: number) => void;
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
    const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
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
            (sum, item) => sum + (item.unitPrice * item.quantity), 0
        ) || 0;

        const totalDiscount = booking.pendingInvoiceItems?.reduce(
            (sum, item) => sum + (item.discount || 0), 0
        ) || 0;

        const afterDiscount = subtotal - totalDiscount;

        const taxRate = 0.1;
        const taxAmount = Math.round(afterDiscount * taxRate);

        const finalAmount = afterDiscount + taxAmount;

        return { subtotal, totalDiscount, taxAmount, finalAmount };
    }, [booking.pendingInvoiceItems]);
    const handleOpenAddDialog = () => {
        setEditingItemIndex(null);
        setCurrentItem(initialItemFormData);
        setItemDialogOpen(true);
    };

    const handleOpenEditItem = (index: number) => {
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
            updatedItems[editingItemIndex] = newItem as any;
        } else {
            updatedItems.push(newItem as any);
        }

        onUpdateBookingItems(booking.id, updatedItems);
        setItemDialogOpen(false);
    };

    const handleDeleteItem = (index: number) => {
        const updatedItems = booking.pendingInvoiceItems!.filter((_, i) => i !== index);
        onUpdateBookingItems(booking.id, updatedItems);
        setItemDialogOpen(false);
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

            <Paper elevation={0} sx={{ p: 0, borderRadius: 0, borderBottom: "1px solid #e0e0e0", bgcolor: "#fff" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <IconButton
                            onClick={onBack}
                            sx={{
                                bgcolor: "#fff",
                                // border: "1px solid #e0e0e0",
                                borderRadius: 0,
                                p: 2,
                                "&:hover": { bgcolor: "#f5f5f5" }
                            }}
                        >
                            <ArrowBack fontSize="small" />
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
                                        <Button startIcon={<Add />} size="small" variant="contained" onClick={handleOpenAddDialog} sx={{ bgcolor: "#3b82f6", borderRadius: 0 }}>ADD Items</Button>
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
                                                    <TableCell>#{item.itemId}</TableCell>
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
                                                { label: "Notes", value: booking.notes || "N/A" },
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
                                                <Typography variant="body2" fontWeight={600}>{financialSummary.subtotal.toLocaleString()}₫</Typography>
                                            </Stack>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2">Total Discount</Typography>
                                                <Typography variant="body2" fontWeight={600} color="success.main">-{financialSummary.totalDiscount.toLocaleString()}₫</Typography>
                                            </Stack>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2">Tax (10%)</Typography>
                                                <Typography variant="body2" fontWeight={600}>{financialSummary.taxAmount.toLocaleString()}₫</Typography>
                                            </Stack>
                                            <Divider sx={{ my: 1 }} />
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography variant="subtitle1" fontWeight={700} >Total Amount Due</Typography>
                                                <Typography variant="subtitle1" fontWeight={700} >{financialSummary.finalAmount.toLocaleString()}₫</Typography>
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
                                    <Button variant="contained" sx={{ bgcolor: "#3498db", borderRadius: 0, height: 40 }}>Save Note</Button>
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
                                        onClick={() => onCompleteService(booking.id)}
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
            <Dialog open={itemDialogOpen} onClose={() => setItemDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {editingItemIndex !== null ? "Edit Item" : "Add Service/Product"}
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <FormControl fullWidth>
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={currentItem.itemType}
                                label="Type"
                                onChange={(e) => setCurrentItem({ ...currentItem, itemType: e.target.value as ItemType, itemId: "" })}
                            >
                                <MenuItem value="service">Service</MenuItem>
                                <MenuItem value="product">Product</MenuItem>
                            </Select>
                        </FormControl>

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
                            renderInput={(params) => <TextField {...params} label="Select Item" />}
                        />

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Quantity"
                                    type="number"
                                    value={currentItem.quantity}
                                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: Number(e.target.value) })}
                                />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Discount (₫)"
                                    type="number"
                                    value={currentItem.discount}
                                    onChange={(e) => setCurrentItem({ ...currentItem, discount: Number(e.target.value) })}
                                />
                            </Grid>
                        </Grid>

                        <FormControl fullWidth>
                            <InputLabel>Assign Staff</InputLabel>
                            <Select
                                value={currentItem.staffId}
                                label="Assign Staff"
                                onChange={(e) => setCurrentItem({ ...currentItem, staffId: e.target.value === "" ? "" : Number(e.target.value) })}
                            >
                                <MenuItem value="">None</MenuItem>
                                {staff.map((s) => (
                                    <MenuItem key={s.id} value={s.id}>{s.full_name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                    <Box>
                        {editingItemIndex !== null && (
                            <Button color="error" startIcon={<Delete />} onClick={() => handleDeleteItem(editingItemIndex)}>
                                Delete
                            </Button>
                        )}
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Button onClick={() => setItemDialogOpen(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleSaveItem} sx={{ bgcolor: PRIMARY_COLOR }}>
                            Save Changes
                        </Button>
                    </Stack>
                </DialogActions>
            </Dialog>
        </Box>
    );
}