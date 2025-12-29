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
import { Booking } from "@/types/booking";
interface InvoiceDetailProps {
  mode: "add" | "edit" | "view";
  initialData?: Invoice | null;
  customers: CustomerType[];
  stores: StoreType[];
  staff: StaffType[];
  onSave: (data: CreateInvoiceDto | UpdateInvoiceDto) => Promise<void>;
  onBack: () => void;
  loading?: boolean;
}


interface ApiError {
  response?: {
    data?: {
      message?: string | string[];
    };
  };
}

export default function InvoiceDetail({
  mode, initialData, customers, stores, staff,
  onSave, onBack, loading
}: InvoiceDetailProps) {
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const [formData, setFormData] = useState({
    customer_id: initialData?.customerId || "",
    store_id: initialData?.storeId || "",
    booking_id: initialData?.bookingId || "",
    discount_amount: initialData?.discountAmount?.toString() || "0",
    discount_type: initialData?.discountType || "" as DiscountType | "",
    notes: initialData?.notes || "",
    payment_status: initialData?.paymentStatus || PaymentStatus.PENDING,
  });
  const booking = initialData?.booking;
  const items = initialData?.items || [];

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

    const calculatedDiscountAmount = inputDiscount;
    // if (formData.discount_type === DiscountType.PERCENT) {
    //   calculatedDiscountAmount = subtotal * (inputDiscount / 100);
    // } else if (formData.discount_type === DiscountType.AMOUNT) {
    //   calculatedDiscountAmount = inputDiscount;
    // }

    const amountAfterDiscount = subtotal - calculatedDiscountAmount;
    const tax = amountAfterDiscount * TAX_RATE;
    const total = amountAfterDiscount + tax;

    return {
      subtotal,
      discountVal: calculatedDiscountAmount,
      tax,
      total: Math.max(0, total)
    };
  }, [items, formData.discount_amount, formData.discount_type, booking]);

  const handleSave = async () => {

    const subtotal = Math.max(0, totals.subtotal);
    const totalAmount = Math.max(0, totals.total);
    const discountAmount = Math.max(0, totals.discountVal);
    const taxAmount = Math.max(0, totals.tax);

    const submissionData: CreateInvoiceDto = {

      voucher: initialData?.voucher || `INV-${Date.now()}`,
      customerId: Number(formData.customer_id),
      storeId: Number(formData.store_id),
      bookingId: formData.booking_id ? Number(formData.booking_id) : null,
      subtotal,
      totalAmount,
      taxAmount,
      discountAmount,
      discountType: formData.discount_type as DiscountType || undefined,

      paymentStatus: PaymentStatus.PAID,
      paidAmount: totalAmount,
      notes: formData.notes || undefined,
      items: items.map(item => ({
        itemType: item.itemType,
        itemId: Number(item.itemId),
        itemName: item.itemName,
        staffId: item.staffId ? Number(item.staffId) : undefined,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        discount: Number(item.discount || 0),
        totalPrice: Number(item.totalPrice)
      }))
    };

    try {
      await onSave(submissionData);
    } catch (error: unknown) { 
      const err = error as ApiError;
      const message = err.response?.data?.message || "Error saving invoice";
      alert(Array.isArray(message) ? message[0] : message);
      
      console.error("Chi tiết lỗi lưu hóa đơn:", err);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 2 } }}>
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
        {/* Bảng Items bên trái */}
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

        {/* Thông tin khách hàng bên phải */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person sx={{ color: '#3b82f6' }} fontSize="small" /> Customer Details
            </Typography>
            <Stack spacing={2}>
              <FormControl fullWidth disabled={isView || isEdit} size="small">
                <InputLabel>Customer</InputLabel>
                <Select
                  value={formData.customer_id.toString()}
                  label="Customer"
                  onChange={handleFormChange("customer_id")}
                >
                  {customers.map(c => <MenuItem key={c.id} value={c.id}>{c.fullName}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth disabled={isView || isEdit} size="small">
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
                <Typography fontWeight="600">{new Intl.NumberFormat('en-US').format(totals.subtotal)} ₫</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Discount</Typography>
                <Typography fontWeight="600">-{new Intl.NumberFormat('en-US').format(totals.discountVal)} ₫</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Tax (8%)</Typography>
                <Typography fontWeight="600">{new Intl.NumberFormat('en-US').format(totals.tax)} ₫</Typography>
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
    </Box>
  );
}