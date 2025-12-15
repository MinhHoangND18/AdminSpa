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
  Switch,
  FormControlLabel,
  CircularProgress,
  Snackbar,
  FormHelperText,
  Backdrop,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  ListItemButton,
} from "@mui/material";
import {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  confirmBooking,
  cancelBooking,
} from "@/lib/api/bookings";
import { getCustomers } from "@/lib/api/customers";
import { storesApi } from "@/lib/api/stores";
import { getStaff } from "@/lib/api/staffs";
import { getItemsByInvoiceId } from "@/lib/api/invoice-items";
import {
  Booking,
  BookingStatus,
  Customer,
  Store as StoreType,
  CreateBookingPayload,
  UpdateBookingPayload,
  BookingFilters,
  BookingResponse,
} from "@/types/booking";
import type { CustomerResponse } from "@/types/customer";
import {
  InvoiceItem as InvoiceItemType,
  ItemType,
} from "@/types/invoice-item";
import { Staff as StaffType } from "@/types/staff";

import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Store,
  Phone,
  CheckCircle,
  Cancel,
  Pending,
  PlayArrow,
  Done,
  NoAccounts,
  CalendarToday,
  ConfirmationNumber,
  Close as CloseIcon,
  LocationOn,
  AccessTime,
  Person,
  Event,
  Source,
  Spa,
  ShoppingBag,
  Inventory,
  Assignment,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";


interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string | string[];
    };
  };
  message?: string; 
}

const isAxiosError = (error: unknown): error is AxiosErrorResponse => {
  return (
    typeof error === "object" &&
    error !== null &&
    ("response" in error || "message" in error)
  );
};

const PRIMARY_COLOR = "#14b8a6";
const PRIMARY_DARK = "#0f766e";
const SUCCESS_COLOR = "#10b981";
const ERROR_COLOR = "#ef4444";
const WARNING_COLOR = "#f59e0b";
const INFO_COLOR = "#3b82f6";
const PURPLE_COLOR = "#a855f7";

interface InvoiceItem extends InvoiceItemType {
  staff_name?: string;
}

interface BookingFormData {
  customerId: string | "";
  storeId: string | "";
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus | "";
  source: string;
  notes: string;
  confirm: boolean;
}

const getItemTypeIcon = (type: ItemType) => {
  switch (type) {
    case "service":
      return <Spa />;
    case "product":
      return <ShoppingBag />;
    case "package":
      return <Inventory />;
    default:
      return <Assignment />;
  }
};

const getItemTypeColor = (type: ItemType) => {
  switch (type) {
    case "service":
      return PRIMARY_COLOR;
    case "product":
      return INFO_COLOR;
    case "package":
      return PURPLE_COLOR;
    default:
      return PRIMARY_COLOR;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const getStatusColor = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.PENDING:
      return WARNING_COLOR;
    case BookingStatus.CONFIRMED:
      return INFO_COLOR;
    case BookingStatus.IN_PROGRESS:
      return PRIMARY_COLOR;
    case BookingStatus.COMPLETED:
      return SUCCESS_COLOR;
    case BookingStatus.CANCELLED:
      return ERROR_COLOR;
    case BookingStatus.NO_SHOW:
      return "#6b7280";
    default:
      return PRIMARY_COLOR;
  }
};

const getStatusIcon = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.PENDING:
      return <Pending />;
    case BookingStatus.CONFIRMED:
      return <CheckCircle />;
    case BookingStatus.IN_PROGRESS:
      return <PlayArrow />;
    case BookingStatus.COMPLETED:
      return <Done />;
    case BookingStatus.CANCELLED:
      return <Cancel />;
    case BookingStatus.NO_SHOW:
      return <NoAccounts />;
    default:
      return <Pending />;
  }
};

const getStatusLabel = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.PENDING:
      return "Pending";
    case BookingStatus.CONFIRMED:
      return "Confirmed";
    case BookingStatus.IN_PROGRESS:
      return "In Progress";
    case BookingStatus.COMPLETED:
      return "Completed";
    case BookingStatus.CANCELLED:
      return "Cancelled";
    case BookingStatus.NO_SHOW:
      return "No Show";
    default:
      return status;
  }
};

const formatTime = (time: string) => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTimeToHHMM = (time: string | null | undefined): string => {
  if (!time) return "";
  const parts = time.split(":");
  if (parts.length < 2) return time;

  const hour = parts[0].padStart(2, "0");
  const minute = parts[1].padStart(2, "0");

  return `${hour}:${minute}`;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [staff, setStaff] = useState<StaffType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isItemsLoading, setIsItemsLoading] = useState(false);
  const [bookingItems, setBookingItems] = useState<InvoiceItem[]>([]);
  const [itemsOpen, setItemsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<BookingStatus | "all">(
    "all"
  );
  const [filterStore, setFilterStore] = useState<number | "all">("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view">("add");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof BookingFormData, string>>
  >({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning";
  } | null>(null);

  const initialFormData: BookingFormData = {
    customerId: "",
    storeId: "",
    bookingDate: new Date().toISOString().split("T")[0],
    startTime: "01:00",
    endTime: "11:00",
    status: "",
    source: "",
    notes: "",
    confirm: false,
  };

  const [formData, setFormData] = useState<BookingFormData>(initialFormData);

  const validateForm = () => {
    const errors: Partial<Record<keyof BookingFormData, string>> = {};

    if (!formData.customerId) {
      errors.customerId = "Customer is required.";
    }
    if (!formData.storeId) {
      errors.storeId = "Store is required.";
    }
    if (!formData.bookingDate) {
      errors.bookingDate = "Booking Date is required.";
    }
    if (!formData.startTime) {
      errors.startTime = "Start Time is required.";
    }

    if (formData.endTime) {
      const start = new Date(`2000/01/01 ${formData.startTime}`);
      const end = new Date(`2000/01/01 ${formData.endTime}`);

      if (end.getTime() <= start.getTime()) {
        errors.endTime = "End Time must be after Start Time.";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: BookingFilters = {
        page: page + 1,
        limit: rowsPerPage,
      };

      if (filterStatus !== "all") {
        filters.status = filterStatus;
      }
      if (filterStore !== "all") {
        filters.storeId = filterStore;
      }
      if (filterDate && filterDate.trim() !== "") {
        filters.bookingDate = filterDate;
      }

      const response: BookingResponse | Booking[] = await getBookings(filters);

      // NEW:
      let bookingData: Booking[],
        metaData: Partial<BookingResponse["meta"]> = {};

      if ("data" in response && Array.isArray(response.data)) {
        bookingData = response.data;
        metaData = (response as BookingResponse).meta;
      } else if (Array.isArray(response)) {
        bookingData = response;
      } else {
        bookingData = [];
      }

      setBookings(Array.isArray(bookingData) ? bookingData : []);
      setTotalRecords(metaData?.total || bookingData.length || 0);
      setTotalPages(metaData?.totalPages || 1);

      if (customers.length === 0) {
        const customerResponse = (await getCustomers({
          limit: 1000,
        })) as CustomerResponse;
        let customerData: Customer[]; // ✅ Giờ Customer đã thống nhất

        if (
          customerResponse?.data?.data &&
          Array.isArray(customerResponse.data.data)
        ) {
          customerData = customerResponse.data.data; // ✅ Không lỗi nữa
        } else if (
          customerResponse?.data &&
          Array.isArray(customerResponse.data)
        ) {
          customerData = customerResponse.data;
        } else if (Array.isArray(customerResponse)) {
          customerData = customerResponse;
        } else {
          customerData = [];
        }

        setCustomers(customerData);
      }
      if (stores.length === 0) {
        const storeResponse = await storesApi.getAll({ limit: 1000 });
        let storeData: StoreType[];

        console.log("🔍 Store Response:", storeResponse); // Debug

        // Kiểm tra cấu trúc { data: { data: [...] } }
        if (
          storeResponse?.data?.data &&
          Array.isArray(storeResponse.data.data)
        ) {
          storeData = storeResponse.data.data;
        } else if (storeResponse?.data && Array.isArray(storeResponse.data)) {
          storeData = storeResponse.data;
        } else if (Array.isArray(storeResponse)) {
          storeData = storeResponse;
        } else {
          storeData = [];
        }

        console.log("✅ Parsed Store Data:", storeData);
        setStores(storeData);
      }
      if (staff.length === 0) {
        const staffResponse = await getStaff({ limit: 1000 }) as unknown as { data: { data: StaffType[] } };
        if (staffResponse?.data?.data && Array.isArray(staffResponse.data.data)) {
          setStaff(staffResponse.data.data);
        }
      }
    } catch (err: unknown) {
      console.error("Error loading data:", err);

      let errorMessage: string = "Failed to load data";
      if (isAxiosError(err)) {
        const backendMessage = err.response?.data?.message;
        if (Array.isArray(backendMessage)) {
          errorMessage = backendMessage[0] || errorMessage;
        } else if (typeof backendMessage === "string") {
          errorMessage = backendMessage;
        } else if (err.message) {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filterStatus, filterStore, filterDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredBookings = Array.isArray(bookings)
    ? bookings.filter((booking) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          booking.customer?.fullName?.toLowerCase().includes(query) ||
          booking.customer?.phone?.includes(query) ||
          booking.customer?.email?.toLowerCase().includes(query)
        );
      })
    : [];
  const stats = {
    total: totalRecords,
    pending: Array.isArray(bookings)
      ? bookings.filter((b) => b.status === BookingStatus.PENDING).length
      : 0,
    confirmed: Array.isArray(bookings)
      ? bookings.filter((b) => b.status === BookingStatus.CONFIRMED).length
      : 0,
    today: Array.isArray(bookings)
      ? bookings.filter(
          (b) => b.bookingDate === new Date().toISOString().split("T")[0]
        ).length
      : 0,
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    booking: Booking
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedBooking(booking);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddNew = () => {
    setDialogMode("add");
    setFormData(initialFormData);
    setValidationErrors({});
    setOpenDialog(true);
  };

  const fetchBookingItemsAndOpenDialog = async (mode: "view" | "edit") => {
    if (!selectedBooking) return;

    setBookingItems([]);
    if (selectedBooking.invoices && selectedBooking.invoices.length > 0) {
      setIsItemsLoading(true);
      try {
        const invoiceId = selectedBooking.invoices[0].id;
        const items = await getItemsByInvoiceId(invoiceId);
        const processedItems: InvoiceItem[] = items.map((apiItem) => ({
          ...apiItem,
          staff_name: staff.find((s) => s.id === apiItem.staffId)?.full_name,
        }));
        setBookingItems(processedItems);
      } catch (err) {
        console.error("Failed to fetch booking items:", err);
        setSnackbar({
          open: true,
          message: "Failed to load booking items.",
          severity: "error",
        });
      } finally {
        setIsItemsLoading(false);
      }
    }

    if (mode === "edit") {
      setFormData({
        customerId: selectedBooking.customerId.toString(),
        storeId: selectedBooking.storeId.toString(),
        bookingDate: selectedBooking.bookingDate,
        startTime: formatTimeToHHMM(selectedBooking.startTime),
        endTime: formatTimeToHHMM(selectedBooking.endTime),
        status: selectedBooking.status,
        source: selectedBooking.source || "",
        notes: selectedBooking.notes || "",
        confirm: selectedBooking.confirm,
      });
    }

    setDialogMode(mode);
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleEdit = () => {
    fetchBookingItemsAndOpenDialog("edit");
  };

  const handleView = () => {
    fetchBookingItemsAndOpenDialog("view");
  };

  const handleDelete = () => {
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (selectedBooking) {
      try {
        setSubmitting(true);
        await deleteBooking(selectedBooking.id);
        await loadData();
        setDeleteConfirmOpen(false);
        setSelectedBooking(null);
        setSnackbar({
          open: true,
          message: `Booking deleted successfully!`,
          severity: "success",
        });
      } catch (error: unknown) {
        let errorMessage: string = "An unknown error occurred.";
        if (isAxiosError(error)) {
          const backendMessage = error.response?.data?.message;
          if (Array.isArray(backendMessage)) {
            errorMessage = backendMessage[0] || errorMessage;
          } else if (typeof backendMessage === "string") {
            errorMessage = backendMessage;
          } else if (error.message) {
            errorMessage = error.message;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        setSnackbar({
          open: true,
          message: `Deletion failed: ${errorMessage}`,
          severity: "error",
        });
      } finally {
        setSubmitting(false);
      }
    }
  };
  const handleDialogClose = () => {
    setOpenDialog(false);
    setFormData(initialFormData);
    setValidationErrors({});
    setBookingItems([]);
    setItemsOpen(false);
  };

  const handleFormChange =
    (field: keyof BookingFormData) =>
    (event: { target: { value: string } }) => {
      setFormData({ ...formData, [field]: event.target.value });
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSwitchChange =
    (field: keyof BookingFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: event.target.checked });
    };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: "Please correct the errors in the form.",
        severity: "warning",
      });
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload: CreateBookingPayload | UpdateBookingPayload = {
        customerId: parseInt(formData.customerId),
        storeId: parseInt(formData.storeId),
        bookingDate: formData.bookingDate,
        startTime: formData.startTime,
        endTime: formData.endTime || undefined,
        status: formData.status || undefined,
        source: formData.source || undefined,
        notes: formData.notes || undefined,
        confirm: formData.confirm,
      };

      let successMessage = "";

      if (dialogMode === "add") {
        await createBooking(payload as CreateBookingPayload);
        successMessage = "New booking created successfully!";
      } else if (dialogMode === "edit" && selectedBooking) {
        await updateBooking(selectedBooking.id, payload);
        successMessage = "Booking updated successfully!";
      }

      await loadData();
      handleDialogClose();
      setSnackbar({
        open: true,
        message: successMessage,
        severity: "success",
      });
    } catch (error: unknown) {
      let errorMessage: string = "An unknown error occurred.";
      if (isAxiosError(error)) {
        const backendMessage = error.response?.data?.message;
        if (Array.isArray(backendMessage)) {
          errorMessage = backendMessage[0] || errorMessage;
        } else if (typeof backendMessage === "string") {
          errorMessage = backendMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setSnackbar({
        open: true,
        message: `Action failed: ${errorMessage}`,
        severity: "error",
      });
    } finally {
      setSubmitting(false);
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

  const updateBookingStatus = async (
    bookingId: number,
    newStatus: BookingStatus,
    successMsg: string
  ) => {
    try {
      await updateBooking(bookingId, { status: newStatus });
      await loadData();
      handleMenuClose();
      setSnackbar({
        open: true,
        message: successMsg,
        severity: "success",
      });
    } catch (error: unknown) {
      let errorMessage: string = "An unknown error occurred.";
      if (isAxiosError(error)) {
        const backendMessage = error.response?.data?.message;
        if (Array.isArray(backendMessage)) {
          errorMessage = backendMessage[0] || errorMessage;
        } else if (typeof backendMessage === "string") {
          errorMessage = backendMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setSnackbar({
        open: true,
        message: `Status update failed: ${errorMessage}`,
        severity: "error",
      });
    }
  };

  const handleConfirmBooking = async () => {
    if (selectedBooking) {
      try {
        await confirmBooking(selectedBooking.id);
        await loadData();
        handleMenuClose();
        setSnackbar({
          open: true,
          message: `Booking #${selectedBooking.id} confirmed successfully!`,
          severity: "success",
        });
      } catch (error: unknown) {
        let errorMessage: string = "An unknown error occurred.";
        if (isAxiosError(error)) {
          const backendMessage = error.response?.data?.message;
          if (Array.isArray(backendMessage)) {
            errorMessage = backendMessage[0] || errorMessage;
          } else if (typeof backendMessage === "string") {
            errorMessage = backendMessage;
          } else if (error.message) {
            errorMessage = error.message;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        setSnackbar({
          open: true,
          message: `Confirmation failed: ${errorMessage}`,
          severity: "error",
        });
      }
    }
  };

  const handleCancelBooking = async () => {
    if (selectedBooking) {
      try {
        await cancelBooking(selectedBooking.id);
        await loadData();
        handleMenuClose();
        setSnackbar({
          open: true,
          message: `Booking #${selectedBooking.id} cancelled successfully.`,
          severity: "warning",
        });
      } catch (error: unknown) {
        let errorMessage: string = "An unknown error occurred.";
        if (isAxiosError(error)) {
          const backendMessage = error.response?.data?.message;
          if (Array.isArray(backendMessage)) {
            errorMessage = backendMessage[0] || errorMessage;
          } else if (typeof backendMessage === "string") {
            errorMessage = backendMessage;
          } else if (error.message) {
            errorMessage = error.message;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        setSnackbar({
          open: true,
          message: `Cancellation failed: ${errorMessage}`,
          severity: "error",
        });
      }
    }
  };

  const isAnyProcessing = loading || submitting;
  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isAnyProcessing}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {/* Header */}
      {/* <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Booking Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage appointments and customer bookings
                </Typography>
            </Box> */}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

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
                    Total Bookings
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
                  <ConfirmationNumber
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
                    Pending
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.pending}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: alpha(WARNING_COLOR, 0.1),
                    width: 56,
                    height: 56,
                  }}
                >
                  <Pending sx={{ color: WARNING_COLOR, fontSize: 28 }} />
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
                    Confirmed
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.confirmed}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: alpha(INFO_COLOR, 0.1),
                    width: 56,
                    height: 56,
                  }}
                >
                  <CheckCircle sx={{ color: INFO_COLOR, fontSize: 28 }} />
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
                    Today&apos;s Bookings
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.today}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: alpha(SUCCESS_COLOR, 0.1),
                    width: 56,
                    height: 56,
                  }}
                >
                  <CalendarToday sx={{ color: SUCCESS_COLOR, fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <TextField
              placeholder="Search by customer name, phone, email..."
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
                  setFilterStatus(e.target.value as BookingStatus | "all")
                }
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value={BookingStatus.PENDING}>Pending</MenuItem>
                <MenuItem value={BookingStatus.CONFIRMED}>Confirmed</MenuItem>
                <MenuItem value={BookingStatus.IN_PROGRESS}>
                  In Progress
                </MenuItem>
                <MenuItem value={BookingStatus.COMPLETED}>Completed</MenuItem>
                <MenuItem value={BookingStatus.CANCELLED}>Cancelled</MenuItem>
                <MenuItem value={BookingStatus.NO_SHOW}>No Show</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Store</InputLabel>
              <Select
                value={filterStore}
                label="Store"
                onChange={(e) =>
                  setFilterStore(e.target.value as number | "all")
                }
              >
                <MenuItem value="all">All Stores</MenuItem>
                {stores.map((store) => (
                  <MenuItem key={store.id} value={store.id}>
                    {store.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Date"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddNew}
              sx={{
                height: 55,
                bgcolor: PRIMARY_COLOR,
                "&:hover": { bgcolor: PRIMARY_DARK },
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              New Booking
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.05) }}>
                <TableCell sx={{ fontWeight: 700 }}>Booking</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Invoice code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Store</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                {/* <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell> */}
                <TableCell sx={{ fontWeight: 700 }}>Source</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Confirmed</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <TableRow
                    key={booking.id}
                    sx={{
                      "&:hover": { bgcolor: alpha(PRIMARY_COLOR, 0.02) },
                    }}
                  >
                    <TableCell>
                      {booking.id ? (
                        <Chip
                          label={`BK${booking.id}`}
                          size="small"
                          variant="outlined"
                          sx={{
                            color: '#ed6c02',
                            borderColor: '#ed6c02',
                            fontWeight: 400,
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No booking
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
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
                          {(booking.customer?.fullName || "?").charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {booking.customer?.fullName}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              mt: 0.5,
                            }}
                          >
                            <Phone
                              sx={{ fontSize: 12, color: "text.secondary" }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {booking.customer?.phone}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 150, wordBreak: 'break-word' }}>
                      {booking.invoices && booking.invoices.length > 0 ? (
                        <Typography
                          variant="body2"
                          fontWeight="600"
                          sx={{ color: SUCCESS_COLOR }}
                        >
                          {booking.invoices[0].voucher}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Has been deleted
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <Store sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2">
                          {booking.store?.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="600">
                          {formatDate(booking.bookingDate)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(booking.startTime)}
                          {/* - {booking.endTime ? formatTime(booking.endTime) : 'N/A'} */}
                        </Typography>
                      </Box>
                    </TableCell>
                    {/* <TableCell>
                                            {booking.endTime ? (
                                                <Typography variant="body2">
                                                    {Math.round(
                                                        (new Date(`2000-01-01T${booking.endTime}`).getTime() -
                                                            new Date(`2000-01-01T${booking.startTime}`).getTime()) / (1000 * 60)
                                                    )} min
                                                </Typography>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Not set
                                                </Typography>
                                            )}
                                        </TableCell> */}
                    <TableCell>
                      <Chip
                        label={booking.source || "Unknown"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(booking.status)}
                        label={getStatusLabel(booking.status)}
                        size="small"
                        sx={{
                          bgcolor: alpha(getStatusColor(booking.status), 0.1),
                          color: getStatusColor(booking.status),
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={booking.confirm}
                        icon={<Cancel sx={{ color: "text.disabled" }} />}
                        checkedIcon={
                          <CheckCircle sx={{ color: SUCCESS_COLOR }} />
                        }
                        disabled
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, booking)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9}>
                    {
                      <Box sx={{ textAlign: "center", py: 6 }}>
                        <ConfirmationNumber
                          sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                        />
                        <Typography
                          variant="h6"
                          color="text.secondary"
                          gutterBottom
                        >
                          No bookings found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {searchQuery ||
                          filterStatus !== "all" ||
                          filterStore !== "all" ||
                          filterDate
                            ? "Try adjusting your search or filters"
                            : "Get started by creating your first booking"}
                        </Typography>
                      </Box>
                    }
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalRecords}
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
        disableScrollLock
      >
        {/* <MenuItem onClick={handleView}>
                    <Visibility sx={{ mr: 1, fontSize: 20 }} />
                    View Details
                </MenuItem> */}
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleConfirmBooking}
          disabled={selectedBooking?.status === BookingStatus.CONFIRMED}
        >
          <CheckCircle sx={{ mr: 1, fontSize: 20, color: INFO_COLOR }} />
          Confirm
        </MenuItem>
        <MenuItem
          onClick={() =>
            selectedBooking &&
            updateBookingStatus(
              selectedBooking.id,
              BookingStatus.IN_PROGRESS,
              "Booking status updated to In Progress."
            )
          }
          disabled={selectedBooking?.status === BookingStatus.IN_PROGRESS}
        >
          <PlayArrow sx={{ mr: 1, fontSize: 20, color: PRIMARY_COLOR }} />
          Start Service
        </MenuItem>
        <MenuItem
          onClick={() =>
            selectedBooking &&
            updateBookingStatus(
              selectedBooking.id,
              BookingStatus.COMPLETED,
              "Booking status updated to Completed."
            )
          }
          disabled={selectedBooking?.status === BookingStatus.COMPLETED}
        >
          <Done sx={{ mr: 1, fontSize: 20, color: SUCCESS_COLOR }} />
          Complete
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleCancelBooking}
          disabled={selectedBooking?.status === BookingStatus.CANCELLED}
          sx={{ color: ERROR_COLOR }}
        >
          <Cancel sx={{ mr: 1, fontSize: 20 }} />
          Cancel
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: ERROR_COLOR }}>
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
            ? "Create New Booking"
            : dialogMode === "edit"
            ? "Edit Booking"
            : "Booking Details"}
        </DialogTitle>
        <DialogContent dividers>
          {dialogMode === "view" && selectedBooking ? (
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
                    {(selectedBooking.customer?.fullName || "?").charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {selectedBooking.customer?.fullName}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <Chip
                        label={getStatusLabel(selectedBooking.status)}
                        size="small"
                        sx={{
                          bgcolor: alpha(
                            getStatusColor(selectedBooking.status),
                            0.1
                          ),
                          color: getStatusColor(selectedBooking.status),
                        }}
                      />
                      <Chip
                        label={
                          selectedBooking.confirm
                            ? "Confirmed"
                            : "Not Confirmed"
                        }
                        size="small"
                        variant={
                          selectedBooking.confirm ? "filled" : "outlined"
                        }
                        color={selectedBooking.confirm ? "success" : "default"}
                      />
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Customer
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedBooking.customer?.fullName}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {selectedBooking.customer?.phone}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Store
                </Typography>
                                  <Typography variant="body1" fontWeight="600">
                                    {selectedBooking.store?.name}
                                  </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Invoice
                                  </Typography>
                                  <Typography variant="body1" fontWeight="600" sx={{ color: SUCCESS_COLOR }}>
                                    {selectedBooking.invoices && selectedBooking.invoices.length > 0
                                      ? selectedBooking.invoices[0].voucher
                                      : "N/A"}
                                  </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>                <Typography variant="caption" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedBooking.bookingDate)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Time
                </Typography>
                <Typography variant="body1">
                  {formatTime(selectedBooking.startTime)} -{" "}
                  {selectedBooking.endTime
                    ? formatTime(selectedBooking.endTime)
                    : "N/A"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Source
                </Typography>
                <Typography variant="body1">
                  {selectedBooking.source || "Not specified"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body1">
                  {selectedBooking.endTime
                    ? `${Math.round(
                        (new Date(
                          `2000-01-01T${selectedBooking.endTime}`
                        ).getTime() -
                          new Date(
                            `2000-01-01T${selectedBooking.startTime}`
                          ).getTime()) /
                          (1000 * 60)
                      )} minutes`
                    : "Not set"}
                </Typography>
              </Grid>
              {selectedBooking.notes && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary">
                    Notes
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {selectedBooking.notes}
                  </Typography>
                </Grid>
              )}

              {/* Invoice Items Section */}
              {isItemsLoading ? (
                <Grid size={{ xs: 12 }} sx={{ textAlign: "center", my: 3 }}>
                  <CircularProgress />
                  <Typography>Loading items...</Typography>
                </Grid>
              ) : bookingItems.length > 0 ? (
                <Grid size={{ xs: 12 }}>
                  <List component={Paper} variant="outlined" sx={{ mt: 2 }}>
                    <ListItemButton onClick={() => setItemsOpen(!itemsOpen)}>
                      <ListItemIcon>
                        <Inventory />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Service Items (${bookingItems.length})`}
                      />
                      {itemsOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={itemsOpen} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {bookingItems.map((item) => (
                          <ListItem key={item.id} sx={{ pl: 4, borderTop: `1px solid ${alpha("#000", 0.12)}` }}>
                            <ListItemIcon>
                              {getItemTypeIcon(item.itemType as ItemType)}
                            </ListItemIcon>
                            <ListItemText
                              primary={item.itemName}
                              secondary={
                                <>
                                  <Typography component="span" variant="body2" color="text.primary">
                                    Qty: {item.quantity}
                                  </Typography>
                                  {` - Staff: ${item.staff_name || "N/A"}`}
                                </>
                              }
                            />
                            <Typography variant="body2" fontWeight="600">
                              {formatCurrency(item.totalPrice)}
                            </Typography>
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </List>
                </Grid>
              ) : null}

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Created At
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedBooking.createdAt).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedBooking.updatedAt).toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={3} sx={{ mt: 0.5 }}>
              {dialogMode === 'edit' && selectedBooking && (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        label="Booking ID"
                        value={`BK${selectedBooking.id}`}
                        InputProps={{ readOnly: true }}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        label="Invoice code"
                        value={
                            selectedBooking.invoices && selectedBooking.invoices.length > 0
                                ? selectedBooking.invoices[0].voucher
                                : 'Has been deleted'
                        }
                        InputProps={{ readOnly: true }}
                    />
                </Grid>
                </>
              )}

              {/* Invoice Items Section for Edit Mode */}
              {isItemsLoading ? (
                <Grid size={{ xs: 12 }} sx={{ textAlign: "center", my: 3 }}>
                  <CircularProgress />
                  <Typography>Loading items...</Typography>
                </Grid>
              ) : bookingItems.length > 0 ? (
                <Grid size={{ xs: 12 }} sx={{ mb: 3 }}>
                  <List component={Paper} variant="outlined">
                    <ListItemButton onClick={() => setItemsOpen(!itemsOpen)}>
                      <ListItemIcon>
                        <Inventory />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Service Items (${bookingItems.length})`}
                      />
                      {itemsOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={itemsOpen} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {bookingItems.map((item) => (
                          <ListItem key={item.id} sx={{ pl: 4, borderTop: `1px solid ${alpha("#000", 0.12)}` }}>
                            <ListItemIcon>
                              {getItemTypeIcon(item.itemType as ItemType)}
                            </ListItemIcon>
                            <ListItemText
                              primary={item.itemName}
                              secondary={
                                <>
                                  <Typography component="span" variant="body2" color="text.primary">
                                    Qty: {item.quantity}
                                  </Typography>
                                  {` - Staff: ${item.staff_name || "N/A"}`}
                                </>
                              }
                            />
                            <Typography variant="body2" fontWeight="600">
                              {formatCurrency(item.totalPrice)}
                            </Typography>
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </List>
                </Grid>
              ) : null}

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl
                  fullWidth
                  required
                  error={!!validationErrors.customerId}
                >
                  <InputLabel>Customer</InputLabel>
                  <Select
                    value={formData.customerId}
                    label="Customer"
                    onChange={handleFormChange("customerId")}
                  >
                    {customers.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>
                        {customer.fullName} - {customer.phone}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.customerId && (
                    <FormHelperText>
                      {validationErrors.customerId}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl
                  fullWidth
                  required
                  error={!!validationErrors.storeId}
                >
                  <InputLabel>Store</InputLabel>
                  <Select
                    value={formData.storeId}
                    label="Store"
                    onChange={handleFormChange("storeId")}
                  >
                    {stores.map((store) => (
                      <MenuItem key={store.id} value={store.id}>
                        {store.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.storeId && (
                    <FormHelperText>{validationErrors.storeId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Booking Date"
                  type="date"
                  value={formData.bookingDate}
                  onChange={handleFormChange("bookingDate")}
                  required
                  InputLabelProps={{ shrink: true }}
                  error={!!validationErrors.bookingDate}
                  helperText={validationErrors.bookingDate}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status 1"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as BookingStatus,
                      })
                    }
                  >
                    <MenuItem value={BookingStatus.PENDING}>Pending</MenuItem>
                    <MenuItem value={BookingStatus.CONFIRMED}>
                      Confirmed
                    </MenuItem>
                    <MenuItem value={BookingStatus.IN_PROGRESS}>
                      In Progress
                    </MenuItem>
                    <MenuItem value={BookingStatus.COMPLETED}>
                      Completed
                    </MenuItem>
                    <MenuItem value={BookingStatus.CANCELLED}>
                      Cancelled
                    </MenuItem>
                    <MenuItem value={BookingStatus.NO_SHOW}>No Show</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Start Time"
                  type="time"
                  value={formData.startTime}
                  onChange={handleFormChange("startTime")}
                  required
                  InputLabelProps={{ shrink: true }}
                  error={!!validationErrors.startTime}
                  helperText={validationErrors.startTime}
                />
              </Grid>
              {/* <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="End Time"
                                    type="time"
                                    value={formData.endTime}
                                    onChange={handleFormChange('endTime')}
                                    InputLabelProps={{ shrink: true }}
                                    error={!!validationErrors.endTime}
                                    helperText={validationErrors.endTime}
                                />
                            </Grid> */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Source</InputLabel>
                  <Select
                    value={formData.source}
                    label="Source"
                    onChange={handleFormChange("source")}
                  >
                    <MenuItem value="website">Website</MenuItem>
                    <MenuItem value="mobile_app">Mobile App</MenuItem>
                    <MenuItem value="phone">Phone</MenuItem>
                    <MenuItem value="walk_in">Walk-in</MenuItem>
                    <MenuItem value="referral">Referral</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.confirm}
                      onChange={handleSwitchChange("confirm")}
                    />
                  }
                  label="Confirmed"
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
                  placeholder="Add any special notes or instructions..."
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {dialogMode !== "view" && (
            <>
              <Button onClick={handleDialogClose} disabled={submitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={submitting}
                sx={{
                  bgcolor: PRIMARY_COLOR,
                  "&:hover": { bgcolor: PRIMARY_DARK },
                }}
              >
                {submitting ? (
                  <CircularProgress size={24} />
                ) : dialogMode === "add" ? (
                  "Create Booking"
                ) : (
                  "Save Changes"
                )}
              </Button>
            </>
          )}
          {dialogMode === "view" && (
            <Button onClick={handleDialogClose}>Close</Button>
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
            Are you sure you want to delete this booking? This action cannot be
            undone.
          </Alert>
          {selectedBooking && (
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
                {(selectedBooking.customer?.fullName || "?").charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight="600">
                  {selectedBooking.customer?.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(selectedBooking.bookingDate)} at{" "}
                  {formatTime(selectedBooking.startTime)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedBooking.store?.name}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            disabled={submitting}
            sx={{ bgcolor: ERROR_COLOR, "&:hover": { bgcolor: "#dc2626" } }}
          >
            {submitting ? <CircularProgress size={24} /> : "Delete Booking"}
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

      {/* Quick Actions Toolbar */}
      <Box sx={{ position: "fixed", bottom: 15, left: "43%", zIndex: 999 }}>
        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ p: 2, pb: "16px !important" }}>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Today's Bookings">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    setFilterDate(new Date().toISOString().split("T")[0])
                  }
                  startIcon={<CalendarToday />}
                >
                  Today
                </Button>
              </Tooltip>
              <Tooltip title="Pending Bookings">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setFilterStatus(BookingStatus.PENDING)}
                  startIcon={<Pending />}
                >
                  Pending
                </Button>
              </Tooltip>
              <Tooltip title="Create New Booking">
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddNew}
                  startIcon={<Add />}
                  sx={{
                    bgcolor: PRIMARY_COLOR,
                    "&:hover": { bgcolor: PRIMARY_DARK },
                  }}
                >
                  New Booking
                </Button>
              </Tooltip>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}