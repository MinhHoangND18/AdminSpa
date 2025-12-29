"use client";

import React, { useState } from 'react';
import {
  Grid, Box, Button, TextField, MenuItem, FormControl,
  InputLabel, Select, Paper, Stack, Typography, IconButton,
  Divider, Avatar, alpha, InputAdornment, CircularProgress, Chip,
  SelectChangeEvent
} from '@mui/material';
import {
  Save, ArrowBack, Category as CategoryIcon,
  Image as ImageIcon, Link as LinkIcon, Description
} from '@mui/icons-material';
import {
  ServiceCategory,
  CategoryStatus,
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto
} from '@/types';
import { createTheme, ThemeProvider } from "@mui/material/styles";
const blueTheme = createTheme({
  palette: {
    primary: {
      main: "#3b82f6",
    },
  },
});

interface CategoryDetailProps {
  mode: 'add' | 'edit' | 'view';
  initialData?: ServiceCategory | null;
  onSave: (data: CategoryFormData) => Promise<void>;
  onBack: () => void;
  loading?: boolean;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  status: CategoryStatus;
}

export default function CategoryDetail({
  mode,
  initialData,
  onSave,
  onBack,
  loading
}: CategoryDetailProps) {
  const isView = mode === 'view';

  const [formData, setFormData] = useState<CategoryFormData>(() => ({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
    status: initialData?.status || 'active',
  }));

  const [errors, setErrors] = useState<Partial<Record<keyof CategoryFormData, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof CategoryFormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Category name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof CategoryFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSave = async () => {
    if (validate()) {
      await onSave(formData);
    }
  };

  return (
    <ThemeProvider theme={blueTheme}>   <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton onClick={onBack} sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {mode === "add" ? "Create New Category" : mode === "edit" ? "Edit Category" : "Category Details"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {mode === "view" ? "Viewing details of" : "Manage information for"} {formData.name || "New Category"}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Left Side: Preview Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Avatar
                src={formData.imageUrl}
                variant="rounded"
                sx={{ width: 120, height: 120, mx: 'auto', bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6' }}
              >
                <CategoryIcon sx={{ fontSize: 60 }} />
              </Avatar>
            </Box>
            <Typography variant="h6" fontWeight="bold">{formData.name || "Category Name"}</Typography>
            <Chip
              label={formData.status.toUpperCase()}
              size="small"
              color={formData.status === 'active' ? "success" : "error"}
              sx={{ mt: 1, fontWeight: 'bold' }}
            />
          </Paper>
        </Grid>

        {/* Right Side: Form Content */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Description sx={{ color: '#3b82f6' }} fontSize="small" /> Category Information
            </Typography>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth label="Category Name *"
                  value={formData.name} onChange={handleChange("name")}
                  disabled={isView} error={!!errors.name} helperText={errors.name}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth label="Slug *"
                  value={formData.slug} onChange={handleChange("slug")}
                  disabled={isView} error={!!errors.slug} helperText={errors.slug}
                  InputProps={{ startAdornment: <InputAdornment position="start"><LinkIcon fontSize="small" /></InputAdornment> }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth disabled={isView}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={handleChange("status")}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth label="Image URL"
                  value={formData.imageUrl} onChange={handleChange("imageUrl")}
                  disabled={isView}
                  InputProps={{ startAdornment: <InputAdornment position="start"><ImageIcon fontSize="small" /></InputAdornment> }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth label="Description" multiline rows={4}
                  value={formData.description} onChange={handleChange("description")}
                  disabled={isView} placeholder="Describe the services in this category..."
                />
              </Grid>

              {!isView && (
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>

                    <Button
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                      onClick={handleSave}
                      disabled={loading}
                      sx={{ px: 4, bgcolor: '#3b82f6', height: 40 }}
                    >
                      {mode === "add" ? "Save Category" : "Update Category"}
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box></ThemeProvider>

  );
}