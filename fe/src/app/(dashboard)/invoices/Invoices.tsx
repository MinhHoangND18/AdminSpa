"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
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
  FormControlLabel,
  Switch,
  Badge,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Autocomplete,
  Backdrop,
} from "@mui/material";
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Receipt,
  Person,
  Store,
  CalendarToday,
  AttachMoney,
  Discount,
  LocalOffer,
  Payment,
  Pending,
  CheckCircle,
  Inventory,
  Spa,
  ShoppingBag,
  Assignment,
  FilterList,
  TrendingUp,
  Download,
  Print,
  Share,
  ContentCopy,
} from "@mui/icons-material";

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
  CreateInvoiceItemDto,
} from "@/types/invoice-item";
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from "@/lib/api/invoices";
import {
  createInvoiceItems,
  getItemsByInvoiceId,
  deleteInvoiceItemsByInvoiceId,
} from "@/lib/api/invoice-items";
import { getCustomers } from "@/lib/api/customers";
import { storesApi } from "@/lib/api/stores";
import { getBookings } from "@/lib/api/bookings";
import { getStaff } from "@/lib/api/staffs";

import { getServices } from "@/lib/api/services";
import { Customer as CustomerType } from "@/types/customer";
import { Store as StoreType } from "@/types/store";
import { Booking as BookingType } from "@/types/booking";
import { Staff as StaffType } from "@/types/staff";

import { Service as ServiceType } from "@/types/service";
import InvoiceDetail from "./InvoiceDetail";
import { createTheme, ThemeProvider } from "@mui/material/styles";
const blueTheme = createTheme({
  palette: {
    primary: {
      main: "#3b82f6",
    },
  },
});

interface ApiResponseWrapper<T> {
  data?: {
    data: T[];
  };
}

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string | string[];
    };
  };
}

const PRIMARY_COLOR = "#3b82f6";
const PRIMARY_DARK = "#0f766e";
const SUCCESS_COLOR = "#10b981";
const ERROR_COLOR = "#ef4444";
const WARNING_COLOR = "#f59e0b";
const INFO_COLOR = "#3b82f6";
const PURPLE_COLOR = "#a855f7";
const EDIT_COLOR = "#f39c12";

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

interface SelectableItem {
  id: number;
  name: string;
  price: number;
  discount: number;
  type: "product" | "service" | "package";
}

interface FetchError extends Error {
  response?: {
    data?: {
      message?: string | string[];
    };
  };
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

const generateVoucher = () => {
  const timestamp = new Date().getTime();
  return `INV-${timestamp}`;
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isItemsLoading, setIsItemsLoading] = useState(false);
  const [itemsForView, setItemsForView] = useState<InvoiceItem[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(
    null
  );

  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [staff, setStaff] = useState<StaffType[]>([]);

  const [services, setServices] = useState<ServiceType[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | "all">(
    "all"
  );
  const [filterStore, setFilterStore] = useState<number | "all">("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openItemsDialog, setOpenItemsDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view">("add");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isFormDataLoading, setIsFormDataLoading] = useState(false);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

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
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const [formData, setFormData] = useState<InvoiceFormData>(initialFormData);
  const [items, setItems] = useState<InvoiceItemFormData[]>([]);
  const [currentItem, setCurrentItem] =
    useState<InvoiceItemFormData>(initialItemFormData);

  const fetchCustomers = async () => {
    try {
      const data = (await getCustomers({
        limit: 1000,
      })) as unknown as ApiResponseWrapper<CustomerType>;
      setCustomers(data?.data?.data ?? []);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    }
  };

  const fetchStores = async () => {
    try {
      const data = (await storesApi.getAll({
        limit: 1000,
      })) as unknown as ApiResponseWrapper<StoreType>;
      setStores(data?.data?.data ?? []);
    } catch (err) {
      console.error("Failed to fetch stores:", err);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await getBookings({ limit: 1000 });
      const bookingsData = response?.data ?? [];
      console.log("Extracted bookings data (count):", bookingsData.length);
      setBookings(bookingsData);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    }
  };

  const fetchStaff = async () => {
    try {
      const data = (await getStaff({
        limit: 1000,
      })) as unknown as ApiResponseWrapper<StaffType>;
      setStaff(data?.data?.data ?? []);
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    }
  };

  

  const fetchServices = async () => {
    try {
      const data = await getServices({ limit: 1000 });
      const servicesData = data?.data ?? [];
      setServices(servicesData);
    } catch (err) {
      console.error("Failed to fetch services:", err);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      if (!isMountedRef.current) return;

      setIsLoading(true);

      try {
        await Promise.all([fetchCustomers(), fetchStores(), fetchStaff()]);

        if (isMountedRef.current) {
          fetchBookings();
        }
      } catch (err) {
        console.error("Failed to load initial data:", err);
      } finally {
        if (isMountedRef.current) {
          setIsInitialLoad(false);
        }
      }
    };

    loadInitialData();
  }, []);

  const fetchInvoices = useCallback(async () => {
    if (customers.length === 0 || stores.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const params: QueryInvoiceDto = {
        page: page + 1,
        limit: rowsPerPage,
        paymentStatus:
          filterStatus === "all"
            ? undefined
            : (filterStatus as PaymentStatusEnum),
        storeId: filterStore === "all" ? undefined : filterStore,
      };

      const data = await getInvoices(params);

      const processedInvoices: Invoice[] = data.data.map((apiInvoice) => ({
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
        customer: customers.find((c) => c.id === apiInvoice.customerId),
        store: stores.find((s) => s.id === apiInvoice.storeId),
        booking: bookings.find((b) => b.id === apiInvoice.bookingId),
      }));

      setInvoices(processedInvoices);
      setTotalItems(data.meta.total);
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
      setError("Failed to load invoices. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [
    page,
    rowsPerPage,
    filterStatus,
    filterStore,
    bookings,
    customers,
    stores,
  ]);

  const handleBookingSelect = (bookingId: string) => {
    setFormData((prev) => ({ ...prev, booking_id: bookingId }));

    if (bookingId) {
      const selectedBooking = bookings.find(
        (b) => b.id.toString() === bookingId
      );

      if (selectedBooking) {
        const customer = customers.find(
          (c) => c.id === selectedBooking.customerId
        );

        setFormData((prev) => ({
          ...prev,
          customer_id: selectedBooking.customerId?.toString() || "",
          store_id: selectedBooking.storeId.toString(),
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        customer_id: initialFormData.customer_id,
        store_id: initialFormData.store_id,
      }));
    }
  };
  useEffect(() => {
    if (!isInitialLoad && customers.length > 0 && stores.length > 0 && bookings.length > 0) {
      fetchInvoices();
    }
  }, [
    isInitialLoad,
    customers.length,
    stores.length,
    bookings.length,
    page,
    rowsPerPage,
    filterStatus,
    filterStore,
    fetchInvoices,
  ]);

  // useEffect(() => {
  //     if (bookings.length > 0 && invoices.length > 0) {
  //         // Re-map invoices với bookings data
  //         const updatedInvoices = invoices.map(invoice => ({
  //             ...invoice,
  //             booking: bookings.find((b) => b.id === invoice.booking_id),
  //         }));
  //         setInvoices(updatedInvoices);
  //     }
  // }, [bookings, invoices]);

  const filteredInvoices = useMemo(() => {
    if (!debouncedSearchQuery) {
      return invoices;
    }
    const lowercasedQuery = debouncedSearchQuery.toLowerCase();
    return invoices.filter((invoice) => {
      const customerName = invoice.customer?.fullName?.toLowerCase() || "";
      const customerPhone = invoice.customer?.phone?.toLowerCase() || "";
      const voucher = invoice.voucher?.toLowerCase() || "";

      return (
        customerName.includes(lowercasedQuery) ||
        customerPhone.includes(lowercasedQuery) ||
        voucher.includes(lowercasedQuery)
      );
    });
  }, [invoices, debouncedSearchQuery]);

  const paginatedInvoices = useMemo(() => filteredInvoices, [filteredInvoices]);

  const stats = useMemo(
    () => ({
      total: filteredInvoices.length,
      paid: filteredInvoices.filter((i) => i.payment_status === "paid").length,
      pending: filteredInvoices.filter((i) => i.payment_status === "pending")
        .length,
      totalRevenue: filteredInvoices.reduce(
        (sum, i) => sum + (Number(i.total_amount) || 0),
        0
      ),
      collectedRevenue: filteredInvoices.reduce(
        (sum, i) => sum + (Number(i.paid_amount) || 0),
        0
      ),
    }),
    [filteredInvoices]
  );

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    invoice: Invoice
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddNew = () => {
    setDialogMode("add");
    setSelectedInvoice(null);
    setShowDetail(true);
  };
  const fetchInvoiceItemsAndOpenDialog = async (
    mode: "view" | "edit" | "view_items"
  ) => {
    if (!selectedInvoice) return;

    setIsItemsLoading(true);
    setItemsForView([]);

    try {
      const items = await getItemsByInvoiceId(selectedInvoice.id);

      const processedItems: InvoiceItem[] = items.map((apiItem) => ({
        ...apiItem,
        staff_name: staff.find((s) => s.id === apiItem.staffId)?.full_name,
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
          // tax_amount: selectedInvoice.tax_amount.toString(),
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

  const handleEdit = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsItemsLoading(true);
    try {
      const items = await getItemsByInvoiceId(invoice.id);
      setSelectedInvoice({ ...invoice, items });
      setDialogMode("edit");
      setShowDetail(true);
    } catch (err) {
      alert("Failed to load invoice items");
    } finally {
      setIsItemsLoading(false);
    }
  };

  const handleSaveInvoice = async (submissionData: CreateInvoiceDto | UpdateInvoiceDto) => {
    try {
      setLoading(true);
      if (dialogMode === "add") {
        await createInvoice(submissionData as CreateInvoiceDto);
      } else if (dialogMode === "edit" && selectedInvoice) {
        await updateInvoice(selectedInvoice.id, submissionData as UpdateInvoiceDto);
      }
      fetchInvoices();
      setShowDetail(false);
    } catch (err) {
      console.error(err);
      alert("Error saving invoice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentItem((prev) => ({
      ...prev,
      item_id: "",
      item_name: "",
      unit_price: "0",
      discount: "0",
    }));
  }, [currentItem.item_type]);

  const selectableItems = useMemo((): SelectableItem[] => {

 
    if (currentItem.item_type === "service") {
      const items = (services || [])
        .filter((service) => !service.isCombo)
        .map((service) => ({
          id: service.id,
          name: service.name,
          price: service.price,
          discount: service.discountPrice
            ? service.price - service.discountPrice
            : 0,
          type: "service" as const,
        }));
      return items;
    }
    if (currentItem.item_type === "package") {
      const items = (services || [])
        .filter((service) => service.isCombo)
        .map((service) => ({
          id: service.id,
          name: service.name,
          price: service.price,
          discount: service.discountPrice
            ? service.price - service.discountPrice
            : 0,
          type: "package" as const,
        }));
      return items;
    }
    return [];
  }, [services, currentItem.item_type]);

  if (showDetail) {
    return (
      <InvoiceDetail
        mode={dialogMode}
        initialData={selectedInvoice}
        customers={customers}
        stores={stores}
        staff={staff}
        onSave={handleSaveInvoice}
        onBack={() => setShowDetail(false)}
        loading={loading}
      />
    );
  }
  const formatVoucherToBK = (voucher?: string) => {
    if (!voucher) return "";
    const parts = voucher.split("-");
    return parts.length >= 2 ? `BK${parts[1]}` : voucher;
  };

  const handleView = () => {
    fetchInvoiceItemsAndOpenDialog("view");
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
        fetchInvoices();
      } catch (err) {
        console.error("Failed to delete invoice:", err);
        alert("Failed to delete invoice. Please try again.");
      }
      setDeleteConfirmOpen(false);
      setSelectedInvoice(null);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setFormData(initialFormData);
    setItems([]);
    setSelectedInvoice(null);
  };

  const handleItemsDialogClose = () => {
    setOpenItemsDialog(false);
  };

  const handleFormChange =
    (field: keyof InvoiceFormData) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
          ...formData,
          [field]: event.target.value as InvoiceFormData[typeof field],
        });
      };

  const handleItemChange =
    (field: keyof InvoiceItemFormData) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCurrentItem({
          ...currentItem,
          [field]: event.target.value as InvoiceItemFormData[typeof field],
        });
      };

  const addItem = () => {
    if (currentItem.item_name && parseFloat(currentItem.unit_price) > 0) {
      setItems([...items, currentItem]);
      setCurrentItem(initialItemFormData);
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      const quantity = parseInt(item.quantity) || 1;
      const unitPrice = parseFloat(item.unit_price) || 0;
      const discount = parseFloat(item.discount) || 0;
      return sum + (unitPrice * quantity - discount);
    }, 0);

    const inputDiscountAmount = parseFloat(formData.discount_amount) || 0;

    const TAX_RATE = 0.08;
    let finalDiscountAmount = inputDiscountAmount;
    let amountAfterDiscount = subtotal;

    if (formData.discount_type === "percent" && inputDiscountAmount > 0) {
      finalDiscountAmount = subtotal * (inputDiscountAmount / 100);
      amountAfterDiscount = subtotal - finalDiscountAmount;
    } else {
      amountAfterDiscount = subtotal - finalDiscountAmount;
    }

    const calculatedTaxAmount = amountAfterDiscount * TAX_RATE;

    const total = amountAfterDiscount + calculatedTaxAmount;

    return {
      subtotal,
      discountAmount: finalDiscountAmount,
      taxAmount: calculatedTaxAmount,
      total: Math.max(0, total),
    };
  };

  const handleSubmit = async () => {
    const {
      subtotal: finalSubtotal,
      total: finalTotal,
      discountAmount: finalDiscountAmount,
    } = calculateTotals();

    try {
      if (dialogMode === "add") {
        const itemsToSubmit = items.map((item) => {
          const quantity = parseInt(item.quantity) || 1;
          const unitPrice = parseFloat(item.unit_price) || 0;
          const discount = parseFloat(item.discount) || 0;
          return {
            itemType: item.item_type as ItemTypeEnum,
            itemId: parseInt(item.item_id) || 0,
            itemName: item.item_name,
            staffId: item.staff_id ? parseInt(item.staff_id) : undefined,
            quantity: quantity,
            unitPrice: unitPrice,
            discount: discount,
            totalPrice: unitPrice * quantity - discount,
          };
        });

        const createData: CreateInvoiceDto = {
          voucher: generateVoucher(),
          customerId: parseInt(formData.customer_id),
          storeId: parseInt(formData.store_id),
          subtotal: finalSubtotal,
          totalAmount: finalTotal,
          items: itemsToSubmit,
          bookingId: formData.booking_id
            ? parseInt(formData.booking_id)
            : undefined,
          discountAmount: finalDiscountAmount,
          discountType:
            (formData.discount_type as DiscountTypeEnum) || undefined,
          taxAmount: calculatedTaxAmount,
          paidAmount: formData.payment_status === "paid" ? finalTotal : 0,
          paymentStatus: formData.payment_status as PaymentStatusEnum,
          notes: formData.notes || undefined,
          createdBy: 1,
        };

        await createInvoice(createData);
      } else if (dialogMode === "edit" && selectedInvoice) {
        const updateData: UpdateInvoiceDto = {
          voucher: selectedInvoice.voucher,
          customerId: parseInt(formData.customer_id),
          storeId: parseInt(formData.store_id),
          bookingId: formData.booking_id ? parseInt(formData.booking_id) : null,
          subtotal: finalSubtotal,
          discountAmount: finalDiscountAmount,
          discountType: (formData.discount_type as DiscountTypeEnum) || null,
          taxAmount: calculatedTaxAmount,
          totalAmount: finalTotal,
          paidAmount: formData.payment_status === "paid" ? finalTotal : 0,
          paymentStatus: formData.payment_status as PaymentStatusEnum,
          notes: formData.notes || null,
        };

        await updateInvoice(selectedInvoice.id, updateData);

        await deleteInvoiceItemsByInvoiceId(selectedInvoice.id);
        if (items.length > 0) {
          const invoiceItems: CreateInvoiceItemDto[] = items.map((item) => {
            const quantity = parseInt(item.quantity) || 1;
            const unitPrice = parseFloat(item.unit_price) || 0;
            const discount = parseFloat(item.discount) || 0;

            return {
              invoiceId: selectedInvoice.id,
              itemType: item.item_type as ItemTypeEnum,
              itemId: parseInt(item.item_id) || 0,
              itemName: item.item_name,
              staffId: item.staff_id ? parseInt(item.staff_id) : undefined,
              quantity: quantity,
              unitPrice: unitPrice,
              discount: discount,
              totalPrice: unitPrice * quantity - discount,
            };
          });
          await createInvoiceItems(invoiceItems);
        }
      }

      fetchInvoices();
      handleDialogClose();
    } catch (err) {
      console.error("Failed to submit invoice:", err);
      let errorMessage =
        "An error occurred while submitting the invoice. Please check the data and try again.";

      const fetchError = err as FetchError;
      if (fetchError.response?.data?.message) {
        const backendMessage = fetchError.response.data.message;
        if (Array.isArray(backendMessage)) {
          errorMessage +=
            "\n\nServer errors:\n- " + backendMessage.join("\n- ");
        } else {
          errorMessage += "\n\nServer error: " + backendMessage;
        }
      }

      alert(errorMessage);
    }
  };

  const markAsPaid = async () => {
    if (selectedInvoice) {
      try {
        const updateData: UpdateInvoiceDto = {
          paymentStatus: PaymentStatusEnum.PAID,
          paidAmount: selectedInvoice.total_amount,
        };
        await updateInvoice(selectedInvoice.id, updateData);
        fetchInvoices();
      } catch (err) {
        console.error("Failed to mark as paid:", err);
        alert("Failed to update payment status.");
      }
      handleMenuClose();
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

  const {
    subtotal,
    total,
    discountAmount: calculatedDiscountAmount,
    taxAmount: calculatedTaxAmount,
  } = calculateTotals();

  const invoiceToView: Invoice | null = selectedInvoice
    ? {
      ...selectedInvoice,
      items: itemsForView.length > 0 ? itemsForView : selectedInvoice.items,
      tax_amount: selectedInvoice.tax_amount,
    }
    : null;

  const handleItemSelection = (item: SelectableItem | null) => {
    if (!item) {
      setCurrentItem((prev) => ({
        ...prev,
        item_id: "",
        item_name: "",
        unit_price: "0",
        discount: "0",
      }));
      return;
    }

    setCurrentItem((prev) => ({
      ...prev,
      item_id: item.id.toString(),
      item_name: item.name,
      unit_price: item.price.toString(),
      discount: item.discount.toString(),
    }));
  };
const isAnyLoading = (isInitialLoad || isFormDataLoading || isItemsLoading) && invoices.length === 0;

  return (
    <ThemeProvider theme={blueTheme}>
      {/* <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Invoice Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage customer invoices and payments
                </Typography>
            </Box> */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isAnyLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{borderRadius: 0}}>
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
                    Total Invoices
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {totalItems}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: alpha(PRIMARY_COLOR, 0.1),
                    width: 56,
                    height: 56,
                  }}
                >
                  <Receipt sx={{ color: PRIMARY_COLOR, fontSize: 28 }} />
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
                    Paid Invoices
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color={SUCCESS_COLOR}
                  >
                    {stats.paid}
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
                    Pending Payments
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color={WARNING_COLOR}
                  >
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
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(stats.totalRevenue)}
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

      {/* Actions Bar */}
      <Card sx={{ mb: 3, borderRadius: 0 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
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
              placeholder="Search by invoice code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              minWidth: 130, "& .MuiOutlinedInput-root": {
                borderRadius: "0px",
              }
            }} size="small">
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

            <FormControl sx={{
              minWidth: 150, "& .MuiOutlinedInput-root": {
                borderRadius: "0px",
              }
            }} size="small">
              <InputLabel>Store</InputLabel>
              <Select
                value={filterStore}
                label="Store"
                onChange={(e) => setFilterStore(e.target.value as number | "all")}
              >
                <MenuItem value="all">All Stores</MenuItem>
                {stores.map((store) => (
                  <MenuItem key={store.id} value={store.id}>
                    {store.name}
                  </MenuItem>
                ))}
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
                {/* <TableCell sx={{ fontWeight: 700 }}>Discount</TableCell> */}
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
                    sx={{
                      "&:hover": { bgcolor: alpha(PRIMARY_COLOR, 0.02) },
                    }}
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight="600"
                        color={PRIMARY_COLOR}
                      >
                        {invoice.voucher}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {invoice.customer?.fullName ||
                              `ID: ${invoice.customer_id}`}
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
                        sx={{
                          color: "#ed6c02",
                          borderColor: "#ed6c02",
                          fontWeight: 400,
                        }}
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
                      <Typography
                        variant="body2"
                        fontWeight="600"
                        color={PRIMARY_COLOR}
                      >
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
                          bgcolor: alpha(
                            getPaymentStatusColor(invoice.payment_status),
                            0.1
                          ),
                          color: getPaymentStatusColor(invoice.payment_status),
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Edit sx={{ fontSize: '18px !important' }} />}
                        onClick={() => handleEdit(invoice)}
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
                  <TableCell colSpan={11}>
                    <Box sx={{ textAlign: "center", py: 6 }}>
                      <Receipt
                        sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                      />
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        gutterBottom
                      >
                        No invoices found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery ||
                          filterStatus !== "all" ||
                          filterStore !== "all"
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
        <MenuItem onClick={() => handleEdit(selectedInvoice!)}>
          <Edit sx={{ mr: 1, fontSize: 20 }} /> Edit
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
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: alpha(
                                getItemTypeColor(item.itemType as ItemType),
                                0.1
                              ),
                              color: getItemTypeColor(
                                item.itemType as ItemType
                              ),
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
                            bgcolor: alpha(
                              getItemTypeColor(item.itemType as ItemType),
                              0.1
                            ),
                            color: getItemTypeColor(item.itemType as ItemType),
                            textTransform: "capitalize",
                          }}
                        />
                      </TableCell>
                      <TableCell>{item.staff_name || "-"}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
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
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete invoice {selectedInvoice?.voucher} ?
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
                  {selectedInvoice.customer?.fullName} •{" "}
                  {formatCurrency(selectedInvoice.total_amount)}
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