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
};

export const Empty = Template.bind({});
Empty.args = {
  tips: [],
};
