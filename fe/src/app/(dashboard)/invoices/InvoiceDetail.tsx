"use client";

import React, { useState, useMemo } from "react";
import {
  Grid, Box, Button, TextField, MenuItem, FormControl,
  InputLabel, Select, Paper, Stack, Typography, IconButton,
  Divider, Avatar, alpha, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, InputAdornment
} from "@mui/material";
import {
  Save, ArrowBack, Person, Receipt,
  Add as AddIcon, Delete as DeleteIcon,
  LocalOffer, Percent, AttachMoney
} from "@mui/icons-material";
import {
  Invoice, DiscountType, PaymentStatus,
} from "@/types/invoice";
import { Customer as CustomerType } from "@/types/customer";
import { Store as StoreType } from "@/types/store";
import { Staff as StaffType } from "@/types/staff";

interface InvoiceDetailProps {
  mode: "add" | "edit" | "view";
  initialData?: Invoice | null;
  customers: CustomerType[];
  stores: StoreType[];
  staff: StaffType[];
  onSave: (data: any) => Promise<void>;
  onBack: () => void;
  loading?: boolean;
}

export default function InvoiceDetail({
  mode, initialData, customers, stores, staff,
  onSave, onBack, loading
}: InvoiceDetailProps) {
  const isView = mode === "view";
  
  const [formData, setFormData] = useState({
    customer_id: initialData?.customerId?.toString() || "",
    store_id: initialData?.storeId?.toString() || "",
    booking_id: initialData?.bookingId?.toString() || "",
    discount_amount: initialData?.discountAmount?.toString() || "0",
    discount_type: initialData?.discountType || "" as DiscountType | "",
    notes: initialData?.notes || "",
    payment_status: initialData?.paymentStatus || "pending" as PaymentStatus,
  });

  const [items, setItems] = useState<any[]>(initialData?.items || []);

  const handleFormChange = (field: string) => (e: any) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  // Logic tính toán bao gồm Discount (Đã bổ sung)
  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => 
      sum + (item.unitPrice * item.quantity - (item.discount || 0)), 0
    );
    
    const TAX_RATE = 0.08;
    const inputDiscount = parseFloat(formData.discount_amount) || 0;
    
    let calculatedDiscountAmount = 0;
    if (formData.discount_type === "percent") {
      calculatedDiscountAmount = subtotal * (inputDiscount / 100);
    } else if (formData.discount_type === "amount") {
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
    const submissionData = {
      ...formData,
      subtotal: totals.subtotal,
      totalAmount: totals.total,
      taxAmount: totals.tax,
      discountAmount: totals.discountVal, 
      items: items.map(item => ({ ...item }))
    };
    await onSave(submissionData);
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

        {!isView && (
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={loading || !formData.customer_id || items.length === 0}
            sx={{ px: 4, bgcolor: '#3b82f6', height: 45 }}
          >
            Confirm & Save
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }} >
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person sx={{ color: '#3b82f6' }} fontSize="small" /> Customer Details
            </Typography>
            <Stack spacing={2}>
              <FormControl fullWidth disabled={isView} size="small">
                <InputLabel>Customer</InputLabel>
                <Select value={formData.customer_id} label="Customer" onChange={handleFormChange("customer_id")}>
                  {customers.map(c => <MenuItem key={c.id} value={c.id}>{c.fullName}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth disabled={isView} size="small">
                <InputLabel>Store</InputLabel>
                <Select value={formData.store_id} label="Store" onChange={handleFormChange("store_id")}>
                  {stores.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalOffer sx={{ color: '#3b82f6' }} fontSize="small" /> Promotion & Discount
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 7 }}>
                <TextField
                  fullWidth label="Discount Value" size="small"
                  value={formData.discount_amount}
                  onChange={handleFormChange("discount_amount")}
                  disabled={isView}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">
                      {formData.discount_type === "percent" ? <Percent fontSize="small" /> : "₫"}
                    </InputAdornment>
                  }}
                />
              </Grid>
              <Grid size={{ xs: 5 }}>
                <FormControl fullWidth size="small" disabled={isView}>
                  <InputLabel>Type</InputLabel>
                  <Select 
                    value={formData.discount_type} 
                    label="Type" 
                    onChange={handleFormChange("discount_type")}
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="amount">Amount (₫)</MenuItem>
                    <MenuItem value="percent">Percent (%)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Summary Section */}
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: alpha('#3b82f6', 0.02) }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Payment Summary</Typography>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography fontWeight="600">{new Intl.NumberFormat('vi-VN').format(totals.subtotal)} ₫</Typography>
              </Box>
              
              {totals.discountVal > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="success.main">Discount</Typography>
                  <Typography color="success.main" fontWeight="600">
                    -{new Intl.NumberFormat('vi-VN').format(totals.discountVal)} ₫
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Tax (8%)</Typography>
                <Typography fontWeight="600">{new Intl.NumberFormat('vi-VN').format(totals.tax)} ₫</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total Amount</Typography>
                <Typography variant="h6" >
                    {new Intl.NumberFormat('vi-VN').format(totals.total)} ₫
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Right Side: Items List */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
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
                  {items.map((item, index) => (
                    <TableRow key={index}>
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
                        {new Intl.NumberFormat('vi-VN').format(item.unitPrice * item.quantity - item.discount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}