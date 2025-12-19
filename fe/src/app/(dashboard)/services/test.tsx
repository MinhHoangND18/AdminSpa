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
  Divider,
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
  Tooltip,
  Checkbox,
  FormControlLabel,
  Switch,
  CircularProgress,
  Snackbar,
  FormHelperText,
} from '@mui/material';
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Spa,
  Category,
  Schedule,
  AttachMoney,
  Discount,
  Image as ImageIcon,
  CheckCircle,
  Cancel,
  FilterList,
  TrendingUp,
  Inventory,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getServices,
  deleteService,
  createService,
  updateService,
} from '@/lib/api/services';
import { getActiveServiceCategories } from '@/lib/api/service-categories';
import {
  Service,
  ServiceCategory,
  ServiceStatus,
  QueryServiceDto,
  UpdateServiceDto,
  CreateServiceDto,
} from '@/types';

const PRIMARY_COLOR = '#3b82f6';
const PRIMARY_DARK = '#0f766e';
const SUCCESS_COLOR = '#10b981';
const ERROR_COLOR = '#ef4444';
const WARNING_COLOR = '#f59e0b';
const INFO_COLOR = '#3b82f6';
const PURPLE_COLOR = '#a855f7';

interface ServiceFormData {
  name: string;
  categoryId: string;
  description: string;
  durationMinutes: string;
  price: string;
  discountPrice: string;
  imageUrl: string;
  isCombo: boolean;
  status: ServiceStatus;
}

const getStatusColor = (status: ServiceStatus) => {
  switch (status) {
    case 'active':
      return SUCCESS_COLOR;
    case 'inactive':
      return ERROR_COLOR;
    default:
      return PRIMARY_COLOR;
  }
};

const getStatusLabel = (status: ServiceStatus) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'inactive':
      return 'Inactive';
    default:
      return status;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${minutes}m`;
};

export default function ServicesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Omit<QueryServiceDto, 'page' | 'limit'>>({
    search: '',
    categoryId: undefined,
    status: undefined,
    isCombo: undefined,
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof ServiceFormData, string>>>({});

  const initialFormData: ServiceFormData = {
    name: '',
    categoryId: '',
    description: '',
    durationMinutes: '',
    price: '',
    discountPrice: '',
    imageUrl: '',
    isCombo: false,
    status: 'active',
  };

  const [formData, setFormData] = useState<ServiceFormData>(initialFormData);

  const validateForm = () => {
    const errors: Partial<Record<keyof ServiceFormData, string>> = {};

    if (!formData.name.trim()) {
      errors.name = 'Service Name is required.';
    }

    const duration = parseFloat(formData.durationMinutes);
    if (!formData.durationMinutes || isNaN(duration) || duration <= 0 || !Number.isInteger(duration)) {
      errors.durationMinutes = 'Duration must be a positive whole number (minutes).';
    }

    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price) || price <= 0) {
      errors.price = 'Price must be a positive number.';
    }
    
    if (!formData.categoryId) {
        errors.categoryId = 'Category is required.';
    }

    const discountPrice = formData.discountPrice ? parseFloat(formData.discountPrice) : null;
    if (discountPrice !== null && isNaN(discountPrice)) {
      errors.discountPrice = 'Invalid discount price.';
    } else if (discountPrice !== null && discountPrice >= price) {
      errors.discountPrice = 'Discount price must be less than the regular price.';
    } else if (discountPrice !== null && discountPrice < 0) {
      errors.discountPrice = 'Discount price cannot be negative.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['activeServiceCategories'],
    queryFn: getActiveServiceCategories,
    select: (data: any) => data.data,
  });

  const { data: paginatedServices, isLoading: isLoadingServices, isError } = useQuery({
    queryKey: ['services', page, rowsPerPage, filters],
    queryFn: () => getServices({ ...filters, page: page + 1, limit: rowsPerPage }),
    placeholderData: (previousData) => previousData,
  });

  const services: Service[] = paginatedServices?.data?.data ?? [];
  const totalServices = paginatedServices?.data?.total ?? 0;

  const createMutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setSnackbar({ open: true, message: 'Service created successfully!', severity: 'success' });
      handleDialogClose();
    },
    onError: (error: Error) => {
      setSnackbar({ open: true, message: `Action failed: ${error.message}`, severity: 'error' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateServiceDto }) => updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setSnackbar({ open: true, message: 'Service updated successfully!', severity: 'success' });
      handleDialogClose();
    },
    onError: (error: Error) => {
      setSnackbar({ open: true, message: `Action failed: ${error.message}`, severity: 'error' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setSnackbar({ open: true, message: 'Service deleted successfully!', severity: 'success' });
      setDeleteConfirmOpen(false);
      setSelectedService(null);
    },
    onError: (error: Error) => {
      setSnackbar({ open: true, message: `Action failed: ${error.message}`, severity: 'error' });
    }
  });

  const handleFilterChange = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K] | 'all') => {
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

  const stats = useMemo(() => ({
    total: totalServices,
    active: services.filter((s) => s.status === 'active').length,
    combo: services.filter((s) => s.isCombo).length,
    totalRevenue: services.reduce((sum, s) => sum + (Number(s.price) || 0), 0),
  }), [services, totalServices]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, service: Service) => {
    setAnchorEl(event.currentTarget);
    setSelectedService(service);
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
    if (selectedService) {
      setDialogMode('edit');
      setFormData({
        name: selectedService.name,
        categoryId: selectedService.categoryId?.toString() || '',
        description: selectedService.description || '',
        durationMinutes: selectedService.durationMinutes.toString(),
        price: selectedService.price.toString(),
        discountPrice: selectedService.discountPrice?.toString() || '',
        imageUrl: selectedService.imageUrl || '',
        isCombo: selectedService.isCombo,
        status: selectedService.status,
      });
      setValidationErrors({});
      setOpenDialog(true);
    }
    handleMenuClose();
  };

  const handleView = () => {
    if (selectedService) {
      setDialogMode('view');
      setOpenDialog(true);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    if (selectedService) {
      deleteMutation.mutate(selectedService.id);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setFormData(initialFormData);
    setValidationErrors({});
  };

  const handleFormChange = (field: keyof ServiceFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let value = event.target.value;
    
    if ((field === 'durationMinutes' || field === 'price' || field === 'discountPrice') && value !== '') {
        value = value.replace(/[^\d.]/g, '');
    }

    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSwitchChange = (field: keyof ServiceFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: event.target.checked });
  };

  const handleSubmit = () => {
    if (!validateForm()) {
        return;
    }

    const submissionData: CreateServiceDto | UpdateServiceDto = {
      name: formData.name,
      description: formData.description || undefined,
      durationMinutes: parseInt(formData.durationMinutes),
      price: parseFloat(formData.price),
      discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
      imageUrl: formData.imageUrl || undefined,
      isCombo: formData.isCombo,
      status: formData.status,
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
    };

    if (dialogMode === 'add') {
      createMutation.mutate(submissionData as CreateServiceDto);
    } else if (dialogMode === 'edit' && selectedService) {
      updateMutation.mutate({ id: selectedService.id, data: submissionData });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Service Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your spa services and treatment packages
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total Services
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {isLoadingServices ? <CircularProgress size={24} /> : stats.total}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.1), width: 56, height: 56 }}>
                  <Spa sx={{ color: PRIMARY_COLOR, fontSize: 28 }} />
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
                    Active Services
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {isLoadingServices ? <CircularProgress size={24} /> : stats.active}
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
                    Combo Packages
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {isLoadingServices ? <CircularProgress size={24} /> : stats.combo}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(PURPLE_COLOR, 0.1), width: 56, height: 56 }}>
                  <Inventory sx={{ color: PURPLE_COLOR, fontSize: 28 }} />
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
              placeholder="Search services..."
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
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.categoryId || 'all'}
                label="Category"
                onChange={(e) => handleFilterChange('categoryId', e.target.value as number | 'all')}
                disabled={isLoadingCategories}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category: ServiceCategory) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status || 'all'}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value as ServiceStatus | 'all')}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.isCombo === undefined ? 'all' : String(filters.isCombo)}
                label="Type"
                onChange={(e) => handleFilterChange('isCombo', e.target.value === 'all' ? 'all' : e.target.value === 'true')}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="true">Combo Packages</MenuItem>
                <MenuItem value="false">Single Services</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddNew}
              sx={{
                bgcolor: PRIMARY_COLOR,
                '&:hover': { bgcolor: PRIMARY_DARK },
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Add New Service
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.05) }}>
                <TableCell sx={{ fontWeight: 700 }}>Service</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Discount</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingServices ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                    <CircularProgress />
                    <Typography>Loading services...</Typography>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                 <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                     <Alert severity="error">Failed to load services.</Alert>
                  </TableCell>
                </TableRow>
              ) : services.length > 0 ? (
                services.map((service) => (
                  <TableRow
                    key={service.id}
                    sx={{
                      '&:hover': { bgcolor: alpha(PRIMARY_COLOR, 0.02) },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={service.imageUrl || undefined}
                          sx={{
                            bgcolor: alpha(PRIMARY_COLOR, 0.1),
                            color: PRIMARY_COLOR,
                            width: 44,
                            height: 44,
                          }}
                        >
                          <Spa />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {service.name}
                          </Typography>
                          {service.description && (
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                              {service.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={service.category?.name || 'N/A'}
                        size="small"
                        sx={{
                          bgcolor: alpha(INFO_COLOR, 0.1),
                          color: INFO_COLOR,
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" fontWeight="600">
                          {formatDuration(service.durationMinutes)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        {formatCurrency(service.price)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {service.discountPrice ? (
                        <Box>
                          <Typography variant="body2" fontWeight="600" color={SUCCESS_COLOR}>
                            {formatCurrency(service.discountPrice)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Save {formatCurrency(service.price - service.discountPrice)}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No discount
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={service.isCombo ? 'Combo Package' : 'Single Service'}
                        size="small"
                        sx={{
                          bgcolor: alpha(service.isCombo ? PURPLE_COLOR : PRIMARY_COLOR, 0.1),
                          color: service.isCombo ? PURPLE_COLOR : PRIMARY_COLOR,
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(service.status)}
                        size="small"
                        sx={{
                          bgcolor: alpha(getStatusColor(service.status), 0.1),
                          color: getStatusColor(service.status),
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, service)}>
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <Spa sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No services found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {filters.search || filters.categoryId || filters.status || filters.isCombo !== undefined
                          ? 'Try adjusting your search or filters'
                          : 'Get started by adding your first service'}
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
          count={totalServices}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleView}>
          <Visibility sx={{ mr: 1, fontSize: 20 }} />
          View Details
        </MenuItem>
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
          {dialogMode === 'add'
            ? 'Add New Service'
            : dialogMode === 'edit'
            ? 'Edit Service'
            : 'Service Details'}
        </DialogTitle>
        <DialogContent dividers>
          {dialogMode === 'view' && selectedService ? (
            <Grid container spacing={3} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar
                    src={selectedService.imageUrl || undefined}
                    sx={{
                      bgcolor: alpha(PRIMARY_COLOR, 0.1),
                      color: PRIMARY_COLOR,
                      width: 80,
                      height: 80,
                    }}
                  >
                    <Spa sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {selectedService.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip
                        label={selectedService.isCombo ? 'Combo Package' : 'Single Service'}
                        size="small"
                        sx={{
                          bgcolor: alpha(selectedService.isCombo ? PURPLE_COLOR : PRIMARY_COLOR, 0.1),
                          color: selectedService.isCombo ? PURPLE_COLOR : PRIMARY_COLOR,
                        }}
                      />
                      <Chip
                        label={getStatusLabel(selectedService.status)}
                        size="small"
                        sx={{
                          bgcolor: alpha(getStatusColor(selectedService.status), 0.1),
                          color: getStatusColor(selectedService.status),
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body1">{selectedService.category?.name || 'N/A'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body1">
                  {formatDuration(selectedService.durationMinutes)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Regular Price
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {formatCurrency(selectedService.price)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Discount Price
                </Typography>
                <Typography variant="body1" color={SUCCESS_COLOR} fontWeight="600">
                  {selectedService.discountPrice
                    ? formatCurrency(selectedService.discountPrice)
                    : 'No discount'
                  }
                </Typography>
              </Grid>
              {selectedService.description && (
              <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedService.description}
                  </Typography>
                </Grid>
              )}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Created At
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedService.createdAt).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedService.updatedAt).toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={3} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Service Name"
                  value={formData.name}
                  onChange={handleFormChange('name')}
                  required
                  disabled={dialogMode === 'view'}
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl 
                    fullWidth 
                    required
                    disabled={dialogMode === 'view' || isLoadingCategories}
                    error={!!validationErrors.categoryId}
                >
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.categoryId}
                    label="Category"
                    onChange={(e) => handleFormChange('categoryId')(e as React.ChangeEvent<HTMLInputElement>)}
                  >
                    {categories.map((category: ServiceCategory) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.categoryId && <FormHelperText>{validationErrors.categoryId}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  type="text" 
                  value={formData.durationMinutes}
                  onChange={handleFormChange('durationMinutes')}
                  required
                  disabled={dialogMode === 'view'}
                  error={!!validationErrors.durationMinutes}
                  helperText={validationErrors.durationMinutes || 'Must be a whole number.'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">minutes</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Price"
                  type="text" 
                  value={formData.price}
                  onChange={handleFormChange('price')}
                  required
                  disabled={dialogMode === 'view'}
                  error={!!validationErrors.price}
                  helperText={validationErrors.price}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Discount Price"
                  type="text" 
                  value={formData.discountPrice}
                  onChange={handleFormChange('discountPrice')}
                  disabled={dialogMode === 'view'}
                  error={!!validationErrors.discountPrice}
                  helperText={validationErrors.discountPrice}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Discount sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
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
                  disabled={dialogMode === 'view'}
                  placeholder="Describe the service in detail..."
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Image URL"
                  value={formData.imageUrl}
                  onChange={handleFormChange('imageUrl')}
                  disabled={dialogMode === 'view'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ImageIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isCombo}
                      onChange={handleSwitchChange('isCombo')}
                      disabled={dialogMode === 'view'}
                    />
                  }
                  label="Combo Package"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth disabled={dialogMode === 'view'}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as ServiceStatus })
                    }
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {dialogMode !== 'view' && (
            <>
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
                {createMutation.isPending || updateMutation.isPending ? <CircularProgress size={24} /> : (dialogMode === 'add' ? 'Add Service' : 'Save Changes')}
              </Button>
            </>
          )}
          {dialogMode === 'view' && (
            <Button onClick={handleDialogClose}>Close</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete service {selectedService?.name}?
            This action cannot be undone.
          </Alert>
          {selectedService && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
              <Avatar
                src={selectedService.imageUrl || undefined}
                sx={{
                  bgcolor: alpha(PRIMARY_COLOR, 0.1),
                  color: PRIMARY_COLOR,
                  width: 44,
                  height: 44,
                }}
              >
                <Spa />
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight="600">
                  {selectedService.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedService.category?.name} • {formatDuration(selectedService.durationMinutes)}
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
            {deleteMutation.isPending ? <CircularProgress size={24} /> : 'Delete Service'}
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