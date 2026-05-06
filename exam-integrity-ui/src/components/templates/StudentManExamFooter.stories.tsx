import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import StudentManExamFooter from './StudentManExamFooter';
import { StudentManExamNavigationBar } from '../organisms';

const meta: Meta<typeof StudentManExamFooter> = {
  title: 'Templates/StudentManExamFooter',
  component: StudentManExamFooter,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof StudentManExamFooter>;

export const Default: Story = {
  render: () => (
    <StudentManExamFooter>
      <StudentManExamNavigationBar
        canGoPrev
        canGoNext
        onPrevious={() => {}}
        onNext={() => {}}
        onSubmit={() => {}}
      />
    </StudentManExamFooter>
  ),
};
