import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import TeacherManScoringPage from './TeacherManScoringPage';
import { useAuth } from '../context/AuthContext';
import { useNavDockMode } from '../hooks/useNavDockMode';
import {
  useReviewDashboard,
  useTeacherScore,
  useTeacherScoringQueue,
} from '../hooks/useReviewDashboard';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../hooks/useNavDockMode', () => ({
  useNavDockMode: jest.fn(),
  TEACHER_NAV_DOCK_STORAGE_KEY: 'test_dock_key',
}));

jest.mock('../hooks/useReviewDashboard', () => ({
  useTeacherScoringQueue: jest.fn(),
  useReviewDashboard: jest.fn(),
  useTeacherScore: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('TeacherManScoringPage', () => {
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      displayName: 'Teacher User',
      logout: jest.fn(),
    });
    (useNavDockMode as jest.Mock).mockReturnValue(['pinned', jest.fn()]);
    (useTeacherScore as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
    (useTeacherScoringQueue as jest.Mock).mockReturnValue({
      data: [
        {
          sessionId: 'session-123',
          examTitle: 'Midterm Exam',
          studentId: 'student-456',
          pendingEssayCount: 1,
          totalEarned: 5,
          totalMax: 10,
          submittedAt: '2026-10-17T08:00:00Z',
        },
      ],
      isLoading: false,
    });
    (useReviewDashboard as jest.Mock).mockReturnValue({
      data: {
        sessionId: 'session-123',
        examTitle: 'Midterm Exam',
        finalScore10: 5.0,
        scores: [
          {
            questionId: 'q-essay-1',
            questionNumber: 1,
            questionText: 'Explain photosynthesis.',
            questionType: 'ESSAY',
            earnedPoints: 2.5,
            maxPoints: 5.0,
            studentAnswer: 'Plants make food with sunlight.',
            correctAnswer: 'Plants convert solar energy into chemical energy.',
            status: 'PENDING_REVIEW',
            explanation: '',
          },
        ],
      },
      isLoading: false,
    });
  });

  it('renders essay question and scoring buttons', () => {
    render(<TeacherManScoringPage />);

    expect(screen.getByText('Essay Scoring')).toBeInTheDocument();
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Explain photosynthesis.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mark correct/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save score/i })).toBeInTheDocument();
  });

  it('calls teacherScore.mutate with max score when Mark correct is clicked', () => {
    render(<TeacherManScoringPage />);

    const markCorrectBtn = screen.getByRole('button', { name: /mark correct/i });
    fireEvent.click(markCorrectBtn);

    expect(mockMutate).toHaveBeenCalledWith(
      {
        questionId: 'q-essay-1',
        payload: {
          earnedPoints: 5.0,
          explanation: undefined,
        },
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );

    const pointsInput = screen.getByLabelText(/awarded points/i) as HTMLInputElement;
    expect(pointsInput.value).toBe('5');
  });

  it('calls teacherScore.mutate with entered score when Save score is clicked', () => {
    render(<TeacherManScoringPage />);

    const pointsInput = screen.getByLabelText(/awarded points/i);
    fireEvent.change(pointsInput, { target: { value: '4' } });

    const saveScoreBtn = screen.getByRole('button', { name: /save score/i });
    fireEvent.click(saveScoreBtn);

    expect(mockMutate).toHaveBeenCalledWith(
      {
        questionId: 'q-essay-1',
        payload: {
          earnedPoints: 4,
          explanation: undefined,
        },
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });
});
