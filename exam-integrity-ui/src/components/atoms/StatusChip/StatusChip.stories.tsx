import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import StatusChip from './StatusChip';

const meta: Meta<typeof StatusChip> = {
  title: 'Atoms/StatusChip',
  component: StatusChip,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['proctoring', 'pending', 'draft', 'published', 'active', 'neutral'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusChip>;

export const Proctoring: Story = { args: { label: 'Proctoring Active', variant: 'proctoring' } };
export const Pending: Story = { args: { label: '2 Pending', variant: 'pending' } };
export const Draft: Story = { args: { label: 'Draft', variant: 'draft' } };
export const Published: Story = { args: { label: 'Published', variant: 'published' } };
export const Active: Story = { args: { label: 'Active', variant: 'active' } };
export const Neutral: Story = { args: { label: 'Needs Grading', variant: 'neutral' } };
