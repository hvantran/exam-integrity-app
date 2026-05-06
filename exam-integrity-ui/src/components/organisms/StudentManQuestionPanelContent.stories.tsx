import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import StudentManQuestionPanelContent from './StudentManQuestionPanelContent';

const meta: Meta<typeof StudentManQuestionPanelContent> = {
  title: 'Organisms/StudentManQuestionPanelContent',
  component: StudentManQuestionPanelContent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StudentManQuestionPanelContent>;

export const Mcq: Story = {
  args: {
    questionNumber: 7,
    questionText: 'Which option is correct?',
    questionType: 'MCQ',
    options: [
      { key: 'A', text: 'Option A' },
      { key: 'B', text: 'Option B' },
      { key: 'C', text: 'Option C' },
    ],
    selectedAnswer: 'A',
    onAnswerChange: () => {},
  },
};

export const Essay: Story = {
  args: {
    questionNumber: 7,
    questionText: 'Explain your reasoning.',
    questionType: 'ESSAY_SHORT',
    selectedAnswer: '',
    onAnswerChange: () => {},
  },
};

export const SimpleMathFormula: Story = {
  args: {
    questionNumber: 8,
    questionText: 'Solve the following arithmetic problems.',
    questionStem: 'Calculate each part below:',
    questionType: 'ESSAY_LONG',
    questionParts: [
      { key: 'a', prompt: '12 + 45' },
      { key: 'b', prompt: '100 - 37' },
      { key: 'c', prompt: '6 × 8' },
      { key: 'd', prompt: '96 ÷ 4' },
    ],
    selectedAnswerParts: [],
    onAnswerChange: () => {},
    onAnswerPartsChange: () => {},
  },
};

export const ComplexMathFormula: Story = {
  args: {
    questionNumber: 9,
    questionText: 'Solve the multi-step mathematical expressions below.',
    questionStem: 'Evaluate each expression step by step:',
    questionType: 'ESSAY_LONG',
    questionParts: [
      { key: 'a', prompt: '(3 + 5) × 2 - 4 ÷ 2' },
      { key: 'b', prompt: '2^3 + 4 × (7 - 3) ÷ 2' },
      { key: 'c', prompt: 'sqrt(144) + 5^2 - 3 × 4' },
    ],
    selectedAnswerParts: [],
    onAnswerChange: () => {},
    onAnswerPartsChange: () => {},
  },
};
