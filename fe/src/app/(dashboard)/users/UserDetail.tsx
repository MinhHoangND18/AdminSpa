"use client";

import React, { useState, useEffect } from "react";
import {
    Grid, Box, Button, TextField, MenuItem, FormControl,
    InputLabel, Select, Switch, FormControlLabel, Paper,
    Stack, Typography, IconButton, Divider, Avatar, alpha,
    FormHelperText,
    SelectChangeEvent // Import for Select typing
} from "@mui/material";
import {
    Save, ArrowBack, Person, PhotoCamera, Badge
} from "@mui/icons-material";
import { User, UserRole, UserFormData } from "@/types/user";
import { Staff } from "@/types/staff";
import { Store } from "@/types/store";

interface UserDetailProps {
    mode: "add" | "edit" | "view";
    initialData?: User | null;
    availableStaff: Staff[];
    availableStores: Store[];
    assignableRoles: UserRole[];
    getRoleLabel: (role: UserRole) => string;
    onSave: (data: UserFormData) => Promise<void>; 
    onBack: () => void;
    loading?: boolean;
}

export default function UserDetail({
    mode,
    initialData,
    availableStaff,
    availableStores,
    assignableRoles,
    getRoleLabel,
    onSave,
    onBack,
    loading
}: UserDetailProps) {
    const [formData, setFormData] = useState<UserFormData>(() => {
        if (initialData && (mode === "edit" || mode === "view")) {
            return {
                username: initialData.username,
                email: initialData.email || "",
                fullname: initialData.fullname || "",
                password: "",
                role: initialData.role,
                staff_id: initialData.staff_id?.toString() || "",
                store_id: initialData.store_id?.toString() || "",
                is_active: initialData.is_active,
            };
        } else {
            return {
                username: "",
                email: "",
                fullname: "",
                password: "",
                role: "" as UserRole,
                staff_id: "",
                store_id: "",
                is_active: true,
            };
        }
    });

    const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
    const handleChange = (field: keyof UserFormData) => (
        event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<string>
    ) => {
        const { target } = event;
        let value: string | boolean;

        if (target instanceof HTMLInputElement && target.type === "checkbox") {
            value = target.checked;
        } else {
            value = target.value as string;
        }

        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof UserFormData, string>> = {}; // Fixed: Explicit typing
        if (!formData.username) newErrors.username = "Username is required";
        if (mode === "add" && !formData.password) newErrors.password = "Password is required";
        if (!formData.fullname) newErrors.fullname = "Full name is required";
        if (!formData.role) newErrors.role = "Role assignment is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validate()) {
            onSave(formData);
        }
    };

    const isView = mode === "view";

    return (
        <Box sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <IconButton onClick={onBack} sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h5" fontWeight="bold">
                    {mode === "add" ? "Create New User" : mode === "edit" ? "Edit User Profile" : "User Details"}
                </Typography>
            </Stack>

            <Grid container spacing={3}>
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
                                {formData.username?.charAt(0).toUpperCase() || <Person />}
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
                        <Typography variant="h6" fontWeight="bold">{formData.fullname || "User Full Name"}</Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {formData.email || "No email provided"}
                        </Typography>
                        
                        <Divider sx={{ my: 3 }} />
                        
                        <Stack spacing={2} alignItems="flex-start">
                            <FormControlLabel
                                control={
                                    <Switch 
                                        checked={formData.is_active} 
                                        onChange={handleChange("is_active")} 
                                        disabled={isView} 
                                        color="success"
                                    />
                                }
                                label={<Typography variant="body2" fontWeight="medium">Account Status: {formData.is_active ? "Active" : "Inactive"}</Typography>}
                            />
                        </Stack>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Badge fontSize="small" sx={{ color: '#3b82f6' }} /> Basic Information
                        </Typography>
                        
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth label="Username" required
                                    value={formData.username} onChange={handleChange("username")}
                                    disabled={isView || mode === "edit"}
                                    error={!!errors.username} helperText={errors.username}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth label="Full Name" required
                                    value={formData.fullname} onChange={handleChange("fullname")}
                                    disabled={isView}
                                    error={!!errors.fullname} helperText={errors.fullname}
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
                                <TextField
                                    fullWidth label="Password" type="password"
                                    placeholder={mode === "edit" ? "(Leave blank to keep unchanged)" : ""}
                                    value={formData.password} onChange={handleChange("password")}
                                    disabled={isView}
                                    error={!!errors.password} helperText={errors.password}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth required error={!!errors.role}>
                                    <InputLabel>User Role</InputLabel>
                                    <Select
                                        value={formData.role} label="User Role"
                                        onChange={handleChange("role")} 
                                        disabled={isView}
                                    >
                                        {assignableRoles.map(role => (
                                            <MenuItem key={role} value={role}>{getRoleLabel(role)}</MenuItem>
                                        ))}
                                    </Select>
                                    {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth disabled={isView}>
                                    <InputLabel>Assigned Store/Branch</InputLabel>
                                    <Select
                                        value={formData.store_id} label="Assigned Store/Branch"
                                        onChange={handleChange("store_id")}
                                    >
                                        <MenuItem value=""><em>None</em></MenuItem>
                                        {availableStores.map(store => (
                                            <MenuItem key={store.id} value={store.id.toString()}>{store.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        {mode !== "view" && (
                            <Box sx={{ mt: 4, pt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2, borderTop: `1px solid ${alpha("#000", 0.05)}` }}>
                                <Button variant="outlined" color="inherit" onClick={onBack}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained" 
                                    startIcon={<Save />}
                                    onClick={handleSave} 
                                    disabled={loading}
                                    sx={{ px: 4, bgcolor: '#004aad' }}
                                >
                                    {mode === "add" ? "Create Account" : "Update Information"}
                                </Button>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}