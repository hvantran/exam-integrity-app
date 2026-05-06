import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import StudentManExamContent from './StudentManExamContent';
import {
  StudentManQuestionPanel,
  StudentManFlaggedSidebar,
  StudentManExamNavigationBar,
} from '../organisms';

const meta: Meta<typeof StudentManExamContent> = {
  title: 'Templates/StudentManExamContent',
  component: StudentManExamContent,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof StudentManExamContent>;

export const Default: Story = {
  render: () => (
    <StudentManExamContent
      proTips={[
        'Read each question completely before answering.',
        'Mark uncertain questions and revisit them later.',
      ]}
    >
      <StudentManQuestionPanel
        questionNumber={3}
        questionText="Sample question text"
        questionType="MCQ"
        options={[
          { key: 'A', text: 'Option A' },
          { key: 'B', text: 'Option B' },
        ]}
        selectedAnswer="A"
        onAnswerChange={() => {}}
      />
    </StudentManExamContent>
  ),
};

export const WithSidebar: Story = {
  render: () => (
    <StudentManExamContent
      proTips={[
        'Read each question completely before answering.',
        'Mark uncertain questions and revisit them later.',
      ]}
    >
      <StudentManQuestionPanel
        questionNumber={3}
        questionText="Sample question text"
        questionType="MCQ"
        options={[
          { key: 'A', text: 'Option A' },
          { key: 'B', text: 'Option B' },
        ]}
        selectedAnswer="A"
        onAnswerChange={() => {}}
      />
    </StudentManExamContent>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <StudentManExamContent
      proTips={[
        'Read each question completely before answering.',
        'Mark uncertain questions and revisit them later.',
      ]}
      footer={
        <StudentManExamNavigationBar
          canGoPrev
          canGoNext
          onPrevious={() => {}}
          onNext={() => {}}
          onSubmit={() => {}}
        />
      }
    >
      <StudentManQuestionPanel
        questionNumber={3}
        questionText="Sample question text"
        questionType="MCQ"
        options={[
          { key: 'A', text: 'Option A' },
          { key: 'B', text: 'Option B' },
        ]}
        selectedAnswer="A"
        onAnswerChange={() => {}}
      />
    </StudentManExamContent>
  ),
};
