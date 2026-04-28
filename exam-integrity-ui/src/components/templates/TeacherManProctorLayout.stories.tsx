import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TeacherManProctorLayout from './TeacherManProctorLayout';

const meta: Meta<typeof TeacherManProctorLayout> = {
  title: 'Templates/TeacherManProctorLayout',
  component: TeacherManProctorLayout,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof TeacherManProctorLayout>;

const sampleContent = (
  <div style={{ padding: 24, color: '#444' }}>
    <h2>Noi dung giam sat ky thi</h2>
    <p>Danh sach hoc sinh dang lam bai va trang thai giam sat.</p>
  </div>
);

export const ActiveProctor: Story = {
  args: {
    brandName: 'IntegrityEngine',
    timerDisplay: '00:59:59',
    progressPercent: 25,
    isProctoringActive: true,
    completedCount: 12,
    totalCount: 40,
    activeNavSection: 'exam',
    children: sampleContent,
  },
};

export const HalfComplete: Story = {
  args: {
    ...ActiveProctor.args,
    timerDisplay: '00:30:00',
    progressPercent: 50,
    completedCount: 20,
    activeNavSection: 'exam',
    children: sampleContent,
  },
};
