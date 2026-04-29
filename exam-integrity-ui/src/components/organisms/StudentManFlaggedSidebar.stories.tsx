import React, { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import StudentManFlaggedSidebar, { StudentManFlaggedSidebarProps } from './StudentManFlaggedSidebar';

export default {
  title: 'Organisms/StudentManFlaggedSidebar',
  component: StudentManFlaggedSidebar,
} as Meta<typeof StudentManFlaggedSidebar>;

const Template: StoryFn<typeof StudentManFlaggedSidebar> = (args: StudentManFlaggedSidebarProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(args.currentQuestion);
  return (
    <StudentManFlaggedSidebar
      {...args}
      currentQuestion={currentQuestion}
      onJumpTo={setCurrentQuestion}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  flaggedMap: { 2: true, 5: true, 7: true },
  totalQuestions: 10,
  currentQuestion: 2,
};

export const NoneFlagged = Template.bind({});
NoneFlagged.args = {
  flaggedMap: {},
  totalQuestions: 10,
  currentQuestion: 1,
};
