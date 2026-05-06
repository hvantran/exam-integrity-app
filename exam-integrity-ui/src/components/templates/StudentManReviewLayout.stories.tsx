import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import StudentManReviewLayout from './StudentManReviewLayout';

const meta: Meta<typeof StudentManReviewLayout> = {
  title: 'Templates/StudentManReviewLayout',
  component: StudentManReviewLayout,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof StudentManReviewLayout>;

export const Default: Story = {
  args: {
    studentName: 'Nguyen Van A',
    activeSection: 'results',
    children: (
      <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>Noi dung ket qua thi</div>
    ),
  },
};

export const MyExams: Story = {
  args: {
    ...Default.args,
    activeSection: 'my-exams',
  },
};
