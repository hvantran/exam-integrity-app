import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ExamIntegrityTeacherScoringTemplate,
  type ExamIntegrityDashboardSection as DashboardSection,
} from '@hvantran/ui-component-library';
import { useAuth } from '../context/AuthContext';
import { useNavDockMode, TEACHER_NAV_DOCK_STORAGE_KEY } from '../hooks/useNavDockMode';
import {
  useReviewDashboard,
  useTeacherScore,
  useTeacherScoringQueue,
  useMarkAllIncorrect,
} from '../hooks/useReviewDashboard';

const SECTION_ROUTES: Record<DashboardSection, string> = {
  dashboard: '/teacher/dashboard',
  ingestion: '/teacher/ingestion',
  review: '/teacher/ingestion',
  scoring: '/teacher/scoring',
  'question-bank': '/teacher/question-bank',
  reports: '/teacher/ingestion',
  settings: '/teacher/settings',
};

const TeacherManScoringPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout, displayName } = useAuth();
  const [dockMode, setDockMode] = useNavDockMode('pinned', TEACHER_NAV_DOCK_STORAGE_KEY);
  const { data: queue = [], isLoading: isLoadingQueue } = useTeacherScoringQueue();
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const { data: dashboard, isLoading: isLoadingSubmission } = useReviewDashboard(selectedSessionId);
  const teacherScore = useTeacherScore(selectedSessionId);
  const markAllIncorrect = useMarkAllIncorrect(selectedSessionId);

  useEffect(() => {
    if (queue.length === 0) {
      return;
    }
    if (!selectedSessionId || !queue.some((item) => item.sessionId === selectedSessionId)) {
      setSelectedSessionId(queue[0].sessionId);
    }
  }, [queue, selectedSessionId]);

  const handleLogout = () => {
    logout();
  };

  const handleNavigate = (section: DashboardSection) => navigate(SECTION_ROUTES[section]);

  const handleSaveScore = ({
    questionId,
    earnedPoints,
    explanation,
  }: {
    questionId: string;
    earnedPoints: number;
    explanation?: string;
  }) => {
    teacherScore.mutate(
      {
        questionId,
        payload: {
          earnedPoints,
          explanation,
        },
      },
      {
        onSuccess: () => toast.success('Score saved successfully.'),
        onError: (e: Error) => toast.error(e.message || 'Failed to save score.'),
      },
    );
  };

  const handleMarkCorrect = ({
    questionId,
    maxPoints,
    explanation,
  }: {
    questionId: string;
    maxPoints: number;
    explanation?: string;
  }) => {
    teacherScore.mutate(
      {
        questionId,
        payload: {
          earnedPoints: maxPoints,
          explanation,
        },
      },
      {
        onSuccess: () => toast.success('Score saved successfully.'),
        onError: (e: Error) => toast.error(e.message || 'Failed to save score.'),
      },
    );
  };

  const handleMarkAllIncorrect = () => {
    markAllIncorrect.mutate(undefined, {
      onSuccess: () => toast.success('All answers marked as incorrect.'),
      onError: (e: Error) => toast.error(e.message || 'Failed to mark answers as incorrect.'),
    });
  };

  return (
    <ExamIntegrityTeacherScoringTemplate
      userName={displayName || 'Teacher'}
      userRole="Teacher"
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      dockMode={dockMode}
      onDockModeChange={setDockMode}
      queue={queue}
      selectedSessionId={selectedSessionId}
      onSelectSession={setSelectedSessionId}
      dashboard={dashboard}
      isLoadingQueue={isLoadingQueue}
      isLoadingSubmission={isLoadingSubmission}
      isSavingScore={teacherScore.isPending || markAllIncorrect.isPending}
      onSaveScore={handleSaveScore}
      onMarkCorrect={handleMarkCorrect}
      onMarkAllIncorrect={handleMarkAllIncorrect}
    />
  );
};

export default TeacherManScoringPage;
