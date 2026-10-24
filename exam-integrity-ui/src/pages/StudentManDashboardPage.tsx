/** FE-16: Student landing page — browse and start exams */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  cn,
  ExamIntegrityStudentLandingTemplate as StudentManLandingLayout,
  ExamIntegrityStudentWelcomeBanner,
  ExamIntegrityStudentExamCard,
  ExamIntegrityStudentAchievementsTray,
  ExamIntegrityExamGrid,
  ExamIntegrityExamGridLoader,
  useTheme,
  type ExamIntegrityStudentPortalSection as PortalSection,
} from '@hvantran/ui-component-library';
import { useExamList, useTagList } from '../hooks/useExams';
import { useCreateSession } from '../hooks/useSession';
import { useAuth } from '../context/AuthContext';
import { useStudentPageTheme, extractSubjectFromTags } from '../hooks/useGradeTheme';
import { useUserProfile } from '../hooks/useUserProfile';
import { useNavDockMode } from '../hooks/useNavDockMode';
import { useEquippedCompanion } from '../hooks/useEquippedCompanion';

const PORTAL_ROUTES: Record<PortalSection, string> = {
  dashboard: '/',
  'my-exams': '/my-exams',
  results: '/my-exams',
  shop: '/shop',
  collection: '/collection',
};

const LandingPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('');
  const tags = activeFilter ? [activeFilter] : undefined;
  const { data: exams, isLoading } = useExamList(tags);
  const { data: tagList = [], isLoading: isTagsLoading } = useTagList();
  const theme = useStudentPageTheme();
  const createSession = useCreateSession();
  const navigate = useNavigate();
  const { user, logout, displayName } = useAuth();
  const { data: profile } = useUserProfile();
  const studentId = user?.username ?? 'guest';
  const totalStars = profile?.stats?.totalStars ?? 0;

  const filterOptions = React.useMemo(
    () => [{ label: 'All', value: '' }, ...tagList.map((tag) => ({ label: tag, value: tag }))],
    [tagList],
  );

  const handleLogout = () => {
    logout();
  };
  const handleNavigate = (section: PortalSection) => navigate(PORTAL_ROUTES[section]);

  const [dockMode, setDockMode] = useNavDockMode();
  const { companion } = useEquippedCompanion();
  const { theme: uiTheme, setTheme: setUiTheme } = useTheme();

  return (
    <StudentManLandingLayout
      studentName={displayName || 'Student'}
      starCount={totalStars}
      activeSection="dashboard"
      isDarkMode={uiTheme === 'dark'}
      onThemeToggle={() => setUiTheme(uiTheme === 'dark' ? 'light' : 'dark')}
      pageTitle={theme.isElementary ? 'Learning Quests 🌟' : 'Ky thi dang dien ra'}
      pageSubtitle={
        theme.isElementary
          ? 'Choose a fun learning quest below and earn shiny stars!'
          : 'Danh sach cac bai kiem tra duoc giao cho ban.'
      }
      filters={filterOptions}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      dockMode={dockMode}
      onDockModeChange={setDockMode}
      bannerSlot={
        theme.isElementary ? (
          <ExamIntegrityStudentWelcomeBanner
            studentName={displayName || 'Adventurer'}
            avatarEmoji={companion?.avatarEmoji}
            avatarIconUrl={companion?.iconUrl}
            backgroundImageUrl={companion?.backgroundUrl}
          />
        ) : undefined
      }
    >
      {isLoading || isTagsLoading ? (
        <ExamIntegrityExamGridLoader count={6} />
      ) : (
        <ExamIntegrityExamGrid>
          {(exams ?? []).map((exam) => {
            const subject = extractSubjectFromTags(exam.tags);

            return (
              <ExamIntegrityStudentExamCard
                key={exam.id}
                id={exam.id}
                title={exam.title}
                questionCount={exam.questionCount}
                durationSeconds={exam.durationSeconds}
                totalPoints={exam.totalPoints}
                tags={exam.tags}
                isElementary={theme.isElementary}
                subject={subject}
                isStarting={createSession.isPending}
                onStart={() =>
                  createSession.mutate(
                    { examId: exam.id, studentId },
                    {
                      onSuccess: () =>
                        toast.success(
                          theme.isElementary
                            ? 'Starting learning quest... 🚀'
                            : 'Starting exam session...',
                        ),
                      onError: (e: Error) =>
                        toast.error(
                          e.message ||
                            (theme.isElementary
                              ? 'Failed to start quest.'
                              : 'Failed to start exam.'),
                        ),
                    },
                  )
                }
              />
            );
          })}
        </ExamIntegrityExamGrid>
      )}

      {/* Elementary Recent Achievements Tray */}
      {theme.isElementary && <ExamIntegrityStudentAchievementsTray />}
    </StudentManLandingLayout>
  );
};

export default LandingPage;
