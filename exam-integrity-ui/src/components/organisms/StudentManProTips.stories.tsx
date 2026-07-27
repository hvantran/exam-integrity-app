import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import StudentManProTips, { StudentManProTipsProps } from './StudentManProTips';

export default {
  title: 'Organisms/StudentManProTips',
  component: StudentManProTips,
} as Meta<typeof StudentManProTips>;

const Template: StoryFn<typeof StudentManProTips> = (args) => <StudentManProTips {...args} />;

export const Default = Template.bind({});
Default.args = {
  tips: [
    'Read each question carefully before answering.',
    'Manage your time wisely during the exam.',
    'Do not refresh or close your browser tab.',
    'Flag questions you want to review later.',
    'Stay calm and focused throughout the exam.',
  ],
  variant: 'high',
};

export const Elementary = Template.bind({});
Elementary.args = {
  tips: [
    'Read the question slowly and underline important numbers.',
    'Answer easy questions first to build confidence.',
    'Re-check your final choice before moving on.',
  ],
  variant: 'elementary',
};

export const Middle = Template.bind({});
Middle.args = {
  tips: [
    'Split your time into first pass and review pass.',
    'Mark uncertain questions and revisit with fresh focus.',
    'Double-check operation signs and units.',
  ],
  variant: 'middle',
};

export const Empty = Template.bind({});
Empty.args = {
  tips: [],
};
