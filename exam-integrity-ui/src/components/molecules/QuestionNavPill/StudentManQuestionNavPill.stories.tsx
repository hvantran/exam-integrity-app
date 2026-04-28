import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import StudentManQuestionNavPill from './StudentManQuestionNavPill';

const meta: Meta<typeof StudentManQuestionNavPill> = {
  title: 'Molecules/StudentManQuestionNavPill',
  component: StudentManQuestionNavPill,
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: 'select',
      options: ['unanswered', 'answered', 'flagged', 'current'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof StudentManQuestionNavPill>;

export const Unanswered: Story = { args: { questionNumber: 1, state: 'unanswered' } };
export const Answered: Story = { args: { questionNumber: 5, state: 'answered' } };
export const Flagged: Story = { args: { questionNumber: 12, state: 'flagged' } };
export const Current: Story = { args: { questionNumber: 18, state: 'current' } };

export const FullGrid: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxWidth: 320 }}>
      {Array.from({ length: 40 }, (_, i) => {
        const states = ['answered', 'answered', 'unanswered', 'flagged', 'current'] as const;
        const idx = i % states.length;
        return (
          <StudentManQuestionNavPill
            key={i}
            questionNumber={i + 1}
            state={i === 17 ? 'current' : i < 12 ? 'answered' : i === 15 ? 'flagged' : 'unanswered'}
          />
        );
      })}
    </Box>
  ),
};
