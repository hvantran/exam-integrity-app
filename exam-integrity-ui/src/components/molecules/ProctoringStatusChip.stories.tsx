import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ProctoringStatusChip from './ProctoringStatusChip';

const meta: Meta<typeof ProctoringStatusChip> = {
  title: 'Molecules/ProctoringStatusChip',
  component: ProctoringStatusChip,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProctoringStatusChip>;

export const Active: Story = { args: { active: true } };
export const Inactive: Story = { args: { active: false } };
export const CustomLabel: Story = { args: { active: true, label: 'Section 04 Live' } };
