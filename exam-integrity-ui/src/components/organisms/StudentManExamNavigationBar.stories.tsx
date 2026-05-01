import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import StudentManExamNavigationBar from './StudentManExamNavigationBar';

const meta: Meta<typeof StudentManExamNavigationBar> = {
  title: 'Organisms/StudentManExamNavigationBar',
  component: StudentManExamNavigationBar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StudentManExamNavigationBar>;

export const Default: Story = {
  args: {
    canGoPrev: true,
    canGoNext: true,
    onPrevious: () => {},
    onNext: () => {},
    onSubmit: () => {},
  },
};

export const FirstQuestion: Story = {
  args: { ...Default.args, canGoPrev: false },
};

export const LastQuestion: Story = {
  args: {
    ...Default.args,
    canGoNext: false,
    isLastQuestion: true,
    flaggedCount: 3,
    onReviewFlagged: () => {},
  },
};

export const ReviewModeNoMovement: Story = {
  args: {
    ...Default.args,
    canGoPrev: false,
    canGoNext: false,
    flaggedCount: 1,
    isLastQuestion: true,
    onReviewFlagged: () => {},
  },
};
