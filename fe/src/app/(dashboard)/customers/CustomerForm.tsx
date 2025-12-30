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
  Backdrop,
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
  CustomerFormData, // Import từ types
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
import { Store, StoreResponse } from "@/types/store";
import CustomerDetail from "./CustomerDetail";
import { createTheme, ThemeProvider } from "@mui/material/styles";
const blueTheme = createTheme({
  palette: {
    primary: {
      main: "#3b82f6",
    },
  },
});

interface CustomerDetailResponse {
  data: Customer;
}
interface CustomErrorResponse {
  data?: { message?: string };
}
interface AxiosErrorLike extends Error {
  response?: CustomErrorResponse;
}

const isAxiosErrorLike = (error: unknown): error is AxiosErrorLike => {
  return typeof error === "object" && error !== null && "response" in error;
};

const getErrorMessage = (error: unknown): string => {
  if (isAxiosErrorLike(error) && error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
};

// --- Giữ nguyên các hằng số màu sắc và Helper ---
const PRIMARY_COLOR = "#3b82f6";
const PRIMARY_DARK = "#0f766e";
const SUCCESS_COLOR = "#10b981";
const ERROR_COLOR = "#ef4444";
const WARNING_COLOR = "#f59e0b";
const INFO_COLOR = "#3b82f6";
const PURPLE_COLOR = "#a855f7";

type Customer = CustomerTypeInterface;

const getStatusColor = (status: CustomerStatus) => {
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

const getStatusLabel = (status: CustomerStatus) => {
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
  const [showDetail, setShowDetail] = useState(false);
  const [storeList, setStoreList] = useState<Store[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response: StoreResponse = await storesApi.getAll({
          limit: 100,
          isActive: true,
        });
        if (response?.data?.data) setStoreList(response.data.data);
      } catch (error) {
        console.error("Failed to load stores:", error);
      }
    };
    fetchStores();
  }, []);

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

  const customers = useMemo(
    () => paginatedCustomers?.data?.data ?? [],
    [paginatedCustomers]
  );
  const totalCustomers = paginatedCustomers?.data?.total ?? 0;

  const { data: customerStats, isLoading: isLoadingStats } =
    useQuery<CustomerStats>({
      queryKey: ["customerStats"],
      queryFn: () => getCustomerStats(),
    });
  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      handleSnackbarOpen("Customer created successfully!");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customerStats"] });
      setOpenDialog(false);
      setShowDetail(false);
    },
    onError: (error) =>
      handleSnackbarOpen(`Error: ${getErrorMessage(error)}`, "error"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; customer: UpdateCustomerDto }) =>
      updateCustomer(data.id, data.customer),
    onSuccess: () => {
      handleSnackbarOpen("Customer updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customerStats"] });
      setOpenDialog(false);
      setShowDetail(false);
    },
    onError: (error) =>
      handleSnackbarOpen(`Error: ${getErrorMessage(error)}`, "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      handleSnackbarOpen("Customer deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customerStats"] });
      setDeleteConfirmOpen(false);
    },
    onError: (error) =>
      handleSnackbarOpen(`Error: ${getErrorMessage(error)}`, "error"),
  });

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId),
    [customers, selectedCustomerId]
  );

  const handleSnackbarOpen = (
    message: string,
    severity: "success" | "error" = "success"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSave = async (data: CreateCustomerDto | UpdateCustomerDto) => {
    const dataToSubmit = {
      ...data,
    };

    if (dialogMode === "edit" && selectedCustomerId) {
      updateMutation.mutate({
        id: selectedCustomerId,
        customer: dataToSubmit as UpdateCustomerDto,
      });
    } else {
      createMutation.mutate(dataToSubmit as CreateCustomerDto);
    }
  };
  const handleFilterChange = <K extends keyof typeof filters>(
    key: K,
    value: (typeof filters)[K] | "all"
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }));
    setPage(0);
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    customer: Customer
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomerId(customer.id);
  };

  const handleAddNew = () => {
    setDialogMode("add");
    setSelectedCustomerId(null);
    setShowDetail(true);
  };
  const handleEdit = () => {
    if (selectedCustomerId) {
      setDialogMode("edit");
      setShowDetail(true);
    }
    setAnchorEl(null);
  };
  const handleView = () => {
    if (selectedCustomerId) {
      setDialogMode("view");
      setShowDetail(true);
    }
    setAnchorEl(null);
  };

  const handleBack = () => {
    setShowDetail(false);
    setSelectedCustomerId(null);
  };
  const handleDelete = () => {
    setDeleteConfirmOpen(true);
    setAnchorEl(null);
  };

  const stats = {
    new: customers.filter((c) => c.customerType === "new").length,
    totalRevenue: customers.reduce((sum, c) => sum + Number(c.totalSpent), 0),
  };

  return (
    <ThemeProvider theme={blueTheme}>
      {showDetail ? (
        <CustomerDetail
          mode={dialogMode}
          initialData={selectedCustomer}
          storeList={storeList}
          onSave={handleSave}
          onBack={handleBack}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      ) : (
        <>
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={
              isLoadingCustomers || isLoadingStats || deleteMutation.isPending
            }
          >
            <CircularProgress color="inherit" />
          </Backdrop>

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
                      <PersonOutline
                        sx={{ color: PRIMARY_COLOR, fontSize: 28 }}
                      />
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
            <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <TextField
                  size="small"
                  placeholder="Search by name, phone, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ flex: 1, minWidth: 200 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton size="small" onClick={() => setPage(0)}>
                          <Search sx={{ color: PRIMARY_COLOR, fontSize: 20 }} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl sx={{ minWidth: 130 }} size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filters.customerType || "all"}
                    label="Type"
                    onChange={(e) =>
                      handleFilterChange(
                        "customerType",
                        e.target.value as CustomerType | "all"
                      )
                    }
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value={CustomerType.NEW}>New</MenuItem>
                    <MenuItem value={CustomerType.REGULAR}>Regular</MenuItem>
                    <MenuItem value={CustomerType.VIP}>VIP</MenuItem>
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 130 }} size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status || "all"}
                    label="Status"
                    onChange={(e) =>
                      handleFilterChange(
                        "status",
                        e.target.value as CustomerStatus | "all"
                      )
                    }
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value={CustomerStatus.ACTIVE}>Active</MenuItem>
                    <MenuItem value={CustomerStatus.INACTIVE}>
                      Inactive
                    </MenuItem>
                    <MenuItem value={CustomerStatus.BLOCKED}>Blocked</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Add />}
                  onClick={handleAddNew}
                  sx={{
                    height: 40,
                    bgcolor: PRIMARY_COLOR,
                    "&:hover": { bgcolor: PRIMARY_DARK },
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                  }}
                >
                  Add New Customer
                </Button>
              </Box>
            </CardContent>
          </Card>

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
                  {isErrorCustomers ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                        <Alert severity="error">
                          Failed to load customers.
                        </Alert>
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
                            ></Badge>
                            <Typography variant="body2" fontWeight="600">
                              {customer.fullName}
                            </Typography>
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
                                {customer.country_code
                                  ? `(${customer.country_code}) `
                                  : ""}
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
                              color: getCustomerTypeColor(
                                customer.customerType
                              ),
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">
                            {customer.totalVisits}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            visits
                          </Typography>
                        </TableCell>
                        <TableCell>
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
                            "Never"
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(customer.status)}
                            size="small"
                            sx={{
                              bgcolor: alpha(
                                getStatusColor(customer.status),
                                0.1
                              ),
                              color: getStatusColor(customer.status),
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={
                              <Edit sx={{ fontSize: "18px !important" }} />
                            }
                            onClick={() => {
                              setSelectedCustomerId(customer.id);
                              setDialogMode("edit");
                              setShowDetail(true);
                            }}
                            sx={{
                              bgcolor: "#f39c12",
                              "&:hover": { bgcolor: "#e67e22" },
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: "6px",
                              px: 2,
                              minWidth: "80px",
                              boxShadow: "none",
                              height: "32px",
                            }}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <PersonOutline
                          sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                        />
                        <Typography variant="h6" color="text.secondary">
                          No customers found
                        </Typography>
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
              onPageChange={(_, p) => setPage(p)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </Card>
        </>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <CustomerDetail
          mode={dialogMode}
          initialData={selectedCustomer}
          storeList={storeList}
          onSave={handleSave}
          onBack={() => setOpenDialog(false)}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </Dialog>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1, fontSize: 20 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: ERROR_COLOR }}>
          <Delete sx={{ mr: 1, fontSize: 20 }} /> Delete
        </MenuItem>
      </Menu>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            Are you sure you want to delete **{selectedCustomer?.fullName}**?
            This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={() => deleteMutation.mutate(selectedCustomerId!)}
            variant="contained"
            sx={{ bgcolor: ERROR_COLOR }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar?.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(null)}
      >
        <Alert
          severity={snackbar?.severity}
          onClose={() => setSnackbar(null)}
          sx={{ width: "100%" }}
        >
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
