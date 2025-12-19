"use client";

import React, { useState, useMemo } from "react";
import {
  Box, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Typography, Stack,
  Avatar, Chip, IconButton, TextField, Button, alpha,
  CircularProgress, Checkbox, Paper, Tabs, Tab
} from "@mui/material";
import {
  Search, Add, Store, Phone, AccessTime, MoreVert,
  ConfirmationNumber, CheckCircle, Cancel
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { BookingStatus } from "@/types/booking";
import BookingDetail from "./BookingDetail";
import { getServices } from "@/lib/api/services";
import { getProducts } from "@/lib/api/products";
import { getStaff } from "@/lib/api/staffs";
import { getBookings, updateBooking, startService, confirmBooking } from "@/lib/api/bookings";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { PendingInvoiceItem } from "@/types/booking";

const PRIMARY_COLOR = "#3b82f6";
const SUCCESS_COLOR = "#10b981";

export default function BookingsPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState<string>("ALL");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const queryClient = useQueryClient();

  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ["bookings", page, rowsPerPage],
    queryFn: () => getBookings({ page: page + 1, limit: rowsPerPage }),
  });
  const { data: servicesRes } = useQuery({
    queryKey: ["services"],
    queryFn: () => getServices({ limit: 100 })
  });

  const { data: productsRes } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts({ limit: 100 })
  });
  const { data: staffDataRes } = useQuery({
    queryKey: ['staff'],
    queryFn: () => getStaff({ limit: 1000 })
  });
  const staffData = (staffDataRes as any)?.data?.data || [];

  const bookings = useMemo(() => {
    if (!response) return [];
    return Array.isArray(response) ? response : (response as any).data || [];
  }, [response]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking: any) => {
      const matchStatus = currentTab === "ALL" || booking.status === currentTab;
      const query = searchTerm.toLowerCase();
      return matchStatus && (
        (booking.customer?.fullName || booking.customerName || "").toLowerCase().includes(query) ||
        (booking.customer?.phone || booking.customerPhone || "").includes(query)
      );
    });
  }, [bookings, currentTab, searchTerm]);

  const handleUpdateStatus = async (id: number, status: BookingStatus) => {
    await updateBooking(id, { status });
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
  };

  const handleStartService = async (id: number) => {
    await startService(id);
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
  };

  const handleCompleteService = (id: number) => {
    console.log("Complete service for booking:", id);
  };

  const handleUpdateBookingItems = async (id: number, items: PendingInvoiceItem[]) => {
    await updateBooking(id, { pendingInvoiceItems: items });
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  if (selectedId && response) {
    const selectedBooking = bookings.find((b: any) => b.id === selectedId);
    if (selectedBooking) {
      return (
        <BookingDetail
          booking={selectedBooking}
          staff={staffData || []}
          services={servicesRes?.data || []}
          products={productsRes?.data || []}
          onBack={() => setSelectedId(null)}
          onUpdateStatus={handleUpdateStatus}
          onStartService={handleStartService}
          onCompleteService={handleCompleteService}
          onEdit={(b) => console.log("Edit", b)}
          onUpdateBookingItems={(id, items) => {
            console.log("Update items for booking", id, items);
          }}
        />
      );
    }
  }

  return (
    <Box sx={{ p: 3, bgcolor: "#F8FAFC", minHeight: "100vh" }}>

      {/* TABS */}
      <Paper elevation={0} sx={{ borderRadius: 0, mb: 3, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => {
            setCurrentTab(newValue);
            setPage(0);
          }}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            minHeight: 48,
            "& .MuiTab-root": {
              fontWeight: 700,
              minHeight: 48,
              textTransform: "none",
              fontSize: "1rem",
              borderRadius: 0,
              transition: "background-color 0.3s",
            },
            // Cấu hình khi Tab được chọn
            "& .Mui-selected": {
              color: `${PRIMARY_COLOR} !important`,
              backgroundColor: alpha(PRIMARY_COLOR, 0.2),
            },
            "& .MuiTabs-indicator": {
              bgcolor: PRIMARY_COLOR,
              height: 3
            }
          }}
        >
          <Tab label="All" value="ALL" />
          <Tab label="Pending" value={BookingStatus.PENDING} />
          <Tab label="In Progress" value={BookingStatus.IN_PROGRESS} />
          <Tab label="Completed" value={BookingStatus.COMPLETED} />
        </Tabs>
      </Paper>

      {/* SEARCH & ACTION */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ flexGrow: 1, p: 0, borderRadius: 2, border: "1px solid #E2E8F0" }} elevation={0}>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm theo tên khách, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ color: PRIMARY_COLOR, ml: 1, mr: 1 }} />,
              sx: { border: "none", "& fieldset": { border: "none" }, borderRadius: 0, height: 44 }
            }}
          />
        </Card>

        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{
            bgcolor: PRIMARY_COLOR, borderRadius: 2, px: 4, fontWeight: 700, textTransform: "none",
            "&:hover": { bgcolor: alpha(PRIMARY_COLOR, 0.8) }
          }}
        >
          New Booking
        </Button>
      </Stack>

      {/* TABLE - CỐ ĐỊNH LAYOUT ĐỂ KHÔNG BỊ NHẢY KHI LOAD DATA */}
      <Card sx={{ borderRadius: 0, border: "1px solid #E2E8F0" }} elevation={0}>
        <TableContainer>
          <Table sx={{ tableLayout: "fixed" }}> {/* QUAN TRỌNG: Giữ nguyên khung bảng */}
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
                  <TableRow
                    key={booking.id}
                    hover
                    onClick={() => setSelectedId(booking.id)}
                    sx={{ cursor: "pointer", height: 72 }} 
                  >
                    <TableCell>
                      <Chip
                        label={`BK${booking.id}`}
                        size="small"
                        variant="outlined"
                        sx={{ color: "#ed6c02", borderColor: "#ed6c02", borderRadius: 2 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ overflow: "hidden" }}>
                        <Typography variant="body2" fontWeight="600" noWrap>
                          {booking.customer?.fullName || booking.customerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                          {booking.customer?.phone || booking.customerPhone}
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
                      <Chip
                        label={booking.status}
                        size="small"
                        sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.1), color: PRIMARY_COLOR, fontWeight: 600, borderRadius: 2 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={booking.confirm}
                        checkedIcon={<CheckCircle sx={{ color: SUCCESS_COLOR }} />}
                        icon={<Cancel sx={{ color: "text.disabled" }} />}
                        disabled
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow sx={{ height: 400 }}>
                  <TableCell colSpan={7} align="center">
                    <ConfirmationNumber sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
                    <Typography color="text.secondary">Không tìm thấy lịch hẹn</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={(response as any)?.meta?.total || filteredBookings.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => setPage(parseInt(e.target.value, 10))}
          sx={{ borderTop: "1px solid #E2E8F0" }}
        />
      </Card>
    </Box>
  );
}