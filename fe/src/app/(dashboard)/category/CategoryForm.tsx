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

// Colors
const PRIMARY_COLOR = '#3b82f6';
const PRIMARY_DARK = '#0f766e';
const SUCCESS_COLOR = '#10b981';
const ERROR_COLOR = '#ef4444';
const INFO_COLOR = '#3b82f6';

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  displayOrder: string;
  imageUrl: string;
  status: CategoryStatus;
}

const getStatusColor = (status: CategoryStatus) => {
  return status === 'active' ? SUCCESS_COLOR : ERROR_COLOR;
};

const getStatusLabel = (status: CategoryStatus) => {
  return status === 'active' ? 'Active' : 'Inactive';
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
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof CategoryFormData, string>>>({});

  const initialFormData: CategoryFormData = {
    name: '',
    slug: '',
    description: '',
    displayOrder: '',
    imageUrl: '',
    status: 'active',
  };

  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);

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
    setDialogMode('add');
    setFormData(initialFormData);
    setValidationErrors({});
    setOpenDialog(true);
  };

  const handleEdit = () => {
    if (selectedCategory) {
      setDialogMode('edit');
      setFormData({
        name: selectedCategory.name,
        slug: selectedCategory.slug,
        description: selectedCategory.description || '',
        displayOrder: selectedCategory.displayOrder.toString(),
        imageUrl: selectedCategory.imageUrl || '',
        status: selectedCategory.status,
      });
      setValidationErrors({});
      setOpenDialog(true);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    if (selectedCategory) {
      deleteMutation.mutate(selectedCategory.id);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setFormData(initialFormData);
    setValidationErrors({});
  };

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
  const [loading, setLoading] = useState(false);
  const isAnyLoading =
  isLoadingCategories ||        
  createMutation.isPending ||   
  updateMutation.isPending ||    
  deleteMutation.isPending;
  return (
    <>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isAnyLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total Categories
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    { stats.total}
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
          <Card>
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
          <Card>
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
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" flexWrap="wrap" gap={2}>
            <TextField
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              sx={{ flex: 1, minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton onClick={handleSearch}><Search sx={{ color: PRIMARY_COLOR }} /></IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ minWidth: 150 }}>
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
              startIcon={<Add />}
              onClick={handleAddNew}
              sx={{
                height: 55,
                bgcolor: PRIMARY_COLOR,
                '&:hover': { bgcolor: PRIMARY_DARK },
                textTransform: 'none',
                fontWeight: 600,
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
              { isError ? (
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
                        label={getStatusLabel(category.status)}
                        size="small"
                        sx={{
                          bgcolor: alpha(getStatusColor(category.status), 0.1),
                          color: getStatusColor(category.status),
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
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, category)}>
                        <MoreVert />
                      </IconButton>
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

      {/* Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: ERROR_COLOR }}>
          <Delete sx={{ mr: 1, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Category' : 'Edit Category'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Category Name"
                value={formData.name}
                onChange={handleFormChange('name')}
                required
                error={!!validationErrors.name}
                helperText={validationErrors.name}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Slug"
                value={formData.slug}
                onChange={handleFormChange('slug')}
                required
                error={!!validationErrors.slug}
                helperText={validationErrors.slug || 'e.g., body-massage, facial-treatment'}
                placeholder="category-slug"
              />
            </Grid>
        
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleFormChange('description')}
                placeholder="Describe the category..."
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Image URL"
                value={formData.imageUrl}
                onChange={handleFormChange('imageUrl')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ImageIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={handleSelectChange('status')}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
            sx={{
              bgcolor: PRIMARY_COLOR,
              '&:hover': { bgcolor: PRIMARY_DARK },
            }}
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              dialogMode === 'add' ? 'Add Category' : 'Save Changes'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete category {selectedCategory?.name}?
            This action cannot be undone.
          </Alert>
          {selectedCategory && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
              <Avatar
                src={selectedCategory.imageUrl || undefined}
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
                <Typography variant="body1" fontWeight="600">
                  {selectedCategory.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedCategory.slug}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            disabled={deleteMutation.isPending}
            sx={{ bgcolor: ERROR_COLOR, '&:hover': { bgcolor: '#dc2626' } }}
          >
            {deleteMutation.isPending ? <CircularProgress size={24} /> : 'Delete Category'}
          </Button>
        </DialogActions>
      </Dialog>

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
    </>
  );
}