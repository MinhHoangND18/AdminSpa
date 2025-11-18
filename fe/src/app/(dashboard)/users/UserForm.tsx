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
    Tooltip,
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
    Person,
    Lock,
    LockOpen,
    AdminPanelSettings,
    Store,
    Badge,
    CalendarToday,
    Security,
    Group,
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
type UserRole = 'super_admin' | 'store_admin' | 'manager' | 'receptionist' | 'staff';

interface Staff {
    id: number;
    name: string;
    phone: string;
    position: string;
}

interface StoreData {
    id: number;
    name: string;
    address: string;
}

interface User {
    id: number;
    username: string;
    email: string | null;
    role: UserRole;
    staff_id: number | null;
    staff_name?: string;
    store_id: number | null;
    store_name?: string;
    last_login: string | null;
    login_attempts: number;
    is_locked: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface UserFormData {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    staff_id: string;
    store_id: string;
    is_active: boolean;
}

// Mock Data
const mockStaff: Staff[] = [
    { id: 1, name: 'Tran Thi Mai', phone: '+84 901 234 567', position: 'Therapist' },
    { id: 2, name: 'Le Van Hung', phone: '+84 902 345 678', position: 'Manager' },
    { id: 3, name: 'Pham Thi Thu', phone: '+84 903 456 789', position: 'Receptionist' },
];

const mockStores: StoreData[] = [
    { id: 1, name: 'Spa Harmony Downtown', address: '123 Nguyen Hue, District 1, HCMC' },
    { id: 2, name: 'Spa Serenity Garden', address: '456 Le Loi, District 3, HCMC' },
];

const mockUsers: User[] = [
    {
        id: 1,
        username: 'admin',
        email: 'admin@spa.com',
        role: 'super_admin',
        staff_id: null,
        store_id: null,
        last_login: '2024-11-20T09:30:00',
        login_attempts: 0,
        is_locked: false,
        is_active: true,
        created_at: '2024-01-01T00:00:00',
        updated_at: '2024-11-20T09:30:00',
    },
    {
        id: 2,
        username: 'minh.manager',
        email: 'minh.manager@spa.com',
        role: 'manager',
        staff_id: 2,
        staff_name: 'Le Van Hung',
        store_id: 1,
        store_name: 'Spa Harmony Downtown',
        last_login: '2024-11-19T14:20:00',
        login_attempts: 0,
        is_locked: false,
        is_active: true,
        created_at: '2024-03-15T08:00:00',
        updated_at: '2024-11-19T14:20:00',
    },
    {
        id: 3,
        username: 'thu.reception',
        email: 'thu.reception@spa.com',
        role: 'receptionist',
        staff_id: 3,
        staff_name: 'Pham Thi Thu',
        store_id: 1,
        store_name: 'Spa Harmony Downtown',
        last_login: '2024-11-20T08:15:00',
        login_attempts: 2,
        is_locked: false,
        is_active: true,
        created_at: '2024-06-10T10:00:00',
        updated_at: '2024-11-20T08:15:00',
    },
    {
        id: 4,
        username: 'mai.therapist',
        email: null,
        role: 'staff',
        staff_id: 1,
        staff_name: 'Tran Thi Mai',
        store_id: 2,
        store_name: 'Spa Serenity Garden',
        last_login: '2024-11-18T16:45:00',
        login_attempts: 5,
        is_locked: true,
        is_active: false,
        created_at: '2024-08-20T09:00:00',
        updated_at: '2024-11-19T10:30:00',
    },
];

// Mock current user (Super Admin)
const mockCurrentUser: User = {
    id: 1,
    username: 'admin',
    email: 'admin@spa.com',
    role: 'super_admin',
    staff_id: null,
    store_id: null,
    last_login: '2024-11-20T09:30:00',
    login_attempts: 0,
    is_locked: false,
    is_active: true,
    created_at: '2024-01-01T00:00:00',
    updated_at: '2024-11-20T09:30:00',
};

const getRoleColor = (role: UserRole) => {
    switch (role) {
        case 'super_admin':
            return ERROR_COLOR;
        case 'store_admin':
            return PURPLE_COLOR;
        case 'manager':
            return INFO_COLOR;
        case 'receptionist':
            return WARNING_COLOR;
        case 'staff':
            return SUCCESS_COLOR;
        default:
            return PRIMARY_COLOR;
    }
};

const getRoleIcon = (role: UserRole) => {
    switch (role) {
        case 'super_admin':
            return <AdminPanelSettings />;
        case 'store_admin':
        case 'manager':
            return <Security />;
        case 'receptionist':
            return <Badge />;
        case 'staff':
            return <Person />;
        default:
            return <Person />;
    }
};

const getRoleLabel = (role: UserRole) => {
    switch (role) {
        case 'super_admin':
            return 'Super Admin';
        case 'store_admin':
            return 'Store Admin';
        case 'manager':
            return 'Manager';
        case 'receptionist':
            return 'Receptionist';
        case 'staff':
            return 'Staff';
        default:
            return role;
    }
};

export default function UsersPage() {
    const currentUser = mockCurrentUser;
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'locked'>('all');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [lockConfirmOpen, setLockConfirmOpen] = useState(false);

    const initialFormData: UserFormData = {
        username: '',
        email: '',
        password: '',
        role: 'staff',
        staff_id: '',
        store_id: '',
        is_active: true,
    };

    const [formData, setFormData] = useState<UserFormData>(initialFormData);

    // Filter and search
    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.staff_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus =
            filterStatus === 'all' ? true :
                filterStatus === 'active' ? user.is_active && !user.is_locked :
                    filterStatus === 'inactive' ? !user.is_active :
                        filterStatus === 'locked' ? user.is_locked : true;

        return matchesSearch && matchesRole && matchesStatus;
    });

    // Pagination
    const paginatedUsers = filteredUsers.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // Stats
    const stats = {
        total: users.length,
        active: users.filter(u => u.is_active && !u.is_locked).length,
        locked: users.filter(u => u.is_locked).length,
        admins: users.filter(u => u.role === 'super_admin' || u.role === 'store_admin').length,
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
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
        if (selectedUser) {
            setDialogMode('edit');
            setFormData({
                username: selectedUser.username,
                email: selectedUser.email || '',
                password: '',
                role: selectedUser.role,
                staff_id: selectedUser.staff_id?.toString() || '',
                store_id: selectedUser.store_id?.toString() || '',
                is_active: selectedUser.is_active,
            });
            setOpenDialog(true);
        }
        handleMenuClose();
    };

    const handleView = () => {
        if (selectedUser) {
            setDialogMode('view');
            setOpenDialog(true);
        }
        handleMenuClose();
    };

    const handleDelete = () => {
        setDeleteConfirmOpen(true);
        handleMenuClose();
    };

    const handleLockUnlock = () => {
        setLockConfirmOpen(true);
        handleMenuClose();
    };

    const confirmDelete = () => {
        if (selectedUser) {
            setUsers(users.filter(u => u.id !== selectedUser.id));
            setDeleteConfirmOpen(false);
            setSelectedUser(null);
        }
    };

    const confirmLockUnlock = () => {
        if (selectedUser) {
            setUsers(users.map(u =>
                u.id === selectedUser.id
                    ? { ...u, is_locked: !u.is_locked, updated_at: new Date().toISOString() }
                    : u
            ));
            setLockConfirmOpen(false);
            setSelectedUser(null);
        }
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setFormData(initialFormData);
    };

    const handleFormChange = (field: keyof UserFormData) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }
    ) => {
        setFormData({ ...formData, [field]: event.target.value });
    };

    const handleSwitchChange = (field: keyof UserFormData) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData({ ...formData, [field]: event.target.checked });
    };

    const handleSubmit = () => {
        if (dialogMode === 'add') {
            const newUser: User = {
                id: users.length + 1,
                username: formData.username,
                email: formData.email || null,
                role: formData.role,
                staff_id: formData.staff_id ? parseInt(formData.staff_id) : null,
                staff_name: mockStaff.find(s => s.id === parseInt(formData.staff_id))?.name,
                store_id: formData.store_id ? parseInt(formData.store_id) : null,
                store_name: mockStores.find(s => s.id === parseInt(formData.store_id))?.name,
                last_login: null,
                login_attempts: 0,
                is_locked: false,
                is_active: formData.is_active,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            setUsers([...users, newUser]);
        } else if (dialogMode === 'edit' && selectedUser) {
            setUsers(
                users.map(u =>
                    u.id === selectedUser.id
                        ? {
                            ...u,
                            username: formData.username,
                            email: formData.email || null,
                            role: formData.role,
                            staff_id: formData.staff_id ? parseInt(formData.staff_id) : null,
                            staff_name: mockStaff.find(s => s.id === parseInt(formData.staff_id))?.name,
                            store_id: formData.store_id ? parseInt(formData.store_id) : null,
                            store_name: mockStores.find(s => s.id === parseInt(formData.store_id))?.name,
                            is_active: formData.is_active,
                            updated_at: new Date().toISOString(),
                        }
                        : u
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

    const canModifyUser = (targetUser: User) => {
        if (!currentUser) return false;
        if (targetUser.id === currentUser.id) return false;
        if (currentUser.role === 'super_admin') return true;
        if (currentUser.role === 'store_admin') {
            return targetUser.role !== 'super_admin' && targetUser.role !== 'store_admin';
        }
        const roleHierarchy = ['super_admin', 'store_admin', 'manager', 'receptionist', 'staff'];
        const currentUserIndex = roleHierarchy.indexOf(currentUser.role);
        const targetUserIndex = roleHierarchy.indexOf(targetUser.role);
        return targetUserIndex > currentUserIndex;
    };

    return (
        <Box >
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    User Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage system users and their permissions
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}   >
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" variant="body2" gutterBottom>
                                        Total Users
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold">
                                        {stats.total}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.1), width: 56, height: 56 }}>
                                    <Group sx={{ color: PRIMARY_COLOR, fontSize: 28 }} />
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
                                        Active Users
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold" color={SUCCESS_COLOR}>
                                        {stats.active}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: alpha(SUCCESS_COLOR, 0.1), width: 56, height: 56 }}>
                                    <LockOpen sx={{ color: SUCCESS_COLOR, fontSize: 28 }} />
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
                                        Locked Users
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold" color={ERROR_COLOR}>
                                        {stats.locked}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: alpha(ERROR_COLOR, 0.1), width: 56, height: 56 }}>
                                    <Lock sx={{ color: ERROR_COLOR, fontSize: 28 }} />
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
                                        Admin Users
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold" color={INFO_COLOR}>
                                        {stats.admins}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: alpha(INFO_COLOR, 0.1), width: 56, height: 56 }}>
                                    <AdminPanelSettings sx={{ color: INFO_COLOR, fontSize: 28 }} />
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
                            placeholder="Search users..."
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
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={filterRole}
                                label="Role"
                                onChange={(e) => setFilterRole(e.target.value as UserRole | 'all')}
                            >
                                <MenuItem value="all">All Roles</MenuItem>
                                <MenuItem value="super_admin">Super Admin</MenuItem>
                                <MenuItem value="store_admin">Store Admin</MenuItem>
                                <MenuItem value="manager">Manager</MenuItem>
                                <MenuItem value="receptionist">Receptionist</MenuItem>
                                <MenuItem value="staff">Staff</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={filterStatus}
                                label="Status"
                                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive' | 'locked')}
                            >
                                <MenuItem value="all">All Status</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                                <MenuItem value="locked">Locked</MenuItem>
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
                            Add New User
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.05) }}>
                                <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Staff</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Store</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Last Login</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedUsers.length > 0 ? (
                                paginatedUsers.map((user) => (
                                    <TableRow
                                        key={user.id}
                                        sx={{
                                            '&:hover': { bgcolor: alpha(PRIMARY_COLOR, 0.02) },
                                            ...(!user.is_active && {
                                                bgcolor: alpha(ERROR_COLOR, 0.02),
                                                '&:hover': { bgcolor: alpha(ERROR_COLOR, 0.05) },
                                            }),
                                            ...(user.is_locked && {
                                                bgcolor: alpha(WARNING_COLOR, 0.02),
                                                '&:hover': { bgcolor: alpha(WARNING_COLOR, 0.05) },
                                            }),
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
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {user.username.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight="600">
                                                        {user.username}
                                                    </Typography>
                                                    {user.email && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {user.email}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={getRoleIcon(user.role)}
                                                label={getRoleLabel(user.role)}
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha(getRoleColor(user.role), 0.1),
                                                    color: getRoleColor(user.role),
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {user.staff_name ? (
                                                <Typography variant="body2">
                                                    {user.staff_name}
                                                </Typography>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Not linked
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {user.store_name ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Store sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    <Typography variant="body2">
                                                        {user.store_name}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Not assigned
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {user.last_login ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                    <Typography variant="body2">
                                                        {new Date(user.last_login).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Never
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                {!user.is_active && (
                                                    <Chip
                                                        label="Inactive"
                                                        size="small"
                                                        color="default"
                                                        variant="outlined"
                                                    />
                                                )}
                                                {user.is_locked && (
                                                    <Chip
                                                        label="Locked"
                                                        size="small"
                                                        color="warning"
                                                    />
                                                )}
                                                {user.is_active && !user.is_locked && (
                                                    <Chip
                                                        label="Active"
                                                        size="small"
                                                        color="success"
                                                    />
                                                )}
                                                {user.login_attempts > 0 && (
                                                    <Tooltip title={`${user.login_attempts} failed login attempts`}>
                                                        <Chip
                                                            label={user.login_attempts}
                                                            size="small"
                                                            color="error"
                                                            variant="outlined"
                                                        />
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleMenuOpen(e, user)}
                                                disabled={!canModifyUser(user)}
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
                                            <Group sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                                No users found
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {searchQuery || filterRole !== 'all' || filterStatus !== 'all'
                                                    ? 'Try adjusting your search or filters'
                                                    : 'Get started by adding your first user'}
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
                    count={filteredUsers.length}
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
                <MenuItem onClick={handleEdit} disabled={!selectedUser || !canModifyUser(selectedUser)}>
                    <Edit sx={{ mr: 1, fontSize: 20 }} />
                    Edit
                </MenuItem>
                <MenuItem
                    onClick={handleLockUnlock}
                    disabled={!selectedUser || !canModifyUser(selectedUser)}
                >
                    {selectedUser?.is_locked ? (
                        <>
                            <LockOpen sx={{ mr: 1, fontSize: 20, color: SUCCESS_COLOR }} />
                            Unlock User
                        </>
                    ) : (
                        <>
                            <Lock sx={{ mr: 1, fontSize: 20, color: WARNING_COLOR }} />
                            Lock User
                        </>
                    )}
                </MenuItem>
                <MenuItem
                    onClick={handleDelete}
                    disabled={!selectedUser || !canModifyUser(selectedUser)}
                    sx={{ color: ERROR_COLOR }}
                >
                    <Delete sx={{ mr: 1, fontSize: 20 }} />
                    Delete
                </MenuItem>
            </Menu>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {dialogMode === 'add'
                        ? 'Add New User'
                        : dialogMode === 'edit'
                            ? 'Edit User'
                            : 'User Details'}
                </DialogTitle>
                <DialogContent dividers>
                    {dialogMode === 'view' && selectedUser ? (
                        <Grid container spacing={3} sx={{ mt: 0.5 }}>
                            <Grid sx={{ gridColumn: 'span 12' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                            color: PRIMARY_COLOR,
                                            width: 80,
                                            height: 80,
                                            fontSize: 32,
                                            fontWeight: 700,
                                        }}
                                    >
                                        {selectedUser.username.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h5" fontWeight="bold">
                                            {selectedUser.username}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                            <Chip
                                                label={getRoleLabel(selectedUser.role)}
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha(getRoleColor(selectedUser.role), 0.1),
                                                    color: getRoleColor(selectedUser.role),
                                                }}
                                            />
                                            {selectedUser.is_locked && (
                                                <Chip label="Locked" size="small" color="warning" />
                                            )}
                                            {!selectedUser.is_active && (
                                                <Chip label="Inactive" size="small" color="default" variant="outlined" />
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Username
                                </Typography>
                                <Typography variant="body1" fontWeight="600">
                                    {selectedUser.username}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Email
                                </Typography>
                                <Typography variant="body1">
                                    {selectedUser.email || 'Not provided'}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Role
                                </Typography>
                                <Typography variant="body1">
                                    {getRoleLabel(selectedUser.role)}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Staff
                                </Typography>
                                <Typography variant="body1">
                                    {selectedUser.staff_name || 'Not linked'}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Store
                                </Typography>
                                <Typography variant="body1">
                                    {selectedUser.store_name || 'Not assigned'}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Last Login
                                </Typography>
                                <Typography variant="body1">
                                    {selectedUser.last_login
                                        ? new Date(selectedUser.last_login).toLocaleString()
                                        : 'Never logged in'
                                    }
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Failed Login Attempts
                                </Typography>
                                <Typography variant="body1">
                                    {selectedUser.login_attempts}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Account Status
                                </Typography>
                                <Typography variant="body1">
                                    {selectedUser.is_locked ? 'Locked' : selectedUser.is_active ? 'Active' : 'Inactive'}
                                </Typography>
                            </Grid>
                            <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                                <Typography variant="caption" color="text.secondary">
                                    Created At
                                </Typography>
                                <Typography variant="body1">
                                    {new Date(selectedUser.created_at).toLocaleDateString()}
                                </Typography>
                            </Grid>
                            <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                                <Typography variant="caption" color="text.secondary">
                                    Last Updated
                                </Typography>
                                <Typography variant="body1">
                                    {new Date(selectedUser.updated_at).toLocaleDateString()}
                                </Typography>
                            </Grid>
                        </Grid>
                    ) : (
                        <Grid container spacing={3} sx={{ mt: 0.5 }}>
                            <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                                <TextField
                                    fullWidth
                                    label="Username"
                                    value={formData.username}
                                    onChange={handleFormChange('username')}
                                    required
                                    disabled={dialogMode === 'view'}
                                />
                            </Grid>
                            <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleFormChange('email')}
                                    disabled={dialogMode === 'view'}
                                />
                            </Grid>
                            <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                                <TextField
                                    fullWidth
                                    label="Password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleFormChange('password')}
                                    required={dialogMode === 'add'}
                                    disabled={dialogMode === 'view'}
                                    helperText={dialogMode === 'edit' ? 'Leave blank to keep current password' : ''}
                                />
                            </Grid>
                            <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                                <FormControl fullWidth required>
                                    <InputLabel>Role</InputLabel>
                                    <Select
                                        value={formData.role}
                                        label="Role"
                                        onChange={(e) =>
                                            setFormData({ ...formData, role: e.target.value as UserRole })
                                        }
                                        disabled={dialogMode === 'view'}
                                    >
                                        <MenuItem value="staff">Staff</MenuItem>
                                        <MenuItem value="receptionist">Receptionist</MenuItem>
                                        <MenuItem value="manager">Manager</MenuItem>
                                        <MenuItem value="store_admin">Store Admin</MenuItem>
                                        {currentUser?.role === 'super_admin' && (
                                            <MenuItem value="super_admin">Super Admin</MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                                <FormControl fullWidth>
                                    <InputLabel>Staff</InputLabel>
                                    <Select
                                        value={formData.staff_id}
                                        label="Staff"
                                        onChange={(e) =>
                                            setFormData({ ...formData, staff_id: e.target.value })
                                        }
                                        disabled={dialogMode === 'view'}
                                    >
                                        <MenuItem value="">No Staff</MenuItem>
                                        {mockStaff.map((staff) => (
                                            <MenuItem key={staff.id} value={staff.id}>
                                                {staff.name} - {staff.position}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                                <FormControl fullWidth>
                                    <InputLabel>Store</InputLabel>
                                    <Select
                                        value={formData.store_id}
                                        label="Store"
                                        onChange={(e) =>
                                            setFormData({ ...formData, store_id: e.target.value })
                                        }
                                        disabled={dialogMode === 'view'}
                                    >
                                        <MenuItem value="">No Store</MenuItem>
                                        {mockStores.map((store) => (
                                            <MenuItem key={store.id} value={store.id}>
                                                {store.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid sx={{ gridColumn: 'span 12' }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.is_active}
                                            onChange={handleSwitchChange('is_active')}
                                            disabled={dialogMode === 'view'}
                                        />
                                    }
                                    label="Active User"
                                />
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
                                {dialogMode === 'add' ? 'Create User' : 'Save Changes'}
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
                        Are you sure you want to delete user {selectedUser?.username}?
                        This action cannot be undone.
                    </Alert>
                    {selectedUser && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                            <Avatar
                                sx={{
                                    bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                    color: PRIMARY_COLOR,
                                    width: 44,
                                    height: 44,
                                    fontWeight: 600,
                                }}
                            >
                                {selectedUser.username.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="body1" fontWeight="600">
                                    {selectedUser.username}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {getRoleLabel(selectedUser.role)} • {selectedUser.email}
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
                        Delete User
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Lock/Unlock Confirmation Dialog */}
            <Dialog open={lockConfirmOpen} onClose={() => setLockConfirmOpen(false)}>
                <DialogTitle>
                    {selectedUser?.is_locked ? 'Unlock User' : 'Lock User'}
                </DialogTitle>
                <DialogContent>
                    <Alert
                        severity={selectedUser?.is_locked ? "info" : "warning"}
                        sx={{ mb: 2 }}
                    >
                        {selectedUser?.is_locked
                            ? `Are you sure you want to unlock user "${selectedUser.username}"?`
                            : `Are you sure you want to lock user "${selectedUser?.username}"? They will not be able to login until unlocked.`
                        }
                    </Alert>
                    {selectedUser && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                            <Avatar
                                sx={{
                                    bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                    color: PRIMARY_COLOR,
                                    width: 44,
                                    height: 44,
                                    fontWeight: 600,
                                }}
                            >
                                {selectedUser.username.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="body1" fontWeight="600">
                                    {selectedUser.username}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {getRoleLabel(selectedUser.role)} • {selectedUser.store_name || 'No store'}
                                </Typography>
                                {selectedUser.login_attempts > 0 && (
                                    <Typography variant="caption" color="warning.main">
                                        {selectedUser.login_attempts} failed login attempts
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLockConfirmOpen(false)}>Cancel</Button>
                    <Button
                        onClick={confirmLockUnlock}
                        variant="contained"
                        color={selectedUser?.is_locked ? "success" : "warning"}
                    >
                        {selectedUser?.is_locked ? 'Unlock User' : 'Lock User'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}