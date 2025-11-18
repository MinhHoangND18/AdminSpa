'use client';

import React, { useState } from 'react';
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

// Colors
const PRIMARY_COLOR = '#14b8a6';
const PRIMARY_DARK = '#0f766e';
const SUCCESS_COLOR = '#10b981';
const ERROR_COLOR = '#ef4444';
const WARNING_COLOR = '#f59e0b';
const INFO_COLOR = '#3b82f6';
const PURPLE_COLOR = '#a855f7';

// Types
type ServiceStatus = 'active' | 'inactive';

interface ServiceCategory {
  id: number;
  name: string;
}

interface Service {
  id: number;
  name: string;
  category_id: number;
  category_name?: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  discount_price: number | null;
  image_url: string | null;
  is_combo: boolean;
  status: ServiceStatus;
  created_at: string;
  updated_at: string;
}

interface ServiceFormData {
  name: string;
  category_id: string;
  description: string;
  duration_minutes: string;
  price: string;
  discount_price: string;
  image_url: string;
  is_combo: boolean;
  status: ServiceStatus;
}

// Mock Data
const mockCategories: ServiceCategory[] = [
  { id: 1, name: 'Massage Therapy' },
  { id: 2, name: 'Facial Treatments' },
  { id: 3, name: 'Body Treatments' },
  { id: 4, name: 'Spa Packages' },
  { id: 5, name: 'Wellness Services' },
];

const mockServices: Service[] = [
  {
    id: 1,
    name: 'Swedish Massage',
    category_id: 1,
    category_name: 'Massage Therapy',
    description: 'A relaxing full-body massage that uses long strokes, kneading, and circular movements to help relax and energize you.',
    duration_minutes: 60,
    price: 850000,
    discount_price: 750000,
    image_url: null,
    is_combo: false,
    status: 'active',
    created_at: '2024-01-15T08:00:00',
    updated_at: '2024-11-10T14:30:00',
  },
  {
    id: 2,
    name: 'Deep Tissue Massage',
    category_id: 1,
    category_name: 'Massage Therapy',
    description: 'A massage technique that focuses on the deeper layers of muscle tissue to release chronic muscle tension.',
    duration_minutes: 90,
    price: 1200000,
    discount_price: null,
    image_url: null,
    is_combo: false,
    status: 'active',
    created_at: '2024-02-20T10:00:00',
    updated_at: '2024-11-08T16:00:00',
  },
  {
    id: 3,
    name: 'Hydrating Facial',
    category_id: 2,
    category_name: 'Facial Treatments',
    description: 'A nourishing facial treatment that deeply hydrates and revitalizes the skin.',
    duration_minutes: 75,
    price: 650000,
    discount_price: 550000,
    image_url: null,
    is_combo: false,
    status: 'active',
    created_at: '2024-03-10T09:30:00',
    updated_at: '2024-11-05T11:00:00',
  },
  {
    id: 4,
    name: 'Ultimate Spa Day Package',
    category_id: 4,
    category_name: 'Spa Packages',
    description: 'A complete spa experience including massage, facial, and body treatment.',
    duration_minutes: 240,
    price: 2500000,
    discount_price: 2200000,
    image_url: null,
    is_combo: true,
    status: 'active',
    created_at: '2024-04-05T14:00:00',
    updated_at: '2024-10-20T18:00:00',
  },
  {
    id: 5,
    name: 'Aromatherapy Session',
    category_id: 5,
    category_name: 'Wellness Services',
    description: 'A therapeutic treatment using essential oils to enhance physical and emotional well-being.',
    duration_minutes: 50,
    price: 500000,
    discount_price: null,
    image_url: null,
    is_combo: false,
    status: 'inactive',
    created_at: '2024-05-12T11:00:00',
    updated_at: '2024-09-15T12:00:00',
  },
];

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
  const [services, setServices] = useState<Service[]>(mockServices);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ServiceStatus | 'all'>('all');
  const [filterCombo, setFilterCombo] = useState<'all' | 'true' | 'false'>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const initialFormData: ServiceFormData = {
    name: '',
    category_id: '',
    description: '',
    duration_minutes: '',
    price: '',
    discount_price: '',
    image_url: '',
    is_combo: false,
    status: 'active',
  };

  const [formData, setFormData] = useState<ServiceFormData>(initialFormData);

  // Filter and search
  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || service.category_id === filterCategory;
    const matchesStatus = filterStatus === 'all' || service.status === filterStatus;
    const matchesCombo = filterCombo === 'all' || service.is_combo === (filterCombo === 'true');
    
    return matchesSearch && matchesCategory && matchesStatus && matchesCombo;
  });

  // Pagination
  const paginatedServices = filteredServices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Stats
  const stats = {
    total: services.length,
    active: services.filter((s) => s.status === 'active').length,
    combo: services.filter((s) => s.is_combo).length,
    totalRevenue: services.reduce((sum, s) => sum + s.price, 0),
  };

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
    setOpenDialog(true);
  };

  const handleEdit = () => {
    if (selectedService) {
      setDialogMode('edit');
      setFormData({
        name: selectedService.name,
        category_id: selectedService.category_id.toString(),
        description: selectedService.description || '',
        duration_minutes: selectedService.duration_minutes.toString(),
        price: selectedService.price.toString(),
        discount_price: selectedService.discount_price?.toString() || '',
        image_url: selectedService.image_url || '',
        is_combo: selectedService.is_combo,
        status: selectedService.status,
      });
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
      setServices(services.filter((s) => s.id !== selectedService.id));
      setDeleteConfirmOpen(false);
      setSelectedService(null);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setFormData(initialFormData);
  };

  const handleFormChange = (field: keyof ServiceFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSwitchChange = (field: keyof ServiceFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: event.target.checked });
  };

  const handleSubmit = () => {
    if (dialogMode === 'add') {
      const newService: Service = {
        id: services.length + 1,
        name: formData.name,
        category_id: parseInt(formData.category_id),
        category_name: mockCategories.find(cat => cat.id === parseInt(formData.category_id))?.name,
        description: formData.description || null,
        duration_minutes: parseInt(formData.duration_minutes),
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        image_url: formData.image_url || null,
        is_combo: formData.is_combo,
        status: formData.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setServices([...services, newService]);
    } else if (dialogMode === 'edit' && selectedService) {
      setServices(
        services.map((s) =>
          s.id === selectedService.id
            ? {
                ...s,
                name: formData.name,
                category_id: parseInt(formData.category_id),
                category_name: mockCategories.find(cat => cat.id === parseInt(formData.category_id))?.name,
                description: formData.description || null,
                duration_minutes: parseInt(formData.duration_minutes),
                price: parseFloat(formData.price),
                discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
                image_url: formData.image_url || null,
                is_combo: formData.is_combo,
                status: formData.status,
                updated_at: new Date().toISOString(),
              }
            : s
        )
      );
    }
    handleDialogClose();
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
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total Services
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.total}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.1), width: 56, height: 56 }}>
                  <Spa sx={{ color: PRIMARY_COLOR, fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Active Services
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
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Combo Packages
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.combo}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(PURPLE_COLOR, 0.1), width: 56, height: 56 }}>
                  <Inventory sx={{ color: PURPLE_COLOR, fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total Value
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(stats.totalRevenue)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(INFO_COLOR, 0.1), width: 56, height: 56 }}>
                  <TrendingUp sx={{ color: INFO_COLOR, fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1, minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: PRIMARY_COLOR }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                label="Category"
                onChange={(e) => setFilterCategory(e.target.value as number | 'all')}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {mockCategories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value as ServiceStatus | 'all')}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterCombo}
                label="Type"
                onChange={(e) => setFilterCombo(e.target.value as 'all' | 'true' | 'false')}
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
          </Box>
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
              {paginatedServices.length > 0 ? (
                paginatedServices.map((service) => (
                  <TableRow
                    key={service.id}
                    sx={{
                      '&:hover': { bgcolor: alpha(PRIMARY_COLOR, 0.02) },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
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
                        label={service.category_name}
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
                          {formatDuration(service.duration_minutes)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        {formatCurrency(service.price)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {service.discount_price ? (
                        <Box>
                          <Typography variant="body2" fontWeight="600" color={SUCCESS_COLOR}>
                            {formatCurrency(service.discount_price)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Save {formatCurrency(service.price - service.discount_price)}
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
                        label={service.is_combo ? 'Combo Package' : 'Single Service'}
                        size="small"
                        sx={{
                          bgcolor: alpha(service.is_combo ? PURPLE_COLOR : PRIMARY_COLOR, 0.1),
                          color: service.is_combo ? PURPLE_COLOR : PRIMARY_COLOR,
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
                        {searchQuery || filterCategory !== 'all' || filterStatus !== 'all' || filterCombo !== 'all'
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
          count={filteredServices.length}
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
                        label={selectedService.is_combo ? 'Combo Package' : 'Single Service'}
                        size="small"
                        sx={{
                          bgcolor: alpha(selectedService.is_combo ? PURPLE_COLOR : PRIMARY_COLOR, 0.1),
                          color: selectedService.is_combo ? PURPLE_COLOR : PRIMARY_COLOR,
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
                <Typography variant="body1">{selectedService.category_name}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body1">
                  {formatDuration(selectedService.duration_minutes)}
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
                  {selectedService.discount_price 
                    ? formatCurrency(selectedService.discount_price)
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
                  {new Date(selectedService.created_at).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedService.updated_at).toLocaleDateString()}
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
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth disabled={dialogMode === 'view'}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category_id}
                    label="Category"
                    onChange={(e) => 
                      setFormData({ ...formData, category_id: e.target.value })
                    }
                  >
                    {mockCategories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={handleFormChange('duration_minutes')}
                  required
                  disabled={dialogMode === 'view'}
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
                  type="number"
                  value={formData.price}
                  onChange={handleFormChange('price')}
                  required
                  disabled={dialogMode === 'view'}
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
                  type="number"
                  value={formData.discount_price}
                  onChange={handleFormChange('discount_price')}
                  disabled={dialogMode === 'view'}
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
                  value={formData.image_url}
                  onChange={handleFormChange('image_url')}
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
                      checked={formData.is_combo}
                      onChange={handleSwitchChange('is_combo')}
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
                sx={{
                  bgcolor: PRIMARY_COLOR,
                  '&:hover': { bgcolor: PRIMARY_DARK },
                }}
              >
                {dialogMode === 'add' ? 'Add Service' : 'Save Changes'}
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
            Are you sure you want to delete service {selectedService?.name} ? 
            This action cannot be undone.
          </Alert>
          {selectedService && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
              <Avatar
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
                  {selectedService.category_name} • {formatDuration(selectedService.duration_minutes)}
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
            sx={{ bgcolor: ERROR_COLOR, '&:hover': { bgcolor: '#dc2626' } }}
          >
            Delete Service
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}