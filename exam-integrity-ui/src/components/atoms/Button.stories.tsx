import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger', 'neutral', 'accent', 'warning', 'outlined'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Tiếp theo',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Quay lại',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Gắn cờ',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Nộp bài',
  },
};

export const Neutral: Story = {
  args: {
    variant: 'neutral',
    children: 'Trước đó',
  },
};

export const Accent: Story = {
  args: {
    variant: 'accent',
    children: 'Tiếp tục',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Xem lại câu gắn cờ',
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Đang xử lý...',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Không khả dụng',
  },
};

export const Small: Story = {
  args: {
    variant: 'secondary',
    size: 'sm',
    children: 'Nhỏ',
  },
};

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: 'Nộp bài thi',
  },
};

export const FullWidth: Story = {
  args: {
    variant: 'primary',
    fullWidth: true,
    children: 'Tạo bài thi mới',
  },
};
