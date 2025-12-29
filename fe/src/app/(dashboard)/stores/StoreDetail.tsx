"use client";

import React, { useState, useEffect } from "react";
import {
    Grid, Box, Button, TextField, MenuItem, FormControl,
    InputLabel, Select, Paper, Stack, Typography, IconButton,
    Divider, Avatar, alpha, InputAdornment, CircularProgress,
    Switch, FormControlLabel, SelectChangeEvent, FormHelperText
} from "@mui/material";
import {
    Save, ArrowBack, Store as StoreIcon, Phone, Email,
    LocationOn, AccessTime, Person, Link as LinkIcon,
    Description, Code
} from "@mui/icons-material";
import { Store, StoreFormData } from "@/types/store";
import { User } from "@/types/user";
import { InvoiceItem } from "@/types/invoice-item";
import { CreateInvoiceDto, UpdateInvoiceDto } from "@/types/invoice";
import { createTheme, ThemeProvider } from "@mui/material/styles";
interface InvoiceDetailProps {

    onSave: (data: CreateInvoiceDto | UpdateInvoiceDto) => Promise<void>;
}
interface StoreDetailProps {
    mode: "add" | "edit" | "view";
    initialData?: Store | null;
    managers: User[];
    onSave: (data: StoreFormData) => Promise<void>;
    onBack: () => void;
    loading?: boolean;
    saveError?: string | null;
}
const blueTheme = createTheme({
    palette: {
        primary: {
            main: "#3b82f6",
        },
    },
});

export default function StoreDetail({
    mode,
    initialData,
    managers,
    onSave,
    onBack,
    loading,
    saveError
}: StoreDetailProps) {
    const isView = mode === "view";

    const [formData, setFormData] = useState<StoreFormData>({
        code: initialData?.code || "",
        name: initialData?.name || "",
        domain: initialData?.domain || "",
        address: initialData?.address || "",
        phone: initialData?.phone || "",
        email: initialData?.email || "",
        description: initialData?.description || "",
        openingHours: initialData?.openingHours || "",
        latitude: initialData?.latitude?.toString() || "",
        longitude: initialData?.longitude?.toString() || "",
        manager_id: initialData?.manager_id?.toString() || "",
        isActive: initialData?.isActive ?? true,
    });
    const [errors, setErrors] = useState<Partial<Record<keyof StoreFormData, string>>>({});

    const handleChange = (field: keyof StoreFormData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const target = e.target as HTMLInputElement;
        const value = target.type === "checkbox" ? target.checked : target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSelectChange = (field: keyof StoreFormData) => (
        e: SelectChangeEvent<string>
    ) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const validate = () => {
        const newErrors: Partial<Record<keyof StoreFormData, string>> = {};
        if (!formData.code.trim()) {
            newErrors.code = "Store Code is required.";
        }
        if (!formData.name.trim()) {
            newErrors.name = "Store Name is required.";
        }
        if (!formData.address.trim()) {
            newErrors.address = "Address is required.";
        }
        if (!formData.manager_id) {
            newErrors.manager_id = "Manager is required.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (validate()) {
            await onSave(formData);
        }
    };

    return (
        <ThemeProvider theme={blueTheme}>
             <Box>
            {/* Header */}
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <IconButton onClick={onBack} sx={{ bgcolor: "background.paper", boxShadow: 1 }}>
                        <ArrowBack />
                    </IconButton>
                    <Box>
                        <Typography variant="h5" fontWeight="bold">
                            {mode === "add" ? "Add New Store" : mode === "edit" ? "Edit Store" : "Store Details"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {mode === "view" ? "Full information about the store" : "Fill in the information below"}
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            <Grid container spacing={3}>
                {/* Left Column: Basic Information */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                            General Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth label="Store Code" required
                                    value={formData.code} onChange={handleChange("code")}
                                    disabled={isView}
                                    error={!!errors.code}
                                    helperText={errors.code}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Code fontSize="small" /></InputAdornment> }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth label="Store Name" required
                                    value={formData.name} onChange={handleChange("name")}
                                    disabled={isView}
                                    error={!!errors.name}
                                    helperText={errors.name}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><StoreIcon fontSize="small" /></InputAdornment> }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth label="Address" required
                                    value={formData.address} onChange={handleChange("address")}
                                    disabled={isView}
                                    error={!!errors.address}
                                    helperText={errors.address}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn fontSize="small" /></InputAdornment> }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth label="Description" multiline rows={3}
                                    value={formData.description} onChange={handleChange("description")}
                                    disabled={isView}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper sx={{ p: 3, borderRadius: 2, mt: 3 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                            Contact & Operation
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth label="Phone"
                                    value={formData.phone} onChange={handleChange("phone")}
                                    disabled={isView}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Phone fontSize="small" /></InputAdornment> }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth label="Email"
                                    value={formData.email} onChange={handleChange("email")}
                                    disabled={isView}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Email fontSize="small" /></InputAdornment> }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth label="Domain"
                                    value={formData.domain} onChange={handleChange("domain")}
                                    disabled={isView}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><LinkIcon fontSize="small" /></InputAdornment> }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth label="Opening Hours"
                                    placeholder="e.g. 08:00 - 22:00"
                                    value={formData.openingHours} onChange={handleChange("openingHours")}
                                    disabled={isView}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><AccessTime fontSize="small" /></InputAdornment> }}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Right Column: Management & Status */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={3}>
                        <Paper sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                                Management
                            </Typography>
                            <FormControl fullWidth disabled={isView} size="small" sx={{ mb: 2 }} error={!!errors.manager_id}>
                                <InputLabel>Manager</InputLabel>
                                <Select
                                    value={formData.manager_id}
                                    label="Manager"
                                    onChange={handleSelectChange("manager_id")}
                                >
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {managers.map((manager) => (
                                        <MenuItem key={manager.id} value={String(manager.id)}>
                                            {manager.fullname || manager.username}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.manager_id && <FormHelperText>{errors.manager_id}</FormHelperText>}
                            </FormControl>

                            <Divider sx={{ my: 2 }} />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        disabled={isView}
                                        color="primary"
                                    />
                                }
                                label={formData.isActive ? "Active" : "Inactive"}
                            />
                        </Paper>

                        <Paper sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                                Location Coordinates
                            </Typography>
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth label="Latitude" size="small"
                                    value={formData.latitude} onChange={handleChange("latitude")}
                                    disabled={isView}
                                />
                                <TextField
                                    fullWidth label="Longitude" size="small"
                                    value={formData.longitude} onChange={handleChange("longitude")}
                                    disabled={isView}
                                />
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid>
            </Grid>

            {/* Action Buttons */}
            {!isView && (
                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}>

                    <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                        onClick={handleSave}
                        disabled={loading}
                        sx={{ px: 6, bgcolor: "#3b82f6", height: 48, borderRadius: 2 }}
                    >
                        {loading ? "Processing..." : mode === "add" ? "Create Store" : "Save Changes"}
                    </Button>
                </Box>
            )}
            </Box>
        </ThemeProvider>

    );
}