import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import type { DraftQuestionDTO } from '../../types/exam.types';
import QuestionDisplay from './QuestionDisplay';

const mcqQuestion: DraftQuestionDTO = {
  id: 'q-mcq-1',
  questionNumber: 1,
  content: 'Which city is the capital of Vietnam?',
  type: 'MCQ',
  points: 1,
  options: ['A. Ho Chi Minh City', 'B. Da Nang', 'C. Hanoi', 'D. Hue'],
  correctAnswer: 'C',
  truncated: false,
  parserConfidence: 0.94,
  reviewStatus: 'APPROVED',
};

const calculationQuestion: DraftQuestionDTO = {
  id: 'q-calc-1',
  questionNumber: 2,
  content: 'Solve the following; 245 + 136 = ....; 900 - 275 = ....; 24 × 3 = ....',
  type: 'ESSAY_SHORT',
  points: 3,
  truncated: false,
  parserConfidence: 0.89,
  reviewStatus: 'CORRECTED',
};

const essayQuestion: DraftQuestionDTO = {
  id: 'q-essay-1',
  questionNumber: 3,
  content:
    'Explain why regular reading is helpful for primary school students. Include at least two benefits.',
  type: 'ESSAY_LONG',
  points: 4,
  truncated: false,
  parserConfidence: 0.92,
  rubric: {
    keywords: ['vocabulary', 'imagination', 'knowledge'],
  },
  reviewStatus: 'APPROVED',
};

const lowConfidenceQuestion: DraftQuestionDTO = {
  id: 'q-low-1',
  questionNumber: 4,
  content: 'Read the OCR output and determine the correct operation: 48 ... 12 = ....',
  type: 'ESSAY_SHORT',
  points: 2,
  truncated: false,
  parserConfidence: 0.53,
  parserWarnings: ['Possible OCR mismatch', 'Missing operator symbol'],
  reviewStatus: 'PENDING',
};

const meta: Meta<typeof QuestionDisplay> = {
  title: 'Molecules/QuestionDisplay',
  component: QuestionDisplay,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof QuestionDisplay>;

export const MultipleChoice: Story = {
  args: {
    question: mcqQuestion,
    index: 0,
  },
};

export const Calculation: Story = {
  args: {
    question: calculationQuestion,
    index: 1,
  },
};

export const Essay: Story = {
  args: {
    question: essayQuestion,
    index: 2,
  },
};

export const LowConfidence: Story = {
  args: {
    question: lowConfidenceQuestion,
    index: 3,
  },
};

export const ReviewList: Story = {
  render: () => (
    <Box sx={{ maxWidth: 820 }}>
      <QuestionDisplay question={mcqQuestion} index={0} />
      <QuestionDisplay question={calculationQuestion} index={1} />
      <QuestionDisplay question={essayQuestion} index={2} />
    </Box>
  ),
};

export const Loading: Story = {
  args: {
    question: mcqQuestion,
    index: 0,
    isLoading: true,
  },
};
