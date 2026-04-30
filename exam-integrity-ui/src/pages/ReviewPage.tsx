/** FE-15: Student review/results page */
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress, Alert } from '@mui/material';
import { StudentManReviewLayout } from '../components/templates';
import { ReviewDashboard } from '../components/organisms';
import { useReviewDashboard } from '../hooks/useReviewDashboard';
import { useAuth } from '../context/AuthContext';
import type { PortalSection } from '../components/organisms';

const PORTAL_ROUTES: Record<PortalSection, string> = {
  dashboard:    '/',
  'my-exams':  '/',
  results:     '/',
};

const ReviewPage: React.FC = () => {
  const { sessionId = '' } = useParams<{ sessionId: string }>();
  const { data: dashboard, isLoading } = useReviewDashboard(sessionId);
  const { user } = useAuth();
  const navigate = useNavigate();
  const handleNavigate = (section: PortalSection) => navigate(PORTAL_ROUTES[section]);

  return (
    <StudentManReviewLayout
      studentName={user?.username ?? 'Student'}
      activeSection="results"
      onNavigate={handleNavigate}
    >
      <div className="p-4 min-h-[300px] flex items-center justify-center">
        {isLoading ? (
          <CircularProgress />
        ) : !dashboard ? (
          <Alert severity="info">Scoring in progress… please wait.</Alert>
        ) : (
          <ReviewDashboard dashboard={dashboard} />
        )}
      </div>
    </StudentManReviewLayout>
  );
};

export default ReviewPage;
