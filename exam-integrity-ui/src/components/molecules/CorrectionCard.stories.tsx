import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import type { ScoreResult } from '../../types/exam.types';
import CorrectionCard from './CorrectionCard';

const incorrectScore: ScoreResult = {
  questionId: 'q-12',
  questionNumber: 12,
  earnedPoints: 0,
  maxPoints: 1,
  status: 'INCORRECT',
  studentAnswer: 'B. Paris',
  correctAnswer: 'C. Hanoi',
  explanation: 'The capital city of Vietnam is Hanoi.',
};

const incompleteScore: ScoreResult = {
  questionId: 'q-7',
  questionNumber: 7,
  earnedPoints: 0,
  maxPoints: 2,
  status: 'INCOMPLETE_QUESTION',
  studentAnswer: '',
  correctAnswer: 'Water evaporates, forms clouds, then falls as rain.',
};

const meta: Meta<typeof CorrectionCard> = {
  title: 'Molecules/CorrectionCard',
  component: CorrectionCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CorrectionCard>;

export const Incorrect: Story = {
  args: {
    score: incorrectScore,
  },
};

export const Incomplete: Story = {
  args: {
    score: incompleteScore,
  },
};

export const ReviewStack: Story = {
  render: () => (
    <Box sx={{ maxWidth: 720 }}>
      <CorrectionCard score={incorrectScore} />
      <CorrectionCard score={incompleteScore} />
    </Box>
  ),
};

export const Loading: Story = {
  args: {
    score: incorrectScore,
    isLoading: true,
  },
};