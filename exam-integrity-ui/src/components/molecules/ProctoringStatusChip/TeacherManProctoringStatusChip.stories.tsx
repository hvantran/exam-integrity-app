import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TeacherManProctoringStatusChip from './TeacherManProctoringStatusChip';

const meta: Meta<typeof TeacherManProctoringStatusChip> = {
  title: 'Molecules/TeacherManProctoringStatusChip',
  component: TeacherManProctoringStatusChip,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TeacherManProctoringStatusChip>;

export const Active: Story = { args: { active: true } };
export const Inactive: Story = { args: { active: false } };
export const CustomLabel: Story = { args: { active: true, label: 'Section 04 Live' } };
