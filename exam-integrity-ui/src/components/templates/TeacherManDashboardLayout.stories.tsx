import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import TeacherManDashboardLayout from './TeacherManDashboardLayout';
import { StatCard } from '../molecules';
import { Users, Clock, Flag, CircleCheck } from 'lucide-react';

const meta: Meta<typeof TeacherManDashboardLayout> = {
  title: 'Templates/TeacherManDashboardLayout',
  component: TeacherManDashboardLayout,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof TeacherManDashboardLayout>;

const OverviewContent = () => (
  <Box>
    <Typography variant="h2" sx={{ mb: 3, fontWeight: 700 }}>
      Tổng quan
    </Typography>
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          icon={<Users size={18} />}
          value="1,248"
          label="Học sinh đang thi"
          variant="default"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          icon={<Clock size={18} />}
          value="42:17"
          label="Thời gian còn lại"
          variant="warning"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard icon={<Flag size={18} />} value="7" label="Cờ cần xét duyệt" variant="warning" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          icon={<CircleCheck size={18} />}
          value="312"
          label="Đã hoàn thành"
          variant="success"
        />
      </Grid>
    </Grid>
    <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e4e7eb' }}>
      <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
        Kết quả thi
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Nội dung chi tiết sẽ hiển thị ở đây…
      </Typography>
    </Paper>
  </Box>
);

export const Overview: Story = {
  args: {
    activeSection: 'dashboard',
    userName: 'Nguyễn Minh Tú',
    userRole: 'Teacher',
  },
  render: (args) => (
    <TeacherManDashboardLayout {...args}>
      <OverviewContent />
    </TeacherManDashboardLayout>
  ),
};

export const ReviewSection: Story = {
  args: { ...Overview.args, activeSection: 'review' },
  render: (args) => (
    <TeacherManDashboardLayout {...args}>
      <Typography variant="h2" sx={{ fontWeight: 700 }}>
        Duyệt đề thi
      </Typography>
    </TeacherManDashboardLayout>
  ),
};
