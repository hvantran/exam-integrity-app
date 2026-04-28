import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TeacherManReportsLayout from './TeacherManReportsLayout';
import { Box, Typography, Grid } from '@mui/material';
import { colors } from '../../design-system/tokens';

const meta: Meta<typeof TeacherManReportsLayout> = {
  title: 'Templates/TeacherManReportsLayout',
  component: TeacherManReportsLayout,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof TeacherManReportsLayout>;

const MockChart = ({ label }: { label: string }) => (
  <Box sx={{ height: 200, border: `1px solid ${colors.outlineVariant}`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface.container.low }}>
    <Typography sx={{ color: colors.on.surfaceVariant, fontSize: 13 }}>{label}</Typography>
  </Box>
);

export const Default: Story = {
  args: {
    activeTab: 0,
    children: (
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}><MockChart label="Biểu đồ phân bố điểm số" /></Grid>
        <Grid item xs={12} md={4}><MockChart label="Tỷ lệ vi phạm toàn vẹn" /></Grid>
        <Grid item xs={12}><MockChart label="Xu hướng hiệu suất theo thời gian" /></Grid>
      </Grid>
    ),
  },
};
