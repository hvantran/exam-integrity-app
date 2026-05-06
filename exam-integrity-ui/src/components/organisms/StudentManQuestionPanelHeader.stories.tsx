import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import StudentManQuestionPanelHeader from './StudentManQuestionPanelHeader';

const meta: Meta<typeof StudentManQuestionPanelHeader> = {
  title: 'Organisms/StudentManQuestionPanelHeader',
  component: StudentManQuestionPanelHeader,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StudentManQuestionPanelHeader>;

export const Default: Story = {
  args: {
    questionNumber: 4,
    subject: 'Biology',
    gradeLevel: 'Grade 10',
    isFlagged: false,
    onFlag: () => {},
  },
};

export const Flagged: Story = {
  args: {
    questionNumber: 4,
    subject: 'Biology',
    gradeLevel: 'Grade 10',
    isFlagged: true,
    onFlag: () => {},
  },
};
