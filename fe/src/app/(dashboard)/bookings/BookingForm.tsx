"use client";

import React, { useState, useMemo } from "react";
import {
  Box, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Typography, Stack,
  Chip, IconButton, TextField, Button, alpha,
  CircularProgress, Checkbox, Paper, Tabs, Tab
} from "@mui/material";
import {
  Search, Store, ConfirmationNumber, CheckCircle, Cancel
} from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

// Types & API
import {
  Booking,
  BookingStatus,
  PendingInvoiceItem,
  CreatePendingInvoiceItemPayload,
  UpdateBookingPayload
} from "@/types/booking";
import { Staff } from "@/types/staff";
import { DiscountType } from "@/types/invoice";
import {
  getBookings,
  getBookingById,
  updateBooking,
  startService,
  completeService,
  type CompleteServicePayload
} from "@/lib/api/bookings";
import { getServices } from "@/lib/api/services";
import { getStaff } from "@/lib/api/staffs";

// Components
import BookingDetail from "./BookingDetail";

interface BackendError {
  response?: {
    data?: {
      message?: string | string[];
    };
  };
}

const PRIMARY_COLOR = "#3b82f6";
const SUCCESS_COLOR = "#10b981";
const WARNING_COLOR = "#f59e0b";
const INFO_COLOR = "#8b5cf6";
const GRAY_COLOR = "#64748b";

export default function BookingForm({ slug }: { slug?: string[] }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // --- States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState<string>("ALL");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const selectedId = useMemo(() => {
    const bookingIdFromUrl = slug?.[0];
    if (bookingIdFromUrl && bookingIdFromUrl !== "add") {
      const numericId = Number(bookingIdFromUrl);
      return !isNaN(numericId) ? numericId : null;
    }
    return null;
  }, [slug]);

  // --- Queries ---
  const { data: response, isLoading } = useQuery({
    queryKey: ["bookings", page, rowsPerPage],
    queryFn: () => getBookings({ page: page + 1, limit: rowsPerPage }),
  });

  const { data: selectedBookingRes, isLoading: isLoadingSelectedBooking } = useQuery({
    queryKey: ["booking", selectedId],
    queryFn: () => getBookingById(selectedId!),
    enabled: !!selectedId,
  });

  const { data: servicesRes } = useQuery({
    queryKey: ["services"],
    queryFn: () => getServices({ limit: 100 }),
    enabled: !!selectedId,
  });

  const { data: staffDataRes } = useQuery({
    queryKey: ['staff'],
    queryFn: () => getStaff({ limit: 1000 }),
    enabled: !!selectedId,
  });

  const bookings = useMemo(() => response?.data || [], [response]);

  const selectedBooking = useMemo(() => {
    if (selectedId && selectedBookingRes) {
      return selectedBookingRes.data;
    }
    return undefined;
  }, [selectedId, selectedBookingRes]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking: Booking) => {
      const matchStatus = currentTab === "ALL" || booking.status === currentTab;
      const query = searchTerm.toLowerCase();
      return matchStatus && (
        (booking.customer?.fullName || booking.customerName || "").toLowerCase().includes(query) ||
        (booking.customer?.phone || booking.customerPhone || "").includes(query)
      );
    });
  }, [bookings, currentTab, searchTerm]);

  // --- Handlers ---
  const handleBack = () => {
    router.push("/bookings");
  };

  const handleRowClick = (id: number) => {
    router.push(`/bookings/${id}`);
  };

  const handleUpdateStatus = async (id: number, status: BookingStatus) => {
    await updateBooking(id, { status });
    queryClient.invalidateQueries({ queryKey: ["bookings"] });
    queryClient.invalidateQueries({ queryKey: ["booking", id] });
  };

  const handleStartService = async (id: number) => {
    await startService(id);
    queryClient.invalidateQueries({ queryKey: ["bookings"] });
    queryClient.invalidateQueries({ queryKey: ["booking", id] });
  };

  const handleCompleteService = async (
    id: number,
    updatedData?: { orderDiscount?: number; discountReason?: string }
  ) => {
    const booking = bookings.find((b: Booking) => b.id === id) || selectedBooking;
    if (!booking) return;

    const subtotal = booking.pendingInvoiceItems?.reduce(
      (sum: number, item: PendingInvoiceItem) => {
        const itemTotal = item.unitPrice * item.quantity - (item.discount || 0);
        return sum + Math.max(0, itemTotal);
      },
      0
    ) || 0;

    const totalDiscount = updatedData?.orderDiscount ?? booking.orderDiscount ?? 0;
    const afterDiscount = Math.max(0, subtotal - totalDiscount);
    const taxAmount = Math.round(afterDiscount * 0.08);
    const finalAmount = afterDiscount + taxAmount;

    const invoiceData: CompleteServicePayload = {
      storeId: Number(booking.storeId),
      subtotal,
      totalAmount: finalAmount,
      discountAmount: totalDiscount,
      discountType: totalDiscount > 0 ? DiscountType.AMOUNT : undefined,
      taxAmount,
      paymentStatus: "pending",
      notes: updatedData?.discountReason || undefined,
      items: booking.pendingInvoiceItems?.map((item: PendingInvoiceItem) => ({
        itemType: item.itemType,
        itemId: Number(item.itemId),
        itemName: item.itemName,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        discount: Number(item.discount || 0),
        staffId: item.staffId ? Number(item.staffId) : undefined,
        totalPrice: Math.max(0, Number(item.unitPrice) * Number(item.quantity) - Number(item.discount || 0)),
      })) || [],
    };

    try {
      await completeService(id, invoiceData);
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
      handleBack();
    } catch (error: unknown) {
      const err = error as BackendError;
      const errorMessage = Array.isArray(err.response?.data?.message)
        ? err.response?.data?.message[0]
        : err.response?.data?.message || "Failed to complete service";
      alert(errorMessage);
    }
  };

  const handleUpdateBookingItems = async (id: number, items: PendingInvoiceItem[]) => {
    const payloadItems: CreatePendingInvoiceItemPayload[] = items.map(item => ({
      itemType: item.itemType,
      itemId: item.itemId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount,
      totalPrice: item.totalPrice,
      staffId: item.staffId,
      itemName: item.itemName,
    }));
    await updateBooking(id, { pendingInvoiceItems: payloadItems });
    queryClient.invalidateQueries({ queryKey: ["bookings"] });
    queryClient.invalidateQueries({ queryKey: ["booking", id] });
  };

  const handleEditBooking = async (booking: Booking) => {
    const payload: UpdateBookingPayload = {
      orderDiscount: booking.orderDiscount,
      discountReason: booking.discountReason,
    };
    await updateBooking(booking.id, payload);
    queryClient.invalidateQueries({ queryKey: ["bookings"] });
    queryClient.invalidateQueries({ queryKey: ["booking", booking.id] });
  };

  // --- Styles ---
  const getTabColor = (tabValue: string) => {
    switch (tabValue) {
      case "ALL": return PRIMARY_COLOR;
      case BookingStatus.PENDING: return WARNING_COLOR;
      case BookingStatus.IN_PROGRESS: return INFO_COLOR;
      case BookingStatus.COMPLETED: return SUCCESS_COLOR;
      default: return PRIMARY_COLOR;
    }
  };

  const getStatusChipStyle = (status: BookingStatus) => {
    let bgcolor = "";
    let color = "white";
    switch (status) {
      case BookingStatus.PENDING: bgcolor = "#F59E0B"; break;
      case BookingStatus.IN_PROGRESS: bgcolor = "#8B5CF6"; break;
      case BookingStatus.COMPLETED: bgcolor = "#10B981"; break;
      case BookingStatus.CANCELLED: bgcolor = "#F44336"; break;
      case BookingStatus.CONFIRMED: bgcolor = INFO_COLOR; break;
      case BookingStatus.NO_SHOW: bgcolor = GRAY_COLOR; break;
      default: bgcolor = alpha(PRIMARY_COLOR, 0.1); color = PRIMARY_COLOR; break;
    }
    return { bgcolor, color, fontWeight: 600, borderRadius: 2 };
  };

  // --- Rendering ---
  if (isLoading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress /></Box>;

  if (selectedId) {
    if (isLoadingSelectedBooking) return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress /></Box>;
    if (selectedBooking) {
      return (
        <BookingDetail
          booking={selectedBooking}
          staff={staffDataRes?.data?.data || []}
          services={servicesRes?.data || []}
          onBack={handleBack}
          onUpdateStatus={handleUpdateStatus}
          onStartService={handleStartService}
          onCompleteService={handleCompleteService}
          onEdit={handleEditBooking}
          onUpdateBookingItems={handleUpdateBookingItems}
        />
      );
    }
  }

  return (
    <Box sx={{ p: 3, bgcolor: "#F8FAFC", minHeight: "100vh" }}>
      <Paper elevation={0} sx={{ borderRadius: 0, mb: 3, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => { setCurrentTab(newValue); setPage(0); }}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            minHeight: 48,
            "& .MuiTab-root": { fontWeight: 700, minHeight: 48, textTransform: "none", fontSize: "1rem", borderRadius: 0, transition: "all 0.3s" },
            "& .Mui-selected": { color: `${getTabColor(currentTab)} !important`, backgroundColor: alpha(getTabColor(currentTab), 0.15) },
            "& .MuiTabs-indicator": { bgcolor: getTabColor(currentTab), height: 3 },
          }}
        >
          <Tab label="All" value="ALL" sx={{ "&.Mui-selected": { color: `${GRAY_COLOR} !important` } }} />
          <Tab label="Pending" value={BookingStatus.PENDING} sx={{ "&.Mui-selected": { color: `${WARNING_COLOR} !important` } }} />
          <Tab label="In Progress" value={BookingStatus.IN_PROGRESS} sx={{ "&.Mui-selected": { color: `${INFO_COLOR} !important` } }} />
          <Tab label="Completed" value={BookingStatus.COMPLETED} sx={{ "&.Mui-selected": { color: `${SUCCESS_COLOR} !important` } }} />
        </Tabs>
      </Paper>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ flexGrow: 1, p: 0, borderRadius: 0, border: "1px solid #E2E8F0" }} elevation={0}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search bookings by customer name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ color: PRIMARY_COLOR, ml: 1, mr: 1 }} />,
              sx: { border: "none", "& fieldset": { border: "none" }, borderRadius: 0, height: 44 },
            }}
      
          />
        </Card>
      </Stack>

      <Card sx={{ borderRadius: 0, border: "1px solid #E2E8F0" }} elevation={0}>
        <TableContainer>
          <Table sx={{ tableLayout: "fixed" }}>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.05) }}>
                <TableCell sx={{ fontWeight: 700, width: "100px" }}>Booking</TableCell>
                <TableCell sx={{ fontWeight: 700, width: "250px" }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700, width: "200px" }}>Store</TableCell>
                <TableCell sx={{ fontWeight: 700, width: "180px" }}>Date & Time</TableCell>
                <TableCell sx={{ fontWeight: 700, width: "120px" }}>Source</TableCell>
                <TableCell sx={{ fontWeight: 700, width: "150px" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, width: "100px" }}>Confirmed</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <TableRow key={booking.id} hover onClick={() => handleRowClick(booking.id)} sx={{ cursor: "pointer", height: 72 }}>
                    <TableCell>
                      <Chip label={`BK${booking.id}`} size="small" variant="outlined" sx={{ color: "#ed6c02", borderColor: "#ed6c02", borderRadius: 2 }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ overflow: "hidden" }}>
                        <Typography variant="body2" fontWeight="600" noWrap>{booking.customer?.fullName || booking.customerName}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                          {booking.customerCountryCode ? `(${booking.customerCountryCode}) ` : ""}{booking.customer?.phone || booking.customerPhone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Store sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2" noWrap>{booking.store?.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} noWrap>{booking.bookingDate}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>{booking.startTime}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={booking.source || "website"} size="small" variant="outlined" sx={{ borderRadius: 2 }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={booking.status === "in_progress" ? "progressing" : booking.status} size="small" sx={getStatusChipStyle(booking.status)} />
                    </TableCell>
                    <TableCell>
                      <Checkbox checked={booking.confirm} checkedIcon={<CheckCircle sx={{ color: SUCCESS_COLOR }} />} icon={<Cancel sx={{ color: "text.disabled" }} />} disabled />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow sx={{ height: 400 }}>
                  <TableCell colSpan={7} align="center">
                    <ConfirmationNumber sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
                    <Typography color="text.secondary">No appointment found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={response?.meta?.total || filteredBookings.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          sx={{ borderTop: "1px solid #E2E8F0" }}
        />
      </Card>
    </Box>
  );
}