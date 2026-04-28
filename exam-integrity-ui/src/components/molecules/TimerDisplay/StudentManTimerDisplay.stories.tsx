import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import StudentManTimerDisplay from './StudentManTimerDisplay';

const meta: Meta<typeof StudentManTimerDisplay> = {
  title: 'Molecules/StudentManTimerDisplay',
  component: StudentManTimerDisplay,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StudentManTimerDisplay>;

export const Normal: Story = { args: { remainingSeconds: 2715 } };
export const Urgent: Story = { args: { remainingSeconds: 240 } };
export const LastMinute: Story = { args: { remainingSeconds: 45 } };
export const NoIcon: Story = { args: { remainingSeconds: 1800, showIcon: false } };
