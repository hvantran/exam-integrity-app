import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TeacherManFinalPublicationLayout from './TeacherManFinalPublicationLayout';
import type { FinalPublicationFormValues } from './TeacherManFinalPublicationLayout';
import type { DraftQuestionDTO } from '../../types/exam.types';

// Mock image data (1x1 transparent PNG)
const MOCK_IMAGE_DATA = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Mock questions for verification section
const MOCK_QUESTIONS: DraftQuestionDTO[] = [
  {
    id: 'q1',
    questionNumber: 1,
    content: 'What is the capital of France?',
    type: 'MCQ',
    points: 5,
    options: ['Paris', 'London', 'Berlin', 'Madrid'],
    correctAnswer: 'A',
    truncated: false,
    parserConfidence: 0.95,
    reviewStatus: 'APPROVED',
    imageData: MOCK_IMAGE_DATA,
  },
  {
    id: 'q2',
    questionNumber: 2,
    content: 'Solve: 2x + 5 = 13',
    type: 'MCQ',
    points: 3,
    options: ['x = 4', 'x = 5', 'x = 6', 'x = 7'],
    correctAnswer: 'A',
    truncated: false,
    parserConfidence: 0.88,
    reviewStatus: 'CORRECTED',
  },
  {
    id: 'q3',
    questionNumber: 3,
    content: 'Explain photosynthesis in 200 words.',
    type: 'ESSAY_SHORT',
    points: 10,
    truncated: false,
    parserConfidence: 0.72,
    reviewStatus: 'APPROVED',
    imageData: MOCK_IMAGE_DATA,
  },
  {
    id: 'q4',
    questionNumber: 4,
    content: 'Multiple choice without image',
    type: 'MCQ',
    points: 2,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 'B',
    truncated: false,
    parserConfidence: 0.90,
    reviewStatus: 'PENDING',
  },
  {
    id: 'q5',
    questionNumber: 5,
    content: 'This question was excluded from publication',
    type: 'MCQ',
    points: 0,
    truncated: false,
    parserConfidence: 0.50,
    reviewStatus: 'EXCLUDED',
  },
];

const meta: Meta<typeof TeacherManFinalPublicationLayout> = {
  title: 'Templates/TeacherManFinalPublicationLayout',
  component: TeacherManFinalPublicationLayout,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof TeacherManFinalPublicationLayout>;

export const Default: Story = {
  args: {
    userName: 'Dr. Nguyen',
    userRole: 'Senior Examiner',
    stats: {
      approvedQuestions: 45,
      totalPoints: 100,
      essayRubricsStatus: 'Ready',
    },
    formValues: {
      examTitle: 'Math Grade 4 Midterm - 2024',
      durationSeconds: 2700,
      tags: ['math', 'grade4', 'midterm'],
      reviewNotes: 'Checked against curriculum standards. Ready for deployment.',
    },
    questions: MOCK_QUESTIONS,
  },
};

export const Interactive: Story = {
  render: () => {
    const [form, setForm] = useState<FinalPublicationFormValues>({
      examTitle: 'Math Grade 4 Midterm - 2024',
      durationSeconds: 2700,
      tags: ['math', 'grade4'],
      reviewNotes: '',
    });

    return (
      <TeacherManFinalPublicationLayout
        userName="Dr. Nguyen"
        stats={{ approvedQuestions: 45, totalPoints: 100, essayRubricsStatus: 'Ready' }}
        formValues={form}
        onFormChange={(field, value) =>
          setForm((prev) => ({
            ...prev,
            [field]: value,
          }))
        }
        onSaveDraft={() => alert('Draft saved')}
        onPublish={() => alert('Exam published!')}
        questions={MOCK_QUESTIONS}
      />
    );
  },
};

export const Loading: Story = {
  args: {
    userName: 'Dr. Nguyen',
    userRole: 'Senior Examiner',
    isLoading: true,
  },
};
