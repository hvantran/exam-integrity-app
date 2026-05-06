import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import {
  LayoutDashboard,
  Upload,
  ClipboardList,
  Database,
  BarChart2,
  Settings,
} from 'lucide-react';
import NavMenuItem from './NavMenuItem';

const meta: Meta<typeof NavMenuItem> = {
  title: 'Molecules/NavMenuItem',
  component: NavMenuItem,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NavMenuItem>;

export const Default: Story = {
  args: { icon: <LayoutDashboard size={18} />, label: 'Tổng quan', active: false },
};

export const Active: Story = {
  args: { icon: <LayoutDashboard size={18} />, label: 'Tổng quan', active: true },
};

export const Collapsed: Story = {
  args: { icon: <LayoutDashboard size={18} />, label: 'Tổng quan', collapsed: true },
};

export const FullSidebar: Story = {
  render: () => (
    <Box
      sx={{
        width: 220,
        backgroundColor: '#fff',
        border: '1px solid #C4C5D5',
        borderRadius: 2,
        p: 1,
      }}
    >
      <NavMenuItem icon={<LayoutDashboard size={18} />} label="Tổng quan" active />
      <NavMenuItem icon={<Upload size={18} />} label="Tải lên đề thi" />
      <NavMenuItem icon={<ClipboardList size={18} />} label="Duyệt đề thi" />
      <NavMenuItem icon={<Database size={18} />} label="Ngân hàng câu hỏi" />
      <NavMenuItem icon={<BarChart2 size={18} />} label="Báo cáo" />
      <NavMenuItem icon={<Settings size={18} />} label="Cài đặt" />
    </Box>
  ),
};
