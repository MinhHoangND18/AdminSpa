'use client';

import React, { useState } from 'react';
import {
  Grid, Box, Button, TextField, MenuItem, FormControl,
  InputLabel, Select, Paper, Stack, Typography, IconButton,
  Divider, Avatar, alpha, InputAdornment, CircularProgress, Chip,
  Switch, FormControlLabel
} from '@mui/material';
import {
  Save, ArrowBack, Spa, Image as ImageIcon, Description,
  Schedule, AttachMoney, Discount, Category
} from '@mui/icons-material';
import {
  Service, ServiceCategory, ServiceStatus,
  CreateServiceDto, UpdateServiceDto,
} from '@/types';

interface ServiceDetailProps {
  mode: 'add' | 'edit' | 'view';
  initialData?: Service | null;
  categories: ServiceCategory[];
  onSave: (data: any) => Promise<void>;
  onBack: () => void;
  loading?: boolean;
}

export default function ServiceDetail({
  mode,
  initialData,
  categories,
  onSave,
  onBack,
  loading
}: ServiceDetailProps) {
  const isView = mode === 'view';

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    categoryId: initialData?.categoryId?.toString() || '',
    description: initialData?.description || '',
    durationMinutes: initialData?.durationMinutes?.toString() || '',
    price: initialData?.price?.toString() || '',
    discountPrice: initialData?.discountPrice?.toString() || '',
    imageUrl: initialData?.imageUrl || '',
    isCombo: initialData?.isCombo || false,
    status: initialData?.status || 'active' as ServiceStatus,
  });

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const newErrors: Partial<Record<string, string>> = {};
    if (!formData.name.trim()) newErrors.name = "Service name is required";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    if (!formData.durationMinutes) newErrors.durationMinutes = "Duration is required";
    if (!formData.price) newErrors.price = "Price is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      const submissionData = {
        ...formData,
        durationMinutes: parseInt(formData.durationMinutes),
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
        categoryId: parseInt(formData.categoryId)
      };
      await onSave(submissionData);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 2 } }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton onClick={onBack} sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {mode === "add" ? "Add New Service" : mode === "edit" ? "Edit Service" : "Service Details"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {mode === "view" ? "Viewing details for" : "Manage information for"} {formData.name || "New Service"}
            </Typography>
          </Box>
        </Stack>

        {!isView && (
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
            onClick={handleSave}
            disabled={loading}
            sx={{ px: 4, bgcolor: '#3b82f6', height: 45 }}
          >
            {mode === "add" ? "Save Service" : "Update Service"}
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Left Side: Preview Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Avatar
                src={formData.imageUrl}
                variant="rounded"
                sx={{ 
                    width: 140, height: 140, mx: 'auto', 
                    bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6',
                    borderRadius: 2
                }}
              >
                <Spa sx={{ fontSize: 60 }} />
              </Avatar>
            </Box>
            <Typography variant="h6" fontWeight="bold">{formData.name || "Service Name"}</Typography>
            
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
                <Chip 
                    label={formData.isCombo ? "COMBO" : "SINGLE"} 
                    size="small" 
                    color={formData.isCombo ? "secondary" : "primary"}
                    sx={{ fontWeight: 'bold' }}
                />
                <Chip 
                    label={formData.status.toUpperCase()} 
                    size="small" 
                    variant="outlined"
                    color={formData.status === 'active' ? "success" : "error"}
                    sx={{ fontWeight: 'bold' }}
                />
            </Stack>

            <Divider sx={{ my: 3 }} />
            
            <Stack spacing={2} textAlign="left">
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Base Price:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(formData.price) || 0)}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Duration:</Typography>
                    <Typography variant="body2" fontWeight="bold">{formData.durationMinutes || 0} mins</Typography>
                </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Right Side: Form Content */}
        <Grid size={{ xs: 12, md: 8 }} >
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Description sx={{ color: '#3b82f6' }}  fontSize="small" /> Service Information
            </Typography>
            
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12}} >
                <TextField
                  fullWidth label="Service Name *"
                  value={formData.name} onChange={handleChange("name")}
                  disabled={isView} error={!!errors.name} helperText={errors.name}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }} >
                <FormControl fullWidth disabled={isView} error={!!errors.categoryId}>
                  <InputLabel>Category *</InputLabel>
                  <Select value={formData.categoryId} label="Category *" onChange={handleChange("categoryId") as any}>
                    {categories.map(cat => (
                      <MenuItem key={cat.id} value={cat.id.toString()}>{cat.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} >
                <TextField
                  fullWidth label="Duration (Minutes) *" type="number"
                  value={formData.durationMinutes} onChange={handleChange("durationMinutes")}
                  disabled={isView} error={!!errors.durationMinutes}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Schedule fontSize="small"/></InputAdornment> }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} >
                <TextField
                  fullWidth label="Regular Price *" type="number"
                  value={formData.price} onChange={handleChange("price")}
                  disabled={isView} error={!!errors.price}
                  InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoney fontSize="small"/></InputAdornment> }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} >
                <TextField
                  fullWidth label="Discount Price" type="number"
                  value={formData.discountPrice} onChange={handleChange("discountPrice")}
                  disabled={isView}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Discount fontSize="small"/></InputAdornment> }}
                />
              </Grid>

              <Grid size={{ xs: 12 }} >
                <TextField
                  fullWidth label="Image URL"
                  value={formData.imageUrl} onChange={handleChange("imageUrl")}
                  disabled={isView}
                  InputProps={{ startAdornment: <InputAdornment position="start"><ImageIcon fontSize="small"/></InputAdornment> }}
                />
              </Grid>

             <Grid size={{ xs: 12 }} >
                <TextField
                  fullWidth label="Description" multiline rows={4}
                  value={formData.description} onChange={handleChange("description")}
                  disabled={isView}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} >
                <FormControlLabel
                  control={<Switch checked={formData.isCombo} onChange={handleChange("isCombo") as any} disabled={isView} />}
                  label="Is Combo Package"
                />
              </Grid>

             <Grid size={{ xs: 12, sm: 6 }} >
                <FormControl fullWidth disabled={isView}>
                  <InputLabel>Status</InputLabel>
                  <Select value={formData.status} label="Status" onChange={handleChange("status") as any}>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}