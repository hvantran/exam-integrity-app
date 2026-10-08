/** FE-15: Student review/results page */
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert } from '@mui/material';
import {
  ExamIntegrityStudentReviewTemplate as StudentManReviewLayout,
  ExamIntegrityReviewDashboard as ReviewDashboard,
  type ExamIntegrityStudentPortalSection as PortalSection,
} from '@hvantran/ui-component-library';
import { useReviewDashboard } from '../hooks/useReviewDashboard';
import { useAuth } from '../context/AuthContext';
import { useStudentPageTheme } from '../hooks/useGradeTheme';
import ElementaryResultsCelebration from '../components/ElementaryResultsCelebration';

const PORTAL_ROUTES: Record<PortalSection, string> = {
  dashboard: '/',
  'my-exams': '/my-exams',
  results: '/my-exams',
};

const ReviewPage: React.FC = () => {
  const { sessionId = '' } = useParams<{ sessionId: string }>();
  const { data: dashboard, isLoading } = useReviewDashboard(sessionId);
  const { displayName } = useAuth();
  const theme = useStudentPageTheme();
  const navigate = useNavigate();
  const handleNavigate = (section: PortalSection) => navigate(PORTAL_ROUTES[section]);

  return (
    <StudentManReviewLayout
      studentName={displayName || 'Student'}
      activeSection="my-exams"
      onNavigate={handleNavigate}
    >
      <div className="p-4 min-h-[300px]">
        {isLoading ? (
          <ReviewDashboard
            isLoading
            dashboard={{
              totalEarned: 0,
              totalMax: 0,
              finalScore10: 0,
              scores: [],
            }}
          />
        ) : !dashboard ? (
          <Alert severity="info">Result is not available for this session yet.</Alert>
        ) : theme.isElementary ? (
          <ElementaryResultsCelebration
            dashboard={dashboard}
            studentName={displayName || 'Super Adventurer'}
          />
        ) : (
          <ReviewDashboard dashboard={dashboard} />
        )}
      </div>
    </StudentManReviewLayout>
  );
};

export default ReviewPage;
