"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  LinearProgress,
  Badge,
  CircularProgress,
  Snackbar,
  Backdrop
} from "@mui/material";
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  PersonAdd,
  Phone,
  Email,
  Store as StoreIcon,
  CheckCircle,
  Cancel,
  Block,
  Star,
  CalendarToday,
  AttachMoney,
  Spa,
  FilterList,
  TrendingUp,
  PersonOutline,
} from "@mui/icons-material";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  Gender,
  CustomerType,
  CustomerStatus,
  Customer as CustomerTypeInterface,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerResponse,
} from "@/types/customer";
import {
  getCustomers,
  getCustomerStats,
  deleteCustomer,
  createCustomer,
  updateCustomer,
  getCustomer,
  CustomerStats,
} from "@/lib/api/customers";
import { storesApi } from "@/lib/api/stores";
import { Store,StoreResponse } from "@/types/store";


interface CustomerDetailResponse {
  data: Customer;
}

interface PaginatedCustomerResponse {
  data: {
    data: Customer[];
    total: number;
    page: number;
    limit: number;
  };
}
interface CustomErrorResponse {
  data?: {
    message?: string;
  };
}

interface AxiosErrorLike extends Error {
  response?: CustomErrorResponse;
}

type DirectStoreArrayResponse = Store[];


interface GenericListResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}



const isAxiosErrorLike = (error: unknown): error is AxiosErrorLike => {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  );
};

const getErrorMessage = (error: unknown): string => {
  if (isAxiosErrorLike(error) && error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred.";
};

const PRIMARY_COLOR = "#3b82f6";
const PRIMARY_DARK = "#0f766e";
const SUCCESS_COLOR = "#10b981";
const ERROR_COLOR = "#ef4444";
const WARNING_COLOR = "#f59e0b";
const INFO_COLOR = "#3b82f6";
const PURPLE_COLOR = "#a855f7";

type Customer = CustomerTypeInterface;
type Status = CustomerStatus;

const getStatusColor = (status: Status) => {
  switch (status) {
    case CustomerStatus.ACTIVE:
      return SUCCESS_COLOR;
    case CustomerStatus.INACTIVE:
      return WARNING_COLOR;
    case CustomerStatus.BLOCKED:
      return ERROR_COLOR;
    default:
      return PRIMARY_COLOR;
  }
};

const getCustomerTypeColor = (type: CustomerType) => {
  switch (type) {
    case CustomerType.VIP:
      return PURPLE_COLOR;
    case CustomerType.REGULAR:
      return INFO_COLOR;
    case CustomerType.NEW:
      return SUCCESS_COLOR;
    default:
      return PRIMARY_COLOR;
  }
};

const getStatusLabel = (status: Status) => {
  switch (status) {
    case CustomerStatus.ACTIVE:
      return "Active";
    case CustomerStatus.INACTIVE:
      return "Inactive";
    case CustomerStatus.BLOCKED:
      return "Blocked";
    default:
      return status;
  }
};

const getCustomerTypeLabel = (type: CustomerType) => {
  switch (type) {
    case CustomerType.VIP:
      return "VIP";
    case CustomerType.REGULAR:
      return "Regular";
    case CustomerType.NEW:
      return "New";
    default:
      return type;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

const formatToFormDate = (date: string | Date | null | undefined): string => {
  if (!date) return "";
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "";
  return dateObj.toISOString().split("T")[0];
};

export interface CustomerFormData {
  fullName: string;
  phone: string;
  email: string;
  gender: Gender | "";
  birthday: string;
  address: string;
  notes: string;
  storeId: string;
  customerType: CustomerType;
  status: CustomerStatus;
}

const initialFormData: CustomerFormData = {
  fullName: "",
  phone: "",
  email: "",
  gender: "",
  birthday: "",
  address: "",
  notes: "",
  storeId: "",
  customerType: CustomerType.NEW,
  status: CustomerStatus.ACTIVE,
};

export interface CustomerFormDialogProps {
  customerId: number | null;
  dialogMode: "add" | "edit" | "view";
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string, severity?: "success" | "error", customer?: Customer) => void;
  initialData?: Partial<CustomerFormData>;
}

export const CustomerFormDialog: React.FC<CustomerFormDialogProps> = ({
  customerId,
  dialogMode,
  open,
  onClose,
  onSuccess,
  initialData,
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CustomerFormData>(initialFormData);
  const [storeList, setStoreList] = useState<Store[]>([]);

  const isEditMode = dialogMode === "edit";
  const isViewMode = dialogMode === "view";

  useEffect(() => {
    if (!open) return;

    const fetchStores = async () => {
      try {

        const response: StoreResponse = await storesApi.getAll({
          limit: 100,
          isActive: true,
        });

        let stores: Store[] = [];
        if (response && response.data && Array.isArray(response.data.data)) {
          stores = response.data.data;
        }

        setStoreList(stores);
      } catch (error) {
        console.error("Failed to load stores for customer dropdown:", error);
      }
    };
    fetchStores();
  }, [open]);

  const {
    data: customerData,
    isLoading: isLoadingCustomer,
    isError: isErrorFetching,
  } = useQuery<CustomerDetailResponse, Error, Customer>({
    queryKey: ["customer", customerId],
    queryFn: () => getCustomer(customerId!) as Promise<CustomerDetailResponse>,
    enabled: !!customerId && open,
    select: (data) => data.data,
  });

  const initialFormDataValue = useMemo(() => {
    if (customerData && (isEditMode || isViewMode)) {
      return {
        fullName: customerData.fullName || "",
        phone: customerData.phone || "",
        email: customerData.email || "",
        gender: customerData.gender || "",
        birthday: formatToFormDate(customerData.birthday),
        address: customerData.address || "",
        notes: customerData.notes || "",
        storeId: customerData.storeId?.toString() || "",
        customerType: customerData.customerType,
        status: customerData.status,
      };
    }
    if (dialogMode === "add" && initialData) {
      return {
        ...initialFormData,
        ...initialData,
      };
    }
    return initialFormData;
  }, [customerData, isEditMode, isViewMode, dialogMode, initialData]);

  useEffect(() => {
    setFormData(initialFormDataValue);
  }, [initialFormDataValue]);

  const createMutation = useMutation<CustomerDetailResponse, Error, CreateCustomerDto>({
    mutationFn: createCustomer,
    onSuccess: (response) => {
      onSuccess("Customer created successfully!", "success", response.data);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customerStats"] });
      onClose();
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error) || "Failed to create customer.";
      onSuccess(`Error: ${errorMessage}`, "error");
    },
  });

  const updateMutation = useMutation<CustomerDetailResponse, Error, { id: number; customer: UpdateCustomerDto }>({
    mutationFn: (data: { id: number; customer: UpdateCustomerDto }) =>
      updateCustomer(data.id, data.customer),
    onSuccess: (response) => {
      onSuccess("Customer updated successfully!", "success", response.data);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer", customerId] });
      queryClient.invalidateQueries({ queryKey: ["customerStats"] });
      onClose();
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error) || "Failed to update customer.";
      onSuccess(`Error: ${errorMessage}`, "error");
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const handleFormChange =
    (field: keyof CustomerFormData) =>
      (
        event:
          | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
          | { target: { value: string | Gender | CustomerStatus | CustomerType } }
      ) => {
        setFormData({
          ...formData,
          [field]: event.target.value as string
        });
      };

  const handleSubmit = () => {
    const dataToSubmit: CreateCustomerDto | UpdateCustomerDto = {
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email || undefined,
      gender:
        formData.gender !== "" ? (formData.gender as Gender) : undefined,
      birthday: formData.birthday || undefined,
      address: formData.address || undefined,
      notes: formData.notes || undefined,
      storeId: formData.storeId ? parseInt(formData.storeId) : undefined,
      status: formData.status,
      customerType: formData.customerType,
    };

    if (isEditMode && customerId) {
      updateMutation.mutate({ id: customerId, customer: dataToSubmit });
    } else if (dialogMode === "add") {
      createMutation.mutate(dataToSubmit as CreateCustomerDto);
    }
  };

  if ((isEditMode || isViewMode) && isLoadingCustomer) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Loading Customer...</DialogTitle>
        <DialogContent
          sx={{ display: "flex", justifyContent: "center", py: 5 }}
        >
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  if ((isEditMode || isViewMode) && isErrorFetching) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Alert severity="error">
            Failed to load customer with ID {customerId}. Please try again.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const currentCustomer = isEditMode || isViewMode ? customerData : undefined;


  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {dialogMode === "add"
          ? "Add New Customer"
          : dialogMode === "edit"
            ? `Edit Customer: ${currentCustomer?.fullName}`
            : "Customer Details"}
      </DialogTitle>
      <DialogContent dividers>
        {isViewMode && currentCustomer ? (
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
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
                  {currentCustomer.fullName?.charAt(0) || "NULL"}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {currentCustomer.fullName}
                  </Typography>
                  <Chip
                    label={getCustomerTypeLabel(currentCustomer.customerType)}
                    size="small"
                    sx={{
                      bgcolor: alpha(
                        getCustomerTypeColor(currentCustomer.customerType),
                        0.1
                      ),
                      color: getCustomerTypeColor(currentCustomer.customerType),
                      fontWeight: 600,
                      mt: 1,
                    }}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Phone
              </Typography>
              <Typography variant="body1">{currentCustomer.phone}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">
                {currentCustomer.email || "Not provided"}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Gender
              </Typography>
              <Typography variant="body1" sx={{ textTransform: "capitalize" }}>
                {currentCustomer.gender || "Not provided"}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Birthday
              </Typography>
              <Typography variant="body1">
                {currentCustomer.birthday
                  ? new Date(currentCustomer.birthday).toLocaleDateString()
                  : "Not provided"}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary">
                Address
              </Typography>
              <Typography variant="body1">
                {currentCustomer.address || "Not provided"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Total Visits
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {currentCustomer.totalVisits} visits
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Total Spent
              </Typography>
              <Typography
                variant="body1"
                fontWeight="600"
                color={SUCCESS_COLOR}
              >
                {formatCurrency(currentCustomer.totalSpent)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Last Visit
              </Typography>
              <Typography variant="body1">
                {currentCustomer.lastVisitDate
                  ? new Date(currentCustomer.lastVisitDate).toLocaleDateString()
                  : "Never visited"}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Status
              </Typography>
              <Chip
                label={getStatusLabel(currentCustomer.status)}
                size="small"
                sx={{
                  bgcolor: alpha(getStatusColor(currentCustomer.status), 0.1),
                  color: getStatusColor(currentCustomer.status),
                  fontWeight: 600,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary">
                Store ID
              </Typography>
              <Typography variant="body1">
                {currentCustomer.storeId || "Not assigned"}
              </Typography>
            </Grid>
            {currentCustomer.notes && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary">
                  Notes
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {currentCustomer.notes}
                </Typography>
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Created At
              </Typography>
              <Typography variant="body1">
                {new Date(currentCustomer.createdAt).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body1">
                {new Date(currentCustomer.updatedAt).toLocaleDateString()}
              </Typography>
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.fullName}
                onChange={handleFormChange("fullName")}
                required
                disabled={isViewMode}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={handleFormChange("phone")}
                required
                disabled={isViewMode}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleFormChange("email")}
                disabled={isViewMode}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth disabled={isViewMode}>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  label="Gender"
                  onChange={handleFormChange("gender")}
                >
                  <MenuItem value="">-- Select Gender --</MenuItem>
                  <MenuItem value={Gender.MALE}>Male</MenuItem>
                  <MenuItem value={Gender.FEMALE}>Female</MenuItem>
                  <MenuItem value={Gender.OTHER}>Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Birthday"
                type="date"
                value={formData.birthday}
                onChange={handleFormChange("birthday")}
                disabled={isViewMode}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth disabled={isViewMode}>
                <InputLabel>Customer Type</InputLabel>
                <Select
                  value={formData.customerType}
                  label="Customer Type"
                  onChange={handleFormChange("customerType")}
                >
                  <MenuItem value={CustomerType.NEW}>New</MenuItem>
                  <MenuItem value={CustomerType.REGULAR}>Regular</MenuItem>
                  <MenuItem value={CustomerType.VIP}>VIP</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth disabled={isViewMode}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={handleFormChange("status")}
                >
                  <MenuItem value={CustomerStatus.ACTIVE}>Active</MenuItem>
                  <MenuItem value={CustomerStatus.INACTIVE}>Inactive</MenuItem>
                  <MenuItem value={CustomerStatus.BLOCKED}>Blocked</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth disabled={isViewMode}>
                <InputLabel id="store-select-label">Store ID</InputLabel>
                <Select
                  labelId="store-select-label"
                  label="Store ID"
                  value={formData.storeId || ""}
                  onChange={handleFormChange("storeId")}
                  required
                >
                  <MenuItem value="">
                    <em>Select a store</em>
                  </MenuItem>

                  {storeList.length === 0 ? (
                    <MenuItem disabled>
                      {isLoadingCustomer ? 'Loading stores...' : 'No active stores found'}
                    </MenuItem>
                  ) : (
                    storeList.map((store) => (
                      <MenuItem key={store.id} value={store.id.toString()}>
                        {store.id}: {store.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={formData.address}
                onChange={handleFormChange("address")}
                disabled={isViewMode}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleFormChange("notes")}
                disabled={isViewMode}
                placeholder="Add any additional notes about the customer..."
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        {!isViewMode && (
          <>
            <Button onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={isSubmitting || !formData.fullName || !formData.phone}
              sx={{
                bgcolor: PRIMARY_COLOR,
                "&:hover": { bgcolor: PRIMARY_DARK },
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : dialogMode === "add" ? (
                "Add Customer"
              ) : (
                "Save Changes"
              )}
            </Button>
          </>
        )}
        {isViewMode && <Button onClick={onClose}>Close</Button>}
      </DialogActions>
    </Dialog>
  );
};

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    customerType: undefined as CustomerType | undefined,
    status: undefined as CustomerStatus | undefined,
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view">("add");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const {
    data: paginatedCustomers,
    isLoading: isLoadingCustomers,
    isError: isErrorCustomers,
  } = useQuery<CustomerResponse>({ 
    queryKey: ["customers", page, rowsPerPage, filters, searchQuery],
    queryFn: () =>
      getCustomers({
        search: searchQuery || undefined,
        customerType: filters.customerType,
        status: filters.status,
        page: page + 1,
        limit: rowsPerPage,
      }),
    placeholderData: keepPreviousData,
  });

  const customers = useMemo((): Customer[] => {
    return paginatedCustomers?.data?.data ?? [];
  }, [paginatedCustomers]);

  const totalCustomers = paginatedCustomers?.data?.total ?? 0;

  const { data: customerStats, isLoading: isLoadingStats } =
    useQuery<CustomerStats>({
      queryKey: ["customerStats"],
      queryFn: () => getCustomerStats(),

    });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      handleSnackbarOpen("Customer deleted successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customerStats"] });
      setDeleteConfirmOpen(false);
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error) || "Failed to delete customer.";
      handleSnackbarOpen(`Error: ${errorMessage}`, "error");
    },
  });

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  const handleSnackbarOpen = (
    message: string,
    severity: "success" | "error" = "success"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    customer: Customer
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomerId(customer.id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddNew = () => {
    setDialogMode("add");
    setSelectedCustomerId(null);
    setOpenDialog(true);
  };

  const handleEdit = () => {
    if (selectedCustomerId) {
      setDialogMode("edit");
      setOpenDialog(true);
    }
    handleMenuClose();
  };

  const handleView = () => {
    if (selectedCustomerId) {
      setDialogMode("view");
      setOpenDialog(true);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    if (selectedCustomerId) {
      deleteMutation.mutate(selectedCustomerId);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
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

  const handleFilterChange = (
    key: "customerType" | "status",
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : (value as CustomerType | CustomerStatus),
    }));
    setPage(0);
  };

  const handleSearch = () => {
    setPage(0);
  };

  const totalRevenue = customerStats?.totalRevenue ?? 0;

  const stats = {
    total: customers.length,
    new: customers.filter((c) => c.customerType === "new").length,
    regular: customers.filter((c) => c.customerType === "regular").length,
    vip: customers.filter((c) => c.customerType === "vip").length,
    totalRevenue: customers.reduce((sum, c) => sum + Number(c.totalSpent), 0),
  };
  const [loading, setLoading] = useState(false);
  const isAnyLoading =
  isLoadingCustomers ||
  isLoadingStats ||
  deleteMutation.isPending;

  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isAnyLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {/* Header */}
      {/* <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Customer Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your customer database and relationships
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
                    Total Customers
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {customerStats?.totalCustomers ?? 0}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: alpha(PRIMARY_COLOR, 0.1),
                    width: 56,
                    height: 56,
                  }}
                >
                  <PersonOutline sx={{ color: PRIMARY_COLOR, fontSize: 28 }} />
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
                    VIP Customers
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {customerStats?.vipCustomers ?? 0}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: alpha(PURPLE_COLOR, 0.1),
                    width: 56,
                    height: 56,
                  }}
                >
                  <Star sx={{ color: PURPLE_COLOR, fontSize: 28 }} />
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
                    New Customers
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.new}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: alpha(SUCCESS_COLOR, 0.1),
                    width: 56,
                    height: 56,
                  }}
                >
                  <PersonAdd sx={{ color: SUCCESS_COLOR, fontSize: 28 }} />
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
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ${(stats.totalRevenue / 1000000).toFixed(1)}M
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: alpha(INFO_COLOR, 0.1),
                    width: 56,
                    height: 56,
                  }}
                >
                  <TrendingUp sx={{ color: INFO_COLOR, fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              placeholder="Search by name, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              sx={{ flex: 1, minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton onClick={handleSearch}>
                      <Search sx={{ color: PRIMARY_COLOR }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.customerType || "all"}
                label="Type"
                onChange={(e) =>
                  handleFilterChange("customerType", e.target.value as string)
                }
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value={CustomerType.NEW}>New</MenuItem>
                <MenuItem value={CustomerType.REGULAR}>Regular</MenuItem>
                <MenuItem value={CustomerType.VIP}>VIP</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status || "all"}
                label="Status"
                onChange={(e) =>
                  handleFilterChange("status", e.target.value as string)
                }
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value={CustomerStatus.ACTIVE}>Active</MenuItem>
                <MenuItem value={CustomerStatus.INACTIVE}>Inactive</MenuItem>
                <MenuItem value={CustomerStatus.BLOCKED}>Blocked</MenuItem>
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
              Add New Customer
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Customer Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.05) }}>
                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Visits</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Total Spent</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Last Visit</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { isErrorCustomers ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                    <Alert severity="error">Failed to load customers.</Alert>
                  </TableCell>
                </TableRow>
              ) : customers.length > 0 ? (
                customers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    sx={{
                      "&:hover": { bgcolor: alpha(PRIMARY_COLOR, 0.02) },
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
                        <Badge
                          overlap="circular"
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                          }}
                          badgeContent={
                            customer.customerType === CustomerType.VIP ? (
                              <Star
                                sx={{
                                  fontSize: 16,
                                  color: PURPLE_COLOR,
                                  bgcolor: "white",
                                  borderRadius: "50%",
                                  p: 0.3,
                                }}
                              />
                            ) : null
                          }
                        >
                          {/* <Avatar
                            sx={{
                              bgcolor: alpha(PRIMARY_COLOR, 0.1),
                              color: PRIMARY_COLOR,
                              width: 44,
                              height: 44,
                              fontWeight: 600,
                            }}
                          >
                            {customer.fullName?.charAt(0) || "NULL"}
                          </Avatar> */}
                        </Badge>
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {customer.fullName}
                          </Typography>
                          {/* {customer.storeId && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Store ID: {customer.storeId}
                            </Typography>
                          )} */}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Phone
                            sx={{ fontSize: 14, color: "text.secondary" }}
                          />
                          <Typography variant="body2">
                            {customer.phone}
                          </Typography>
                        </Box>
                        {customer.email && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Email
                              sx={{ fontSize: 14, color: "text.secondary" }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {customer.email}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getCustomerTypeLabel(customer.customerType)}
                        size="small"
                        sx={{
                          bgcolor: alpha(
                            getCustomerTypeColor(customer.customerType),
                            0.1
                          ),
                          color: getCustomerTypeColor(customer.customerType),
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="600">
                          {customer.totalVisits}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          visits
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight="600"
                          color={SUCCESS_COLOR}
                        >
                          {formatCurrency(customer.totalSpent)}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(
                            (Number(customer.totalSpent) / 10000000) * 100,
                            100
                          )}
                          sx={{
                            height: 4,
                            borderRadius: 2,
                            bgcolor: alpha(SUCCESS_COLOR, 0.1),
                            "& .MuiLinearProgress-bar": {
                              bgcolor: SUCCESS_COLOR,
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      {customer.lastVisitDate ? (
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
                            {new Date(
                              customer.lastVisitDate
                            ).toLocaleDateString()}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Never
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(customer.status)}
                        size="small"
                        sx={{
                          bgcolor: alpha(getStatusColor(customer.status), 0.1),
                          color: getStatusColor(customer.status),
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, customer)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box sx={{ textAlign: "center", py: 6 }}>
                      <PersonOutline
                        sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                      />
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        gutterBottom
                      >
                        No customers found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery || filters.customerType || filters.status
                          ? "Try adjusting your search or filters"
                          : "Get started by adding your first customer"}
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
          count={totalCustomers}
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

      {/* Add/Edit/View Dialog */}
      {openDialog && (
        <CustomerFormDialog
          customerId={selectedCustomerId}
          dialogMode={dialogMode}
          open={openDialog}
          onClose={handleDialogClose}
          onSuccess={handleSnackbarOpen}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete customer **
            {selectedCustomer?.fullName || selectedCustomerId}**? This action
            cannot be undone.
          </Alert>
          {selectedCustomer && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
              <Avatar
                sx={{
                  bgcolor: alpha(PRIMARY_COLOR, 0.1),
                  color: PRIMARY_COLOR,
                  width: 44,
                  height: 44,
                  fontWeight: 600,
                }}
              >
                {selectedCustomer.fullName?.charAt(0) || "NULL"}
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight="600">
                  {selectedCustomer.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedCustomer.phone}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            disabled={deleteMutation.isPending}
            sx={{ bgcolor: ERROR_COLOR, "&:hover": { bgcolor: "#dc2626" } }}
          >
            {deleteMutation.isPending ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Delete Customer"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar?.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={() => setSnackbar(null)}
          severity={snackbar?.severity}
          sx={{ width: "100%" }}
        >
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </>
  );
}