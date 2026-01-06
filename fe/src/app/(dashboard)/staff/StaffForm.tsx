"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  getStaffById,
} from "@/lib/api/staffs";

import { useAuth } from "@/lib/hooks/useAuth";
import StaffDetail from "./StaffDetail";
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
      message?: string | string[];
    };
    status?: number;
  };
}

const isAxiosError = (error: unknown): error is AxiosErrorResponse => {
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

export default function StaffPage({ slug }: { slug?: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  const [showDetail, setShowDetail] = useState(false);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Ref để track khi đang fetch từ user action (tránh double fetch)
  const isFetchingFromUserAction = useRef(false);

  // Map status để chuyển đổi giữa string và number
  const statusToNumber: Record<StaffStatus, string> = {
    "active": "1",
    "inactive": "2",
    "on_leave": "3"
  };

  const numberToStatus: Record<string, StaffStatus> = {
    "1": "active",
    "2": "inactive",
    "3": "on_leave"
  };

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await storesApi.getAll({
          limit: 100,
          isActive: true,
        });

        if (response?.data?.data) {
          setStoreList(response.data.data);
        } else {
          console.warn("Could not parse store data structure:", response);
          setStoreList([]);
        }
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

  // Hàm cập nhật URL với query params
  const updateURL = useCallback((updates: {
    status?: StaffStatus | "all";
    search?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams();
    
    // Xử lý status
    if (updates.status !== undefined && updates.status !== "all") {
      params.set("status", statusToNumber[updates.status]);
    }
    
    // Xử lý search
    if (updates.search !== undefined && updates.search) {
      params.set("search", updates.search);
    }
    
    // Xử lý page
    if (updates.page !== undefined && updates.page > 0) {
      params.set("page", (updates.page + 1).toString());
    }
    
    // Tạo URL string
    const queryString = params.toString();
    const url = queryString ? `/staff?${queryString}` : `/staff`;
    
    // Cập nhật URL
    router.replace(url, { scroll: false });
  }, [router, statusToNumber]);

  // Hàm xử lý thay đổi filter status
  const handleFilterStatusChange = (status: StaffStatus | "all") => {
    // Đánh dấu đang fetch từ user action
    isFetchingFromUserAction.current = true;
    
    // Update state ngay lập tức
    setFilterStatus(status);
    setPage(0);
    
    // Update URL
    updateURL({ status, page: 0, search: searchQuery });
    
    // Fetch data ngay với status(không đợi useEffect)
    const fetchWithNewStatus = async () => {
      setLoading(true);
      try {
        const params: StaffFilters = {
          page: 1,
          limit: rowsPerPage,
          keyword: searchQuery,
        };
        if (status !== "all") {
          params.status = status as StaffStatus;
        }

        const response = await getStaff(params);

        if (response && response.data && Array.isArray(response.data.data)) {
          setStaff(response.data.data);
          setTotalCount(response.data.total);
        } else {
          setStaff([]);
          setTotalCount(0);
        }
      } catch (error) {
        console.error("Failed to fetch staff:", error);
        setStaff([]);
      } finally {
        setLoading(false);
        // Reset flag sau khi fetch xong
        setTimeout(() => {
          isFetchingFromUserAction.current = false;
        }, 100);
      }
    };
    
    fetchWithNewStatus();
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(0);
    updateURL({ search: value, page: 0, status: filterStatus !== "all" ? filterStatus : undefined });
  };

  useEffect(() => {
    const statusParam = searchParams.get("status");
    const searchParam = searchParams.get("search");
    const pageParam = searchParams.get("page");
    
    // Xử lý status: nếu có param thì parse, nếu không có thì là "all"
    if (statusParam) {
      const status = numberToStatus[statusParam];
      if (status) {
        setFilterStatus(status);
      } else {
        setFilterStatus("all");
      }
    } else {
      // Nếu không có status param trong URL, set về "all"
      setFilterStatus("all");
    }
    
    if (searchParam) {
      setSearchQuery(searchParam);
    } else {
      setSearchQuery("");
    }
    
    if (pageParam) {
      const pageNum = parseInt(pageParam) - 1;
      if (!isNaN(pageNum) && pageNum >= 0) {
        setPage(pageNum);
      }
    } else {
      setPage(0);
    }
  }, [searchParams, numberToStatus]);

  // Xử lý khi người dùng vào trực tiếp URL /staff/17 hoặc /staff/new
  useEffect(() => {
    const staffId = slug?.[0];

    if (staffId) {
      if (selectedStaff?.id === Number(staffId) && showDetail) {
        return;
      }

      if (staffId === 'new') {
        // Xử lý add new
        setDialogMode("add");
        setSelectedStaff(null);
        setShowDetail(true);
      } else if (!isNaN(Number(staffId))) {
        // Fetch staff by id
        getStaffById(Number(staffId))
          .then((Response: Staff | { data: Staff }) => {
            const staffData = "data" in Response ? Response.data : Response;
            setSelectedStaff(staffData);
            setDialogMode("edit");
            setShowDetail(true);
          })
          .catch(() => {
            router.push("/staff");
          });
      }
    } else {
      if (showDetail && dialogMode === "edit") {
        setShowDetail(false);
        setSelectedStaff(null);
      }
    }
  }, [slug, router, selectedStaff?.id, showDetail, dialogMode]);

  const fetchStaffData = useCallback(async () => {
    setLoading(true);
    try {
      const params: StaffFilters = {
        page: page + 1,
        limit: rowsPerPage,
        keyword: searchQuery,
      };
      if (filterStatus !== "all") {
        params.status = filterStatus as StaffStatus;
      }

      const response = await getStaff(params);

      if (response && response.data && Array.isArray(response.data.data)) {
        setStaff(response.data.data);
        setTotalCount(response.data.total);
      } else {
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

  const handleAddNew = () => {
    setIsAddLoading(true);
    
    // Chuyển hướng đến URL /staff/new
    router.push(`/staff/new`, { scroll: false });

    setTimeout(() => {
      setDialogMode("add");
      setSelectedStaff(null);
      setShowDetail(true);
      setIsAddLoading(false);
    }, 500);
  };

  const handleRowEdit = (staffMember: Staff) => {
    setEditingId(staffMember.id);
    
    // Chuyển hướng đến URL /staff/{id}
    router.push(`/staff/${staffMember.id}`, { scroll: false });

    setTimeout(() => {
      setSelectedStaff(staffMember);
      setDialogMode("edit");
      setShowDetail(true);
      setEditingId(null);
    }, 500);
  };

  const handleEdit = (staffMember?: Staff) => {
    const target = staffMember || selectedStaff;
    if (target) {
      // Chuyển hướng đến URL /staff/{id}
      router.push(`/staff/${target.id}`, { scroll: false });
      
      setSelectedStaff(target);
      setDialogMode("edit");
      setShowDetail(true);
    }
    handleMenuClose();
  };

  const handleSaveStaff = async (submitData: StaffFormData) => {
    try {
      if (dialogMode === "add") {
        await createStaff(submitData);
        setSnackbar({ open: true, message: "Staff added successfully", severity: "success" });
      } else if (dialogMode === "edit" && selectedStaff) {
        await updateStaff({ id: selectedStaff.id, data: submitData });
        setSnackbar({ open: true, message: "Staff updated successfully", severity: "success" });
      }

      // Refresh data
      fetchStaffData();
    } catch (error) {
      console.error("Failed to save staff:", error);
      throw error;
    }
  };

  useEffect(() => {
    // Nếu đang fetch từ user action, không fetch lại
    if (isFetchingFromUserAction.current) {
      return;
    }
    
    const timeoutId = setTimeout(() => {
      fetchStaffData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fetchStaffData]);

  // Hàm xử lý back từ detail
  const handleBackFromDetail = () => {
    setShowDetail(false);
    setSelectedStaff(null);
    
    // Quay lại danh sách với filter hiện tại
    const params = new URLSearchParams();
    
    if (searchQuery) {
      params.set("search", searchQuery);
    }
    
    if (filterStatus !== "all") {
      params.set("status", statusToNumber[filterStatus]);
    }
    
    if (page > 0) {
      params.set("page", (page + 1).toString());
    }
    
    const queryString = params.toString();
    const url = queryString ? `/staff?${queryString}` : `/staff`;
    router.replace(url, { scroll: false });
  };

  if (showDetail) {
    return (
      <StaffDetail
        key={selectedStaff?.id || 'new'}
        mode={dialogMode}
        initialData={selectedStaff}
        storeList={storeList}
        onBack={handleBackFromDetail}
        onSave={handleSaveStaff}
        loading={loading}
      />
    );
  }

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
    updateURL({ page: newPage, status: filterStatus !== "all" ? filterStatus : undefined, search: searchQuery });
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    updateURL({ page: 0, status: filterStatus !== "all" ? filterStatus : undefined, search: searchQuery });
  };

  return (
    <ThemeProvider theme={blueTheme}>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ borderRadius: 0 }}>
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
          <Card sx={{ borderRadius: 0 }}>
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
          <Card sx={{ borderRadius: 0 }}>
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
          <Card sx={{ borderRadius: 0 }}>
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
      <Card sx={{ mb: 3, borderRadius: 0 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
            <TextField
              size="small"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              sx={{
                flex: 1, minWidth: 200, "& .MuiOutlinedInput-root": {
                  borderRadius: "0px",
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: PRIMARY_COLOR, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl sx={{
              minWidth: 140, "& .MuiOutlinedInput-root": {
                borderRadius: "0px",
              }
            }} size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => handleFilterStatusChange(e.target.value as StaffStatus | "all")}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterList sx={{ color: PRIMARY_COLOR, fontSize: 18 }} />
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
              size="small"
              startIcon={isAddLoading ? <CircularProgress size={20} color="inherit" /> : <Add />}
              onClick={handleAddNew}
              disabled={!canManageStaff || isAddLoading}
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
              {staff.length > 0 ? (
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
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={
                          editingId === staffMember.id ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <Edit sx={{ fontSize: '18px !important' }} />
                          )
                        }
                        onClick={() => handleRowEdit(staffMember)}
                        disabled={!canManageStaff || editingId === staffMember.id}
                        sx={{
                          bgcolor: '#f39c12',
                          '&:hover': { bgcolor: '#e67e22' },
                          textTransform: 'none',
                          fontWeight: 600,
                          borderRadius: '0px',
                          px: 2,
                          minWidth: '80px',
                          boxShadow: 'none',
                          height: '32px'
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
    </ThemeProvider>
  );
}