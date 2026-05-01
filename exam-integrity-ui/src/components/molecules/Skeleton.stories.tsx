import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import Skeleton from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Molecules/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Line: Story = {
  args: {
    width: '100%',
    height: 14,
  },
};

export const CardPreview: Story = {
  render: () => (
    <Box sx={{ width: 320, p: 2, border: '1px solid #e5e7eb', borderRadius: 3 }}>
      <Skeleton height={20} width="50%" className="mb-3" />
      <Skeleton height={14} width="100%" className="mb-2" />
      <Skeleton height={14} width="92%" className="mb-2" />
      <Skeleton height={14} width="75%" className="mb-4" />
      <Skeleton height={40} width="100%" />
    </Box>
  ),
};

export const MixedShapes: Story = {
  render: () => (
    <Box sx={{ display: 'grid', gap: 2, width: 240 }}>
      <Skeleton width={56} height={56} rounded={false} />
      <Skeleton width="100%" height={16} />
      <Skeleton width="70%" height={16} />
    </Box>
  ),
};