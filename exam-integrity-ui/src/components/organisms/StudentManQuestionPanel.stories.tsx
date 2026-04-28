import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import StudentManQuestionPanel from './StudentManQuestionPanel';

const meta: Meta<typeof StudentManQuestionPanel> = {
  title: 'Organisms/StudentManQuestionPanel',
  component: StudentManQuestionPanel,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StudentManQuestionPanel>;

const biologyOptions = [
  { key: 'A', text: 'Tháo xoắn phân tử ADN và xúc tác tổng hợp mạch ARN mới.' },
  { key: 'B', text: 'Tháo xoắn phân tử ADN và gắn các nuclêôtit tự do vào mạch khuôn.' },
  { key: 'C', text: 'Nối các đoạn Okazaki lại với nhau tạo thành mạch pôlinuclêôtit hoàn chỉnh.' },
  { key: 'D', text: 'Xúc tác hình thành liên kết hiđrô giữa các nuclêôtit.' },
];

export const MCQ: Story = {
  args: {
    questionNumber: 18,
    subject: 'Sinh học',
    gradeLevel: 'Lớp 12',
    questionText:
      'Trong quá trình phiên mã, enzim ARN pôlimeraza có vai trò gì?',
    questionType: 'MCQ',
    options: biologyOptions,
    selectedAnswer: 'A',
    onAnswerChange: () => {},
  },
};

export const MCQUnanswered: Story = {
  args: {
    ...MCQ.args,
    selectedAnswer: undefined,
  },
};

export const Essay: Story = {
  args: {
    questionNumber: 5,
    subject: 'Toán',
    gradeLevel: 'Lớp 11',
    questionText:
      'Chứng minh rằng: với mọi số nguyên n ≥ 1, tổng 1² + 2² + ... + n² = n(n+1)(2n+1)/6.',
    questionType: 'ESSAY_SHORT',
    selectedAnswer: '',
    onAnswerChange: () => {},
  },
};

export const Disabled: Story = {
  args: {
    ...MCQ.args,
    disabled: true,
    selectedAnswer: 'A',
  },
};
