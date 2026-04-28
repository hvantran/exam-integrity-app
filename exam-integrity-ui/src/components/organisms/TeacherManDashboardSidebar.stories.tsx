import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TeacherManDashboardSidebar from './TeacherManDashboardSidebar';

const meta: Meta<typeof TeacherManDashboardSidebar> = {
  title: 'Organisms/TeacherManDashboardSidebar',
  component: TeacherManDashboardSidebar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof TeacherManDashboardSidebar>;

export const Default: Story = {
  args: {
    activeSection: 'overview',
    userName: 'Nguyen Minh Tu',
    userRole: 'Giao vien',
  },
};

export const ReviewActive: Story = {
  args: { ...Default.args, activeSection: 'review' },
};

export const ReportsActive: Story = {
  args: { ...Default.args, activeSection: 'reports' },
};

export const IngestionActive: Story = {
  args: { ...Default.args, activeSection: 'ingestion' },
};
