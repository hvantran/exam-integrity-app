import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import StudentManExamCard from './StudentManExamCard';

const meta: Meta<typeof StudentManExamCard> = {
  title: 'Molecules/StudentManExamCard',
  component: StudentManExamCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StudentManExamCard>;

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
      <StudentManExamCard
        title="Thi giữa kỳ Toán lớp 4 - MÃ ĐỀ 01"
        subject="Toán"
        grade="Lớp 4"
        type="Giữa kỳ"
        durationMinutes={45}
        questionCount={20}
        points={10}
        isHighlighted
      />
      <StudentManExamCard
        title="Kiểm tra Đọc hiểu Tuần 12"
        subject="Tiếng Việt"
        grade="Lớp 4"
        type="Đọc hiểu"
        durationMinutes={30}
        questionCount={15}
        points={10}
      />
      <StudentManExamCard
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
