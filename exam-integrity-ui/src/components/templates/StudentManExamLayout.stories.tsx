import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Typography } from '@mui/material';
import StudentManExamLayout from './StudentManExamLayout';
import { StudentManExamHeader, StudentManQuestionPanel, StudentManExamNavigationBar } from '../organisms';

const meta: Meta<typeof StudentManExamLayout> = {
  title: 'Templates/StudentManExamLayout',
  component: StudentManExamLayout,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof StudentManExamLayout>;

const options = [
  { key: 'A', text: 'Tháo xoắn phân tử ADN và xúc tác tổng hợp mạch ARN mới.' },
  { key: 'B', text: 'Tháo xoắn phân tử ADN và gắn các nuclêôtit tự do vào mạch khuôn.' },
  { key: 'C', text: 'Nối các đoạn Okazaki lại với nhau tạo thành mạch pôlinuclêôtit hoàn chỉnh.' },
  { key: 'D', text: 'Xúc tác hình thành liên kết hiđrô giữa các nuclêôtit.' },
];

export const ActiveExam: Story = {
  render: () => (
    <StudentManExamLayout
      header={
        <StudentManExamHeader
          currentQuestion={18}
          totalQuestions={40}
          remainingSeconds={2535}
          isProctoringActive
        />
      }
      footer={
        <StudentManExamNavigationBar
          canGoPrev
          canGoNext
          isFlagged={false}
          onPrevious={() => {}}
          onNext={() => {}}
          onFlag={() => {}}
          onSubmit={() => {}}
        />
      }
      proTips={[
        'Read the question carefully before attempting to answer.',
        'Use the workspace provided for intermediate calculations to avoid careless mistakes.',
        'You can flag questions to review them later before submitting the exam.'
      ]}
    >
      <StudentManQuestionPanel
        questionNumber={18}
        subject="Sinh học"
        gradeLevel="Lớp 12"
        questionText="Trong quá trình phiên mã, enzim ARN pôlimeraza có vai trò gì?"
        questionType="MCQ"
        options={options}
        selectedAnswer="A"
        onAnswerChange={() => {}}
      />
    </StudentManExamLayout>
  ),
};
