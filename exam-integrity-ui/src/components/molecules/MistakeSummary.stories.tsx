import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Typography } from '@mui/material';
import MistakeSummary from './MistakeSummary';

const meta: Meta<typeof MistakeSummary> = {
  title: 'Molecules/MistakeSummary',
  component: MistakeSummary,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MistakeSummary>;

export const WithMissedQuestions: Story = {
  args: {
    missedNumbers: [2, 5, 9, 14],
  },
};

export const ManyQuestions: Story = {
  args: {
    missedNumbers: [1, 3, 4, 6, 7, 10, 12, 13, 18],
  },
};

export const Empty: Story = {
  render: () => (
    <Box sx={{ p: 2 }}>
      <MistakeSummary missedNumbers={[]} />
      <Typography sx={{ fontSize: '13px', color: '#6b7280' }}>
        No summary is rendered when there are no missed questions.
      </Typography>
    </Box>
  ),
};