"use client";

import React, { useState, useMemo, ChangeEvent } from "react";
import {
  Grid, Box, Button, MenuItem, FormControl,
  InputLabel, Select, Paper, Stack, Typography, IconButton,
  Divider, alpha, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, SelectChangeEvent
} from "@mui/material";
import { Save, ArrowBack, Person } from "@mui/icons-material";
import {
  Invoice, DiscountType, PaymentStatus, CreateInvoiceDto, UpdateInvoiceDto
} from "@/types/invoice";
import { InvoiceItem } from "@/types/invoice-item"; 
import { Customer as CustomerType } from "@/types/customer";
import { Store as StoreType } from "@/types/store";
import { Staff as StaffType } from "@/types/staff";
import { createTheme, ThemeProvider } from "@mui/material/styles";
const blueTheme = createTheme({
    palette: {
        primary: {
            main: "#3b82f6",
        },
    },
});

interface InvoiceDetailProps {
  mode: "add" | "edit" | "view";
  initialData?: Invoice | null;
  customers: CustomerType[];
  stores: StoreType[];
  staff: StaffType[];
  onSave: (data: CreateInvoiceDto | UpdateInvoiceDto) => Promise<void>; //
  onBack: () => void;
  loading?: boolean;
}

export default function InvoiceDetail({
  mode, initialData, customers, stores, staff,
  onSave, onBack, loading
}: InvoiceDetailProps) {
  const isView = mode === "view";
  
  const [formData, setFormData] = useState({
    customer_id: initialData?.customerId || "",
    store_id: initialData?.storeId || "",
    booking_id: initialData?.bookingId || "",
    discount_amount: initialData?.discountAmount?.toString() || "0",
    discount_type: initialData?.discountType || "" as DiscountType | "",
    notes: initialData?.notes || "",
    payment_status: initialData?.paymentStatus || PaymentStatus.PENDING,
  });
  const [items, setItems] = useState<InvoiceItem[]>(initialData?.items || []);

  const handleFormChange = (field: string) => (
    e: SelectChangeEvent<string | number> | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => 
      sum + (item.unitPrice * item.quantity - (item.discount || 0)), 0
    );
    
    const TAX_RATE = 0.08;
    const inputDiscount = parseFloat(formData.discount_amount) || 0;
    
    let calculatedDiscountAmount = 0;
    if (formData.discount_type === DiscountType.PERCENT) {
      calculatedDiscountAmount = subtotal * (inputDiscount / 100);
    } else if (formData.discount_type === DiscountType.AMOUNT) {
      calculatedDiscountAmount = inputDiscount;
    }

    const amountAfterDiscount = subtotal - calculatedDiscountAmount;
    const tax = amountAfterDiscount * TAX_RATE;
    const total = amountAfterDiscount + tax;
    
    return {
      subtotal,
      discountVal: calculatedDiscountAmount,
      tax,
      total: Math.max(0, total)
    };
  }, [items, formData.discount_amount, formData.discount_type]);

  const handleSave = async () => {

    const submissionData: CreateInvoiceDto = {
      voucher: initialData?.voucher || `INV-${Date.now()}`,
      customerId: Number(formData.customer_id),
      storeId: Number(formData.store_id),
      bookingId: formData.booking_id ? Number(formData.booking_id) : null,
      subtotal: totals.subtotal,
      totalAmount: totals.total,
      taxAmount: totals.tax,
      discountAmount: totals.discountVal,
      discountType: formData.discount_type as DiscountType,
      paymentStatus: formData.payment_status as PaymentStatus,
      notes: formData.notes,
      items: items.map(item => ({
        itemType: item.itemType,
        itemId: item.itemId,
        itemName: item.itemName,
        staffId: item.staffId ?? undefined,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        totalPrice: item.totalPrice
      }))
    };
    await onSave(submissionData);
  };

  return (

    <ThemeProvider theme={blueTheme}>  <Box sx={{ p: { xs: 2, md: 2 } }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton onClick={onBack} sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {mode === "add" ? "Create Invoice" : mode === "edit" ? "Edit Invoice" : "Invoice Preview"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {initialData?.voucher || "Draft"} • {new Date().toLocaleDateString()}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Bảng Items */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Invoice Items</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha('#3b82f6', 0.05) }}>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Item Discount</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="600">{item.itemName}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.itemType}</Typography>
                      </TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{new Intl.NumberFormat('vi-VN').format(item.unitPrice)}</TableCell>
                      <TableCell align="right" sx={{ color: 'success.main' }}>
                        {item.discount > 0 ? `-${new Intl.NumberFormat('vi-VN').format(item.discount)}` : '-'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {new Intl.NumberFormat('vi-VN').format(item.totalPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No items added yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Thông tin khách hàng */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person sx={{ color: '#3b82f6' }} fontSize="small" /> Customer Details
            </Typography>
            <Stack spacing={2}>
              <FormControl fullWidth disabled={isView} size="small">
                <InputLabel>Customer</InputLabel>
                <Select 
                  value={formData.customer_id.toString()} 
                  label="Customer" 
                  onChange={handleFormChange("customer_id")}
                >
                  {customers.map(c => <MenuItem key={c.id} value={c.id}>{c.fullName}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth disabled={isView} size="small">
                <InputLabel>Store</InputLabel>
                <Select 
                  value={formData.store_id.toString()} 
                  label="Store" 
                  onChange={handleFormChange("store_id")}
                >
                  {stores.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: alpha('#3b82f6', 0.02) }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Payment Summary</Typography>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography fontWeight="600">{new Intl.NumberFormat('vi-VN').format(totals.subtotal)} ₫</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Tax (8%)</Typography>
                <Typography fontWeight="600">{new Intl.NumberFormat('vi-VN').format(totals.tax)} ₫</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total Amount</Typography>
                <Typography variant="h6" color="primary.main">
                    {new Intl.NumberFormat('vi-VN').format(totals.total)} ₫
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Button Save  */}
      {!isView && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={loading || !formData.customer_id || items.length === 0}
            sx={{ px: 6, bgcolor: '#3b82f6', height: 48, borderRadius: 2 }}
          >
            {loading ? "Saving..." : "Confirm & Save"}
          </Button>
        </Box>
      )}
    </Box></ThemeProvider>
  
  );
}