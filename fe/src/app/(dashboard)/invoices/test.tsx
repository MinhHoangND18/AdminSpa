"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { getProducts } from "@/lib/api/products";
import { getServices } from "@/lib/api/services";
import { Customer as CustomerType } from "@/types/customer";
import { Store as StoreType } from "@/types/store";
import { Booking as BookingType } from "@/types/booking";
import { Staff as StaffType } from "@/types/staff";
import { Product as ProductType } from "@/types/product";
import { Service as ServiceType } from "@/types/service";

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

const PRIMARY_COLOR = "#14b8a6";
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
    tax_amount: string;
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

    const [customers, setCustomers] = useState<CustomerType[]>([]);
    const [stores, setStores] = useState<StoreType[]>([]);
    const [bookings, setBookings] = useState<BookingType[]>([]);
    const [staff, setStaff] = useState<StaffType[]>([]);
    const [products, setProducts] = useState<ProductType[]>([]);
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

    const initialFormData: InvoiceFormData = useMemo(
        () => ({
            customer_id: "",
            store_id: "",
            booking_id: "",
            discount_amount: "0",
            discount_type: "",
            tax_amount: "0",
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
    const [currentItem, setCurrentItem] =
        useState<InvoiceItemFormData>(initialItemFormData);

    useEffect(() => {
        const fetchRelatedData = async () => {
            try {
                const [
                    customersData,
                    storesData,
                    bookingsData,
                    staffData,
                    productsData,
                    servicesData,
                ] = (await Promise.all([
                    getCustomers({ limit: 1000 }),
                    storesApi.getAll({ limit: 1000 }),
                    getBookings({ limit: 1000 }),
                    getStaff({ limit: 1000 }),
                    getProducts({ limit: 1000 }),
                    getServices({ limit: 1000 }),
                ])) as unknown as [ 
                        ApiResponseWrapper<CustomerType>,
                        ApiResponseWrapper<StoreType>,
                        ApiResponseWrapper<BookingType>,
                        ApiResponseWrapper<StaffType>,
                        ProductType[] | ApiResponseWrapper<ProductType>,
                        ApiResponseWrapper<ServiceType>
                    ];
                setCustomers(customersData?.data?.data ?? []);
                setStores(storesData?.data?.data ?? []);
                setBookings(bookingsData?.data?.data ?? []);
                setStaff(staffData?.data?.data ?? []);
                setProducts(Array.isArray(productsData) ? productsData : []);
                setServices(servicesData?.data?.data ?? []);
            } catch (err) {
                console.error("Failed to fetch related data:", err);
                setError("Failed to load related data for invoices.");
            }
        };
        fetchRelatedData();
    }, []);

    const fetchInvoices = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params: QueryInvoiceDto = {
                limit: 1000, 
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
            setTotalItems(processedInvoices.length); // Update total items based on fetched length
        } catch (err) {
            console.error("Failed to fetch invoices:", err);
            setError("Failed to load invoices. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [filterStatus, filterStore, bookings, customers, stores]);
    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

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

    const paginatedInvoices = useMemo(
        () =>
            filteredInvoices.slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
            ),
        [filteredInvoices, page, rowsPerPage]
    );

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
        setFormData(initialFormData);
        setItems([]);
        setOpenDialog(true);
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
                    tax_amount: selectedInvoice.tax_amount.toString(),
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

    const handleEdit = () => {
        fetchInvoiceItemsAndOpenDialog("edit");
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
                    [field]: event.target.value as InvoiceFormData[typeof field]
                });
            };

    const handleItemChange =
        (field: keyof InvoiceItemFormData) =>
            (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                setCurrentItem({
                    ...currentItem,
                    [field]: event.target.value as InvoiceItemFormData[typeof field]
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
        const taxAmount = parseFloat(formData.tax_amount) || 0;

        let finalDiscountAmount = inputDiscountAmount;
        let total = subtotal;

        if (formData.discount_type === "percent" && inputDiscountAmount > 0) {
            finalDiscountAmount = subtotal * (inputDiscountAmount / 100);
            total = subtotal - finalDiscountAmount + taxAmount;
        } else {
            total = subtotal - finalDiscountAmount + taxAmount;
        }

        return {
            subtotal,
            discountAmount: finalDiscountAmount,
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
                    items: itemsToSubmit, // Add items directly to the payload
                    bookingId: formData.booking_id
                        ? parseInt(formData.booking_id)
                        : undefined,
                    discountAmount: finalDiscountAmount,
                    discountType:
                        (formData.discount_type as DiscountTypeEnum) || undefined,
                    taxAmount: parseFloat(formData.tax_amount) || 0,
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
                    taxAmount: parseFloat(formData.tax_amount) || 0,
                    totalAmount: finalTotal,
                    paidAmount:
                        formData.payment_status === "paid"
                            ? finalTotal
                            : 0,
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
        } catch (err: unknown) {
            console.error("Failed to submit invoice:", err);
            let errorMessage =
                "An error occurred while submitting the invoice. Please check the data and try again.";
            const apiError = err as ApiErrorResponse;

            if (apiError.response?.data?.message) {
                const backendMessage = apiError.response.data.message;
                if (Array.isArray(backendMessage)) {
                    errorMessage += "\n\nServer errors:\n- " + backendMessage.join("\n- ");
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
    } = calculateTotals();

    const invoiceToView: Invoice | null = selectedInvoice
        ? {
            ...selectedInvoice,
            items: itemsForView.length > 0 ? itemsForView : selectedInvoice.items,
        }
        : null;

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
        if (currentItem.item_type === "product") {
            return (products || []).map((product) => ({
                id: product.id,
                name: product.name,
                price: product.price,
                discount: product.discount || 0,
                type: "product",
            }));
        }
        if (currentItem.item_type === "service") {
            return (services || [])
                .filter((service) => !service.isCombo)
                .map((service) => ({
                    id: service.id,
                    name: service.name,
                    price: service.price,
                    discount: service.discountPrice
                        ? service.price - service.discountPrice
                        : 0,
                    type: "service",
                }));
        }
        if (currentItem.item_type === "package") {
            return (services || [])
                .filter((service) => service.isCombo)
                .map((service) => ({
                    id: service.id,
                    name: service.name,
                    price: service.price,
                    discount: service.discountPrice
                        ? service.price - service.discountPrice
                        : 0,
                    type: "package",
                }));
        }
        return [];
    }, [products, services, currentItem.item_type]);

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

    return (
        <>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Invoice Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage customer invoices and payments
                </Typography>
            </Box>

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
                                    <Receipt sx={{ fontSize: 32 }} />
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
                            placeholder="Search by voucher, customer name, phone..."
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
                            <InputLabel>Payment Status</InputLabel>
                            <Select
                                value={filterStatus}
                                label="Payment Status"
                                onChange={(e) =>
                                    setFilterStatus(e.target.value as PaymentStatus | "all")
                                }
                            >
                                <MenuItem value="all">All Status</MenuItem>
                                <MenuItem value="paid">Paid</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
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
                            Create Invoice
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.05) }}>
                                <TableCell sx={{ fontWeight: 700 }}>Voucher</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Store</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Booking</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Subtotal</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Discount</TableCell>
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
                            {isLoading && paginatedInvoices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={11} align="center">
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                py: 2,
                                            }}
                                        >
                                            <CircularProgress
                                                size={24}
                                                sx={{ color: PRIMARY_COLOR }}
                                            />
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ ml: 2 }}
                                            >
                                                Loading...
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : paginatedInvoices.length > 0 ? (
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
                                            {invoice.booking ? (
                                                <Chip
                                                    label={`BK${invoice.booking.id}`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    No booking
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="600">
                                                {formatCurrency(invoice.subtotal)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {invoice.discount_amount > 0 ? (
                                                <Box>
                                                    <Typography
                                                        variant="body2"
                                                        color={SUCCESS_COLOR}
                                                        fontWeight="600"
                                                    >
                                                        -{formatCurrency(invoice.discount_amount)}
                                                    </Typography>
                                                    {invoice.discount_type === "percent" && (
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            (
                                                            {((parseFloat(
                                                                invoice.discount_amount.toString()
                                                            ) || 0) *
                                                                100) /
                                                                (parseFloat(invoice.subtotal.toString()) ||
                                                                    100)}
                                                            %)
                                                        </Typography>
                                                    )}
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    No discount
                                                </Typography>
                                            )}
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
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleMenuOpen(e, invoice)}
                                            >
                                                <MoreVert />
                                            </IconButton>
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
                    count={filteredInvoices.length}
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
                <MenuItem onClick={handleView}>
                    <Visibility sx={{ mr: 1, fontSize: 20 }} />
                    View Details
                </MenuItem>
                <MenuItem onClick={handleViewItems}>
                    <Inventory sx={{ mr: 1, fontSize: 20 }} />
                    View Items
                </MenuItem>
                <MenuItem onClick={handleEdit}>
                    <Edit sx={{ mr: 1, fontSize: 20 }} />
                    Edit
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
                open={openDialog}
                onClose={handleDialogClose}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    {dialogMode === "add"
                        ? "Create New Invoice"
                        : dialogMode === "edit"
                            ? "Edit Invoice"
                            : "Invoice Details"}
                </DialogTitle>
                <DialogContent dividers>
                    {isItemsLoading &&
                        (dialogMode === "view" || dialogMode === "edit") ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                            <CircularProgress size={24} />
                            <Typography sx={{ ml: 2 }}>Loading Details...</Typography>
                        </Box>
                    ) : dialogMode === "view" && invoiceToView ? (
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
                                        }}
                                    >
                                        <Receipt sx={{ fontSize: 32 }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h5" fontWeight="bold">
                                            {invoiceToView.voucher}
                                        </Typography>
                                        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                                            <Chip
                                                label={getPaymentStatusLabel(
                                                    invoiceToView.payment_status
                                                )}
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha(
                                                        getPaymentStatusColor(invoiceToView.payment_status),
                                                        0.1
                                                    ),
                                                    color: getPaymentStatusColor(
                                                        invoiceToView.payment_status
                                                    ),
                                                }}
                                            />
                                            <Chip
                                                label={invoiceToView.store?.name || ""}
                                                size="small"
                                                variant="outlined"
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
                                    {invoiceToView.customer?.fullName ||
                                        `ID: ${invoiceToView.customer_id}`}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Phone
                                </Typography>
                                <Typography variant="body1">
                                    {invoiceToView.customer?.phone || "N/A"}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Store
                                </Typography>
                                <Typography variant="body1" fontWeight="600">
                                    {invoiceToView.store?.name || `ID: ${invoiceToView.store_id}`}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Booking
                                </Typography>
                                <Typography variant="body1">
                                    {invoiceToView.booking
                                        ? invoiceToView.voucher
                                        : "No booking"}
                                </Typography>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                                    Invoice Items
                                </Typography>
                                <TableContainer component={Paper} variant="outlined">
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
                                            {invoiceToView.items?.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 1,
                                                            }}
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
                                                                color: getItemTypeColor(
                                                                    item.itemType as ItemType
                                                                ),
                                                                textTransform: "capitalize",
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{item.staff_name || "-"}</TableCell>
                                                    <TableCell align="right">{item.quantity}</TableCell>
                                                    <TableCell align="right">
                                                        {formatCurrency(item.unitPrice)}
                                                    </TableCell>
                                                    <TableCell
                                                        align="right"
                                                        sx={{ color: SUCCESS_COLOR }}
                                                    >
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
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Box
                                    sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
                                >
                                    <Box sx={{ minWidth: 300 }}>
                                        <Stack spacing={1}>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                }}
                                            >
                                                <Typography>Subtotal:</Typography>
                                                <Typography fontWeight="600">
                                                    {formatCurrency(invoiceToView.subtotal)}
                                                </Typography>
                                            </Box>
                                            {invoiceToView.discount_amount > 0 && (
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                    }}
                                                >
                                                    <Typography color={SUCCESS_COLOR}>
                                                        Discount{" "}
                                                        {invoiceToView.discount_type === "percent"
                                                            ? `(${invoiceToView.discount_amount}%)`
                                                            : ""}
                                                        :
                                                    </Typography>
                                                    <Typography color={SUCCESS_COLOR} fontWeight="600">
                                                        -{formatCurrency(invoiceToView.discount_amount)}
                                                    </Typography>
                                                </Box>
                                            )}
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                }}
                                            >
                                                <Typography>Tax:</Typography>
                                                <Typography fontWeight="600">
                                                    {formatCurrency(invoiceToView.tax_amount)}
                                                </Typography>
                                            </Box>
                                            <Divider />
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                }}
                                            >
                                                <Typography variant="h6">Total Amount:</Typography>
                                                <Typography variant="h6" color={PRIMARY_COLOR}>
                                                    {formatCurrency(invoiceToView.total_amount)}
                                                </Typography>
                                            </Box>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                }}
                                            >
                                                <Typography>Paid Amount:</Typography>
                                                <Typography
                                                    fontWeight="600"
                                                    color={
                                                        invoiceToView.payment_status === "paid"
                                                            ? SUCCESS_COLOR
                                                            : WARNING_COLOR
                                                    }
                                                >
                                                    {formatCurrency(invoiceToView.paid_amount)}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Box>
                                </Box>
                            </Grid>

                            {invoiceToView.notes && (
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Notes
                                    </Typography>
                                    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                                        {invoiceToView.notes}
                                    </Typography>
                                </Grid>
                            )}

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Created At
                                </Typography>
                                <Typography variant="body1">
                                    {new Date(invoiceToView.created_at).toLocaleString()}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Last Updated
                                </Typography>
                                <Typography variant="body1">
                                    {new Date(invoiceToView.updated_at).toLocaleString()}
                                </Typography>
                            </Grid>
                        </Grid>
                    ) : (
                        <Grid container spacing={3} sx={{ mt: 0.5 }}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth required>
                                    <InputLabel>Customer</InputLabel>
                                    <Select
                                        value={formData.customer_id}
                                        label="Customer"
                                        onChange={(e) =>
                                            setFormData({ ...formData, customer_id: e.target.value })
                                        }
                                    >
                                        {customers.map((customer) => (
                                            <MenuItem key={customer.id} value={customer.id}>
                                                {customer.fullName} - {customer.phone}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth required>
                                    <InputLabel>Store</InputLabel>
                                    <Select
                                        value={formData.store_id}
                                        label="Store"
                                        onChange={(e) =>
                                            setFormData({ ...formData, store_id: e.target.value })
                                        }
                                    >
                                        {stores.map((store) => (
                                            <MenuItem key={store.id} value={store.id}>
                                                {store.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Booking</InputLabel>
                                    <Select
                                        value={formData.booking_id}
                                        label="Booking"
                                        onChange={(e) =>
                                            setFormData({ ...formData, booking_id: e.target.value })
                                        }
                                    >
                                        <MenuItem value="">No Booking</MenuItem>
                                        {bookings
                                            .filter(
                                                (booking) =>
                                                    booking.confirm === true
                                            )
                                            .map((booking) => (
                                                <MenuItem key={booking.id} value={booking.id}>
                                                    {`Booking #${booking.id} - ${customers.find(
                                                        (c) => c.id === booking.customerId
                                                    )?.fullName || "Unknown Customer"
                                                        }`}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Payment Status</InputLabel>
                                    <Select
                                        value={formData.payment_status}
                                        label="Payment Status"
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                payment_status: e.target.value as PaymentStatus,
                                            })
                                        }
                                    >
                                        <MenuItem value="pending">Pending</MenuItem>
                                        <MenuItem value="paid">Paid</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Add Items
                                </Typography>
                                <Paper sx={{ p: 2, mb: 2 }}>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, sm: 3 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>Item Type</InputLabel>
                                                <Select
                                                    value={currentItem.item_type}
                                                    label="Item Type"
                                                    onChange={(e) =>
                                                        setCurrentItem({
                                                            ...initialItemFormData,
                                                            item_type: e.target.value as ItemType,
                                                        })
                                                    }
                                                >
                                                    <MenuItem value="service">Service</MenuItem>
                                                    <MenuItem value="package">Package</MenuItem>
                                                    <MenuItem value="product">Product</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 3 }}>
                                            <Autocomplete
                                                options={selectableItems}
                                                getOptionLabel={(option) => option.name}
                                                value={
                                                    selectableItems.find(
                                                        (item) => item.id.toString() === currentItem.item_id
                                                    ) || null
                                                }
                                                onChange={(event, newValue) => {
                                                    handleItemSelection(newValue);
                                                }}
                                                renderInput={(params) => (
                                                    <TextField {...params} label="Item Name" />
                                                )}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 2 }}>
                                            <TextField
                                                fullWidth
                                                label="Quantity"
                                                type="number"
                                                value={currentItem.quantity}
                                                onChange={handleItemChange("quantity")}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 2 }}>
                                            <TextField
                                                fullWidth
                                                disabled
                                                label="Unit Price"
                                                type="number"
                                                value={currentItem.unit_price}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">₫</InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 2 }}>
                                            <TextField
                                                fullWidth
                                                disabled
                                                label="Discount"
                                                type="number"
                                                value={currentItem.discount}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">₫</InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 4 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>Staff</InputLabel>
                                                <Select
                                                    value={currentItem.staff_id}
                                                    label="Staff"
                                                    onChange={(e) =>
                                                        setCurrentItem({
                                                            ...currentItem,
                                                            staff_id: e.target.value,
                                                        })
                                                    }
                                                >
                                                    <MenuItem value="">No Staff</MenuItem>
                                                    {staff.map((staff) => (
                                                        <MenuItem key={staff.id} value={staff.id}>
                                                            {staff.full_name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 2 }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                onClick={addItem}
                                                sx={{ height: "56px" }}
                                                disabled={
                                                    !currentItem.item_name ||
                                                    !currentItem.item_id ||
                                                    parseFloat(currentItem.unit_price) <= 0
                                                }
                                            >
                                                Add Item
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Paper>

                                {items.length > 0 && (
                                    <TableContainer component={Paper} variant="outlined">
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
                                                    <TableCell align="center">Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {items.map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <Typography variant="body2" fontWeight="600">
                                                                {item.item_name}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={item.item_type}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: alpha(
                                                                        getItemTypeColor(item.item_type),
                                                                        0.1
                                                                    ),
                                                                    color: getItemTypeColor(item.item_type),
                                                                    textTransform: "capitalize",
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            {staff.find(
                                                                (s) => s.id === parseInt(item.staff_id)
                                                            )?.full_name || "-"}
                                                        </TableCell>
                                                        <TableCell align="right">{item.quantity}</TableCell>
                                                        <TableCell align="right">
                                                            {formatCurrency(parseFloat(item.unit_price))}
                                                        </TableCell>
                                                        <TableCell
                                                            align="right"
                                                            sx={{ color: SUCCESS_COLOR }}
                                                        >
                                                            -{formatCurrency(parseFloat(item.discount))}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                                                            {formatCurrency(
                                                                parseFloat(item.unit_price) *
                                                                parseInt(item.quantity) -
                                                                parseFloat(item.discount)
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => removeItem(index)}
                                                                color="error"
                                                            >
                                                                <Delete />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Grid>

                            {/* <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Discount Amount"
                  type="number"
                  value={formData.discount_amount}
                  onChange={handleFormChange("discount_amount")}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₫</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Discount Type</InputLabel>
                  <Select
                    value={formData.discount_type}
                    label="Discount Type"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_type: e.target.value as DiscountType,
                      })
                    }
                  >
                    <MenuItem value="">No Discount</MenuItem>
                    <MenuItem value="amount">Amount</MenuItem>
                    <MenuItem value="percent">Percentage</MenuItem>
                  </Select>
                </FormControl>
              </Grid> */}
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Tax Amount"
                                    type="number"
                                    value={formData.tax_amount}
                                    onChange={handleFormChange("tax_amount")}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">₫</InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Box
                                    sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
                                >
                                    <Box
                                        sx={{
                                            minWidth: 300,
                                            p: 2,
                                            bgcolor: alpha(PRIMARY_COLOR, 0.05),
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Stack spacing={1}>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                }}
                                            >
                                                <Typography>Subtotal:</Typography>
                                                <Typography fontWeight="600">
                                                    {formatCurrency(subtotal)}
                                                </Typography>
                                            </Box>
                                            {calculatedDiscountAmount > 0 && (
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                    }}
                                                >
                                                    <Typography color={SUCCESS_COLOR}>
                                                        Discount{" "}
                                                        {formData.discount_type === "percent"
                                                            ? `(${formData.discount_amount}%)`
                                                            : ""}
                                                        :
                                                    </Typography>
                                                    <Typography color={SUCCESS_COLOR} fontWeight="600">
                                                        -{formatCurrency(calculatedDiscountAmount)}
                                                    </Typography>
                                                </Box>
                                            )}
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                }}
                                            >
                                                <Typography>Tax:</Typography>
                                                <Typography fontWeight="600">
                                                    {formatCurrency(parseFloat(formData.tax_amount))}
                                                </Typography>
                                            </Box>
                                            <Divider />
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                }}
                                            >
                                                <Typography variant="h6">Total Amount:</Typography>
                                                <Typography variant="h6" color={PRIMARY_COLOR}>
                                                    {formatCurrency(total)}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Notes"
                                    multiline
                                    rows={3}
                                    value={formData.notes}
                                    onChange={handleFormChange("notes")}
                                    placeholder="Add any notes or special instructions..."
                                />
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    {dialogMode !== "view" && (
                        <>
                            <Button onClick={handleDialogClose}>Cancel</Button>
                            <Button
                                onClick={handleSubmit}
                                variant="contained"
                                disabled={items.length === 0}
                                sx={{
                                    bgcolor: PRIMARY_COLOR,
                                    "&:hover": { bgcolor: PRIMARY_DARK },
                                }}
                            >
                                {dialogMode === "add" ? "Create Invoice" : "Save Changes"}
                            </Button>
                        </>
                    )}
                    {dialogMode === "view" && (
                        <Button onClick={handleDialogClose}>Close</Button>
                    )}
                </DialogActions>
            </Dialog>

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
        </>
    );
}