import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import ScheduleIcon from '@mui/icons-material/Schedule';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import TeacherManStatCard from './TeacherManStatCard';

const meta: Meta<typeof TeacherManStatCard> = {
  title: 'Molecules/TeacherManStatCard',
  component: TeacherManStatCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TeacherManStatCard>;

export const StudentsActive: Story = {
  args: {
    icon: <GroupIcon />,
    value: '42 / 45',
    label: 'Students Active',
    variant: 'default',
  },
};

export const TimeRemaining: Story = {
  args: {
    icon: <ScheduleIcon />,
    value: '00:45:12',
    label: 'Time Remaining',
    variant: 'success',
  },
};

export const FlagsRaised: Story = {
  args: {
    icon: <WarningAmberIcon />,
    value: 2,
    label: 'Flags Raised',
    sublabel: 'Pending review',
    variant: 'warning',
  },
};

export const NeedsGrading: Story = {
  args: {
    icon: <FactCheckIcon />,
    value: 12,
    label: 'Needs Grading',
    sublabel: 'Exams queued',
    variant: 'default',
  },
};

export const Dashboard: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <TeacherManStatCard icon={<GroupIcon />} value="42 / 45" label="Students Active" />
      <TeacherManStatCard icon={<ScheduleIcon />} value="00:45:12" label="Time Remaining" variant="success" />
      <TeacherManStatCard icon={<WarningAmberIcon />} value={2} label="Flags Raised" sublabel="Pending" variant="warning" />
      <TeacherManStatCard icon={<FactCheckIcon />} value={12} label="Needs Grading" />
    </Box>
  ),
};
