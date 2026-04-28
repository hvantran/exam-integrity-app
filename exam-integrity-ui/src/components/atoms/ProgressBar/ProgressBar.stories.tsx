import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ProgressBar from './ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Atoms/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Start: Story = { args: { value: 5 } };
export const HalfWay: Story = { args: { value: 50 } };
export const NearEnd: Story = { args: { value: 90 } };
export const Urgent: Story = { args: { value: 70, urgent: true } };
export const Complete: Story = { args: { value: 100 } };
