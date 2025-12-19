'use client';

import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  alpha,
  Chip,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  PersonAdd,
  CalendarToday,
  EventNote,
  CheckCircle,
  Schedule,
  Cancel,
  Star,
  Spa,
  AccessTime,
} from '@mui/icons-material';
import type { SvgIconProps } from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Primary colors
const PRIMARY_COLOR = '#3b82f6';
const PRIMARY_LIGHT = '#2dd4bf';
const PRIMARY_DARK = '#0f766e';
const ACCENT_COLOR = '#ec4899';
const SUCCESS_COLOR = '#10b981';
const WARNING_COLOR = '#f59e0b';
const ERROR_COLOR = '#ef4444';
const INFO_COLOR = '#3b82f6';

// Mock data - Revenue
const revenueData = [
  { name: 'Mon', revenue: 4500, appointments: 120, customers: 98 },
  { name: 'Tue', revenue: 5200, appointments: 145, customers: 118 },
  { name: 'Wed', revenue: 4800, appointments: 132, customers: 105 },
  { name: 'Thu', revenue: 6100, appointments: 168, customers: 142 },
  { name: 'Fri', revenue: 5500, appointments: 151, customers: 128 },
  { name: 'Sat', revenue: 6700, appointments: 189, customers: 156 },
  { name: 'Sun', revenue: 7200, appointments: 203, customers: 175 },
];

// Top services
const topServices = [
  { name: 'Body Massage', bookings: 450, revenue: 135000000 },
  { name: 'Foot Massage', bookings: 320, revenue: 64000000 },
  { name: 'Facial Treatment', bookings: 280, revenue: 98000000 },
  { name: 'Thai Massage', bookings: 190, revenue: 76000000 },
  { name: 'Hot Stone', bookings: 160, revenue: 80000000 },
];

// Booking status
const bookingStatus = [
  { name: 'Completed', value: 156, color: SUCCESS_COLOR },
  { name: 'Confirmed', value: 48, color: PRIMARY_COLOR },
  { name: 'Pending', value: 24, color: WARNING_COLOR },
  { name: 'Cancelled', value: 12, color: ERROR_COLOR },
];

// Top staff
const topStaff = [
  { name: 'Nguyen Thi Mai', services: 89, revenue: 26700000, rating: 4.9 },
  { name: 'Tran Van Hung', services: 76, revenue: 22800000, rating: 4.8 },
  { name: 'Le Thi Hoa', services: 68, revenue: 20400000, rating: 4.7 },
  { name: 'Pham Minh Tuan', services: 62, revenue: 18600000, rating: 4.6 },
];

// Recent activities
type Activity = {
  type: 'booking' | 'payment' | 'customer' | 'complete' | 'cancel';
  icon: React.ReactElement<SvgIconProps>;
  text: string;
  time: string;
  color: string;
};

const recentActivities: Activity[] = [
  {
    type: 'booking',
    icon: <EventNote />,
    text: 'Nguyen Van A booked Body Massage - 2:00 PM',
    time: '5 minutes ago',
    color: PRIMARY_COLOR,
  },
  {
    type: 'payment',
    icon: <AttachMoney />,
    text: 'Payment #INV-2024-1234 - $850 completed',
    time: '12 minutes ago',
    color: SUCCESS_COLOR,
  },
  {
    type: 'customer',
    icon: <PersonAdd />,
    text: 'New customer: Tran Thi B (VIP)',
    time: '25 minutes ago',
    color: INFO_COLOR,
  },
  {
    type: 'complete',
    icon: <CheckCircle />,
    text: 'Completed: Facial Treatment - Customer: Mai Lan',
    time: '1 hour ago',
    color: SUCCESS_COLOR,
  },
  {
    type: 'cancel',
    icon: <Cancel />,
    text: 'Cancelled: #BK-789 - Reason: Urgent matters',
    time: '2 hours ago',
    color: ERROR_COLOR,
  },
];

// Stat Card Component
const StatCard = ({
  title,
  value,
  change,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Chip
              label={`${change > 0 ? '+' : ''}${change}%`}
              size="small"
              sx={{
                bgcolor: change > 0 ? alpha(SUCCESS_COLOR, 0.1) : alpha(ERROR_COLOR, 0.1),
                color: change > 0 ? SUCCESS_COLOR : ERROR_COLOR,
                fontWeight: 600,
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              vs last month
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 3,
            bgcolor: alpha(color, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  return (
    <>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Monthly Revenue"
            value="$72.5K"
            change={12.5}
            icon={<TrendingUp sx={{ fontSize: 32 }} />}
            color={SUCCESS_COLOR}
            subtitle="USD"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Bookings"
            value="203"
            change={8.2}
            icon={<CalendarToday sx={{ fontSize: 32 }} />}
            color={PRIMARY_COLOR}
            subtitle="appointments"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="New Customers"
            value="48"
            change={-3.1}
            icon={<PersonAdd sx={{ fontSize: 32 }} />}
            color={INFO_COLOR}
            subtitle="registered"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Today's Schedule"
            value="24"
            change={5.7}
            icon={<Schedule sx={{ fontSize: 32 }} />}
            color={WARNING_COLOR}
            subtitle="18 completed"
          />
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Revenue & Appointments
                </Typography>
                <Chip label="Last 7 days" size="small" sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.1), color: PRIMARY_COLOR }} />
              </Box>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PRIMARY_COLOR} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={PRIMARY_COLOR} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    formatter={(value: number) => new Intl.NumberFormat('en-US').format(value)}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: `1px solid ${alpha(PRIMARY_COLOR, 0.2)}`,
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={PRIMARY_COLOR}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue (USD)"
                  />
                  <Line
                    type="monotone"
                    dataKey="appointments"
                    stroke={ACCENT_COLOR}
                    strokeWidth={2}
                    name="Appointments"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Booking Status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={bookingStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {bookingStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2 }}>
                {bookingStatus.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: item.color,
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2">{item.name}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="600">
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Top Popular Services
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={topServices} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" width={120} stroke="#94a3b8" />
                  <Tooltip
                    formatter={(value: number) => new Intl.NumberFormat('en-US').format(value)}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: `1px solid ${alpha(PRIMARY_COLOR, 0.2)}`,
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="bookings" fill={PRIMARY_COLOR} radius={[0, 8, 8, 0]} name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Top Performing Staff
              </Typography>
              <List>
                {topStaff.map((staff, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            bgcolor: alpha(PRIMARY_COLOR, 0.1),
                            color: PRIMARY_COLOR,
                            fontWeight: 'bold',
                          }}
                        >
                          {index + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" fontWeight="600">
                              {staff.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Star sx={{ fontSize: 16, color: WARNING_COLOR, mr: 0.5 }} />
                              <Typography variant="caption" fontWeight="600">
                                {staff.rating}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {staff.services} services • ${new Intl.NumberFormat('en-US').format(staff.revenue)}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={(staff.services / 89) * 100}
                              sx={{
                                mt: 0.5,
                                height: 6,
                                borderRadius: 3,
                                bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: PRIMARY_COLOR,
                                  borderRadius: 3,
                                },
                              }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < topStaff.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activities */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Activities
                </Typography>
                <Chip
                  label="View All"
                  size="small"
                  sx={{
                    bgcolor: alpha(PRIMARY_COLOR, 0.1),
                    color: PRIMARY_COLOR,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: alpha(PRIMARY_COLOR, 0.2) },
                  }}
                />
              </Box>
              <List>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: alpha(activity.color, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {React.cloneElement(activity.icon, {
                            sx: { color: activity.color, fontSize: 24 },
                          })}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight="500">
                            {activity.text}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <AccessTime sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {activity.time}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}