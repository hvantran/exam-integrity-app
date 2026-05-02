import React from 'react';
import { Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ReviewDashboard } from '../components/organisms';
import type { PortalSection } from '../components/organisms';
import { StudentManLandingLayout } from '../components/templates';
import { useAuth } from '../context/AuthContext';
import { useReviewDashboard, useStudentResults } from '../hooks/useReviewDashboard';

const PORTAL_ROUTES: Record<PortalSection, string> = {
  dashboard: '/',
  'my-exams': '/my-exams',
  results: '/my-exams',
};

const StudentManMyExamsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const studentId = user?.username ?? '';
  const { data: sessions = [], isLoading } = useStudentResults(studentId);
  const [selectedSessionId, setSelectedSessionId] = React.useState('');

  React.useEffect(() => {
    if (!selectedSessionId && sessions.length > 0) {
      setSelectedSessionId(sessions[0].sessionId);
    }
  }, [selectedSessionId, sessions]);

  const selectedSummary = sessions.find(session => session.sessionId === selectedSessionId) ?? sessions[0];
  const { data: dashboard, isLoading: reviewLoading } = useReviewDashboard(selectedSummary?.sessionId ?? '');

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleNavigate = (section: PortalSection) => navigate(PORTAL_ROUTES[section]);

  return (
    <StudentManLandingLayout
      studentName={user?.username ?? 'Student'}
      activeSection="my-exams"
      pageTitle="My Exams"
      pageSubtitle="Review submitted exams, total score, and per-question grading status."
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {isLoading ? (
        <ReviewDashboard
          isLoading
          dashboard={{ sessionId: '', totalEarned: 0, totalMax: 0, finalScore10: 0, scores: [] }}
        />
      ) : sessions.length === 0 ? (
        <Alert severity="info">You have not submitted any exams yet.</Alert>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {sessions.map((session) => {
              const isSelected = session.sessionId === selectedSummary?.sessionId;
              return (
                <button
                  key={session.sessionId}
                  type="button"
                  onClick={() => setSelectedSessionId(session.sessionId)}
                  className={`rounded-2xl border p-5 text-left shadow-sm transition ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">{session.examTitle}</div>
                      <div className="text-sm text-gray-500">{session.submittedAt ? new Date(session.submittedAt).toLocaleString() : 'Submitted exam'}</div>
                    </div>
                    {session.pendingEssayCount > 0 && (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        {session.pendingEssayCount} essay pending
                      </span>
                    )}
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">{session.finalScore10.toFixed(1)}<span className="text-base font-medium text-gray-500">/10</span></div>
                      <div className="text-sm text-gray-600">{session.totalEarned.toFixed(1)} / {session.totalMax.toFixed(1)} pts</div>
                    </div>
                    <span className="text-sm font-semibold text-blue-700">View details</span>
                  </div>
                </button>
              );
            })}
          </div>

          {reviewLoading ? (
            <ReviewDashboard
              isLoading
              dashboard={{ sessionId: '', totalEarned: 0, totalMax: 0, finalScore10: 0, scores: [] }}
            />
          ) : dashboard ? (
            <ReviewDashboard dashboard={dashboard} />
          ) : (
            <Alert severity="info">Detailed scoring is not available for the selected session yet.</Alert>
          )}
        </div>
      )}
    </StudentManLandingLayout>
  );
};

export default StudentManMyExamsPage;