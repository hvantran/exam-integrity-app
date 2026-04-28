import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import StudentManPortalSidebar from './StudentManPortalSidebar';

const meta: Meta<typeof StudentManPortalSidebar> = {
  title: 'Organisms/StudentManPortalSidebar',
  component: StudentManPortalSidebar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof StudentManPortalSidebar>;

export const Overview: Story = {
  args: { activeSection: 'overview', studentName: 'Nguyễn Văn An', studentRole: 'Lớp 4A' },
};

export const MyExams: Story = {
  args: { activeSection: 'my-exams', studentName: 'Trần Thị Bình', studentRole: 'Lớp 5B' },
};

export const Results: Story = {
  args: { activeSection: 'results', studentName: 'Lê Minh Quân', studentRole: 'Lớp 4C' },
};
