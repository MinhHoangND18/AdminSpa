"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Switch,
  FormControlLabel,
  CircularProgress,
  Backdrop,
  Snackbar,
} from "@mui/material";
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Store as StoreIcon,
  Phone,
  Email,
  LocationOn,
  AccessTime,
  Person,
  Link as LinkIcon,
  CheckCircle,
  Cancel,
  Close as CloseIcon,
} from "@mui/icons-material";

import { storesApi } from "@/lib/api/storesApi";
import {getStores} from "@/lib/api/stores";
import { Store, StoreFormData, } from "@/types/store";
// import { get } from "axios";

const PRIMARY_COLOR = "#3b82f6";
const PRIMARY_DARK = "#0f766e";
const SUCCESS_COLOR = "#10b981";
const ERROR_COLOR = "#ef4444";

const QUERY_KEY = ["stores"];

const fetchStores = async (searchQuery: string) => {
  const params: { search?: string } = {};

  if (searchQuery) {
    params.search = searchQuery;
  }
 const response = await storesApi.getAll(params);

//   const paginationData = response.data?.data;

  const storeArray = response.data;

  if (Array.isArray(storeArray)) {
    return storeArray;
  }
  return [];
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) => (
  <Grid size={{ xs: 12, sm: 4 }}>
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
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: alpha(color, 0.1), width: 56, height: 56 }}>
            <Icon sx={{ color: color, fontSize: 28 }} />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  </Grid>
);

export default function StoresPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view">("add");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning",
  });

  const {
    data: stores = [],
    isLoading,
    isError,
    error,
  } = useQuery<Store[], Error>({
    queryKey: [...QUERY_KEY, debouncedSearch],
    queryFn: () => fetchStores(debouncedSearch),
    staleTime: 5 * 60 * 1000,
  });

  const stats = {
    total: stores.length,
    active: stores.filter((s) => s.isActive).length,
    inactive: stores.filter((s) => !s.isActive).length,
  };

  const storeMutation = useMutation<
    any,
    Error,
    Partial<Store> & { id?: number }
  >({
    mutationFn: async (data) => {
      if (dialogMode === "edit" && selectedStore?.id) {
        return await storesApi.update(selectedStore.id, data);
      }
      return await storesApi.create(data);
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      setSnackbar({
        open: true,
        message: `Store ${variables.id ? "updated" : "created"} successfully!`,
        severity: "success",
      });
      handleDialogClose();
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred.";
      setSnackbar({
        open: true,
        message: `Action failed: ${errorMessage}`,
        severity: "error",
      });
    },
  });

  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: (id) =>
      storesApi.remove(id).then((res) => res) as Promise<void>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      setSnackbar({
        open: true,
        message: "Store deleted successfully!",
        severity: "success",
      });
      setDeleteConfirmOpen(false);
      setSelectedStore(null);
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred.";
      setSnackbar({
        open: true,
        message: `Deletion failed: ${errorMessage}`,
        severity: "error",
      });
    },
  });

  const initialFormData: StoreFormData = {
    code: "",
    name: "",
    domain: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    openingHours: "",
    latitude: "",
    longitude: "",
    manager_id: "",
    isActive: true,
  };
  const [formData, setFormData] = useState<StoreFormData>(initialFormData);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    store: Store
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedStore(store);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    //setSelectedStore(null);
  };

  const handleAddNew = () => {
    setDialogMode("add");
    setFormData(initialFormData);
    setOpenDialog(true);
  };

  const handleEdit = () => {
    if (selectedStore) {
      setDialogMode("edit");
      setFormData({
        code: selectedStore.code,
        name: selectedStore.name,
        domain: selectedStore.domain || "",
        address: selectedStore.address,
        phone: selectedStore.phone || "",
        email: selectedStore.email || "",
        description: selectedStore.description || "",
        openingHours: selectedStore.openingHours || "",
        latitude: selectedStore.latitude?.toString() || "",
        longitude: selectedStore.longitude?.toString() || "",
        manager_id: selectedStore.manager_id?.toString() || "",
        isActive: selectedStore.isActive,
      });
      setOpenDialog(true);
    }
    handleMenuClose();
  };

  const handleView = () => {
    if (selectedStore) {
      setDialogMode("view");
      setFormData({
        code: selectedStore.code,
        name: selectedStore.name,
        domain: selectedStore.domain || "",
        address: selectedStore.address,
        phone: selectedStore.phone || "",
        email: selectedStore.email || "",
        description: selectedStore.description || "",
        openingHours: selectedStore.openingHours || "",
        latitude: selectedStore.latitude?.toString() || "",
        longitude: selectedStore.longitude?.toString() || "",
        manager_id: selectedStore.manager_id?.toString() || "",
        isActive: selectedStore.isActive,
      });
      setOpenDialog(true);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setFormData(initialFormData);
    setSelectedStore(null);
  };

  const handleFormChange =
    (field: keyof StoreFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: event.target.value });
    };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, isActive: event.target.checked });
  };

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = () => {
    const dataToSend = {
      //id: dialogMode === "edit" ? selectedStore?.id : undefined,
      ...formData,
      domain: formData.domain || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      description: formData.description || undefined,
      openingHours: formData.openingHours || undefined,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude
        ? parseFloat(formData.longitude)
        : undefined,
      manager_id: formData.manager_id
        ? parseInt(formData.manager_id)
        : undefined,
    } as Partial<Store> & { id?: number };

    storeMutation.mutate(dataToSend);
  };

  const confirmDelete = () => {
    if (!selectedStore) return;
    deleteMutation.mutate(selectedStore.id);
  };

  const loading =
    isLoading || storeMutation.isPending || deleteMutation.isPending;

  if (isError) {
    return (
      <Alert severity="error">
        <Typography variant="h6">Failed to load store data.</Typography>
        <Typography>
          Error: {error?.message || "Check your API connection."}
        </Typography>
      </Alert>
    );
  }

  return (
    <>
      {/* <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop> */}

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Store Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your spa locations and branches
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <StatCard
          title="Total Stores"
          value={stats.total}
          icon={StoreIcon}
          color={PRIMARY_COLOR}
        />
        <StatCard
          title="Active Stores"
          value={stats.active}
          icon={CheckCircle}
          color={SUCCESS_COLOR}
        />
        <StatCard
          title="Inactive Stores"
          value={stats.inactive}
          icon={Cancel}
          color={ERROR_COLOR}
        />
      </Grid>

      {/* Actions Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              placeholder="Search stores..."
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
              Add New Store
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Store Cards */}
      <Grid container spacing={3}>
        {stores.length > 0 ? (
          stores.map((store) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={store.id}>
              <Card
                sx={{
                  height: "100%",
                  transition: "all 0.3s",
                  "&:hover": { boxShadow: 6, transform: "translateY(-4px)" },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Chip
                      label={store.code}
                      size="small"
                      sx={{
                        bgcolor: alpha(PRIMARY_COLOR, 0.1),
                        color: PRIMARY_COLOR,
                        fontWeight: 600,
                      }}
                    />
                    <Box>
                      <Chip
                        label={store.isActive ? "Active" : "Inactive"}
                        size="small"
                        sx={{
                          bgcolor: store.isActive
                            ? alpha(SUCCESS_COLOR, 0.1)
                            : alpha(ERROR_COLOR, 0.1),
                          color: store.isActive ? SUCCESS_COLOR : ERROR_COLOR,
                          fontWeight: 600,
                          mr: 1,
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, store)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {store.name}
                  </Typography>
                  {store.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {store.description}
                    </Typography>
                  )}
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={1.5}>
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
                    >
                      <LocationOn
                        sx={{ fontSize: 18, color: PRIMARY_COLOR, mt: 0.3 }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ flex: 1 }}
                      >
                        {store.address}
                      </Typography>
                    </Box>
                    {store.phone && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Phone sx={{ fontSize: 18, color: PRIMARY_COLOR }} />
                        <Typography variant="body2" color="text.secondary">
                          {store.phone}
                        </Typography>
                      </Box>
                    )}
                    {store.email && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Email sx={{ fontSize: 18, color: PRIMARY_COLOR }} />
                        <Typography variant="body2" color="text.secondary">
                          {store.email}
                        </Typography>
                      </Box>
                    )}
                    {store.openingHours && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <AccessTime
                          sx={{ fontSize: 18, color: PRIMARY_COLOR }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {store.openingHours}
                        </Typography>
                      </Box>
                    )}
                    {store.manager_name && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Person sx={{ fontSize: 18, color: PRIMARY_COLOR }} />
                        <Typography variant="body2" color="text.secondary">
                          Manager: {store.manager_name}
                        </Typography>
                      </Box>
                    )}
                    {store.domain && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <LinkIcon sx={{ fontSize: 18, color: PRIMARY_COLOR }} />
                        <Typography variant="body2" color="text.secondary">
                          {store.domain}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <StoreIcon
                    sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No stores found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery
                      ? "Try adjusting your search criteria"
                      : "Get started by adding your first store"}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView} disabled={loading}>
          <Visibility sx={{ mr: 1, fontSize: 20 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEdit} disabled={loading}>
          <Edit sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={handleDeleteClick}
          sx={{ color: ERROR_COLOR }}
          disabled={loading}
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
            ? "Add New Store"
            : dialogMode === "edit"
            ? "Edit Store"
            : "Store Details"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Store Code *"
                fullWidth
                value={formData.code}
                onChange={handleFormChange("code")}
                disabled={dialogMode === "view"}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Store Name *"
                fullWidth
                value={formData.name}
                onChange={handleFormChange("name")}
                disabled={dialogMode === "view"}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Domain"
                fullWidth
                value={formData.domain}
                onChange={handleFormChange("domain")}
                disabled={dialogMode === "view"}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Phone"
                fullWidth
                value={formData.phone}
                onChange={handleFormChange("phone")}
                disabled={dialogMode === "view"}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Address *"
                fullWidth
                value={formData.address}
                onChange={handleFormChange("address")}
                disabled={dialogMode === "view"}
                required
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
              <TextField
                label="Opening Hours"
                fullWidth
                value={formData.openingHours}
                onChange={handleFormChange("openingHours")}
                disabled={dialogMode === "view"}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={handleFormChange("description")}
                disabled={dialogMode === "view"}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Latitude"
                fullWidth
                type="number"
                value={formData.latitude}
                onChange={handleFormChange("latitude")}
                disabled={dialogMode === "view"}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Longitude"
                fullWidth
                type="number"
                value={formData.longitude}
                onChange={handleFormChange("longitude")}
                disabled={dialogMode === "view"}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Manager ID"
                fullWidth
                type="number"
                value={formData.manager_id}
                onChange={handleFormChange("manager_id")}
                disabled={dialogMode === "view"}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleSwitchChange}
                    disabled={dialogMode === "view"}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} sx={{ color: PRIMARY_COLOR }}>
            {dialogMode === "view" ? "Close" : "Cancel"}
          </Button>
          {dialogMode !== "view" && (
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: PRIMARY_COLOR,
                "&:hover": { bgcolor: PRIMARY_DARK },
              }}
            >
              {dialogMode === "add" ? "Add Store" : "Save Changes"}
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
            This action cannot be undone!
          </Alert>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{selectedStore?.name}</strong> permanently?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleSnackbarClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}