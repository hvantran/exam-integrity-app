import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import { Users, Clock, AlertTriangle, CheckSquare } from 'lucide-react';
import StatCard from './StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'Molecules/StatCard',
  component: StatCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const StudentsActive: Story = {
  args: {
    icon: <Users size={18} />,
    value: '42 / 45',
    label: 'Students Active',
    variant: 'default',
  },
};

export const TimeRemaining: Story = {
  args: {
    icon: <Clock size={18} />,
    value: '00:45:12',
    label: 'Time Remaining',
    variant: 'success',
  },
};

export const FlagsRaised: Story = {
  args: {
    icon: <AlertTriangle size={18} />,
    value: 2,
    label: 'Flags Raised',
    sublabel: 'Pending review',
    variant: 'warning',
  },
};

export const NeedsGrading: Story = {
  args: {
    icon: <CheckSquare size={18} />,
    value: 12,
    label: 'Needs Grading',
    sublabel: 'Exams queued',
    variant: 'default',
  },
};

export const Dashboard: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <StatCard icon={<Users size={18} />} value="42 / 45" label="Students Active" />
      <StatCard
        icon={<Clock size={18} />}
        value="00:45:12"
        label="Time Remaining"
        variant="success"
      />
      <StatCard
        icon={<AlertTriangle size={18} />}
        value={2}
        label="Flags Raised"
        sublabel="Pending"
        variant="warning"
      />
      <StatCard icon={<CheckSquare size={18} />} value={12} label="Needs Grading" />
    </Box>
  ),
};
