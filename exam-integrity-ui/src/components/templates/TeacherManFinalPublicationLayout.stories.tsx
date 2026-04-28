import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TeacherManFinalPublicationLayout from './TeacherManFinalPublicationLayout';
import type { FinalPublicationFormValues } from './TeacherManFinalPublicationLayout';

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
