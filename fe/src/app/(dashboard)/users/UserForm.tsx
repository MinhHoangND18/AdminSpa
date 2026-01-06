"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Grid, Card, CardContent, Typography, Box, Button, TextField,
  InputAdornment, Chip, IconButton, Menu, MenuItem, Dialog,
  DialogTitle, DialogContent, DialogActions, alpha, Avatar, Alert,
  Select, FormControl, InputLabel, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, Tooltip,
  Switch, FormControlLabel, FormHelperText, Snackbar, Backdrop,
  CircularProgress,
} from "@mui/material";
import { usersApi } from "@/lib/api/users";
import { getStaff } from "@/lib/api/staffs";
import { storesApi } from "@/lib/api/stores";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Add, Search, Edit, Delete, Person, LockOpen, AdminPanelSettings,
  Store, Badge, CalendarToday, Security, Group, Close as CloseIcon,
} from "@mui/icons-material";
import { useQuery, keepPreviousData, useQueryClient } from "@tanstack/react-query"; // IMPORT MỚI
import UserDetail from "./UserDetail";
import { User, UserFormData, UserResponse } from "@/types/user";
import { Staff } from "@/types/staff";
import { Store as StoreType } from "@/types/store";
import { useRouter, useSearchParams } from "next/navigation";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const blueTheme = createTheme({
  palette: {
    primary: {
      main: "#3b82f6",
    },
  },
});

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

// --- INTERFACES FOR API RESPONSE ---
interface MasterDataResponse<T> {
  data: {
    data: T[];
  };
}

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
  "staff",
];

type UserRole = "super_admin" | "store_admin" | "manager" | "receptionist" | "staff";

const getRoleColor = (role: UserRole) => {
  switch (role) {
    case "super_admin": return ERROR_COLOR;
    case "store_admin": return PURPLE_COLOR;
    case "manager": return INFO_COLOR;
    case "receptionist": return WARNING_COLOR;
    case "staff": return SUCCESS_COLOR;
    default: return PRIMARY_COLOR;
  }
};

const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case "super_admin": return <AdminPanelSettings />;
    case "store_admin":
    case "manager": return <Security />;
    case "receptionist": return <Badge />;
    case "staff": return <Person />;
    default: return <Person />;
  }
};

const getRoleLabel = (role: UserRole) => {
  switch (role) {
    case "super_admin": return "Super Admin";
    case "store_admin": return "Store Admin";
    case "manager": return "Manager";
    case "receptionist": return "Receptionist";
    case "staff": return "Staff";
    default: return role;
  }
};

const roleToIdMap: Record<UserRole, number> = {
  super_admin: 1,
  store_admin: 2,
  manager: 3,
  receptionist: 4,
  staff: 5,
};

const idToRoleMap: Record<number, UserRole> = {
  1: "super_admin",
  2: "store_admin",
  3: "manager",
  4: "receptionist",
  5: "staff",
};

const statusToIdMap: Record<string, number> = {
  active: 1,
  inactive: 2,
  locked: 3,
};

const idToStatusMap: Record<number, string> = {
  1: "active",
  2: "inactive",
  3: "locked",
};

export default function UsersPage({ slug }: { slug?: string[] }) {
  const { user: currentUser, loading: authLoading } = useAuth();
  const queryClient = useQueryClient(); 
  const router = useRouter();
  const searchParams = useSearchParams();

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "all">(() => {
    const roleId = searchParams.get("role");
    return roleId && idToRoleMap[parseInt(roleId)]
      ? idToRoleMap[parseInt(roleId)]
      : "all";
  });
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "locked">(() => {
    const statusId = searchParams.get("status");
    return statusId && idToStatusMap[parseInt(statusId)]
      ? (idToStatusMap[parseInt(statusId)] as "all" | "active" | "inactive" | "locked")
      : "all";
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // UI States
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view">("add");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [lockConfirmOpen, setLockConfirmOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [showDetail, setShowDetail] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Loading states for actions (not data fetching)
  const [actionLoading, setActionLoading] = useState(false);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning",
  });

  const currentUserRoleIndex = currentUser ? roleHierarchy.indexOf(currentUser.role) : -1;
  const assignableRoles = currentUserRoleIndex !== -1 ? roleHierarchy.slice(currentUserRoleIndex + 1) : [];

  const initialFormData: UserFormData = {
    username: "", email: "", fullname: "", password: "", role: "" as UserRole,
    staff_id: "", store_id: "", is_active: true,
  };
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const { data: availableStaff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: () => getStaff({ limit: 1000 }).then(res => {
      const response = res as unknown as MasterDataResponse<Staff>;
      return response?.data?.data || [];
    }),
    staleTime: 0,
  });

  const { data: availableStores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: () => storesApi.getAll().then(res => {
      const response = res as unknown as MasterDataResponse<StoreType>;
      return response?.data?.data || [];
    }),
    staleTime: 0,
  });
  const { 
    data: usersResponse, 
    isLoading: isUsersLoading 
  } = useQuery({
    queryKey: ['users', page, rowsPerPage, searchQuery, filterRole, filterStatus],
    queryFn: async () => {
      const filters = {
        search: searchQuery,
        role: filterRole,
        is_active: filterStatus === "active" || filterStatus === "locked" ? "true" : filterStatus === "inactive" ? "false" : undefined,
        is_locked: filterStatus === "locked" ? true : undefined,
        page: page + 1,
        limit: rowsPerPage,
      };
      return usersApi.getAll(filters);
    },
    staleTime: 0,
  });

  // Handle User Data Extraction
  const usersData = (usersResponse as unknown as { data: UserResponse['data'] })?.data;
  const users = usersData?.data || [];
  const totalUsers = usersData?.total || 0;

  const { data: aggregateStats = { active: 0, admins: 0 } } = useQuery({
    queryKey: ['users_stats', searchQuery, filterRole, filterStatus],
    queryFn: async () => {
      const filters = {
        search: searchQuery,
        role: filterRole,
        is_active: filterStatus === "active" || filterStatus === "locked" ? "true" : filterStatus === "inactive" ? "false" : undefined,
        is_locked: filterStatus === "locked" ? true : undefined,
        page: 1,
        limit: 99999, 
      };
      const apiResponse = await usersApi.getAll(filters);
      const responseData = (apiResponse as unknown as { data: UserResponse['data'] })?.data;
      const allMatchingUsers = responseData?.data || [];
      
      return {
        active: allMatchingUsers.filter((u: User) => u.is_active && !u.is_locked).length,
        admins: allMatchingUsers.filter((u: User) => u.role === "super_admin" || u.role === "store_admin").length,
      };
    },
    staleTime: 0,
  });

  const userId = slug?.[0];

  useEffect(() => {
    if (sessionStorage.getItem('showUserUpdateSuccess')) {
      // Defer state update to avoid cascading renders
      setTimeout(() => {
        setSnackbar({
          open: true,
          message: "Update successful",
          severity: "success",
        });
        sessionStorage.removeItem('showUserUpdateSuccess');
      }, 0);
    }
  }, []);

  const handleMenuClose = () => setAnchorEl(null);

  useEffect(() => {
    if (userId) {
      if (selectedUser?.id === Number(userId) && showDetail) {
        return;
      }

      usersApi
        .getById(Number(userId))
        .then((response: User | { data: User }) => {
          const userData = "data" in response ? response.data : response;
          setSelectedUser(userData);
          setDialogMode("edit");
          setShowDetail(true);
          setEditingId(null);
        })
        .catch(() => {
          const query: { role?: string; status?: string } = {};
          if (filterRole !== "all") {
            query.role = roleToIdMap[filterRole].toString();
          }
          if (filterStatus !== "all") {
            query.status = statusToIdMap[filterStatus].toString();
          }
          const queryString = new URLSearchParams(query).toString();
          router.push(queryString ? `/users?${queryString}` : "/users");
          setEditingId(null); 
        });
    } else {
      if (showDetail && dialogMode === "edit") {
        setTimeout(() => {
          setShowDetail(false);
          setSelectedUser(null);
          setEditingId(null);
        }, 0);
      }
    }
  }, [userId, filterRole, filterStatus, router, selectedUser, showDetail, dialogMode]);

  useEffect(() => {
    if (userId) {
      return;
    }

    const query: { role?: string; status?: string } = {};
    if (filterRole !== "all") {
      query.role = roleToIdMap[filterRole].toString();
    }
    if (filterStatus !== "all") {
      query.status = statusToIdMap[filterStatus].toString();
    }

    const queryString = new URLSearchParams(query).toString();
    const currentPath = "/users";
    const newUrl = queryString ? `${currentPath}?${queryString}` : currentPath;

    if (
      typeof window !== "undefined" &&
      window.location.pathname + window.location.search !== newUrl
    ) {
      router.push(newUrl, {
        scroll: false,
      });
    }
  }, [filterRole, filterStatus, userId, router]);

  // --- ACTIONS ---

  const validateForm = () => {
    const errors: Partial<Record<keyof UserFormData, string>> = {};
    if (!formData.username.trim()) errors.username = "Username is required.";
    if (dialogMode === "add" && !formData.password) errors.password = "Password is required for new users.";
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = "Invalid email format.";
    if (!formData.fullname.trim()) errors.fullname = "Full Name is required.";
    if (!formData.role) errors.role = "Role is required.";

    const rolesRequiringStore = ["store_admin", "manager", "receptionist"];
    if (rolesRequiringStore.includes(formData.role) && !formData.store_id) {
      errors.store_id = `${getRoleLabel(formData.role)} must be assigned to a Store.`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveUser = async (submittedData: UserFormData) => {
    setActionLoading(true);
    try {
      const dataToSend: Partial<User> & { password?: string } = {
        username: submittedData.username,
        email: submittedData.email || null,
        fullname: submittedData.fullname || null,
        role: submittedData.role,
        is_active: submittedData.is_active,
        staff_id: submittedData.staff_id ? parseInt(submittedData.staff_id, 10) : null,
        store_id: submittedData.store_id ? parseInt(submittedData.store_id, 10) : null,
        password: submittedData.password,
      };

      if (dialogMode === "edit" && !dataToSend.password) delete dataToSend.password;

      if (dialogMode === "add") {
        await usersApi.create(dataToSend);
        setShowDetail(false);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['users'] }),
          queryClient.invalidateQueries({ queryKey: ['users_stats'] })
        ]);
        setSnackbar({
          open: true,
          message: "User created successfully",
          severity: "success",
        });
      } else if (dialogMode === "edit" && selectedUser) {
        await usersApi.update(selectedUser.id, dataToSend);
        sessionStorage.setItem("showUserUpdateSuccess", "true");
        const query: { role?: string; status?: string } = {};
        if (filterRole !== "all") {
          query.role = roleToIdMap[filterRole].toString();
        }
        if (filterStatus !== "all") {
          query.status = statusToIdMap[filterStatus].toString();
        }
        const queryString = new URLSearchParams(query).toString();
        router.push(queryString ? `/users?${queryString}` : "/users");
      }
      setSaveError(null);
    } catch (error: unknown) {
      console.error("Failed to save user:", error);
      let errorMessage = "An unknown error occurred.";
      if (isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setSaveError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (selectedUser) {
      setActionLoading(true);
      try {
        await usersApi.remove(selectedUser.id);
        setDeleteConfirmOpen(false);
        setSelectedUser(null);
        
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['users'] }),
            queryClient.invalidateQueries({ queryKey: ['users_stats'] })
        ]);

        setSnackbar({
          open: true,
          message: `User ${selectedUser.username} deleted successfully.`,
          severity: "success",
        });
      } catch (error: unknown) {
        let errorMessage = "An unknown error occurred.";
        if (isAxiosError(error)) {
          errorMessage = error.response?.data?.message || error.message || errorMessage;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        setSnackbar({ open: true, message: `Deletion failed: ${errorMessage}`, severity: "error" });
      } finally {
        setActionLoading(false);
      }
    }
  };

  const confirmLockUnlock = async () => {
    if (selectedUser) {
      setActionLoading(true);
      try {
        const isLocked = !selectedUser.is_locked;
        await usersApi.toggleLock(selectedUser.id, isLocked);
        setLockConfirmOpen(false);
        setSelectedUser(null);
        
        await queryClient.invalidateQueries({ queryKey: ['users'] });

        setSnackbar({
          open: true,
          message: `User ${selectedUser.username} has been ${isLocked ? "locked" : "unlocked"}.`,
          severity: isLocked ? "warning" : "success",
        });
      } catch (error: unknown) {
        let errorMessage = "An unknown error occurred.";
        if (isAxiosError(error)) {
          errorMessage = error.response?.data?.message || error.message || errorMessage;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }
        setSnackbar({ open: true, message: `Action failed: ${errorMessage}`, severity: "error" });
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setActionLoading(true);
    try {
      const dataToSend: Partial<Omit<UserFormData, 'staff_id' | 'store_id'>> & {
        staff_id: number | null;
        store_id: number | null;
        password?: string;
      } = {
        ...formData,
        staff_id: formData.staff_id ? parseInt(formData.staff_id) : null,
        store_id: formData.store_id ? parseInt(formData.store_id) : null,
      };

      if (dialogMode === "edit" && !dataToSend.password) delete dataToSend.password;

      let successMessage = "";
      if (dialogMode === "add") {
        await usersApi.create(dataToSend);
        successMessage = `User ${formData.username} created successfully!`;
      } else if (dialogMode === "edit" && selectedUser) {
        await usersApi.update(selectedUser.id, dataToSend);
        successMessage = `User ${selectedUser.username} updated successfully!`;
      }

      handleDialogClose();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.invalidateQueries({ queryKey: ['users_stats'] })
      ]);
      setSnackbar({ open: true, message: successMessage, severity: "success" });
    } catch (error: unknown) {
      let errorMessage = "An unknown error occurred.";
      if (isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setSnackbar({ open: true, message: `Action failed: ${errorMessage}`, severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  // UI Handlers (unchanged mostly)
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };
  const handleAddNew = () => {
    setIsAddLoading(true);

    setTimeout(() => {
      setDialogMode("add");
      setSelectedUser(null);
      setShowDetail(true);
      setSaveError(null);
      setIsAddLoading(false);
    }, 500);
  };
  const handleEdit = () => {
    if (selectedUser) {
      router.push(`/users/${selectedUser.id}`);
    }
    handleMenuClose();
  };
  const handleDelete = () => { setDeleteConfirmOpen(true); handleMenuClose(); };
  const handleDialogClose = () => { setOpenDialog(false); setFormData(initialFormData); setValidationErrors({}); };
  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => { if (reason === "clickaway") return; setSnackbar({ ...snackbar, open: false }); };
  const handleFormChange = (field: keyof UserFormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }) => { setFormData({ ...formData, [field]: event.target.value }); setValidationErrors((prev) => ({ ...prev, [field]: undefined })); };
  const handleSwitchChange = (field: keyof UserFormData) => (event: React.ChangeEvent<HTMLInputElement>) => { setFormData({ ...formData, [field]: event.target.checked }); };
  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
  
  const canModifyUser = (targetUser: User) => {
    if (!currentUser) return false;
    if (targetUser.id === Number(currentUser.id)) return true;
    const currentUserIndex = roleHierarchy.indexOf(currentUser.role);
    const targetUserIndex = roleHierarchy.indexOf(targetUser.role);
    if (currentUserIndex === -1 || targetUserIndex === -1) return false;
    return targetUserIndex > currentUserIndex;
  };

  if (authLoading || !currentUser) {
    return (
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={true}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (showDetail) {
    return (
      <UserDetail
        mode={dialogMode}
        initialData={selectedUser}
        availableStaff={availableStaff}
        availableStores={availableStores}
        assignableRoles={assignableRoles}
        getRoleLabel={getRoleLabel}
        onBack={() => {
          const query: { role?: string; status?: string } = {};
          if (filterRole !== "all") {
            query.role = roleToIdMap[filterRole].toString();
          }
          if (filterStatus !== "all") {
            query.status = statusToIdMap[filterStatus].toString();
          }
          const queryString = new URLSearchParams(query).toString();
          if (dialogMode === "edit") {
            router.push(queryString ? `/users?${queryString}` : "/users");
          } else {
            setShowDetail(false);
            setSelectedUser(null);
            setSaveError(null);
          }
        }}
        onSave={handleSaveUser}
        loading={actionLoading}
        saveError={saveError}
      />
    );
  }

  const isAnyLoading = isUsersLoading || actionLoading;

  return (
    <ThemeProvider theme={blueTheme}>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isAnyLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Box>
        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card sx={{ borderRadius: 0 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>Total Users</Typography>
                    <Typography variant="h4" fontWeight="bold">{totalUsers}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.1), width: 56, height: 56 }}>
                    <Group sx={{ color: PRIMARY_COLOR, fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card sx={{ borderRadius: 0 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>Active Users</Typography>
                    <Typography variant="h4" fontWeight="bold" color={SUCCESS_COLOR}>{aggregateStats.active}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(SUCCESS_COLOR, 0.1), width: 56, height: 56 }}>
                    <LockOpen sx={{ color: SUCCESS_COLOR, fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card sx={{ borderRadius: 0 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>Admin Users</Typography>
                    <Typography variant="h4" fontWeight="bold" color={INFO_COLOR}>{aggregateStats.admins}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(INFO_COLOR, 0.1), width: 56, height: 56 }}>
                    <AdminPanelSettings sx={{ color: INFO_COLOR, fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search & Filters */}
        <Card sx={{ mb: 3, borderRadius: 0 }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
              <TextField
                size="small"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flex: 1, minWidth: 200, "& .MuiOutlinedInput-root": { borderRadius: "0px" } }}
                InputProps={{
                  startAdornment: (<InputAdornment position="start"><Search sx={{ color: PRIMARY_COLOR, fontSize: 20 }} /></InputAdornment>),
                }}
              />
              <FormControl sx={{ minWidth: 130, "& .MuiOutlinedInput-root": { borderRadius: "0px" } }} size="small">
                <InputLabel>Role</InputLabel>
                <Select value={filterRole} label="Role" onChange={(e) => setFilterRole(e.target.value as UserRole | "all")}>
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="super_admin">Super Admin</MenuItem>
                  <MenuItem value="store_admin">Store Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="receptionist">Receptionist</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 130, "& .MuiOutlinedInput-root": { borderRadius: "0px" } }} size="small">
                <InputLabel>Status</InputLabel>
                <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive" | "locked")}>
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="locked">Locked</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                size="small"
                startIcon={isAddLoading ? <CircularProgress size={20} color="inherit" /> : <Add />}
                disabled={isAddLoading}
                onClick={handleAddNew}
                sx={{ height: 40, bgcolor: PRIMARY_COLOR, "&:hover": { bgcolor: PRIMARY_DARK }, textTransform: "none", fontWeight: 600, px: 3, borderRadius: 0 }}
              >
                Add New User
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.05) }}>
                  <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Store</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Last Login</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow
                      key={user.id}
                      sx={{
                        "&:hover": { bgcolor: alpha(PRIMARY_COLOR, 0.02) },
                        ...(!user.is_active && { bgcolor: alpha(ERROR_COLOR, 0.02), "&:hover": { bgcolor: alpha(ERROR_COLOR, 0.05) } }),
                        ...(user.is_locked && { bgcolor: alpha(WARNING_COLOR, 0.02), "&:hover": { bgcolor: alpha(WARNING_COLOR, 0.05) } }),
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.1), color: PRIMARY_COLOR, width: 44, height: 44, fontWeight: 600 }}>
                            {user.username.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="600">{user.username}</Typography>
                            {user.email && <Typography variant="caption" color="text.secondary">{user.email}</Typography>}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getRoleIcon(user.role)}
                          label={getRoleLabel(user.role)}
                          size="small"
                          sx={{ bgcolor: alpha(getRoleColor(user.role), 0.1), color: getRoleColor(user.role), fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        {user.store_name ? (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Store sx={{ fontSize: 16, color: "text.secondary" }} />
                            <Typography variant="body2">{user.store_name}</Typography>
                          </Box>
                        ) : (<Typography variant="body2" color="text.secondary">Not assigned</Typography>)}
                      </TableCell>
                      <TableCell>
                        {user.last_login ? (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <CalendarToday sx={{ fontSize: 14, color: "text.secondary" }} />
                            <Typography variant="body2">{new Date(user.last_login).toLocaleDateString()}</Typography>
                          </Box>
                        ) : (<Typography variant="body2" color="text.secondary">Never</Typography>)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          {!user.is_active && <Chip label="Inactive" size="small" color="default" variant="outlined" />}
                          {user.is_locked && <Chip label="Locked" size="small" color="warning" />}
                          {user.is_active && !user.is_locked && <Chip label="Active" size="small" color="success" />}
                          {user.login_attempts > 0 && (
                            <Tooltip title={`${user.login_attempts} failed login attempts`}>
                              <Chip label={user.login_attempts} size="small" color="error" variant="outlined" />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={
                            editingId === user.id ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <Edit sx={{ fontSize: "18px !important" }} />
                            )
                          }
                          disabled={!canModifyUser(user) || editingId === user.id}
                          onClick={() => {
                            setEditingId(user.id);
                            router.push(`/users/${user.id}`);
                          }}
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
                            color: "#fff",
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Box sx={{ textAlign: "center", py: 6 }}>
                        <Group sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>No users found</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {searchQuery || filterRole !== "all" || filterStatus !== "all" ? "Try adjusting your search or filters" : "Get started by adding your first user"}
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
        

        <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
  
            <DialogTitle>{dialogMode === "add" ? "Add New User" : dialogMode === "edit" ? "Edit User" : "User Details"}</DialogTitle>
            <DialogContent dividers>
              
                {dialogMode === "view" && selectedUser ? (
                    <Grid container spacing={3} sx={{ mt: 0.5 }}>
                         <Grid size={{ xs: 12 }}>
                            <Typography variant="body1">User details view...</Typography>
                        </Grid>
                    </Grid>
                ) : (
                     <Grid container spacing={3} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField fullWidth label="Username" value={formData.username} onChange={handleFormChange("username")} required disabled={dialogMode === "view"} error={!!validationErrors.username} helperText={validationErrors.username} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField fullWidth label="Full Name" value={formData.fullname} onChange={handleFormChange("fullname")} disabled={dialogMode === "view"} error={!!validationErrors.fullname} helperText={validationErrors.fullname} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField fullWidth label="Email" type="email" value={formData.email} onChange={handleFormChange("email")} disabled={dialogMode === "view"} error={!!validationErrors.email} helperText={validationErrors.email} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                             <TextField fullWidth label="Password" type="password" value={formData.password} onChange={handleFormChange("password")} required={dialogMode === "add"} disabled={dialogMode === "view"} error={!!validationErrors.password} helperText={validationErrors.password || (dialogMode === "edit" ? "Leave blank to keep current" : "")} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth required error={!!validationErrors.role}>
                                <InputLabel>Role</InputLabel>
                                <Select value={formData.role} label="Role" onChange={(e) => { setFormData({ ...formData, role: e.target.value as UserRole }); setValidationErrors((prev) => ({ ...prev, role: undefined })); }}>
                                    {assignableRoles.map((role) => (<MenuItem key={role} value={role}>{getRoleLabel(role)}</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>
                         <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth error={!!validationErrors.store_id}>
                                <InputLabel>Store</InputLabel>
                                <Select value={formData.store_id} label="Store" onChange={handleFormChange("store_id")}>
                                    <MenuItem value="">No Store</MenuItem>
                                    {availableStores.map((store) => (<MenuItem key={store.id} value={store.id.toString()}>{store.name}</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControlLabel control={<Switch checked={formData.is_active} onChange={handleSwitchChange("is_active")} />} label="Active User" />
                        </Grid>
                     </Grid>
                )}
            </DialogContent>
            <DialogActions sx={{ padding: '16px 24px' }}>
                {dialogMode !== "view" && (
                <>
                    <Button onClick={handleDialogClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: PRIMARY_COLOR, "&:hover": { bgcolor: PRIMARY_DARK } }}>
                    {dialogMode === "add" ? "Create User" : "Save Changes"}
                    </Button>
                </>
                )}
                {dialogMode === "view" && <Button onClick={handleDialogClose}>Close</Button>}
            </DialogActions>
        </Dialog>

        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
            <DialogTitle>Confirm Delete</DialogTitle>
             <DialogContent>
                <Alert severity="warning">Are you sure you want to delete user {selectedUser?.username}?</Alert>
             </DialogContent>
             <DialogActions>
                <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                <Button onClick={confirmDelete} variant="contained" sx={{ bgcolor: ERROR_COLOR }}>Delete User</Button>
             </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }} action={<IconButton aria-label="close" color="inherit" size="small" onClick={handleSnackbarClose}><CloseIcon fontSize="inherit" /></IconButton>}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}