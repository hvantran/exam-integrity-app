import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Badge from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'neutral', 'warning'],
    },
    size: { control: 'select', options: ['sm', 'md'] },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = { args: { count: 3 } };
export const Error: Story = { args: { count: 2, color: 'error' } };
export const Warning: Story = { args: { count: 5, color: 'warning' } };
export const Secondary: Story = { args: { count: 12, color: 'secondary' } };
export const Neutral: Story = { args: { count: 42, color: 'neutral' } };
export const Capped: Story = { args: { count: 150, max: 99, color: 'primary' } };
export const Small: Story = { args: { count: 7, size: 'sm' } };
