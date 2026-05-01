import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RateReviewIcon from '@mui/icons-material/RateReview';
import DatabaseIcon from '@mui/icons-material/Storage';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';
import NavMenuItem from './NavMenuItem';

const meta: Meta<typeof NavMenuItem> = {
  title: 'Molecules/NavMenuItem',
  component: NavMenuItem,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NavMenuItem>;

export const Default: Story = {
  args: { icon: <DashboardIcon />, label: 'Tổng quan', active: false },
};

export const Active: Story = {
  args: { icon: <DashboardIcon />, label: 'Tổng quan', active: true },
};

export const Collapsed: Story = {
  args: { icon: <DashboardIcon />, label: 'Tổng quan', collapsed: true },
};

export const FullSidebar: Story = {
  render: () => (
    <Box sx={{ width: 220, backgroundColor: '#fff', border: '1px solid #C4C5D5', borderRadius: 2, p: 1 }}>
      <NavMenuItem icon={<DashboardIcon />} label="Tổng quan" active />
      <NavMenuItem icon={<UploadFileIcon />} label="Tải lên đề thi" />
      <NavMenuItem icon={<RateReviewIcon />} label="Duyệt đề thi" />
      <NavMenuItem icon={<DatabaseIcon />} label="Ngân hàng câu hỏi" />
      <NavMenuItem icon={<AnalyticsIcon />} label="Báo cáo" />
      <NavMenuItem icon={<SettingsIcon />} label="Cài đặt" />
    </Box>
  ),
};
