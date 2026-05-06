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
    questionText: 'Trong quá trình phiên mã, enzim ARN pôlimeraza có vai trò gì?',
    questionType: 'MCQ',
    options: biologyOptions,
    selectedAnswer: 'A',
    isFlagged: false,
    onAnswerChange: () => {},
    onFlag: () => {},
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

export const MathSimpleAddition: Story = {
  args: {
    questionNumber: 8,
    subject: 'Toan',
    gradeLevel: 'Lop 4',
    questionText: '4 722 + 5 369',
    questionType: 'ESSAY_SHORT',
    selectedAnswer: '10091',
    onAnswerChange: () => {},
  },
};

export const MathSimpleSubtraction: Story = {
  args: {
    questionNumber: 9,
    subject: 'Toan',
    gradeLevel: 'Lop 4',
    questionText: '14 751 - 10 162',
    questionType: 'ESSAY_SHORT',
    selectedAnswer: '',
    onAnswerChange: () => {},
  },
};

export const MathSimpleMultiplication: Story = {
  args: {
    questionNumber: 10,
    subject: 'Toan',
    gradeLevel: 'Lop 4',
    questionText: '5 037 x 4',
    questionType: 'ESSAY_SHORT',
    selectedAnswer: '',
    onAnswerChange: () => {},
  },
};

export const MathComplexMixedOperators: Story = {
  args: {
    questionNumber: 11,
    subject: 'Toan',
    gradeLevel: 'Lop 4',
    questionText: '93 645 : 9 x 5',
    questionType: 'ESSAY_SHORT',
    selectedAnswer: 'Step 1: 93 645 : 9 = 10 405\nStep 2: 10 405 x 5 = 52 025\n52 025',
    onAnswerChange: () => {},
  },
};

export const MathComplexPrecedence: Story = {
  args: {
    questionNumber: 12,
    subject: 'Toan',
    gradeLevel: 'Lop 4',
    questionText: '12 740 + 5 037 x 4',
    questionType: 'ESSAY_SHORT',
    selectedAnswer: 'Step 1: 5 037 x 4 = 20 148\nStep 2: 12 740 + 20 148 = 32 888\n32 888',
    onAnswerChange: () => {},
  },
};

export const EssayWithParts: Story = {
  args: {
    questionNumber: 7,
    subject: 'Toán',
    gradeLevel: 'Lớp 4',
    questionText: 'Tính giá trị của biểu thức:\na) 12 523 + 20 492 : 4\nb) (15 320 – 3 105) x 8',
    questionStem: 'Tính giá trị của biểu thức:',
    questionType: 'ESSAY_SHORT',
    questionParts: [
      { key: 'a', prompt: '12 523 + 20 492 : 4' },
      { key: 'b', prompt: '(15 320 – 3 105) x 8' },
    ],
    selectedAnswerParts: [
      { key: 'a', answer: '' },
      { key: 'b', answer: '' },
    ],
    onAnswerChange: () => {},
    onAnswerPartsChange: () => {},
  },
};

export const Disabled: Story = {
  args: {
    ...MCQ.args,
    disabled: true,
    selectedAnswer: 'A',
  },
};

export const FlaggedQuestion: Story = {
  args: {
    ...MCQ.args,
    isFlagged: true,
  },
};

export const Loading: Story = {
  args: {
    ...MCQ.args,
    isLoading: true,
  },
};
