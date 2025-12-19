"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  FormHelperText,
  Snackbar,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { usersApi } from "@/lib/api/users";
import {UserResponse} from "@/types/user"
import {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from "@/lib/api/staffs";
import { storesApi } from "@/lib/api/stores";
import { useAuth } from "@/lib/hooks/useAuth";
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
  Close as CloseIcon,
} from "@mui/icons-material";

interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const isAxiosError = (error: unknown): error is AxiosErrorResponse => {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('response' in error || 'message' in error)
  );
};
const PRIMARY_COLOR = "#3b82f6";
const PRIMARY_DARK = "#0f766e";
const SUCCESS_COLOR = "#10b981";
const ERROR_COLOR = "#ef4444";
const WARNING_COLOR = "#f59e0b";
const INFO_COLOR = "#3b82f6";
const PURPLE_COLOR = "#a855f7";

const roleHierarchy: UserRole[] = [
  "super_admin",
  "store_admin",
  "manager",
  "receptionist",
  // "staff",
];

type UserRole =
  | "super_admin"
  | "store_admin"
  | "manager"
  | "receptionist"
  | "staff";

interface Staff {
  id: number;
  full_name: string;
}

interface StoreData {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
  email: string | null;
  fullname: string | null;
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
  fullname: string;
  password: string;
  role: UserRole;
  staff_id: string;
  store_id: string;
  is_active: boolean;
}

const StaffApi = {
  getAll: getStaff,
  create: createStaff,
  update: updateStaff,
  remove: deleteStaff,
};
const getRoleColor = (role: UserRole) => {
  switch (role) {
    case "super_admin":
      return ERROR_COLOR;
    case "store_admin":
      return PURPLE_COLOR;
    case "manager":
      return INFO_COLOR;
    case "receptionist":
      return WARNING_COLOR;
    case "staff":
      return SUCCESS_COLOR;
    default:
      return PRIMARY_COLOR;
  }
};

const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case "super_admin":
      return <AdminPanelSettings />;
    case "store_admin":
    case "manager":
      return <Security />;
    case "receptionist":
      return <Badge />;
    case "staff":
      return <Person />;
    default:
      return <Person />;
  }
};

const getRoleLabel = (role: UserRole) => {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "store_admin":
      return "Store Admin";
    case "manager":
      return "Manager";
    case "receptionist":
      return "Receptionist";
    case "staff":
      return "Staff";
    default:
      return role;
  }
};

export default function UsersPage() {
  const { user: currentUser, loading: authLoading } = useAuth();

  const currentUserRoleIndex = currentUser
    ? roleHierarchy.indexOf(currentUser.role)
    : -1;
  const assignableRoles =
    currentUserRoleIndex !== -1
      ? roleHierarchy.slice(currentUserRoleIndex + 1)
      : [];

  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [availableStores, setAvailableStores] = useState<StoreData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive" | "locked"
  >("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view">("add");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [lockConfirmOpen, setLockConfirmOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof UserFormData, string>>
  >({});

  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning",
  });

  const initialFormData: UserFormData = {
    username: "",
    email: "",
    fullname: "",
    password: "",
    role: "" as UserRole,
    staff_id: "",
    store_id: "",
    is_active: true,
  };

  const [formData, setFormData] = useState<UserFormData>(initialFormData);

  const validateForm = () => {
    const errors: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.username.trim()) {
      errors.username = "Username is required.";
    }

    if (dialogMode === "add" && !formData.password) {
      errors.password = "Password is required for new users.";
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Invalid email format.";
    }

    if (!formData.role) {
      errors.role = "Role is required.";
    }

    const rolesRequiringStaff = ["staff", "receptionist"];
    // if (rolesRequiringStaff.includes(formData.role) && !formData.staff_id) {
    //   errors.staff_id = `${getRoleLabel(
    //     formData.role
    //   )} must be linked to a Staff member.`;
    // }

    const rolesRequiringStore = ["store_admin", "manager", "receptionist"];
    if (rolesRequiringStore.includes(formData.role) && !formData.store_id) {
      errors.store_id = `${getRoleLabel(
        formData.role
      )} must be assigned to a Store.`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const filters = {
      search: searchQuery,
      role: filterRole,
      is_active:
        filterStatus === "active" || filterStatus === "locked"
          ? "true"
          : filterStatus === "inactive"
            ? "false"
            : undefined,
      is_locked: filterStatus === "locked" ? true : undefined,
      page: page + 1,
      limit: rowsPerPage,
    };

    try {
      const apiResponse = await usersApi.getAll(filters);
      const responseData: UserResponse['data'] = apiResponse.data || { data: [], total: 0, page: 0, limit: 0 };
      const users = responseData.data || [];
      const total = responseData.total ?? 0;

      setUsers(users);
      setTotalUsers(total);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, [
    searchQuery,
    filterRole,
    filterStatus,
    page,
    rowsPerPage,
    availableStaff,
    availableStores,
  ]);

  const fetchDropdownData = async () => {
    setLoading(true);
    try {
      const staffResponse = await StaffApi.getAll({});
      const storeResponse = await storesApi.getAll();

      const staffData = staffResponse?.data.data || [];
      setAvailableStaff(Array.isArray(staffData) ? staffData : []);

      const storeData = storeResponse?.data.data || [];
      setAvailableStores(Array.isArray(storeData) ? storeData : []);
    } catch (error) {
      console.error("Failed to fetch dropdown data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const stats = {
    total: users.length,
    active: users.filter((u) => u.is_active && !u.is_locked).length,
    locked: users.filter((u) => u.is_locked).length,
    admins: users.filter(
      (u) => u.role === "super_admin" || u.role === "store_admin"
    ).length,
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddNew = () => {
    setDialogMode("add");
    setFormData(initialFormData);
    setOpenDialog(true);
  };

  const handleEdit = () => {
    if (selectedUser) {
      setDialogMode("edit");
      setFormData({
        username: selectedUser.username,
        email: selectedUser.email || "",
        fullname: selectedUser.fullname || "",
        password: "",
        role: selectedUser.role,
        staff_id: selectedUser.staff_id?.toString() || "",
        store_id: selectedUser.store_id?.toString() || "",
        is_active: selectedUser.is_active,
      });
      setOpenDialog(true);
    }
    handleMenuClose();
  };

  const handleView = () => {
    if (selectedUser) {
      setDialogMode("view");
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

  const confirmDelete = async () => {
    if (selectedUser) {
      setLoading(true);
      try {
        await usersApi.remove(selectedUser.id);
        setDeleteConfirmOpen(false);
        setSelectedUser(null);
        fetchUsers();
        setSnackbar({
          open: true,
          message: `User ${selectedUser.username} deleted successfully.`,
          severity: "success",
        });
      } catch (error: unknown) {
        console.error("Failed to delete user:", error);
        let errorMessage = "An unknown error occurred.";

        if (isAxiosError(error)) {
          errorMessage =
            error.response?.data?.message ||
            error.message ||
            errorMessage;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        setSnackbar({
          open: true,
          message: `Deletion failed: ${errorMessage}`,
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const confirmLockUnlock = async () => {
    if (selectedUser) {
      setLoading(true);
      try {
        const isLocked = !selectedUser.is_locked;
        await usersApi.toggleLock(selectedUser.id, isLocked);
        setLockConfirmOpen(false);
        setSelectedUser(null);
        fetchUsers();
        setSnackbar({
          open: true,
          message: `User ${selectedUser.username} has been ${isLocked ? "locked" : "unlocked"
            }.`,
          severity: isLocked ? "warning" : "success",
        });
      } catch (error: unknown) {
        console.error("Failed to toggle lock:", error);
        let errorMessage = "An unknown error occurred.";

        if (isAxiosError(error)) {
          errorMessage =
            error.response?.data?.message ||
            error.message ||
            errorMessage;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        setSnackbar({
          open: true,
          message: `Action failed: ${errorMessage}`,
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setFormData(initialFormData);
    setValidationErrors({});
  };

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFormChange =
    (field: keyof UserFormData) =>
      (
        event:
          | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
          | { target: { value: string } }
      ) => {
        setFormData({ ...formData, [field]: event.target.value });
        setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
      };

  const handleSwitchChange =
    (field: keyof UserFormData) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [field]: event.target.checked });
      };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const dataToSend: Partial<Omit<UserFormData, 'staff_id' | 'store_id'>> & {
        staff_id: number | null;
        store_id: number | null;
        password?: string; // Tạm thời thêm password là tùy chọn
      } = {
        ...formData,
        staff_id: formData.staff_id ? parseInt(formData.staff_id) : null,
        store_id: formData.store_id ? parseInt(formData.store_id) : null,
      };

      if (dialogMode === "edit" && !dataToSend.password) {
        delete dataToSend.password;
      }

      let successMessage = "";

      if (dialogMode === "add") {
        await usersApi.create(dataToSend);
        successMessage = `User ${formData.username} created successfully!`;
      } else if (dialogMode === "edit" && selectedUser) {
        await usersApi.update(selectedUser.id, dataToSend);
        successMessage = `User ${selectedUser.username} updated successfully!`;
      }

      handleDialogClose();
      fetchUsers();
      setSnackbar({
        open: true,
        message: successMessage,
        severity: "success",
      });
    } catch (error: unknown) {
      console.error(`Failed to ${dialogMode} user:`, error);
      let errorMessage = "An unknown error occurred.";

      if (isAxiosError(error)) {
        errorMessage =
          error.response?.data?.message ||
          error.message ||
          errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setSnackbar({
        open: true,
        message: `Action failed: ${errorMessage}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const canModifyUser = (targetUser: User) => {
    if (!currentUser) return false;
    if (targetUser.id === Number(currentUser.id)) return true;
    //if (currentUser.role === "super_admin") return true;

    const currentUserIndex = roleHierarchy.indexOf(currentUser.role);
    const targetUserIndex = roleHierarchy.indexOf(targetUser.role);

    if (currentUserIndex === -1 || targetUserIndex === -1) return false;

    return targetUserIndex > currentUserIndex;
  };

  if (authLoading || !currentUser) {
    return (
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={true}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Box>
        {/* <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage system users and their permissions
          </Typography>
        </Box> */}

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                      gutterBottom
                    >
                      Total Users
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.total}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: alpha(PRIMARY_COLOR, 0.1),
                      width: 56,
                      height: 56,
                    }}
                  >
                    <Group sx={{ color: PRIMARY_COLOR, fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                      gutterBottom
                    >
                      Active Users
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color={SUCCESS_COLOR}
                    >
                      {stats.active}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: alpha(SUCCESS_COLOR, 0.1),
                      width: 56,
                      height: 56,
                    }}
                  >
                    <LockOpen sx={{ color: SUCCESS_COLOR, fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          {/* <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                      gutterBottom
                    >
                      Locked Users
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color={ERROR_COLOR}
                    >
                      {stats.locked}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: alpha(ERROR_COLOR, 0.1),
                      width: 56,
                      height: 56,
                    }}
                  >
                    <Lock sx={{ color: ERROR_COLOR, fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid> */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                      gutterBottom
                    >
                      Admin Users
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color={INFO_COLOR}
                    >
                      {stats.admins}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: alpha(INFO_COLOR, 0.1),
                      width: 56,
                      height: 56,
                    }}
                  >
                    <AdminPanelSettings
                      sx={{ color: INFO_COLOR, fontSize: 28 }}
                    />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
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
                  onChange={(e) =>
                    setFilterRole(e.target.value as UserRole | "all")
                  }
                  sx={{
                    "& .MuiSelect-select": { paddingRight: "75px !important" },
                  }}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="super_admin">Super Admin</MenuItem>
                  <MenuItem value="store_admin">Store Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="receptionist">Receptionist</MenuItem>
                  {/* <MenuItem value="staff">Staff</MenuItem> */}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) =>
                    setFilterStatus(
                      e.target.value as "all" | "active" | "inactive" | "locked"
                    )
                  }
                  sx={{
                    "& .MuiSelect-select": { paddingRight: "75px !important" },
                  }}
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
                  "&:hover": { bgcolor: PRIMARY_DARK },
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Add New User
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.05) }}>
                  <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Full Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                  {/* <TableCell sx={{ fontWeight: 700 }}>Staff</TableCell> */}
                  <TableCell sx={{ fontWeight: 700 }}>Store</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Last Login</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow
                      key={user.id}
                      sx={{
                        "&:hover": { bgcolor: alpha(PRIMARY_COLOR, 0.02) },
                        ...(!user.is_active && {
                          bgcolor: alpha(ERROR_COLOR, 0.02),
                          "&:hover": { bgcolor: alpha(ERROR_COLOR, 0.05) },
                        }),
                        ...(user.is_locked && {
                          bgcolor: alpha(WARNING_COLOR, 0.02),
                          "&:hover": { bgcolor: alpha(WARNING_COLOR, 0.05) },
                        }),
                      }}
                    >
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
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
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {user.email}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {user.fullname}
                        </Typography>
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
                      {/* <TableCell>
                        {user.staff_name ? (
                          <Typography variant="body2">
                            {user.staff_name}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Not linked
                          </Typography>
                        )}
                      </TableCell> */}
                      <TableCell>
                        {user.store_name ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Store
                              sx={{ fontSize: 16, color: "text.secondary" }}
                            />
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
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <CalendarToday
                              sx={{ fontSize: 14, color: "text.secondary" }}
                            />
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
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          {!user.is_active && (
                            <Chip
                              label="Inactive"
                              size="small"
                              color="default"
                              variant="outlined"
                            />
                          )}
                          {user.is_locked && (
                            <Chip label="Locked" size="small" color="warning" />
                          )}
                          {user.is_active && !user.is_locked && (
                            <Chip label="Active" size="small" color="success" />
                          )}
                          {user.login_attempts > 0 && (
                            <Tooltip
                              title={`${user.login_attempts} failed login attempts`}
                            >
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
                      <Box sx={{ textAlign: "center", py: 6 }}>
                        <Group
                          sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                        />
                        <Typography
                          variant="h6"
                          color="text.secondary"
                          gutterBottom
                        >
                          No users found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {searchQuery ||
                            filterRole !== "all" ||
                            filterStatus !== "all"
                            ? "Try adjusting your search or filters"
                            : "Get started by adding your first user"}
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
            count={totalUsers}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {/* <MenuItem onClick={handleView}>
          <Visibility sx={{ mr: 1, fontSize: 20 }} />
          View Details
        </MenuItem> */}
          <MenuItem
            onClick={handleEdit}
            disabled={!selectedUser || !canModifyUser(selectedUser)}
          >
            <Edit sx={{ mr: 1, fontSize: 20 }} />
            Edit
          </MenuItem>
          {/* <MenuItem
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
        </MenuItem> */}
          <MenuItem
            onClick={handleDelete}
            disabled={
              !selectedUser ||
              !canModifyUser(selectedUser) ||
              selectedUser.id === Number(currentUser.id)
            }
            sx={{ color: ERROR_COLOR }}
          >
            <Delete sx={{ mr: 1, fontSize: 20 }} />
            Delete
          </MenuItem>
        </Menu>

        <Dialog
          open={openDialog}
          onClose={handleDialogClose}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {dialogMode === "add"
              ? "Add New User"
              : dialogMode === "edit"
                ? "Edit User"
                : "User Details"}
          </DialogTitle>
          <DialogContent dividers>
            {dialogMode === "view" && selectedUser ? (
              <Grid container spacing={3} sx={{ mt: 0.5 }}>
                <Grid sx={{ gridColumn: "span 12" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
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
                      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <Chip
                          label={getRoleLabel(selectedUser.role)}
                          size="small"
                          sx={{
                            bgcolor: alpha(
                              getRoleColor(selectedUser.role),
                              0.1
                            ),
                            color: getRoleColor(selectedUser.role),
                          }}
                        />
                        {selectedUser.is_locked && (
                          <Chip label="Locked" size="small" color="warning" />
                        )}
                        {!selectedUser.is_active && (
                          <Chip
                            label="Inactive"
                            size="small"
                            color="default"
                            variant="outlined"
                          />
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
                    {selectedUser.email || "Not provided"}
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
                    {selectedUser.staff_name || "Not linked"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Store
                  </Typography>
                  <Typography variant="body1">
                    {selectedUser.store_name || "Not assigned"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Last Login
                  </Typography>
                  <Typography variant="body1">
                    {selectedUser.last_login
                      ? new Date(selectedUser.last_login).toLocaleString()
                      : "Never logged in"}
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
                    {selectedUser.is_locked
                      ? "Locked"
                      : selectedUser.is_active
                        ? "Active"
                        : "Inactive"}
                  </Typography>
                </Grid>
                <Grid sx={{ gridColumn: { xs: "span 12", sm: "span 6" } }}>
                  <Typography variant="caption" color="text.secondary">
                    Created At
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid sx={{ gridColumn: { xs: "span 12", sm: "span 6" } }}>
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
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={formData.username}
                    onChange={handleFormChange("username")}
                    required
                    disabled={dialogMode === "view"}
                    error={!!validationErrors.username}
                    helperText={validationErrors.username}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Full Name *"
                    value={formData.fullname}
                    onChange={handleFormChange("fullname")}
                    disabled={dialogMode === "view"}
                    error={!!validationErrors.username}
                    helperText={validationErrors.username}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleFormChange("email")}
                    disabled={dialogMode === "view"}
                    error={!!validationErrors.email}
                    helperText={validationErrors.email}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleFormChange("password")}
                    required={dialogMode === "add"}
                    disabled={dialogMode === "view"}
                    error={!!validationErrors.password}
                    helperText={
                      validationErrors.password ||
                      (dialogMode === "edit"
                        ? "Leave blank to keep current password"
                        : "")
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl
                    fullWidth
                    required
                    disabled={
                      dialogMode === "view" ||
                      (dialogMode === "edit" &&
                        selectedUser?.id === Number(currentUser.id))
                    }
                    error={!!validationErrors.role}
                  >
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={formData.role}
                      label="Role"
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          role: e.target.value as UserRole,
                        });
                        setValidationErrors((prev) => ({
                          ...prev,
                          role: undefined,
                        }));
                      }}
                      sx={{
                        "& .MuiSelect-select": {
                          paddingRight: "75px !important",
                        },
                      }}
                    >
                      {assignableRoles.map((role) => (
                        <MenuItem key={role} value={role}>
                          {getRoleLabel(role)}
                        </MenuItem>
                      ))}
                    </Select>
                    {validationErrors.role && (
                      <FormHelperText>{validationErrors.role}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                {/* <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl
                    fullWidth
                    disabled={dialogMode === "view"}
                    error={!!validationErrors.staff_id}
                  >
                    <InputLabel>Staff</InputLabel>
                    <Select
                      value={formData.staff_id}
                      label="Staff"
                      onChange={handleFormChange("staff_id")}
                      sx={{
                        "& .MuiSelect-select": {
                          paddingRight: "75px !important",
                        },
                      }}
                    >
                      <MenuItem value="">No Staff</MenuItem>
                      {availableStaff.map((staff) => (
                        <MenuItem key={staff.id} value={staff.id.toString()}>
                          {staff.full_name}
                        </MenuItem>
                      ))}
                    </Select>
                    {validationErrors.staff_id && (
                      <FormHelperText>
                        {validationErrors.staff_id}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid> */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl
                    fullWidth
                    disabled={dialogMode === "view"}
                    error={!!validationErrors.store_id}
                  >
                    <InputLabel>Store</InputLabel>
                    <Select
                      value={formData.store_id}
                      label="Store"
                      onChange={handleFormChange("store_id")}
                      sx={{
                        "& .MuiSelect-select": {
                          paddingRight: "75px !important",
                        },
                      }}
                    >
                      <MenuItem value="">No Store</MenuItem>
                      {availableStores.map((store) => (
                        <MenuItem key={store.id} value={store.id.toString()}>
                          {store.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {validationErrors.store_id && (
                      <FormHelperText>
                        {validationErrors.store_id}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_active}
                        onChange={handleSwitchChange("is_active")}
                        disabled={dialogMode === "view"}
                      />
                    }
                    label="Active User"
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ padding: '16px 24px' }}>
            {dialogMode !== "view" && (
              <>
                <Button onClick={handleDialogClose}>Cancel</Button>
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  sx={{
                    bgcolor: PRIMARY_COLOR,
                    "&:hover": { bgcolor: PRIMARY_DARK },
                  }}
                >
                  {dialogMode === "add" ? "Create User" : "Save Changes"}
                </Button>
              </>
            )}
            {dialogMode === "view" && (
              <Button onClick={handleDialogClose}>Close</Button>
            )}
          </DialogActions>
        </Dialog>

        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Are you sure you want to delete user {selectedUser?.username}? This
              will deactivate their account and they will no longer be able to log in.
            </Alert>
            {selectedUser && (
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}
              >
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
              sx={{ bgcolor: ERROR_COLOR, "&:hover": { bgcolor: "#dc2626" } }}
            >
              Delete User
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={lockConfirmOpen}
          onClose={() => setLockConfirmOpen(false)}
        >
          <DialogTitle>
            {selectedUser?.is_locked ? "Unlock User" : "Lock User"}
          </DialogTitle>
          <DialogContent>
            <Alert
              severity={selectedUser?.is_locked ? "info" : "warning"}
              sx={{ mb: 2 }}
            >
              {selectedUser?.is_locked
                ? `Are you sure you want to unlock user "${selectedUser.username}"?`
                : `Are you sure you want to lock user "${selectedUser?.username}"? They will not be able to login until unlocked.`}
            </Alert>
            {selectedUser && (
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}
              >
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
                    {getRoleLabel(selectedUser.role)} •{" "}
                    {selectedUser.store_name || "No store"}
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
              {selectedUser?.is_locked ? "Unlock User" : "Lock User"}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={handleSnackbarClose}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}