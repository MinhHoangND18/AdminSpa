'use client';

import React, { useState, useMemo } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  alpha,
  Avatar,
  Alert,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Snackbar,
  SelectChangeEvent,
  Backdrop
} from '@mui/material';
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  Category as CategoryIcon,
  CheckCircle,
  Cancel,
  Image as ImageIcon,
  Reorder,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getServiceCategories,
  deleteServiceCategory,
  createServiceCategory,
  updateServiceCategory,
} from '@/lib/api/service-categories';
import {
  ServiceCategory,
  CategoryStatus,
  QueryServiceCategoryDto,
  UpdateServiceCategoryDto,
  CreateServiceCategoryDto,
  PaginatedServiceCategories,
} from '@/types';
import CategoryDetail from './CategoryDetail';
import { createTheme, ThemeProvider } from "@mui/material/styles";
const blueTheme = createTheme({
  palette: {
    primary: {
      main: "#3b82f6",
    },
  },
});

// Colors
const PRIMARY_COLOR = '#3b82f6';
const PRIMARY_DARK = '#0f766e';
const SUCCESS_COLOR = '#10b981';
const ERROR_COLOR = '#ef4444';
const INFO_COLOR = '#3b82f6';
const EDIT_COLOR = "#f39c12"

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  displayOrder: string;
  imageUrl: string;
  status: CategoryStatus;
}

interface CategoryDetailFormData {
  name: string;
  slug: string;
  description: string;
  status: CategoryStatus;
}


const getStatusColor = (isActive: boolean) => {
  return isActive ? SUCCESS_COLOR : ERROR_COLOR;
};

const getStatusLabel = (isActive: boolean) => {
  return isActive ? 'Active' : 'Inactive';
};

export default function CategoryForm() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Omit<QueryServiceCategoryDto, 'page' | 'limit'>>({
    search: '',
    isActive: undefined,
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof CategoryFormData, string>>>({});
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const initialFormData: CategoryFormData = {
    name: '',
    slug: '',
    description: '',
    displayOrder: '',
    imageUrl: '',
    status: 'active',
  };

  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);

  const handleDialogClose = () => {
    setOpenDialog(false);
    setFormData(initialFormData);
    setValidationErrors({});
  };

  const validateForm = () => {
    const errors: Partial<Record<keyof CategoryFormData, string>> = {};

    if (!formData.name.trim()) {
      errors.name = 'Category Name is required.';
    }

    if (!formData.slug.trim()) {
      errors.slug = 'Slug is required.';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens.';
    }

    const displayOrder = formData.displayOrder ? parseFloat(formData.displayOrder) : null;
    if (displayOrder !== null && (isNaN(displayOrder) || displayOrder < 0 || !Number.isInteger(displayOrder))) {
      errors.displayOrder = 'Display order must be a positive whole number.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const {
    data: paginatedCategories,
    isLoading: isLoadingCategories,
    isError,
    error,
  } = useQuery<PaginatedServiceCategories>({
    queryKey: ['serviceCategories', page, rowsPerPage, filters],
    queryFn: () => getServiceCategories({
      ...filters,
      page: page + 1,
      limit: rowsPerPage
    }),
    placeholderData: (previousData) => previousData,
  });



  const categories = useMemo((): ServiceCategory[] => {
    if (!paginatedCategories?.data) return [];
    return Array.isArray(paginatedCategories.data) ? paginatedCategories.data : [];
  }, [paginatedCategories]);

  const totalCategories = paginatedCategories?.total ?? 0;

  const createMutation = useMutation({
    mutationFn: createServiceCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] });
      queryClient.invalidateQueries({ queryKey: ['activeServiceCategories'] });
      setSnackbar({ open: true, message: 'Category created successfully!', severity: 'success' });
      handleDialogClose();
    },
    onError: (error: Error) => {
      setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateServiceCategoryDto }) =>
      updateServiceCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] });
      queryClient.invalidateQueries({ queryKey: ['activeServiceCategories'] });
      setSnackbar({ open: true, message: 'Category updated successfully!', severity: 'success' });
      handleDialogClose();
    },
    onError: (error: Error) => {
      setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteServiceCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] });
      queryClient.invalidateQueries({ queryKey: ['activeServiceCategories'] });
      setSnackbar({ open: true, message: 'Category deleted successfully!', severity: 'success' });
      setDeleteConfirmOpen(false);
      setSelectedCategory(null);
    },
    onError: (error: Error) => {
      setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
    }
  });

  const handleFilterChange = <K extends keyof typeof filters>(
    key: K,
    value: typeof filters[K] | 'all'
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
    }));
    setPage(0);
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchQuery }));
    setPage(0);
  };

  const stats = useMemo(() => {
    return {
      total: totalCategories,
      active: categories.filter((c) => c.status === 'active').length,
      inactive: categories.filter((c) => c.status === 'inactive').length,
    };
  }, [categories, totalCategories]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, category: ServiceCategory) => {
    setAnchorEl(event.currentTarget);
    setSelectedCategory(category);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddNew = () => {
    setIsAddLoading(true);

    setTimeout(() => {
      setDialogMode("add");
      setSelectedCategory(null);
      setShowDetail(true);
      setIsAddLoading(false);
    }, 500);
  };

  const handleEdit = (category: ServiceCategory) => {
    setEditingId(category.id);

    setTimeout(() => {
      setSelectedCategory(category);
      setDialogMode("edit");
      setShowDetail(true);
      handleMenuClose();
      setEditingId(null);
    }, 500);
  };
  const handleBack = () => {
    setShowDetail(false);
    setSelectedCategory(null);
  };

  const handleDelete = () => {
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };
  const handleSave = async (data: CategoryDetailFormData) => {
    const submissionData = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      isActive: data.status === 'active',
    };

    if (dialogMode === 'add') {
      await createMutation.mutateAsync(submissionData as CreateServiceCategoryDto);
    } else if (dialogMode === 'edit' && selectedCategory) {
      await updateMutation.mutateAsync({
        id: selectedCategory.id,
        data: submissionData as UpdateServiceCategoryDto
      });
    }
    // setShowDetail(false);
  };

  const confirmDelete = () => {
    if (selectedCategory) {
      deleteMutation.mutate(selectedCategory.id);
    }
  };
  if (showDetail) {
    return (
      <CategoryDetail
        mode={dialogMode}
        initialData={selectedCategory}
        onSave={handleSave}
        onBack={handleBack}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    );
  }

  const handleFormChange = (field: keyof CategoryFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSelectChange = (field: keyof CategoryFormData) => (
    event: SelectChangeEvent
  ) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      setSnackbar({ open: true, message: 'Please fix validation errors', severity: 'error' });
      return;
    }

    const submissionData: CreateServiceCategoryDto = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || undefined,
      displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : undefined,
    };

    if (dialogMode === 'add') {
      createMutation.mutate(submissionData);
    } else if (dialogMode === 'edit' && selectedCategory) {
      updateMutation.mutate({ id: selectedCategory.id, data: submissionData });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isAnyLoading =
    isLoadingCategories ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;
  return (
    <ThemeProvider theme={blueTheme}>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isAnyLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Card sx={{ borderRadius: 0 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total Categories
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.total}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.1), width: 56, height: 56 }}>
                  <CategoryIcon sx={{ color: PRIMARY_COLOR, fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Card sx={{ borderRadius: 0 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Active Categories
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.active}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(SUCCESS_COLOR, 0.1), width: 56, height: 56 }}>
                  <CheckCircle sx={{ color: SUCCESS_COLOR, fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Card sx={{ borderRadius: 0 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Inactive Categories
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.inactive}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(ERROR_COLOR, 0.1), width: 56, height: 56 }}>
                  <Cancel sx={{ color: ERROR_COLOR, fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions Bar */}
      <Card sx={{ mb: 3, borderRadius: 0 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1.5}>
            <TextField
              size="small"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              sx={{
                flex: 1, minWidth: 200, "& .MuiOutlinedInput-root": {
                  borderRadius: "0px",
                }
              }}

              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton size="small" onClick={handleSearch}>
                      <Search sx={{ color: PRIMARY_COLOR, fontSize: 20 }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControl sx={{
              minWidth: 140, "& .MuiOutlinedInput-root": {
                borderRadius: "0px",
              }
            }} size="small"

            >
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'}
                label="Status"
                onChange={(e: SelectChangeEvent) => {
                  const value = e.target.value;
                  handleFilterChange('isActive', value === 'all' ? undefined : value === 'active');
                }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              size="small"
              startIcon={isAddLoading ? <CircularProgress size={20} color="inherit" /> : <Add />}
              disabled={isAddLoading}
              onClick={handleAddNew}
              sx={{
                height: 40,
                bgcolor: PRIMARY_COLOR,
                "&:hover": { bgcolor: PRIMARY_DARK },
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                borderRadius: "0px",
              }}
            >
              Add New Category
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Debug Info */}
      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading categories: {error?.message || 'Unknown error'}
        </Alert>
      )}

      {/* Categories Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.05) }}>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Slug</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isError ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                    <Alert severity="error">Failed to load categories. Please check console for details.</Alert>
                  </TableCell>
                </TableRow>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <TableRow
                    key={category.id}
                    sx={{
                      '&:hover': { bgcolor: alpha(PRIMARY_COLOR, 0.02) },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={category.imageUrl || undefined}
                          sx={{
                            bgcolor: alpha(PRIMARY_COLOR, 0.1),
                            color: PRIMARY_COLOR,
                            width: 44,
                            height: 44,
                          }}
                        >
                          <CategoryIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {category.name}
                          </Typography>
                          {category.description && (
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                              {category.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={category.slug}
                        size="small"
                        sx={{
                          bgcolor: alpha(INFO_COLOR, 0.1),
                          color: INFO_COLOR,
                          fontWeight: 600,
                          fontFamily: 'monospace',
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={getStatusLabel(category.isActive)}
                        size="small"
                        sx={{
                          bgcolor: alpha(getStatusColor(category.isActive), 0.1),
                          color: getStatusColor(category.isActive),
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={
                          editingId === category.id ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <Edit sx={{ fontSize: "18px !important" }} />
                          )
                        }
                        disabled={editingId === category.id}
                        onClick={() => handleEdit(category)}
                        sx={{
                          bgcolor: "#f39c12",
                          "&:hover": { bgcolor: "#e67e22" },
                          textTransform: "none",
                          fontWeight: 600,
                          borderRadius: "0px",
                          px: 2,
                          minWidth: "80px",
                          boxShadow: "none",
                          height: "32px",
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <CategoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No categories found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {filters.search || filters.isActive !== undefined
                          ? 'Try adjusting your search or filters'
                          : 'Get started by adding your first category'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCategories}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar?.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setSnackbar(null)} severity={snackbar?.severity} sx={{ width: '100%' }}>
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}