"use client";

import React, { useState } from "react";
import {
    Grid, Box, Button, TextField, MenuItem, FormControl,
    InputLabel, Select, Paper, Stack, Typography, IconButton,
    Divider, Avatar, alpha, InputAdornment, CircularProgress, Chip,
    SelectChangeEvent
} from "@mui/material";
import {
    Save, ArrowBack, Person, Phone, Email,
    PhotoCamera, Description
} from "@mui/icons-material";
import {
    Gender, CustomerType, CustomerStatus,
    Customer, CustomerFormData, CreateCustomerDto, UpdateCustomerDto
} from "@/types/customer";
import { Store } from "@/types/store";
import { createTheme, ThemeProvider } from "@mui/material/styles";
const blueTheme = createTheme({
    palette: {
        primary: {
            main: "#3b82f6",
        },
    },
});

interface CustomerDetailProps {
    mode: "add" | "edit" | "view";
    initialData?: Customer | null;
    storeList: Store[];
    onSave: (data: CreateCustomerDto | UpdateCustomerDto) => Promise<void>;
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

    const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});

    const handleTextChange = (field: keyof CustomerFormData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };
    const handleSelectChange = (field: keyof CustomerFormData) => (
        e: SelectChangeEvent<string>
    ) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleSave = async () => {
        const newErrors: Partial<Record<keyof CustomerFormData, string>> = {};
        if (!formData.fullName.trim()) {
            newErrors.fullName = "Full name is required.";
        }
        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required.";
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        
        const submissionData = {
            ...formData,
            storeId: formData.storeId ? parseInt(formData.storeId) : undefined
        };
        await onSave(submissionData as CreateCustomerDto);
    };

    return (
        <ThemeProvider theme={blueTheme}><Box sx={{ p: { xs: 2, md: 2 } }}>
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
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Description sx={{ color: '#3b82f6' }} /> Basic Information
                        </Typography>
                        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth label="Full Name" required
                                    value={formData.fullName} onChange={handleTextChange("fullName")}
                                    disabled={isView}
                                    error={!!errors.fullName}
                                    helperText={errors.fullName}
                                />
                            </Grid>
                             <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth label="Phone Number" required
                                    value={formData.phone} onChange={handleTextChange("phone")}
                                    disabled={isView}
                                    error={!!errors.phone}
                                    helperText={errors.phone}
                                />
                            </Grid>
                             <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth label="Email Address" type="email"
                                    value={formData.email} onChange={handleTextChange("email")}
                                    disabled={isView}
                                    error={!!errors.email}
                                    helperText={errors.email}
                                />
                            </Grid>
                             <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth disabled={isView}>
                                    <InputLabel>Gender</InputLabel>
                                    <Select 
                                        value={formData.gender} 
                                        label="Gender" 
                                        onChange={handleSelectChange("gender")}
                                    >
                                        <MenuItem value={Gender.MALE}>Male</MenuItem>
                                        <MenuItem value={Gender.FEMALE}>Female</MenuItem>
                                        <MenuItem value={Gender.OTHER}>Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                             <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth label="Birthday" type="date"
                                    value={formData.birthday} onChange={handleTextChange("birthday")}
                                    disabled={isView} InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                             <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth disabled={isView}>
                                    <InputLabel>Store</InputLabel>
                                    <Select 
                                        value={formData.storeId} 
                                        label="Store" 
                                        onChange={handleSelectChange("storeId")}
                                    >
                                        {storeList.map(store => (
                                            <MenuItem key={store.id} value={store.id.toString()}>{store.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                             <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth label="Address"
                                    value={formData.address} onChange={handleTextChange("address")}
                                    disabled={isView} multiline rows={2}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth label="Internal Notes" multiline rows={3}
                                    value={formData.notes} onChange={handleTextChange("notes")}
                                    disabled={isView} placeholder="Notes about preferences..."
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 1, textAlign: 'center', borderRadius: 2, mb: 2 }}>
                      
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

                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>Classification</Typography>
                        <Stack spacing={2}>
                            <FormControl fullWidth disabled={isView} size="small">
                                <InputLabel>Type</InputLabel>
                                <Select value={formData.customerType} label="Type" onChange={handleSelectChange("customerType")}>
                                    <MenuItem value={CustomerType.NEW}>New</MenuItem>
                                    <MenuItem value={CustomerType.REGULAR}>Regular</MenuItem>
                                    <MenuItem value={CustomerType.VIP}>VIP</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth disabled={isView} size="small">
                                <InputLabel>Status</InputLabel>
                                <Select value={formData.status} label="Status" onChange={handleSelectChange("status")}>
                                    <MenuItem value={CustomerStatus.ACTIVE}>Active</MenuItem>
                                    <MenuItem value={CustomerStatus.INACTIVE}>Inactive</MenuItem>
                                    <MenuItem value={CustomerStatus.BLOCKED}>Blocked</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
            {!isView && (
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                        onClick={handleSave}
                        disabled={loading}
                        sx={{ px: 6, bgcolor: '#3b82f6', height: 48, borderRadius: 2 }}
                    >
                        {loading ? "Processing..." : (mode === "add" ? "Save Customer" : "Update Profile")}
                    </Button>
                </Box>
            )}
        </Box></ThemeProvider>
        
    );
}