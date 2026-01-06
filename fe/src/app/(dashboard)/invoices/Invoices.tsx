"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
} from "react";
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
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  CircularProgress,
  Backdrop,
} from "@mui/material";
import {
  Add,
  Search,
  Edit,
  Delete,
  Receipt,
  Pending,
  CheckCircle,
  Inventory,
  Spa,
  ShoppingBag,
  Assignment,
  TrendingUp,
  Download,
  Print,
  Payment,
} from "@mui/icons-material";
import { useQuery, keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Invoice as InvoiceType,
  DiscountType as DiscountTypeEnum,
  PaymentStatus as PaymentStatusEnum,
  CreateInvoiceDto,
  UpdateInvoiceDto,
  QueryInvoiceDto,
} from "@/types/invoice";
import {
  InvoiceItem as InvoiceItemType,
  ItemType as ItemTypeEnum,
} from "@/types/invoice-item";
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoiceById,
} from "@/lib/api/invoices";
import {
  getItemsByInvoiceId,
} from "@/lib/api/invoice-items";
import { getCustomers } from "@/lib/api/customers";
import { storesApi } from "@/lib/api/stores";
import { getBookings } from "@/lib/api/bookings";
import { getStaff } from "@/lib/api/staffs";

import { Customer as CustomerType } from "@/types/customer";
import { Store as StoreType } from "@/types/store";
import { Booking as BookingType } from "@/types/booking";
import { Staff as StaffType } from "@/types/staff";

import InvoiceDetail from "./InvoiceDetail";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const blueTheme = createTheme({
  palette: {
    primary: {
      main: "#3b82f6",
    },
  },
});

// --- TYPE DEFINITIONS ---

// Helper type for API responses handling data list
interface ApiListResponse<T> {
  data: {
    data: T[];
  };
}

// Helper for getInvoices specific response structure
interface InvoiceListResponse {
  data: InvoiceType[];
  meta: {
    total: number;
  };
}

const PRIMARY_COLOR = "#3b82f6";
const PRIMARY_DARK = "#0f766e";
const SUCCESS_COLOR = "#10b981";
const ERROR_COLOR = "#ef4444";
const WARNING_COLOR = "#f59e0b";
const INFO_COLOR = "#3b82f6";
const PURPLE_COLOR = "#a855f7";

type DiscountType = "amount" | "percent";
type PaymentStatus = "pending" | "paid";
type ItemType = "service" | "product" | "package";

interface InvoiceItem extends InvoiceItemType {
  staff_name?: string;
}

interface Invoice extends InvoiceType {
  booking_id: number | null;
  customer_id: number;
  store_id: number;
  discount_amount: number;
  discount_type: DiscountType | null;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  payment_status: PaymentStatus;
  created_by: number | null;
  created_at: string;
  updated_at: string;

  customer?: CustomerType;
  store?: StoreType;
  booking?: BookingType;
  items?: InvoiceItem[];
}

interface InvoiceFormData {
  customer_id: string;
  store_id: string;
  booking_id: string;
  discount_amount: string;
  discount_type: DiscountType | "";
  notes: string;
  payment_status: PaymentStatus;
}

interface InvoiceItemFormData {
  item_type: ItemType;
  item_id: string;
  item_name: string;
  staff_id: string;
  quantity: string;
  unit_price: string;
  discount: string;
}
interface MasterDataResponse<T> {
  data: {
    data: T[];
  };
}

interface BookingListResponse {
  data: BookingType[];
}

const getPaymentStatusColor = (status: PaymentStatus) => {
  switch (status) {
    case "paid":
      return SUCCESS_COLOR;
    case "pending":
      return WARNING_COLOR;
    default:
      return PRIMARY_COLOR;
  }
};

const getPaymentStatusLabel = (status: PaymentStatus) => {
  switch (status) {
    case "paid":
      return "Paid";
    case "pending":
      return "Pending";
    default:
      return status;
  }
};

// Maps for URL query params (using numbers for shorter URLs)
const paymentStatusToIdMap: Record<PaymentStatus, number> = {
  paid: 1,
  pending: 2,
};

const idToPaymentStatusMap: Record<number, PaymentStatus> = {
  1: "paid",
  2: "pending",
};

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

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function InvoicesPage({ slug }: { slug?: string[] }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter and pagination states
  const [searchQuery, setSearchQuery] = useState(() => {
    return searchParams.get("search") || "";
  });
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | "all">(() => {
    const statusId = searchParams.get("status");
    return statusId && idToPaymentStatusMap[parseInt(statusId, 10)]
      ? idToPaymentStatusMap[parseInt(statusId, 10)]
      : "all";
  });
  const [filterStore, setFilterStore] = useState<number | "all">(() => {
    const storeId = searchParams.get("storeId");
    return storeId ? parseInt(storeId, 10) : "all";
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog and UI states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openItemsDialog, setOpenItemsDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view">("add");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isFormDataLoading, _setIsFormDataLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const [isItemsLoading, setIsItemsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [itemsForView, setItemsForView] = useState<InvoiceItem[]>([]);

  // Refs for cleanup and control
  const isMountedRef = useRef(true);


  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => getCustomers({ limit: 1000 }).then((res) => {

      const response = res as unknown as MasterDataResponse<CustomerType>;
      return response?.data?.data || [];
    }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: stores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: () => storesApi.getAll({ limit: 1000 }).then((res) => {
      const response = res as unknown as MasterDataResponse<StoreType>;
      return response?.data?.data || [];
    }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: staff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: () => getStaff({ limit: 1000 }).then((res) => {
      const response = res as unknown as MasterDataResponse<StaffType>;
      return response?.data?.data || [];
    }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => getBookings({ limit: 1000 }).then((res) => {
      const response = res as unknown as BookingListResponse;
      return response?.data || [];
    }),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: invoiceResponse,
    isLoading: isInvoiceLoading,
  } = useQuery({
    queryKey: ['invoices', page, rowsPerPage, filterStatus, filterStore],
    queryFn: async () => {
      const params: QueryInvoiceDto = {
        page: page + 1,
        limit: rowsPerPage,
        paymentStatus: filterStatus === "all" ? undefined : (filterStatus as PaymentStatusEnum),
        storeId: filterStore === "all" ? undefined : filterStore,
      };
      return getInvoices(params);
    },
    placeholderData: keepPreviousData,
  });

  const rawInvoices = (invoiceResponse as unknown as InvoiceListResponse)?.data || [];
  const totalItems = (invoiceResponse as unknown as InvoiceListResponse)?.meta?.total || 0;

  const invoices: Invoice[] = useMemo(() => {
    return rawInvoices.map((apiInvoice: InvoiceType) => ({
      ...apiInvoice,
      booking_id: apiInvoice.bookingId,
      customer_id: apiInvoice.customerId,
      store_id: apiInvoice.storeId,
      discount_amount: apiInvoice.discountAmount,
      discount_type: apiInvoice.discountType as DiscountType | null,
      tax_amount: apiInvoice.taxAmount,
      total_amount: apiInvoice.totalAmount,
      paid_amount: apiInvoice.paidAmount,
      payment_status: apiInvoice.paymentStatus as PaymentStatus,
      created_by: apiInvoice.createdBy,
      created_at: apiInvoice.createdAt,
      updated_at: apiInvoice.updatedAt,
      customer: undefined,
      store: undefined,
      booking: undefined,
      items: undefined,
    }));
  }, [rawInvoices]);

  const initialFormData: InvoiceFormData = useMemo(
    () => ({
      customer_id: "",
      store_id: "",
      booking_id: "",
      discount_amount: "0",
      discount_type: "",
      notes: "",
      payment_status: "pending",
    }),
    []
  );

  const initialItemFormData: InvoiceItemFormData = useMemo(
    () => ({
      item_type: "service",
      item_id: "",
      item_name: "",
      staff_id: "",
      quantity: "1",
      unit_price: "0",
      discount: "0",
    }),
    []
  );

  const [formData, setFormData] = useState<InvoiceFormData>(initialFormData);
  const [items, setItems] = useState<InvoiceItemFormData[]>([]);
  const [_currentItem, _setCurrentItem] = useState<InvoiceItemFormData>(initialItemFormData);

  // Cleanup on unmount
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Handle slug to load invoice detail
  useEffect(() => {
    const invoiceId = slug?.[0];

    const loadInvoiceForDetail = async (id: number) => {
      try {
        setIsItemsLoading(true);
        const apiInvoice: InvoiceType = await getInvoiceById(id);
        const invoiceData: Invoice = {
          ...apiInvoice,
          booking_id: apiInvoice.bookingId,
          customer_id: apiInvoice.customerId,
          store_id: apiInvoice.storeId,
          discount_amount: apiInvoice.discountAmount,
          discount_type: apiInvoice.discountType as DiscountType | null,
          tax_amount: apiInvoice.taxAmount,
          total_amount: apiInvoice.totalAmount,
          paid_amount: apiInvoice.paidAmount,
          payment_status: apiInvoice.paymentStatus as PaymentStatus,
          created_by: apiInvoice.createdBy,
          created_at: apiInvoice.createdAt,
          updated_at: apiInvoice.updatedAt,
          customer: undefined,
          store: undefined,
          booking: undefined,
        };

        const items = await getItemsByInvoiceId(id);
        setSelectedInvoice({ ...invoiceData, items });
        setDialogMode("edit");
        setShowDetail(true);
        setEditingId(null); // Reset editingId after successful load
      } catch (err) {
        alert("Failed to load invoice details.");
        console.error("Failed to load invoice details:", err);
        const query: Record<string, string> = {};
        if (searchQuery) {
          query.search = searchQuery;
        }
        if (filterStatus !== "all") {
          query.status = paymentStatusToIdMap[filterStatus].toString();
        }
        if (filterStore !== "all") {
          query.storeId = filterStore.toString();
        }
        const queryString = new URLSearchParams(query).toString();
        router.push(queryString ? `/invoices?${queryString}` : "/invoices");
        setEditingId(null); // Reset editingId on error
      } finally {
        setIsItemsLoading(false);
      }
    };

    if (invoiceId) {
      if (
        selectedInvoice?.id === Number(invoiceId) &&
        showDetail &&
        dialogMode === "edit"
      ) {
        return;
      }
      loadInvoiceForDetail(Number(invoiceId));
    } else {
      if (showDetail) {
        setShowDetail(false);
        setSelectedInvoice(null);
        setEditingId(null); // Reset editingId when closing detail view
      }
    }
  }, [slug, router, selectedInvoice?.id, showDetail, dialogMode, searchQuery, filterStatus, filterStore]);

  useEffect(() => {
    const invoiceId = slug?.[0];
    if (invoiceId) {
      return;
    }

    const query: Record<string, string> = {};
    if (searchQuery) {
      query.search = searchQuery;
    }
    if (filterStatus !== "all") {
      query.status = paymentStatusToIdMap[filterStatus].toString();
    }
    if (filterStore !== "all") {
      query.storeId = filterStore.toString();
    }

    const queryString = new URLSearchParams(query).toString();
    const currentPath = "/invoices";
    const newUrl = queryString ? `${currentPath}?${queryString}` : currentPath;

    if (
      typeof window !== "undefined" &&
      window.location.pathname + window.location.search !== newUrl
    ) {
      router.push(newUrl, {
        scroll: false,
      });
    }
  }, [filterStatus, filterStore, searchQuery, slug, router]);

  const customerMap = useMemo(() => {
    return customers.reduce((acc: Record<number, CustomerType>, cur: CustomerType) => ({ ...acc, [cur.id]: cur }), {} as Record<number, CustomerType>);
  }, [customers]);

  const storeMap = useMemo(() => {
    return stores.reduce((acc: Record<number, StoreType>, cur: StoreType) => ({ ...acc, [cur.id]: cur }), {} as Record<number, StoreType>);
  }, [stores]);

  const bookingMap = useMemo(() => {
    return bookings.reduce((acc: Record<number, BookingType>, cur: BookingType) => ({ ...acc, [cur.id]: cur }), {} as Record<number, BookingType>);
  }, [bookings]);
  const processedInvoices = useMemo(() => {
    return invoices.map((invoice) => ({
      ...invoice,
      customer: customerMap[invoice.customer_id] || undefined,
      store: storeMap[invoice.store_id] || undefined,
      booking: invoice.booking_id ? bookingMap[invoice.booking_id] : undefined,
    }));
  }, [invoices, customerMap, storeMap, bookingMap]);

  // Client-side search filtering
  const filteredInvoices = useMemo(() => {
    if (!debouncedSearchQuery) {
      return processedInvoices;
    }
    const lowercasedQuery = debouncedSearchQuery.toLowerCase();
    return processedInvoices.filter((invoice) => {
      const customerName = invoice.customer?.fullName?.toLowerCase() || "";
      const customerPhone = invoice.customer?.phone?.toLowerCase() || "";
      const voucher = invoice.voucher?.toLowerCase() || "";

      return (
        customerName.includes(lowercasedQuery) ||
        customerPhone.includes(lowercasedQuery) ||
        voucher.includes(lowercasedQuery)
      );
    });
  }, [processedInvoices, debouncedSearchQuery]);

  const paginatedInvoices = useMemo(() => filteredInvoices, [filteredInvoices]);

  const stats = useMemo(
    () => ({
      total: filteredInvoices.length,
      paid: filteredInvoices.filter((i) => i.payment_status === "paid").length,
      pending: filteredInvoices.filter((i) => i.payment_status === "pending").length,
      totalRevenue: filteredInvoices.reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0),
      collectedRevenue: filteredInvoices.reduce((sum, i) => sum + (Number(i.paid_amount) || 0), 0),
    }),
    [filteredInvoices]
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, invoice: Invoice) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddNew = () => {
    setIsCreateLoading(true);
    setTimeout(() => {
      setDialogMode("add");
      setSelectedInvoice(null);
      setShowDetail(true);
      setIsCreateLoading(false);
    }, 500);
  };

  const fetchInvoiceItemsAndOpenDialog = async (mode: "view" | "edit" | "view_items") => {
    if (!selectedInvoice) return;

    setIsItemsLoading(true);
    setItemsForView([]);

    try {
      const items = await getItemsByInvoiceId(selectedInvoice.id);

      const processedItems: InvoiceItem[] = items.map((apiItem) => ({
        ...apiItem,
        staff_name: staff.find((s: StaffType) => s.id === apiItem.staffId)?.full_name,
      }));

      setItemsForView(processedItems);

      if (mode === "view") {
        setDialogMode("view");
        setOpenDialog(true);
      } else if (mode === "view_items") {
        setOpenItemsDialog(true);
      } else if (mode === "edit") {
        setFormData({
          customer_id: selectedInvoice.customer_id.toString(),
          store_id: selectedInvoice.store_id.toString(),
          booking_id: selectedInvoice.booking_id?.toString() || "",
          discount_amount: selectedInvoice.discount_amount.toString(),
          discount_type: (selectedInvoice.discount_type as DiscountType) || "",
          notes: selectedInvoice.notes || "",
          payment_status: selectedInvoice.payment_status,
        });

        const formItems: InvoiceItemFormData[] = processedItems.map((item) => ({
          item_type: item.itemType as ItemType,
          item_id: item.itemId.toString(),
          item_name: item.itemName,
          staff_id: item.staffId?.toString() || "",
          quantity: item.quantity.toString(),
          unit_price: item.unitPrice.toString(),
          discount: item.discount.toString(),
        }));
        setItems(formItems);

        setDialogMode("edit");
        setOpenDialog(true);
      }
    } catch (err) {
      console.error("Failed to fetch invoice items:", err);
      alert("Failed to load invoice items.");
    } finally {
      setIsItemsLoading(false);
    }
    handleMenuClose();
  };

  const handleEdit = (invoice: Invoice) => {
    router.push(`/invoices/${invoice.id}`);
  };

  const handleSaveInvoice = async (submissionData: CreateInvoiceDto | UpdateInvoiceDto) => {
    try {
      setLoading(true);
      if (dialogMode === "add") {
        await createInvoice(submissionData as CreateInvoiceDto);
      } else if (dialogMode === "edit" && selectedInvoice) {
        await updateInvoice(selectedInvoice.id, submissionData as UpdateInvoiceDto);
      }
      await queryClient.invalidateQueries({ queryKey: ['invoices'] });
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleViewItems = () => {
    fetchInvoiceItemsAndOpenDialog("view_items");
  };

  const handleDelete = () => {
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (selectedInvoice) {
      try {
        await deleteInvoice(selectedInvoice.id);
        await queryClient.invalidateQueries({ queryKey: ['invoices'] });
      } catch (err) {
        console.error("Failed to delete invoice:", err);
        alert("Failed to delete invoice. Please try again.");
      }
      setDeleteConfirmOpen(false);
      setSelectedInvoice(null);
    }
  };

  const handleItemsDialogClose = () => {
    setOpenItemsDialog(false);
  };

  const markAsPaid = async () => {
    if (selectedInvoice) {
      try {
        const updateData: UpdateInvoiceDto = {
          paymentStatus: PaymentStatusEnum.PAID,
          paidAmount: selectedInvoice.total_amount,
        };
        await updateInvoice(selectedInvoice.id, updateData);
        await queryClient.invalidateQueries({ queryKey: ['invoices'] });
      } catch (err) {
        console.error("Failed to mark as paid:", err);
        alert("Failed to update payment status.");
      }
      handleMenuClose();
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatVoucherToBK = (voucher?: string) => {
    if (!voucher) return "";
    const parts = voucher.split("-");
    return parts.length >= 2 ? `BK${parts[1]}` : voucher;
  };

  // Show detail view if needed
  if (showDetail) {
    return (
      <InvoiceDetail
        mode={dialogMode}
        initialData={selectedInvoice}
        customers={customers}
        stores={stores}
        staff={staff}
        onSave={handleSaveInvoice}
        onBack={() => {
          setShowDetail(false);
          const query: Record<string, string> = {};
          if (searchQuery) {
            query.search = searchQuery;
          }
          if (filterStatus !== "all") {
            query.status = paymentStatusToIdMap[filterStatus].toString();
          }
          if (filterStore !== "all") {
            query.storeId = filterStore.toString();
          }
          const queryString = new URLSearchParams(query).toString();
          router.push(queryString ? `/invoices?${queryString}` : "/invoices");
        }}
        loading={loading}
      />
    );
  }

  const isAnyLoading = (isInvoiceLoading || isFormDataLoading || isItemsLoading) && invoices.length === 0;

  return (
    <ThemeProvider theme={blueTheme}>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isAnyLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ borderRadius: 0 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total Invoices
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {totalItems}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.1), width: 56, height: 56 }}>
                  <Receipt sx={{ color: PRIMARY_COLOR, fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ borderRadius: 0 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Paid Invoices
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color={SUCCESS_COLOR}>
                    {stats.paid}
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
          <Card sx={{ borderRadius: 0 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Pending Payments
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color={WARNING_COLOR}>
                    {stats.pending}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(WARNING_COLOR, 0.1), width: 56, height: 56 }}>
                  <Pending sx={{ color: WARNING_COLOR, fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ borderRadius: 0 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(stats.totalRevenue)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(INFO_COLOR, 0.1), width: 56, height: 56 }}>
                  <TrendingUp sx={{ color: INFO_COLOR, fontSize: 28 }} />
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
              placeholder="Search by invoice code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                flex: 1,
                minWidth: 200,
                "& .MuiOutlinedInput-root": { borderRadius: "0px" }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: PRIMARY_COLOR, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl
              sx={{ minWidth: 130, "& .MuiOutlinedInput-root": { borderRadius: "0px" } }}
              size="small"
            >
              <InputLabel>Payment Status</InputLabel>
              <Select
                value={filterStatus}
                label="Payment Status"
                onChange={(e) => setFilterStatus(e.target.value as PaymentStatus | "all")}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>

            <FormControl
              sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { borderRadius: "0px" } }}
              size="small"
            >
              <InputLabel>Store</InputLabel>
              <Select
                value={filterStore}
                label="Store"
                onChange={(e) => setFilterStore(e.target.value as number | "all")}
              >
                <MenuItem value="all">All Stores</MenuItem>
                {stores.map((store: StoreType) => (
                  <MenuItem key={store.id} value={store.id}>
                    {store.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              size="small"
              startIcon={isCreateLoading ? <CircularProgress size={20} color="inherit" /> : <Add />}
              disabled={isCreateLoading}
              onClick={handleAddNew}
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
              Create Invoice
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.05) }}>
                <TableCell sx={{ fontWeight: 700 }}>Invoice code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Store</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Booking</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Subtotal</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tax</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Paid</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedInvoices.length > 0 ? (
                paginatedInvoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    sx={{ "&:hover": { bgcolor: alpha(PRIMARY_COLOR, 0.02) } }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="600" color={PRIMARY_COLOR}>
                        {invoice.voucher}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {invoice.customer?.fullName || `ID: ${invoice.customer_id}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {invoice.customer?.phone || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {invoice.store?.name || `ID: ${invoice.store_id}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatVoucherToBK(invoice.voucher)}
                        size="small"
                        variant="outlined"
                        sx={{ color: "#ed6c02", borderColor: "#ed6c02", fontWeight: 400 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        {formatCurrency(invoice.subtotal)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatCurrency(invoice.tax_amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600" color={PRIMARY_COLOR}>
                        {formatCurrency(invoice.total_amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        {formatCurrency(invoice.paid_amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getPaymentStatusLabel(invoice.payment_status)}
                        size="small"
                        sx={{
                          bgcolor: alpha(getPaymentStatusColor(invoice.payment_status), 0.1),
                          color: getPaymentStatusColor(invoice.payment_status),
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={
                            editingId === invoice.id ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <Edit sx={{ fontSize: '18px !important' }} />
                            )
                          }
                          disabled={editingId === invoice.id}
                          onClick={() => {
                            setEditingId(invoice.id);
                            handleEdit(invoice);
                          }}
                          sx={{
                            bgcolor: '#f39c12',
                            '&:hover': { bgcolor: '#e67e22' },
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: '0px',
                            px: 2,
                            minWidth: '80px',
                            boxShadow: 'none',
                            height: '32px',
                            color: '#fff',
                          }}
                        >
                          Edit
                        </Button>
                        {/* <Button
                          size="small"
                          onClick={(e) => handleMenuOpen(e, invoice)}
                          sx={{ minWidth: 0, px: 1 }}
                        >
                          <Menu sx={{ fontSize: 20 }} />
                        </Button> */}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10}>
                    <Box sx={{ textAlign: "center", py: 6 }}>
                      <Receipt sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No invoices found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery || filterStatus !== "all" || filterStore !== "all"
                          ? "Try adjusting your search or filters"
                          : "Get started by creating your first invoice"}
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
          count={totalItems}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Menu for invoice actions */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleViewItems}>
          <Inventory sx={{ mr: 1, fontSize: 20 }} />
          View Items
        </MenuItem>
        <Divider />
        {selectedInvoice?.payment_status === "pending" && (
          <MenuItem onClick={markAsPaid}>
            <Payment sx={{ mr: 1, fontSize: 20, color: SUCCESS_COLOR }} />
            Mark as Paid
          </MenuItem>
        )}
        <MenuItem>
          <Download sx={{ mr: 1, fontSize: 20 }} />
          Download PDF
        </MenuItem>
        <MenuItem>
          <Print sx={{ mr: 1, fontSize: 20 }} />
          Print
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: ERROR_COLOR }}>
          <Delete sx={{ mr: 1, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* View Items Dialog */}
      <Dialog
        open={openItemsDialog}
        onClose={handleItemsDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Invoice Items - {selectedInvoice?.voucher}</DialogTitle>
        <DialogContent dividers>
          {isItemsLoading ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress size={24} />
              <Typography sx={{ ml: 2 }}>Loading Items...</Typography>
            </Box>
          ) : itemsForView.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Staff</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Discount</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {itemsForView.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar
                            sx={{
                              bgcolor: alpha(getItemTypeColor(item.itemType as ItemType), 0.1),
                              color: getItemTypeColor(item.itemType as ItemType),
                              width: 32,
                              height: 32,
                            }}
                          >
                            {getItemTypeIcon(item.itemType as ItemType)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="600">
                              {item.itemName}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.itemType}
                          size="small"
                          sx={{
                            bgcolor: alpha(getItemTypeColor(item.itemType as ItemType), 0.1),
                            color: getItemTypeColor(item.itemType as ItemType),
                            textTransform: "capitalize",
                          }}
                        />
                      </TableCell>
                      <TableCell>{item.staff_name || "-"}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell align="right" sx={{ color: SUCCESS_COLOR }}>
                        -{formatCurrency(item.discount)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatCurrency(item.totalPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Inventory sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No items found
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleItemsDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete invoice {selectedInvoice?.voucher}?
            This action cannot be undone.
          </Alert>
          {selectedInvoice && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
              <Avatar
                sx={{
                  bgcolor: alpha(PRIMARY_COLOR, 0.1),
                  color: PRIMARY_COLOR,
                  width: 44,
                  height: 44,
                }}
              >
                <Receipt />
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight="600">
                  {selectedInvoice.voucher}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedInvoice.customer?.fullName} • {formatCurrency(selectedInvoice.total_amount)}
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
            Delete Invoice
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}