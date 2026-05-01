import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import ExamCard from './ExamCard';

const meta: Meta<typeof ExamCard> = {
  title: 'Molecules/ExamCard',
  component: ExamCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ExamCard>;

export const Highlighted: Story = {
  args: {
    title: 'Thi giữa kỳ Toán lớp 4 - MÃ ĐỀ 01',
    subject: 'Toán',
    grade: 'Lớp 4',
    type: 'Giữa kỳ',
    durationMinutes: 45,
    questionCount: 20,
    points: 10,
    isHighlighted: true,
  },
};

export const Default: Story = {
  args: {
    title: 'Kiểm tra Đọc hiểu Tuần 12',
    subject: 'Tiếng Việt',
    grade: 'Lớp 4',
    type: 'Đọc hiểu',
    durationMinutes: 30,
    questionCount: 15,
    points: 10,
    isHighlighted: false,
  },
};

export const Grid: Story = {
  render: () => (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, p: 3 }}>
      <ExamCard
        title="Thi giữa kỳ Toán lớp 4 - MÃ ĐỀ 01"
        subject="Toán"
        grade="Lớp 4"
        type="Giữa kỳ"
        durationMinutes={45}
        questionCount={20}
        points={10}
        isHighlighted
      />
      <ExamCard
        title="Kiểm tra Đọc hiểu Tuần 12"
        subject="Tiếng Việt"
        grade="Lớp 4"
        type="Đọc hiểu"
        durationMinutes={30}
        questionCount={15}
        points={10}
      />
      <ExamCard
        title="Bài Test Thường Xuyên - Chủ đề 3"
        subject="Khoa học"
        grade="Lớp 4"
        durationMinutes={20}
        questionCount={10}
        points={10}
      />
    </Box>
  ),
};
