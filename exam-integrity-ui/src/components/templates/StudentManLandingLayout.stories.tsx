import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import StudentManLandingLayout from './StudentManLandingLayout';
import { StudentManExamCard } from '../molecules';
import { spacing } from '../../design-system/tokens';

const meta: Meta<typeof StudentManLandingLayout> = {
  title: 'Templates/StudentManLandingLayout',
  component: StudentManLandingLayout,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof StudentManLandingLayout>;

const FILTERS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Toán', value: 'toan' },
  { label: 'Tiếng Việt', value: 'tieng-viet' },
  { label: 'Lớp 4', value: 'lop4' },
  { label: 'Giữa kỳ', value: 'giua-ky' },
];

const ExamGrid = () => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' },
      gap: `${spacing.gutter}px`,
    }}
  >
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
);

export const Default: Story = {
  render: () => (
    <StudentManLandingLayout
      studentName="Nguyễn Văn An"
      studentRole="Lớp 4A"
      activeSection="overview"
      filters={FILTERS}
      activeFilter="all"
    >
      <ExamGrid />
    </StudentManLandingLayout>
  ),
};

export const FilteredBySubject: Story = {
  render: () => (
    <StudentManLandingLayout
      studentName="Trần Thị Bình"
      studentRole="Lớp 5B"
      activeSection="my-exams"
      filters={FILTERS}
      activeFilter="toan"
    >
      <ExamGrid />
    </StudentManLandingLayout>
  ),
};

export const EmptyState: Story = {
  render: () => (
    <StudentManLandingLayout
      studentName="Lê Minh Quân"
      studentRole="Lớp 4C"
      activeSection="results"
      pageTitle="Kết quả"
      pageSubtitle="Lịch sử bài kiểm tra đã hoàn thành."
    >
      <Box sx={{ textAlign: 'center', py: 8, color: '#757684' }}>
        Chưa có kết quả nào.
      </Box>
    </StudentManLandingLayout>
  ),
};
