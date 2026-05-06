/** FE-15: Student review/results page */
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert } from '@mui/material';
import { StudentManReviewLayout } from '../components/templates';
import { ReviewDashboard } from '../components/organisms';
import { useReviewDashboard } from '../hooks/useReviewDashboard';
import { useAuth } from '../context/AuthContext';
import type { PortalSection } from '../components/organisms';

const PORTAL_ROUTES: Record<PortalSection, string> = {
  dashboard: '/',
  'my-exams': '/my-exams',
  results: '/my-exams',
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
      activeSection="my-exams"
      onNavigate={handleNavigate}
    >
      <div className="p-4 min-h-[300px]">
        {isLoading ? (
          <ReviewDashboard
            isLoading
            dashboard={{
              sessionId: '',
              totalEarned: 0,
              totalMax: 0,
              finalScore10: 0,
              scores: [],
            }}
          />
        ) : !dashboard ? (
          <Alert severity="info">Result is not available for this session yet.</Alert>
        ) : (
          <ReviewDashboard dashboard={dashboard} />
        )}
      </div>
    </StudentManReviewLayout>
  );
};

export default ReviewPage;
