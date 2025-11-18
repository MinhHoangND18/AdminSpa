'use client';

import React from 'react';
import { Card, CardContent, Box, Typography, alpha } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

export default function StatCard({
  title,
  value,
  change,
  icon,
  color,
}: StatCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(
          color,
          0.05
        )} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>
              {value}
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              {change > 0 ? (
                <TrendingUp fontSize="small" sx={{ color: 'success.main' }} />
              ) : (
                <TrendingDown fontSize="small" sx={{ color: 'error.main' }} />
              )}
              <Typography
                variant="body2"
                color={change > 0 ? 'success.main' : 'error.main'}
                fontWeight="medium"
              >
                {change > 0 ? '+' : ''}
                {change}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                with last month
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(color, 0.15),
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}