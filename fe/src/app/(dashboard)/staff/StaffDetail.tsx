"use client";

import React, { useState, useEffect } from "react";
import {
    Grid, Box, Button, TextField, MenuItem, FormControl,
    InputLabel, Select, Paper, Stack, Typography, IconButton,
    Divider, Avatar, alpha, InputAdornment, FormHelperText
} from "@mui/material";
import {
    Save, ArrowBack, Person, Phone, Email,
    Store, AccountBalanceWallet, CalendarToday, PhotoCamera
} from "@mui/icons-material";
import {
    Staff, StaffFormData, StaffStatus,
    SalaryType, Gender
} from "@/types/staff";
import { Store as StoreType } from "@/types/store";
import { User, UserFormData, UserResponse, UserRole } from "@/types/user";
import { Store as StoreData } from "@/types/store";
import { createTheme, ThemeProvider } from "@mui/material/styles";
const blueTheme = createTheme({
    palette: {
        primary: {
            main: "#3b82f6",
        },
    },
});
interface StaffDetailProps {
    mode: "add" | "edit" | "view";
    initialData?: Staff | null;
    storeList: StoreType[];
    onSave: (data: StaffFormData) => Promise<void>;
    onBack: () => void;
    loading?: boolean;
}

export default function StaffDetail({
    mode,
    initialData,
    storeList,
    onSave,
    onBack,
    loading
}: StaffDetailProps) {
    const [formData, setFormData] = useState<StaffFormData>(() => {
        if (initialData && (mode === "edit" || mode === "view")) {
            return {
                full_name: initialData.full_name,
                phone: initialData.phone,
                email: initialData.email || "",
                gender: initialData.gender,
                birthday: initialData.birthday ? new Date(initialData.birthday).toISOString().split("T")[0] : "",
                address: initialData.address || "",
                store_id: initialData.store?.id ?? initialData.store_id ?? "",
                hire_date: initialData.hire_date ? new Date(initialData.hire_date).toISOString().split("T")[0] : "",
                salary_type: initialData.salary_type,
                base_salary: initialData.base_salary || 0,
                commission_rate: initialData.commission_rate || 0,
                status: initialData.status,
            };
        }
        return {
            full_name: "",
            phone: "",
            email: "",
            gender: "" as Gender,
            birthday: "",
            address: "",
            store_id: "",
            hire_date: "",
            salary_type: "" as SalaryType,
            base_salary: 0,
            commission_rate: 0,
            status: "active" as StaffStatus,
        };
    });

    const [errors, setErrors] = useState<Partial<Record<keyof StaffFormData, string>>>({});

    const handleChange = (field: keyof StaffFormData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string | number | null } }
    ) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const validate = () => {
        const newErrors: Partial<Record<keyof StaffFormData, string>> = {};
        if (!formData.full_name) newErrors.full_name = "Full Name is required";
        if (!formData.phone) newErrors.phone = "Phone number is required";
        if (!formData.store_id) newErrors.store_id = "Store assignment is required";
        if (!formData.salary_type) newErrors.salary_type = "Salary type is required";
        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.gender) newErrors.gender = "Gender is required";
        if (!formData.address) newErrors.address = "Address is required";
        if (!formData.hire_date) newErrors.hire_date = "Hire date is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validate()) {
            const submitData = {
                ...formData,
                store_id: formData.store_id ? Number(formData.store_id) : undefined,
                base_salary: formData.base_salary ? Number(formData.base_salary) : 0,
                commission_rate: formData.commission_rate ? Number(formData.commission_rate) : undefined,
            };
            onSave(submitData as StaffFormData);
        }
    };

    const isView = mode === "view";

    return (
        <ThemeProvider theme={blueTheme}>  <Box sx={{ px: 2, py: 0 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <IconButton onClick={onBack} sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h5" fontWeight="bold">
                    {mode === "add" ? "Register New Staff" : mode === "edit" ? "Edit Staff Profile" : "Staff Details"}
                </Typography>
            </Stack>

            <Grid container spacing={3}>
                {/* Profile Card Section */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, textAlign: 'center', height: '100%', borderRadius: 2 }}>
                        <Box sx={{ position: 'relative', display: 'inline-block' }}>
                            <Avatar
                                sx={{
                                    width: 120, height: 120, mx: 'auto', mb: 2,
                                    bgcolor: alpha("#3b82f6", 0.1), color: "#3b82f6", fontSize: 48,
                                    border: `2px solid ${alpha("#3b82f6", 0.2)}`
                                }}
                            >
                                {formData.full_name?.charAt(0).toUpperCase() || <Person />}
                            </Avatar>
                            {!isView && (
                                <IconButton
                                    size="small"
                                    sx={{
                                        position: 'absolute', bottom: 20, right: 0,
                                        bgcolor: '#3b82f6', color: 'white',
                                        '&:hover': { bgcolor: 'primary.dark' }
                                    }}
                                >
                                    <PhotoCamera fontSize="small" />
                                </IconButton>
                            )}
                        </Box>
                        <Typography variant="h6" fontWeight="bold">{formData.full_name || "Staff Name"}</Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {formData.phone || "No phone provided"}
                        </Typography>

                        <Divider sx={{ my: 3 }} />

                        <FormControl fullWidth disabled={isView} size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={formData.status}
                                label="Status"
                                onChange={handleChange("status")}
                            >
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                                <MenuItem value="on_leave">On Leave</MenuItem>
                            </Select>
                        </FormControl>
                    </Paper>
                </Grid>

                {/* Main Form Section */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3 }}>
                            Personal Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth label="Full Name *"
                                    value={formData.full_name} onChange={handleChange("full_name")}
                                    disabled={isView} error={!!errors.full_name} helperText={errors.full_name}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth label="Phone *"
                                    value={formData.phone} onChange={handleChange("phone")}
                                    disabled={isView} error={!!errors.phone} helperText={errors.phone}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth label="Email" type="email"
                                    value={formData.email} onChange={handleChange("email")}
                                    disabled={isView} error={!!errors.email} helperText={errors.email}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth disabled={isView} error={!!errors.gender}>
                                    <InputLabel>Gender</InputLabel>
                                    <Select value={formData.gender} label="Gender" onChange={handleChange("gender")}>
                                        <MenuItem value="male">Male</MenuItem>
                                        <MenuItem value="female">Female</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>
                                    {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
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
                                <FormControl fullWidth required disabled={isView} error={!!errors.store_id}>
                                    <InputLabel>Assigned Store</InputLabel>
                                    <Select
                                        value={formData.store_id}
                                        label="Assigned Store"
                                        onChange={(e) => setFormData({ ...formData, store_id: Number(e.target.value) })}
                                    >
                                        {storeList.map(store => (
                                            <MenuItem key={store.id} value={store.id}>{store.name}</MenuItem>
                                        ))}
                                    </Select>
                                    {errors.store_id && <FormHelperText>{errors.store_id}</FormHelperText>}
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth label="Address"
                                    value={formData.address} onChange={handleChange("address")}
                                    disabled={isView} error={!!errors.address} helperText={errors.address}
                                />
                            </Grid>
                        </Grid>

                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 4, mb: 3 }}>
                            Employment & Salary
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth label="Hire Date" type="date"
                                    value={formData.hire_date} onChange={handleChange("hire_date")}
                                    disabled={isView} InputLabelProps={{ shrink: true }}
                                    error={!!errors.hire_date} helperText={errors.hire_date}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth required disabled={isView} error={!!errors.salary_type}>
                                    <InputLabel>Salary Type</InputLabel>
                                    <Select value={formData.salary_type} label="Salary Type" onChange={handleChange("salary_type")}>
                                        <MenuItem value="fixed">Fixed Salary</MenuItem>
                                        <MenuItem value="hourly">Hourly Rate</MenuItem>
                                        <MenuItem value="commission">Commission</MenuItem>
                                    </Select>
                                    {errors.salary_type && <FormHelperText>{errors.salary_type}</FormHelperText>}
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth label="Base Salary" type="number"
                                    value={formData.base_salary} onChange={handleChange("base_salary")}
                                    disabled={isView}
                                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                />
                            </Grid>
                            {formData.salary_type === "commission" && (
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth label="Commission Rate" type="number"
                                        value={formData.commission_rate} onChange={handleChange("commission_rate")}
                                        disabled={isView}
                                        InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                                    />
                                </Grid>
                            )}
                        </Grid>

                        {mode !== "view" && (
                            <Box sx={{ mt: 4, pt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2, borderTop: `1px solid ${alpha("#000", 0.05)}` }}>
                                <Button
                                    variant="contained" startIcon={<Save />}
                                    onClick={handleSave} disabled={loading}
                                    sx={{ px: 4, bgcolor: '#004aad' }}
                                >
                                    {mode === "add" ? "Add Staff Member" : "Save Profile Changes"}
                                </Button>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
        </ThemeProvider>

    );
}