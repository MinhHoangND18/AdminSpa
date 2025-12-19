"use client";

import React, { useState } from "react";
import {
    Grid, Box, Button, TextField, MenuItem, FormControl,
    InputLabel, Select, Paper, Stack, Typography, IconButton,
    Divider, Avatar, alpha, InputAdornment, CircularProgress, Chip
} from "@mui/material";
import {
    Save, ArrowBack, Person, Phone, Email,
    Store as StoreIcon, PhotoCamera, Star,
    Home, Cake, Wc
} from "@mui/icons-material";
import {
    Gender, CustomerType, CustomerStatus,
    Customer, CustomerFormData
} from "@/types/customer";
import { Store } from "@/types/store";

interface CustomerDetailProps {
    mode: "add" | "edit" | "view";
    initialData?: Customer | null;
    storeList: Store[];
    onSave: (data: CustomerFormData) => Promise<void>;
    onBack: () => void;
    loading?: boolean;
}

const formatToFormDate = (date: string | Date | null | undefined): string => {
    if (!date) return "";
    const dateObj = new Date(date);
    return isNaN(dateObj.getTime()) ? "" : dateObj.toISOString().split("T")[0];
};

export default function CustomerDetail({
    mode,
    initialData,
    storeList,
    onSave,
    onBack,
    loading
}: CustomerDetailProps) {
    const isView = mode === "view";
    
    const [formData, setFormData] = useState<CustomerFormData>(() => ({
        fullName: initialData?.fullName || "",
        phone: initialData?.phone || "",
        email: initialData?.email || "",
        gender: initialData?.gender || Gender.OTHER,
        birthday: formatToFormDate(initialData?.birthday),
        address: initialData?.address || "",
        customerType: initialData?.customerType || CustomerType.NEW,
        notes: initialData?.notes || "",
        storeId: initialData?.storeId?.toString() || "",
        status: initialData?.status || CustomerStatus.ACTIVE,
    }));

    const handleChange = (field: keyof CustomerFormData) => (
        e: React.ChangeEvent<HTMLInputElement | { value: unknown }>
    ) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleSave = async () => {
        await onSave(formData);
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header - Giống StaffDetail */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <IconButton onClick={onBack} sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
                        <ArrowBack />
                    </IconButton>
                    <Box>
                        <Typography variant="h5" fontWeight="bold">
                            {mode === "add" ? "Register New Customer" : mode === "edit" ? "Edit Customer Profile" : "Customer Details"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {mode === "view" ? "Viewing information for" : "Manage information for"} {formData.fullName || "New Customer"}
                        </Typography>
                    </Box>
                </Stack>

                {mode !== "view" && (
                    <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                        onClick={handleSave}
                        disabled={loading}
                        sx={{ px: 4, bgcolor: '#3b82f6', height: 45 }}
                    >
                        {mode === "add" ? "Save Customer" : "Update Profile"}
                    </Button>
                )}
            </Box>

            <Grid container spacing={3}>
                {/* Left Side: Profile Card */}
                <Grid size={{xs:12,  md: 4}} >
                    <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                        <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                            <Avatar
                                sx={{ width: 120, height: 120, fontSize: '3rem', bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6', mx: 'auto' }}
                            >
                                {formData.fullName?.charAt(0) || <Person fontSize="large" />}
                            </Avatar>
                            {!isView && (
                                <IconButton
                                    sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'white', boxShadow: 2, '&:hover': { bgcolor: '#f5f5f5' } }}
                                    size="small"
                                >
                                    <PhotoCamera fontSize="small" />
                                </IconButton>
                            )}
                        </Box>
                        <Typography variant="h6" fontWeight="bold">{formData.fullName || "Full Name"}</Typography>
                        <Chip 
                            label={formData.customerType.toUpperCase()} 
                            size="small" 
                            color={formData.customerType === CustomerType.VIP ? "secondary" : "primary"}
                            sx={{ mt: 1, fontWeight: 'bold' }}
                        />
                        <Divider sx={{ my: 3 }} />
                        <Stack spacing={2} textAlign="left">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Phone color="action" />
                                <Typography variant="body2">{formData.phone || "No phone provided"}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Email color="action" />
                                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{formData.email || "No email provided"}</Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>

                {/* Right Side: Form Details */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person sx={{ color: '#3b82f6' }} /> Basic Information
                        </Typography>
                        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth label="Full Name" required
                                    value={formData.fullName} onChange={handleChange("fullName")}
                                    disabled={isView}
                                />
                            </Grid>
                             <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth label="Phone Number" required
                                    value={formData.phone} onChange={handleChange("phone")}
                                    disabled={isView}
                                />
                            </Grid>
                             <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth label="Email Address" type="email"
                                    value={formData.email} onChange={handleChange("email")}
                                    disabled={isView}
                                />
                            </Grid>
                             <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth disabled={isView}>
                                    <InputLabel>Gender</InputLabel>
                                    <Select value={formData.gender} label="Gender" onChange={handleChange("gender") as any}>
                                        <MenuItem value={Gender.MALE}>Male</MenuItem>
                                        <MenuItem value={Gender.FEMALE}>Female</MenuItem>
                                        <MenuItem value={Gender.OTHER}>Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                             <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth label="Birthday" type="date"
                                    value={formData.birthday} onChange={handleChange("birthday")}
                                    disabled={isView} InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                             <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth disabled={isView}>
                                    <InputLabel>Store</InputLabel>
                                    <Select value={formData.storeId} label="Store" onChange={handleChange("storeId") as any}>
                                        {storeList.map(store => (
                                            <MenuItem key={store.id} value={store.id.toString()}>{store.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            
                             <Grid size={{ xs: 12 }}>
                                <Divider sx={{ my: 1 }}>
                                    <Chip label="Account Status & Classification" size="small" variant="outlined" />
                                </Divider>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth disabled={isView}>
                                    <InputLabel>Customer Type</InputLabel>
                                    <Select value={formData.customerType} label="Customer Type" onChange={handleChange("customerType") as any}>
                                        <MenuItem value={CustomerType.NEW}>New</MenuItem>
                                        <MenuItem value={CustomerType.REGULAR}>Regular</MenuItem>
                                        <MenuItem value={CustomerType.VIP}>VIP</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                             <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth disabled={isView}>
                                    <InputLabel>Status</InputLabel>
                                    <Select value={formData.status} label="Status" onChange={handleChange("status") as any}>
                                        <MenuItem value={CustomerStatus.ACTIVE}>Active</MenuItem>
                                        <MenuItem value={CustomerStatus.INACTIVE}>Inactive</MenuItem>
                                        <MenuItem value={CustomerStatus.BLOCKED}>Blocked</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                             <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth label="Address"
                                    value={formData.address} onChange={handleChange("address")}
                                    disabled={isView} multiline rows={2}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth label="Internal Notes" multiline rows={3}
                                    value={formData.notes} onChange={handleChange("notes")}
                                    disabled={isView} placeholder="Notes about preferences..."
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}