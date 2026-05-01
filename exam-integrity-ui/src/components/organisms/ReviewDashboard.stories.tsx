import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { ReviewDashboard as ReviewDashboardType } from '../../types/exam.types';
import ReviewDashboard from './ReviewDashboard';

const sampleDashboard: ReviewDashboardType = {
  sessionId: 'session-101',
  totalEarned: 7.5,
  totalMax: 10,
  finalScore10: 7.5,
  missedQuestionNumbers: [2, 6, 9],
  scores: [
    {
      questionId: 'q-1',
      questionNumber: 1,
      earnedPoints: 1,
      maxPoints: 1,
      status: 'CORRECT',
      studentAnswer: 'C',
      correctAnswer: 'C',
    },
    {
      questionId: 'q-2',
      questionNumber: 2,
      earnedPoints: 0,
      maxPoints: 1,
      status: 'INCORRECT',
      studentAnswer: 'A',
      correctAnswer: 'D',
      explanation: 'The correct option is D based on the question context.',
    },
    {
      questionId: 'q-3',
      questionNumber: 3,
      earnedPoints: 2.5,
      maxPoints: 4,
      status: 'PARTIAL',
      studentAnswer: 'Short explanation from student',
      correctAnswer: 'Complete expected explanation',
      explanation: 'You covered one key point but missed two rubric criteria.',
    },
  ],
};

const meta: Meta<typeof ReviewDashboard> = {
  title: 'Organisms/ReviewDashboard',
  component: ReviewDashboard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ReviewDashboard>;

export const Default: Story = {
  args: {
    dashboard: sampleDashboard,
  },
};

export const Loading: Story = {
  args: {
    dashboard: sampleDashboard,
    isLoading: true,
  },
};