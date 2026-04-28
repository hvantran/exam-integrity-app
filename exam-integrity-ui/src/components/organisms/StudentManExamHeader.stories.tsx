import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import StudentManExamHeader from './StudentManExamHeader';

const meta: Meta<typeof StudentManExamHeader> = {
  title: 'Organisms/StudentManExamHeader',
  component: StudentManExamHeader,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof StudentManExamHeader>;

export const Default: Story = {
  args: {
    currentQuestion: 18,
    totalQuestions: 40,
    remainingSeconds: 2535,
    isProctoringActive: true,
  },
};

export const UrgentTimer: Story = {
  args: {
    currentQuestion: 35,
    totalQuestions: 40,
    remainingSeconds: 240,
    isProctoringActive: true,
  },
};

export const ProctoringOff: Story = {
  args: {
    currentQuestion: 5,
    totalQuestions: 40,
    remainingSeconds: 3500,
    isProctoringActive: false,
  },
};
