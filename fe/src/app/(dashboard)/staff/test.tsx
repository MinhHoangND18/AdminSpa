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
  CircularProgress,
  Snackbar,
  Backdrop,
} from "@mui/material";
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  People,
  Store as StoreIcon,
  CheckCircle,
  Cancel,
  BeachAccess,
  FilterList,
} from "@mui/icons-material";
import { storesApi } from "@/lib/api/stores";
import { Store } from "@/types/store";
import {
  Staff,
  StaffFormData as StaffFormDataType,
  StaffStatus,
  SalaryType,
  Gender,
  StaffFilters,
  StaffFormData,
} from "@/types/staff";
import {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from "@/lib/api/staffs";

import { useAuth } from "@/lib/hooks/useAuth";

interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string | string[];
    };
    status?: number;
  };
}


const isAxiosError = (error: unknown): error is AxiosErrorResponse => {
  // Kiểm tra xem nó có phải là đối tượng và có thuộc tính 'response' không
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as AxiosErrorResponse).response === 'object'
  );
};

const PRIMARY_COLOR = "#3b82f6";
const PRIMARY_DARK = "#0f766e";
const SUCCESS_COLOR = "#10b981";
const ERROR_COLOR = "#ef4444";
const WARNING_COLOR = "#f59e0b";

const getStatusColor = (status: StaffStatus) => {
  switch (status) {
    case "active":
      return SUCCESS_COLOR;
    case "inactive":
      return ERROR_COLOR;
    case "on_leave":
      return WARNING_COLOR;
    default:
      return PRIMARY_COLOR;
  }
};

const getStatusLabel = (status: StaffStatus) => {
  switch (status) {
    case "active":
      return "Active";
    case "inactive":
      return "Inactive";
    case "on_leave":
      return "On Leave";
    default:
      return status;
  }
};

const getSalaryTypeLabel = (type: SalaryType) => {
  switch (type) {
    case "fixed":
      return "Fixed Salary";
    case "hourly":
      return "Hourly Rate";
    case "commission":
      return "Commission";
    default:
      return type;
  }
};

export default function StaffPage() {
  const { user: currentUser } = useAuth();
  const canManageStaff = currentUser?.role !== "staff";

  const [staff, setStaff] = useState<Staff[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<StaffStatus | "all">("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view">("add");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [storeList, setStoreList] = useState<Store[]>([]);
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await storesApi.getAll({
          limit: 100,
          isActive: true,
        });

        let stores: Store[] = [];
        if (Array.isArray(response)) {
          stores = response;
          console.log("Store list loaded. Count:", stores.length);
        } else {

          console.warn("Could not parse store data structure:", response);
          stores = [];
        }

        setStoreList(stores);
      } catch (error) {
        console.error("Failed to load stores for dropdown", error);
        setStoreList([]);
      }
    };
    fetchStores();
  }, []);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const initialFormData: StaffFormDataType = {
    full_name: "",
    phone: "",
    email: "",
    gender: "",
    birthday: "",
    address: "",
    store_id: "",
    hire_date: "",
    salary_type: "",
    base_salary: 0,
    commission_rate: 0,
    status: "active",
  };

  const [formData, setFormData] = useState<StaffFormDataType>(initialFormData);

  const fetchStaffData = useCallback(async () => {
    setLoading(true);
    try {
      const params: StaffFilters = {
        page: page + 1,
        limit: rowsPerPage,
        keyword: searchQuery,
      };
      if (filterStatus !== "all") params.status = filterStatus;

      const response = await getStaff(params);

      if (response && response.data && Array.isArray(response.data.data)) {
        setStaff(response.data.data);
        setTotalCount(response.data.total);
      } else if (response && Array.isArray(response.data)) {
        setStaff(response.data);
        setTotalCount(response.data.total);
      } else {
        console.warn("Strange data structure:", response);
        setStaff([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery, filterStatus]);


  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchStaffData();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [fetchStaffData]);

  const stats = {
    total: staff.length,
    active: staff.filter((s) => s.status === "active").length,
    inactive: staff.filter((s) => s.status === "inactive").length,
    onLeave: staff.filter((s) => s.status === "on_leave").length,
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    staffMember: Staff
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedStaff(staffMember);
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
    if (selectedStaff) {
      setDialogMode("edit");
      setFormData({

        full_name: selectedStaff.full_name,
        phone: selectedStaff.phone,
        email: selectedStaff.email || "",
        gender: selectedStaff.gender,
        birthday: selectedStaff.birthday
          ? new Date(selectedStaff.birthday).toISOString().split("T")[0]
          : "",
        address: selectedStaff.address || "",
        store_id: selectedStaff.store?.id ?? selectedStaff.store_id ?? null,
        hire_date: selectedStaff.hire_date
          ? new Date(selectedStaff.hire_date).toISOString().split("T")[0]
          : "",
        salary_type: selectedStaff.salary_type,
        base_salary: selectedStaff.base_salary || 0,
        commission_rate: selectedStaff.commission_rate || 0,
        status: selectedStaff.status,
      });
      setOpenDialog(true);
    }
    handleMenuClose();
  };

  const handleView = () => {
    if (selectedStaff) {
      setDialogMode("view");
      setFormData({
        full_name: selectedStaff.full_name,
        phone: selectedStaff.phone,
        email: selectedStaff.email || "",
        gender: selectedStaff.gender,
        birthday: selectedStaff.birthday
          ? new Date(selectedStaff.birthday).toISOString().split("T")[0]
          : "",
        address: selectedStaff.address || "",
        store_id: selectedStaff.store?.id ?? selectedStaff.store_id ?? null,
        hire_date: selectedStaff.hire_date
          ? new Date(selectedStaff.hire_date).toISOString().split("T")[0]
          : "",
        salary_type: selectedStaff.salary_type,
        base_salary: selectedStaff.base_salary || 0,
        commission_rate: selectedStaff.commission_rate || 0,
        status: selectedStaff.status,
      });
      setOpenDialog(true);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (selectedStaff) {
      try {
        await deleteStaff(selectedStaff.id);
        fetchStaffData();
        setDeleteConfirmOpen(false);
        setSelectedStaff(null);
        setSnackbar({
          open: true,
          message: "Staff member deleted successfully.",
          severity: "success",
        });
      } catch (error) {
        console.error("Failed to delete staff:", error);
      }
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setFormData(initialFormData);
  };

  const handleFormChange =
      (field: keyof StaffFormDataType) =>
        (
          event:
            | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            | { target: { value: string | number | StaffStatus | SalaryType | Gender | null | '' } }
        ) => {
          setFormData({ ...formData, [field]: event.target.value });
        };
  const validateForm = (data: StaffFormDataType): string | null => {
    if (!data.full_name?.trim()) return "Full Name is required.";
    if (!data.phone?.trim()) return "Phone number is required.";
    if (!data.email?.trim()) return "Email is required.";
    if (!data.address?.trim()) return "Address is required.";
    if (!data.birthday) return "Birthday is required.";
    if (!data.hire_date) return "Hire Date is required.";
    if (!data.store_id) return "Please select a store.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
      return "Invalid email format.";
    }

    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (data.phone && !phoneRegex.test(data.phone)) {
      return "Invalid phone number format.";
    }

    if (data.base_salary && Number(data.base_salary) < 0) {
      return "Base salary cannot be negative.";
    }

    if (data.salary_type === "commission") {
      if (!data.commission_rate || Number(data.commission_rate) <= 0) {
        return "Commission rate is required for Commission salary type.";
      }
    }

    if (data.salary_type === "fixed") {
      if (!data.base_salary || Number(data.base_salary) <= 0) {
        return "Base salary is required for Fixed salary type.";
      }
    }

    return null;
  };
  const handleSubmit = async () => {
    const errorMsg = validateForm(formData);

    if (errorMsg) {
      setSnackbar({
        open: true,
        message: errorMsg,
        severity: "error",
      });
      return;
    }

    try {
        const submitData: StaffFormData = {
              ...formData,
              store_id: Number(formData.store_id),
              base_salary: formData.base_salary ? Number(formData.base_salary) : 0,
              commission_rate: formData.commission_rate
                ? Number(formData.commission_rate)
                : undefined,
              email: formData.email || undefined,
              address: formData.address,
            };

      if (dialogMode === "add") {
        await createStaff(submitData);
        setSnackbar({
          open: true,
          message: "Staff member added successfully.",
          severity: "success",
        });
      } else if (dialogMode === "edit" && selectedStaff) {
        await updateStaff({ id: selectedStaff.id, data: submitData });
        setSnackbar({
          open: true,
          message: "Staff member updated successfully.",
          severity: "success",
        });
      }

      fetchStaffData();
      handleDialogClose();
    } catch (error: unknown) {
      console.error("Failed to save staff:", error);

      let backendError: string | string[] | undefined;

      if (isAxiosError(error)) {
        backendError = error.response?.data?.message;
      }
      const displayMessage = Array.isArray(backendError)
        ? backendError[0]
        : backendError || "An error occurred. Please try again.";

      setSnackbar({
        open: true,
        message: displayMessage,
        severity: "error",
      });
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

  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {/* Header */}
      {/* <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Staff Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your spa staff members and their information
        </Typography>
      </Box> */}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
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
                    Total Staff
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
                  <People sx={{ color: PRIMARY_COLOR, fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
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
                    Active
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
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
                  <CheckCircle sx={{ color: SUCCESS_COLOR, fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
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
                    On Leave
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.onLeave}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: alpha(WARNING_COLOR, 0.1),
                    width: 56,
                    height: 56,
                  }}
                >
                  <BeachAccess sx={{ color: WARNING_COLOR, fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
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
                    Inactive
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.inactive}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: alpha(ERROR_COLOR, 0.1),
                    width: 56,
                    height: 56,
                  }}
                >
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
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
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
                onChange={(e) =>
                  setFilterStatus(e.target.value as StaffStatus | "all")
                }
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
              disabled={!canManageStaff}
              sx={{
                bgcolor: PRIMARY_COLOR,
                "&:hover": { bgcolor: PRIMARY_DARK },
                textTransform: "none",
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress sx={{ color: PRIMARY_COLOR }} />
                  </TableCell>
                </TableRow>
              ) : staff.length > 0 ? (
                staff.map((staffMember) => (
                  <TableRow
                    key={staffMember.id}
                    sx={{
                      "&:hover": { bgcolor: alpha(PRIMARY_COLOR, 0.02) },
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
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
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
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {staffMember.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{staffMember.phone}</TableCell>
                    <TableCell>
                      {staffMember.store ? (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <StoreIcon
                            sx={{ fontSize: 16, color: "text.secondary" }}
                          />
                          <Typography variant="body2" fontWeight="500">
                            {staffMember.store.name}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontStyle: "italic" }}
                        >
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
                          bgcolor: alpha(
                            getStatusColor(staffMember.status),
                            0.1
                          ),
                          color: getStatusColor(staffMember.status),
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, staffMember)}
                        disabled={!canManageStaff}
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
                      <People
                        sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                      />
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        gutterBottom
                      >
                        No staff members found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery || filterStatus !== "all"
                          ? "Try adjusting your search or filters"
                          : "Get started by adding your first staff member"}
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
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {/* <MenuItem onClick={handleView}>
          <Visibility sx={{ mr: 1, fontSize: 20 }} />
          View Details
        </MenuItem> */}
        <MenuItem onClick={handleEdit} disabled={!canManageStaff}>
          <Edit sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={handleDelete}
          sx={{ color: ERROR_COLOR }}
          disabled={!canManageStaff}
        >
          <Delete sx={{ mr: 1, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === "add"
            ? "Add New Staff"
            : dialogMode === "edit"
              ? "Edit Staff"
              : "Staff Details"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Full Name *"
                fullWidth
                value={formData.full_name}
                onChange={handleFormChange("full_name")}
                disabled={dialogMode === "view"}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Phone *"
                fullWidth
                value={formData.phone}
                onChange={handleFormChange("phone")}
                disabled={dialogMode === "view"}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Email"
                fullWidth
                type="email"
                value={formData.email}
                onChange={handleFormChange("email")}
                disabled={dialogMode === "view"}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth disabled={dialogMode === "view"}>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  label="Gender"
                  onChange={handleFormChange("gender")}
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
                onChange={handleFormChange("birthday")}
                disabled={dialogMode === "view"}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth disabled={dialogMode === "view"}>
                <InputLabel id="store-select-label">Store *</InputLabel>
                <Select
                  labelId="store-select-label"
                  label="Store *"
                  value={formData.store_id || ""}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      store_id: Number(e.target.value),
                    });
                  }}
                >
                  <MenuItem value="">
                    <em>Select a store</em>
                  </MenuItem>

                  {storeList.map((store) => (
                    <MenuItem key={store.id} value={store.id}>
                      {store.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Address"
                fullWidth
                value={formData.address}
                onChange={handleFormChange("address")}
                disabled={dialogMode === "view"}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Hire Date"
                fullWidth
                type="date"
                value={formData.hire_date}
                onChange={handleFormChange("hire_date")}
                disabled={dialogMode === "view"}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth disabled={dialogMode === "view"}>
                <InputLabel>Salary Type</InputLabel>
                <Select
                  value={formData.salary_type}
                  label="Salary Type"
                  onChange={handleFormChange("salary_type")}
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
                onChange={handleFormChange("base_salary")}
                disabled={dialogMode === "view"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />
            </Grid>
            {formData.salary_type === "commission" && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Commission Rate"
                  fullWidth
                  type="number"
                  value={formData.commission_rate}
                  onChange={handleFormChange("commission_rate")}
                  disabled={dialogMode === "view"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth disabled={dialogMode === "view"}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={handleFormChange("status")}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="on_leave">On Leave</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button onClick={handleDialogClose} sx={{ color: PRIMARY_COLOR }}>
            {dialogMode === "view" ? "Close" : "Cancel"}
          </Button>
          {dialogMode !== "view" && (
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{
                bgcolor: PRIMARY_COLOR,
                "&:hover": { bgcolor: PRIMARY_DARK },
              }}
            >
              {dialogMode === "add" ? "Add Staff" : "Save Changes"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete staff member{" "}
            <strong>{selectedStaff?.full_name}</strong>? This action cannot be
            undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="standard"
          sx={{
            width: "100%",
            boxShadow: 3,
            fontSize: "0.95rem",
            alignItems: "center",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}