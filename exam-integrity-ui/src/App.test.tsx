import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

let mockRoles = ['ADMIN'];

jest.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    user: { username: 'admin-user', roles: mockRoles, firstName: 'Admin', lastName: 'User' },
    isLoading: false,
    isLoggingOut: false,
    logout: jest.fn(),
    isAdmin: mockRoles.includes('ADMIN'),
    isTeacher: mockRoles.includes('TEACHER'),
    isStudent: !mockRoles.includes('ADMIN') && !mockRoles.includes('TEACHER'),
    canSwitchGrade: mockRoles.includes('ADMIN') || mockRoles.includes('TEACHER'),
    displayName: 'Admin User',
    overrideGrade: null,
    setOverrideGrade: jest.fn(),
    effectiveGrade: null,
  }),
}));

jest.mock('./pages/StudentManDashboardPage', () => () => <div>Student dashboard</div>);
jest.mock('./pages/StudentManMyExamsPage', () => () => <div>My exams</div>);
jest.mock('./pages/StudentManExamPage', () => () => <div>Exam</div>);
jest.mock('./pages/ReviewPage', () => () => <div>Review</div>);
jest.mock('./pages/TeacherManExamPdfUploadPage', () => () => <div>Ingestion</div>);
jest.mock('./pages/QuestionReviewPage', () => () => <div>Question review</div>);
jest.mock('./pages/TeacherManQuestionBankPage', () => () => <div>Question bank</div>);
jest.mock('./pages/TeacherManFinalPublicationPage', () => () => <div>Final publication</div>);
jest.mock('./pages/TeacherManDashboardPage', () => () => <div>Teacher dashboard</div>);
jest.mock('./pages/TeacherManScoringPage', () => () => <div>Teacher scoring</div>);
jest.mock('./components/AppToastContainer', () => () => null);

describe('App', () => {
  beforeEach(() => {
    mockRoles = ['ADMIN'];
    window.history.replaceState({}, '', '/');
  });

  it('routes an administrator from root to the teacher dashboard', async () => {
    render(<App />);

    expect(await screen.findByText('Teacher dashboard')).toBeTruthy();
  });

  it('routes a teacher from root to the teacher dashboard', async () => {
    mockRoles = ['TEACHER'];

    render(<App />);

    expect(await screen.findByText('Teacher dashboard')).toBeTruthy();
  });
});
