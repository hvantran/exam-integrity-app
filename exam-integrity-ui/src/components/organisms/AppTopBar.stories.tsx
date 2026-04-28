import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import AppTopBar from './AppTopBar';

const meta: Meta<typeof AppTopBar> = {
  title: 'Organisms/AppTopBar',
  component: AppTopBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AppTopBar>;

export const Default: Story = {
  args: {
    appTitle: 'He thong Khao thi Minh bach',
    userName: 'Nguyen Minh Tu',
    showSearch: true,
  },
};

export const StudentPortal: Story = {
  args: {
    appTitle: 'Portal Kiem Tra',
    userName: 'Tran Van An',
    showSearch: true,
  },
};

export const NoSearch: Story = {
  args: {
    ...Default.args,
    showSearch: false,
  },
};
