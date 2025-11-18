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
  Paper,
  TablePagination,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  People,
  Phone,
  Email,
  Store as StoreIcon,
  CheckCircle,
  Cancel,
  BeachAccess,
  DateRange,
  AttachMoney,
  Person,
  FilterList,
} from '@mui/icons-material';

// Colors
const PRIMARY_COLOR = '#14b8a6';
const PRIMARY_DARK = '#0f766e';
const SUCCESS_COLOR = '#10b981';
const ERROR_COLOR = '#ef4444';
const WARNING_COLOR = '#f59e0b';
const INFO_COLOR = '#3b82f6';

// Types
type Gender = 'male' | 'female' | 'other';
type SalaryType = 'fixed' | 'hourly' | 'commission';
type Status = 'active' | 'inactive' | 'on_leave';

interface Staff {
  id: number;
  code: string;
  full_name: string;
  phone: string;
  email: string | null;
  gender: Gender;
  birthday: string | null;
  address: string | null;
  store_id: number | null;
  store_name?: string;
  hire_date: string | null;
  salary_type: SalaryType;
  base_salary: number | null;
  commission_rate: number | null;
  status: Status;
  created_at: string;
  updated_at: string;
}

interface StaffFormData {
  code: string;
  full_name: string;
  phone: string;
  email: string;
  gender: Gender;
  birthday: string;
  address: string;
  store_id: string;
  hire_date: string;
  salary_type: SalaryType;
  base_salary: string;
  commission_rate: string;
  status: Status;
}

// Mock Data
const mockStaff: Staff[] = [
  {
    id: 1,
    code: 'ST001',
    full_name: 'Nguyen Thi Mai',
    phone: '+84 901 234 567',
    email: 'mai.nguyen@spa.com',
    gender: 'female',
    birthday: '1995-03-15',
    address: '123 Le Loi, District 1, HCMC',
    store_id: 1,
    store_name: 'Spa Harmony Downtown',
    hire_date: '2023-01-15',
    salary_type: 'fixed',
    base_salary: 15000000,
    commission_rate: null,
    status: 'active',
    created_at: '2023-01-15T08:00:00',
    updated_at: '2023-01-15T08:00:00',
  },
  {
    id: 2,
    code: 'ST002',
    full_name: 'Tran Van Hung',
    phone: '+84 902 345 678',
    email: 'hung.tran@spa.com',
    gender: 'male',
    birthday: '1992-07-20',
    address: '456 Nguyen Hue, District 3, HCMC',
    store_id: 1,
    store_name: 'Spa Harmony Downtown',
    hire_date: '2023-02-01',
    salary_type: 'commission',
    base_salary: 8000000,
    commission_rate: 15.5,
    status: 'active',
    created_at: '2023-02-01T09:00:00',
    updated_at: '2023-02-01T09:00:00',
  },
  {
    id: 3,
    code: 'ST003',
    full_name: 'Le Thi Hoa',
    phone: '+84 903 456 789',
    email: 'hoa.le@spa.com',
    gender: 'female',
    birthday: '1998-11-08',
    address: '789 Tran Hung Dao, District 5, HCMC',
    store_id: 2,
    store_name: 'Spa Serenity Garden',
    hire_date: '2023-03-10',
    salary_type: 'hourly',
    base_salary: 100000,
    commission_rate: null,
    status: 'on_leave',
    created_at: '2023-03-10T10:00:00',
    updated_at: '2023-03-10T10:00:00',
  },
  {
    id: 4,
    code: 'ST004',
    full_name: 'Pham Minh Tuan',
    phone: '+84 904 567 890',
    email: null,
    gender: 'male',
    birthday: '1990-05-25',
    address: null,
    store_id: 2,
    store_name: 'Spa Serenity Garden',
    hire_date: '2023-04-20',
    salary_type: 'fixed',
    base_salary: 12000000,
    commission_rate: null,
    status: 'inactive',
    created_at: '2023-04-20T11:00:00',
    updated_at: '2023-04-20T11:00:00',
  },
];

const getStatusColor = (status: Status) => {
  switch (status) {
    case 'active':
      return SUCCESS_COLOR;
    case 'inactive':
      return ERROR_COLOR;
    case 'on_leave':
      return WARNING_COLOR;
    default:
      return PRIMARY_COLOR;
  }
};

const getStatusLabel = (status: Status) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'inactive':
      return 'Inactive';
    case 'on_leave':
      return 'On Leave';
    default:
      return status;
  }
};

const getSalaryTypeLabel = (type: SalaryType) => {
  switch (type) {
    case 'fixed':
      return 'Fixed Salary';
    case 'hourly':
      return 'Hourly Rate';
    case 'commission':
      return 'Commission';
    default:
      return type;
  }
};

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>(mockStaff);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const initialFormData: StaffFormData = {
    code: '',
    full_name: '',
    phone: '',
    email: '',
    gender: 'male',
    birthday: '',
    address: '',
    store_id: '',
    hire_date: '',
    salary_type: 'fixed',
    base_salary: '',
    commission_rate: '',
    status: 'active',
  };

  const [formData, setFormData] = useState<StaffFormData>(initialFormData);

  // Filter and search
  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const paginatedStaff = filteredStaff.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Stats
  const stats = {
    total: staff.length,
    active: staff.filter((s) => s.status === 'active').length,
    inactive: staff.filter((s) => s.status === 'inactive').length,
    onLeave: staff.filter((s) => s.status === 'on_leave').length,
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, staffMember: Staff) => {
    setAnchorEl(event.currentTarget);
    setSelectedStaff(staffMember);
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
    if (selectedStaff) {
      setDialogMode('edit');
      setFormData({
        code: selectedStaff.code,
        full_name: selectedStaff.full_name,
        phone: selectedStaff.phone,
        email: selectedStaff.email || '',
        gender: selectedStaff.gender,
        birthday: selectedStaff.birthday || '',
        address: selectedStaff.address || '',
        store_id: selectedStaff.store_id?.toString() || '',
        hire_date: selectedStaff.hire_date || '',
        salary_type: selectedStaff.salary_type,
        base_salary: selectedStaff.base_salary?.toString() || '',
        commission_rate: selectedStaff.commission_rate?.toString() || '',
        status: selectedStaff.status,
      });
      setOpenDialog(true);
    }
    handleMenuClose();
  };

  const handleView = () => {
    if (selectedStaff) {
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
    if (selectedStaff) {
      setStaff(staff.filter((s) => s.id !== selectedStaff.id));
      setDeleteConfirmOpen(false);
      setSelectedStaff(null);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setFormData(initialFormData);
  };

  const handleFormChange = (field: keyof StaffFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }
  ) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSubmit = () => {
    if (dialogMode === 'add') {
      const newStaff: Staff = {
        id: staff.length + 1,
        ...formData,
        email: formData.email || null,
        birthday: formData.birthday || null,
        address: formData.address || null,
        store_id: formData.store_id ? parseInt(formData.store_id) : null,
        hire_date: formData.hire_date || null,
        base_salary: formData.base_salary ? parseFloat(formData.base_salary) : null,
        commission_rate: formData.commission_rate ? parseFloat(formData.commission_rate) : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setStaff([...staff, newStaff]);
    } else if (dialogMode === 'edit' && selectedStaff) {
      setStaff(
        staff.map((s) =>
          s.id === selectedStaff.id
            ? {
                ...s,
                ...formData,
                email: formData.email || null,
                birthday: formData.birthday || null,
                address: formData.address || null,
                store_id: formData.store_id ? parseInt(formData.store_id) : null,
                hire_date: formData.hire_date || null,
                base_salary: formData.base_salary ? parseFloat(formData.base_salary) : null,
                commission_rate: formData.commission_rate
                  ? parseFloat(formData.commission_rate)
                  : null,
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
          Staff Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your spa staff members and their information
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
                    Total Staff
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.total}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.1), width: 56, height: 56 }}>
                  <People sx={{ color: PRIMARY_COLOR, fontSize: 28 }} />
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
                    Active Staff
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
                    On Leave
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.onLeave}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(WARNING_COLOR, 0.1), width: 56, height: 56 }}>
                  <BeachAccess sx={{ color: WARNING_COLOR, fontSize: 28 }} />
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
                    Inactive
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
              placeholder="Search staff..."
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
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value as Status | 'all')}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterList sx={{ color: PRIMARY_COLOR }} />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="on_leave">On Leave</MenuItem>
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
              Add New Staff
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.05) }}>
                <TableCell sx={{ fontWeight: 700 }}>Staff Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Full Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Store</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Salary Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStaff.length > 0 ? (
                paginatedStaff.map((staffMember) => (
                  <TableRow
                    key={staffMember.id}
                    sx={{
                      '&:hover': { bgcolor: alpha(PRIMARY_COLOR, 0.02) },
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={staffMember.code}
                        size="small"
                        sx={{
                          bgcolor: alpha(PRIMARY_COLOR, 0.1),
                          color: PRIMARY_COLOR,
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(PRIMARY_COLOR, 0.1),
                            color: PRIMARY_COLOR,
                            width: 40,
                            height: 40,
                          }}
                        >
                          {staffMember.full_name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {staffMember.full_name}
                          </Typography>
                          {staffMember.email && (
                            <Typography variant="caption" color="text.secondary">
                              {staffMember.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{staffMember.phone}</TableCell>
                    <TableCell>
                      {staffMember.store_name ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <StoreIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">{staffMember.store_name}</Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not assigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getSalaryTypeLabel(staffMember.salary_type)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(staffMember.status)}
                        size="small"
                        sx={{
                          bgcolor: alpha(getStatusColor(staffMember.status), 0.1),
                          color: getStatusColor(staffMember.status),
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, staffMember)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <People sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No staff members found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery || filterStatus !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'Get started by adding your first staff member'}
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
          count={filteredStaff.length}
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
            ? 'Add New Staff'
            : dialogMode === 'edit'
            ? 'Edit Staff'
            : 'Staff Details'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Staff Code *"
                fullWidth
                value={formData.code}
                onChange={handleFormChange('code')}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Full Name *"
                fullWidth
                value={formData.full_name}
                onChange={handleFormChange('full_name')}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Phone *"
                fullWidth
                value={formData.phone}
                onChange={handleFormChange('phone')}
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
              <FormControl fullWidth disabled={dialogMode === 'view'}>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  label="Gender"
                  onChange={handleFormChange('gender')}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Birthday"
                fullWidth
                type="date"
                value={formData.birthday}
                onChange={handleFormChange('birthday')}
                disabled={dialogMode === 'view'}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Address"
                fullWidth
                value={formData.address}
                onChange={handleFormChange('address')}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Store ID"
                fullWidth
                type="number"
                value={formData.store_id}
                onChange={handleFormChange('store_id')}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Hire Date"
                fullWidth
                type="date"
                value={formData.hire_date}
                onChange={handleFormChange('hire_date')}
                disabled={dialogMode === 'view'}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth disabled={dialogMode === 'view'}>
                <InputLabel>Salary Type</InputLabel>
                <Select
                  value={formData.salary_type}
                  label="Salary Type"
                  onChange={handleFormChange('salary_type')}
                >
                  <MenuItem value="fixed">Fixed Salary</MenuItem>
                  <MenuItem value="hourly">Hourly Rate</MenuItem>
                  <MenuItem value="commission">Commission</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Base Salary"
                fullWidth
                type="number"
                value={formData.base_salary}
                onChange={handleFormChange('base_salary')}
                disabled={dialogMode === 'view'}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            {formData.salary_type === 'commission' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Commission Rate"
                  fullWidth
                  type="number"
                  value={formData.commission_rate}
                  onChange={handleFormChange('commission_rate')}
                  disabled={dialogMode === 'view'}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth disabled={dialogMode === 'view'}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={handleFormChange('status')}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="on_leave">On Leave</MenuItem>
                </Select>
              </FormControl>
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
              {dialogMode === 'add' ? 'Add Staff' : 'Save Changes'}
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
            Are you sure you want to delete staff member{' '}
            <strong>{selectedStaff?.full_name}</strong>?
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