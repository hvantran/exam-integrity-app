import React from 'react';
import { Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  ExamIntegrityReviewDashboard as ReviewDashboard,
  ExamIntegrityResultsCelebration as ElementaryResultsCelebration,
  ExamIntegrityStudentLandingTemplate as StudentManLandingLayout,
  ExamIntegrityStudentExamResultCard,
  ExamIntegrityStudentExamResultsGrid,
  ExamIntegrityStudentMyExamsWorkspace,
  type ExamIntegrityStudentPortalSection as PortalSection,
} from '@hvantran/ui-component-library';
import { useAuth } from '../context/AuthContext';
import { useReviewDashboard, useStudentResults } from '../hooks/useReviewDashboard';
import { useStudentPageTheme } from '../hooks/useGradeTheme';
import { useUserProfile } from '../hooks/useUserProfile';
import { useNavDockMode } from '../hooks/useNavDockMode';

const PORTAL_ROUTES: Record<PortalSection, string> = {
  dashboard: '/',
  'my-exams': '/my-exams',
  results: '/my-exams',
  shop: '/shop',
  collection: '/collection',
};

const StudentManMyExamsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, displayName } = useAuth();
  const studentId = user?.username ?? '';
  const { data: sessions = [], isLoading } = useStudentResults(studentId);
  const { data: profile } = useUserProfile();
  const totalStars = profile?.stats?.totalStars ?? 0;
  const [selectedSessionId, setSelectedSessionId] = React.useState('');
  const theme = useStudentPageTheme();

  React.useEffect(() => {
    if (!selectedSessionId && sessions.length > 0) {
      setSelectedSessionId(sessions[0].sessionId);
    }
  }, [selectedSessionId, sessions]);

  const selectedSummary =
    sessions.find((session) => session.sessionId === selectedSessionId) ?? sessions[0];
  const { data: dashboard, isLoading: reviewLoading } = useReviewDashboard(
    selectedSummary?.sessionId ?? '',
  );

  const handleLogout = () => {
    logout();
  };

  const handleNavigate = (section: PortalSection) => navigate(PORTAL_ROUTES[section]);
  const [dockMode, setDockMode] = useNavDockMode();

  return (
    <StudentManLandingLayout
      studentName={displayName || 'Student'}
      starCount={totalStars}
      activeSection="my-exams"
      pageTitle={theme.isElementary ? 'My Completed Quests 🌟' : 'My Exams'}
      pageSubtitle={
        theme.isElementary
          ? 'Check your earned stars, quest results, and celebration badges!'
          : 'Review submitted exams, total score, and per-question grading status.'
      }
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      dockMode={dockMode}
      onDockModeChange={setDockMode}
    >
      {isLoading ? (
        <ReviewDashboard
          isLoading
          dashboard={{ totalEarned: 0, totalMax: 0, finalScore10: 0, scores: [] }}
        />
      ) : sessions.length === 0 ? (
        <Alert severity="info">You have not submitted any exams yet.</Alert>
      ) : (
        <ExamIntegrityStudentMyExamsWorkspace>
          <ExamIntegrityStudentExamResultsGrid>
            {sessions.map((session) => (
              <ExamIntegrityStudentExamResultCard
                key={session.sessionId}
                sessionId={session.sessionId}
                examTitle={session.examTitle}
                submittedAt={session.submittedAt}
                finalScore10={session.finalScore10}
                totalEarned={session.totalEarned}
                totalMax={session.totalMax}
                starsEarned={session.starsEarned}
                pendingEssayCount={session.pendingEssayCount}
                isSelected={session.sessionId === selectedSummary?.sessionId}
                isElementary={theme.isElementary}
                onSelect={(id) => setSelectedSessionId(id)}
              />
            ))}
          </ExamIntegrityStudentExamResultsGrid>

          {reviewLoading ? (
            <ReviewDashboard
              isLoading
              dashboard={{
                totalEarned: 0,
                totalMax: 0,
                finalScore10: 0,
                scores: [],
              }}
            />
          ) : dashboard ? (
            theme.isElementary ? (
              <ElementaryResultsCelebration
                dashboard={dashboard}
                studentName={displayName || 'Adventurer'}
              />
            ) : (
              <ReviewDashboard dashboard={dashboard} />
            )
          ) : (
            <Alert severity="info">
              Detailed scoring is not available for the selected session yet.
            </Alert>
          )}
        </ExamIntegrityStudentMyExamsWorkspace>
      )}
    </StudentManLandingLayout>
  );
};

export default StudentManMyExamsPage;
