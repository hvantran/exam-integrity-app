import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import ExamTips from './ExamTips';

const meta: Meta<typeof ExamTips> = {
  title: 'Molecules/ExamTips',
  component: ExamTips,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ExamTips>;

export const Default: Story = {};

export const InPanel: Story = {
  render: () => (
    <Box sx={{ maxWidth: 680, p: 3, backgroundColor: '#fff' }}>
      <ExamTips />
    </Box>
  ),
};