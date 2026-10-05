import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import StudentExamGradeSwitcher, {
  StudentExamSummary,
} from './StudentExamGradeSwitcher';

const mockStudents: StudentExamSummary[] = [
  {
    sessionId: 'sess-001',
    studentId: 'CS2025-0842',
    studentName: 'Elena Rostova',
    examTitle: 'CS 304: Distributed Systems Midterm',
    totalEarned: 96,
    totalMax: 100,
    finalScore10: 9.6,
    pendingEssayCount: 1,
    submittedAt: '2026-05-14T11:42:00Z',
  },
  {
    sessionId: 'sess-002',
    studentId: 'CS2025-0119',
    studentName: 'Marcus Chen',
    examTitle: 'CS 304: Distributed Systems Midterm',
    totalEarned: 94,
    totalMax: 100,
    finalScore10: 9.4,
    pendingEssayCount: 0,
    submittedAt: '2026-05-14T11:30:00Z',
  },
  {
    sessionId: 'sess-003',
    studentId: 'CS2025-0453',
    studentName: 'Aisha Patel',
    examTitle: 'CS 304: Distributed Systems Midterm',
    totalEarned: 82,
    totalMax: 100,
    finalScore10: 8.2,
    pendingEssayCount: 0,
    submittedAt: '2026-05-14T11:15:00Z',
  },
  {
    sessionId: 'sess-004',
    studentId: 'CS2025-0328',
    studentName: 'Sophia Martinez',
    examTitle: 'CS 304: Distributed Systems Midterm',
    totalEarned: 64,
    totalMax: 100,
    finalScore10: 6.4,
    pendingEssayCount: 2,
    submittedAt: '2026-05-14T11:45:00Z',
  },
  {
    sessionId: 'sess-005',
    studentId: 'CS2025-0912',
    studentName: 'Lucas Dubois',
    examTitle: 'CS 304: Distributed Systems Midterm',
    totalEarned: 42,
    totalMax: 100,
    finalScore10: 4.2,
    pendingEssayCount: 1,
    submittedAt: '2026-05-14T11:50:00Z',
  },
];

const meta: Meta<typeof StudentExamGradeSwitcher> = {
  title: 'Organisms/StudentExamGradeSwitcher',
  component: StudentExamGradeSwitcher,
};

export default meta;
type Story = StoryObj<typeof StudentExamGradeSwitcher>;

export const Default: Story = {
  render: () => {
    const [selectedSessionId, setSelectedSessionId] = useState('sess-001');
    return (
      <div className="max-w-md p-4">
        <StudentExamGradeSwitcher
          students={mockStudents}
          selectedSessionId={selectedSessionId}
          onSelectStudent={(student) => setSelectedSessionId(student.sessionId)}
        />
      </div>
    );
  },
};
