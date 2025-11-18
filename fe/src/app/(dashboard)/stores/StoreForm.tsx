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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Store as StoreIcon,
  Phone,
  Email,
  LocationOn,
  AccessTime,
  Person,
  Link as LinkIcon,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';

// Colors
const PRIMARY_COLOR = '#14b8a6';
const PRIMARY_DARK = '#0f766e';
const SUCCESS_COLOR = '#10b981';
const ERROR_COLOR = '#ef4444';
const WARNING_COLOR = '#f59e0b';

// Types
interface Store {
  id: number;
  code: string;
  name: string;
  domain: string | null;
  address: string;
  phone: string | null;
  email: string | null;
  description: string | null;
  opening_hours: string | null;
  latitude: number | null;
  longitude: number | null;
  manager_id: number | null;
  manager_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface StoreFormData {
  code: string;
  name: string;
  domain: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  opening_hours: string;
  latitude: string;
  longitude: string;
  manager_id: string;
  is_active: boolean;
}

// Mock Data
const mockStores: Store[] = [
  {
    id: 1,
    code: 'SPA001',
    name: 'Spa Harmony Downtown',
    domain: 'harmony-downtown',
    address: '123 Main Street, District 1, Ho Chi Minh City',
    phone: '+84 28 1234 5678',
    email: 'downtown@harmony.spa',
    description: 'Premium spa services in the heart of the city',
    opening_hours: 'Mon-Sun: 9:00 AM - 10:00 PM',
    latitude: 10.7769,
    longitude: 106.7009,
    manager_id: 1,
    manager_name: 'Nguyen Van A',
    is_active: true,
    created_at: '2024-01-15T08:00:00',
    updated_at: '2024-01-15T08:00:00',
  },
  {
    id: 2,
    code: 'SPA002',
    name: 'Spa Serenity Garden',
    domain: 'serenity-garden',
    address: '456 Nguyen Hue Boulevard, District 3, Ho Chi Minh City',
    phone: '+84 28 8765 4321',
    email: 'garden@serenity.spa',
    description: 'Peaceful retreat with garden views',
    opening_hours: 'Mon-Sun: 8:00 AM - 9:00 PM',
    latitude: 10.7756,
    longitude: 106.7019,
    manager_id: 2,
    manager_name: 'Tran Thi B',
    is_active: true,
    created_at: '2024-02-10T10:30:00',
    updated_at: '2024-02-10T10:30:00',
  },
  {
    id: 3,
    code: 'SPA003',
    name: 'Spa Luxury Bay',
    domain: 'luxury-bay',
    address: '789 Le Loi Street, District 5, Ho Chi Minh City',
    phone: '+84 28 5555 6666',
    email: 'bay@luxury.spa',
    description: 'Luxury spa experience by the bay',
    opening_hours: 'Mon-Fri: 10:00 AM - 11:00 PM, Sat-Sun: 9:00 AM - 11:00 PM',
    latitude: 10.7545,
    longitude: 106.6646,
    manager_id: null,
    manager_name: '',
    is_active: false,
    created_at: '2024-03-05T14:20:00',
    updated_at: '2024-03-05T14:20:00',
  },
];

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>(mockStores);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const initialFormData: StoreFormData = {
    code: '',
    name: '',
    domain: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    opening_hours: '',
    latitude: '',
    longitude: '',
    manager_id: '',
    is_active: true,
  };

  const [formData, setFormData] = useState<StoreFormData>(initialFormData);

  // Filter stores
  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const stats = {
    total: stores.length,
    active: stores.filter((s) => s.is_active).length,
    inactive: stores.filter((s) => !s.is_active).length,
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, store: Store) => {
    setAnchorEl(event.currentTarget);
    setSelectedStore(store);
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
    if (selectedStore) {
      setDialogMode('edit');
      setFormData({
        code: selectedStore.code,
        name: selectedStore.name,
        domain: selectedStore.domain || '',
        address: selectedStore.address,
        phone: selectedStore.phone || '',
        email: selectedStore.email || '',
        description: selectedStore.description || '',
        opening_hours: selectedStore.opening_hours || '',
        latitude: selectedStore.latitude?.toString() || '',
        longitude: selectedStore.longitude?.toString() || '',
        manager_id: selectedStore.manager_id?.toString() || '',
        is_active: selectedStore.is_active,
      });
      setOpenDialog(true);
    }
    handleMenuClose();
  };

  const handleView = () => {
    if (selectedStore) {
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
    if (selectedStore) {
      setStores(stores.filter((s) => s.id !== selectedStore.id));
      setDeleteConfirmOpen(false);
      setSelectedStore(null);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setFormData(initialFormData);
  };

  const handleFormChange = (field: keyof StoreFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, is_active: event.target.checked });
  };

  const handleSubmit = () => {
    if (dialogMode === 'add') {
      const newStore: Store = {
        id: stores.length + 1,
        ...formData,
        domain: formData.domain || null,
        phone: formData.phone || null,
        email: formData.email || null,
        description: formData.description || null,
        opening_hours: formData.opening_hours || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        manager_id: formData.manager_id ? parseInt(formData.manager_id) : null,
        manager_name: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setStores([...stores, newStore]);
    } else if (dialogMode === 'edit' && selectedStore) {
      setStores(
        stores.map((s) =>
          s.id === selectedStore.id
            ? {
                ...s,
                ...formData,
                domain: formData.domain || null,
                phone: formData.phone || null,
                email: formData.email || null,
                description: formData.description || null,
                opening_hours: formData.opening_hours || null,
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                manager_id: formData.manager_id ? parseInt(formData.manager_id) : null,
                updated_at: new Date().toISOString(),
              }
            : s
        )
      );
    }
    handleDialogClose();
  };

  return (
    <>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Store Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your spa locations and branches
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total Stores
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.total}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.1), width: 56, height: 56 }}>
                  <StoreIcon sx={{ color: PRIMARY_COLOR, fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Active Stores
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
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Inactive Stores
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
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search stores..."
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
              Add New Store
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Store Cards */}
      <Grid container spacing={3}>
        {filteredStores.map((store) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={store.id}>
            <Card
              sx={{
                height: '100%',
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Chip
                    label={store.code}
                    size="small"
                    sx={{
                      bgcolor: alpha(PRIMARY_COLOR, 0.1),
                      color: PRIMARY_COLOR,
                      fontWeight: 600,
                    }}
                  />
                  <Box>
                    <Chip
                      label={store.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        bgcolor: store.is_active
                          ? alpha(SUCCESS_COLOR, 0.1)
                          : alpha(ERROR_COLOR, 0.1),
                        color: store.is_active ? SUCCESS_COLOR : ERROR_COLOR,
                        fontWeight: 600,
                        mr: 1,
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, store)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {store.name}
                </Typography>

                {store.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {store.description}
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <LocationOn sx={{ fontSize: 18, color: PRIMARY_COLOR, mt: 0.3 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      {store.address}
                    </Typography>
                  </Box>

                  {store.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone sx={{ fontSize: 18, color: PRIMARY_COLOR }} />
                      <Typography variant="body2" color="text.secondary">
                        {store.phone}
                      </Typography>
                    </Box>
                  )}

                  {store.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email sx={{ fontSize: 18, color: PRIMARY_COLOR }} />
                      <Typography variant="body2" color="text.secondary">
                        {store.email}
                      </Typography>
                    </Box>
                  )}

                  {store.opening_hours && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime sx={{ fontSize: 18, color: PRIMARY_COLOR }} />
                      <Typography variant="body2" color="text.secondary">
                        {store.opening_hours}
                      </Typography>
                    </Box>
                  )}

                  {store.manager_name && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person sx={{ fontSize: 18, color: PRIMARY_COLOR }} />
                      <Typography variant="body2" color="text.secondary">
                        Manager: {store.manager_name}
                      </Typography>
                    </Box>
                  )}

                  {store.domain && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinkIcon sx={{ fontSize: 18, color: PRIMARY_COLOR }} />
                      <Typography variant="body2" color="text.secondary">
                        {store.domain}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredStores.length === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <StoreIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No stores found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery
                  ? 'Try adjusting your search criteria'
                  : 'Get started by adding your first store'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

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
          {dialogMode === 'add' ? 'Add New Store' : dialogMode === 'edit' ? 'Edit Store' : 'Store Details'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Store Code *"
                fullWidth
                value={formData.code}
                onChange={handleFormChange('code')}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Store Name *"
                fullWidth
                value={formData.name}
                onChange={handleFormChange('name')}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Domain"
                fullWidth
                value={formData.domain}
                onChange={handleFormChange('domain')}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Phone"
                fullWidth
                value={formData.phone}
                onChange={handleFormChange('phone')}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Address *"
                fullWidth
                value={formData.address}
                onChange={handleFormChange('address')}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Email"
                fullWidth
                type="email"
                value={formData.email}
                onChange={handleFormChange('email')}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Opening Hours"
                fullWidth
                value={formData.opening_hours}
                onChange={handleFormChange('opening_hours')}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={handleFormChange('description')}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Latitude"
                fullWidth
                type="number"
                value={formData.latitude}
                onChange={handleFormChange('latitude')}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Longitude"
                fullWidth
                type="number"
                value={formData.longitude}
                onChange={handleFormChange('longitude')}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={handleSwitchChange}
                    disabled={dialogMode === 'view'}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} sx = {{color: PRIMARY_COLOR,}}>
            {dialogMode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {dialogMode !== 'view' && (
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{
                bgcolor: PRIMARY_COLOR,
                '&:hover': { bgcolor: PRIMARY_DARK },
              }}
            >
              {dialogMode === 'add' ? 'Add Store' : 'Save Changes'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography>
            Are you sure you want to delete <strong>{selectedStore?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}