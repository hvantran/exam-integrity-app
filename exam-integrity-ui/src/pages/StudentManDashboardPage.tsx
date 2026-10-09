/** FE-16: Student landing page — browse and start exams */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Button,
  Skeleton,
  ExamIntegrityStudentLandingTemplate as StudentManLandingLayout,
  type ExamIntegrityStudentPortalSection as PortalSection,
} from '@hvantran/ui-component-library';
import { useExamList, useTagList } from '../hooks/useExams';
import { useCreateSession } from '../hooks/useSession';
import { useAuth } from '../context/AuthContext';
import { useStudentPageTheme, extractSubjectFromTags } from '../hooks/useGradeTheme';
import { useUserProfile } from '../hooks/useUserProfile';
import { useNavDockMode } from '../hooks/useNavDockMode';

const PORTAL_ROUTES: Record<PortalSection, string> = {
  dashboard: '/',
  'my-exams': '/my-exams',
  results: '/my-exams',
};

const SUBJECT_ICONS: Record<string, { label: string; icon: string; border: string; bg: string }> = {
  math: { label: '🦁 Math', icon: '🦁', border: 'border-amber-300', bg: 'bg-amber-50' },
  english: { label: '📚 English', icon: '📚', border: 'border-emerald-300', bg: 'bg-emerald-50' },
  science: { label: '🚀 Science', icon: '🚀', border: 'border-sky-300', bg: 'bg-sky-50' },
  general: { label: '🎯 General', icon: '🎯', border: 'border-slate-300', bg: 'bg-slate-50' },
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

  return (
    <StudentManLandingLayout
      studentName={displayName || 'Student'}
      starCount={totalStars}
      activeSection="dashboard"
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
          <div className="rounded-3xl border-2 border-amber-300/80 bg-gradient-to-r from-amber-100/90 via-sky-100/70 to-emerald-100/80 p-5 sm:p-6 md:p-8 shadow-md">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-400 border-4 border-white shadow-md flex items-center justify-center text-3xl md:text-4xl flex-shrink-0">
                🦁
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 mb-1">
                  Welcome back, {displayName || 'Adventurer'}! 🚀
                </h1>
                <p className="text-slate-700 text-xs sm:text-sm md:text-base font-medium">
                  Ready for today's learning adventures? Have fun exploring your quests!
                </p>
              </div>
            </div>
          </div>
        ) : undefined
      }
    >

      {isLoading || isTagsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="border rounded-2xl bg-white shadow-sm p-5 flex flex-col justify-between"
            >
              <div>
                <Skeleton height={24} width="72%" className="mb-3" />
                <Skeleton height={16} width="88%" className="mb-2" />
                <Skeleton height={16} width="60%" className="mb-3" />
                <div className="flex gap-2 mb-3">
                  <Skeleton height={20} width={56} />
                  <Skeleton height={20} width={56} />
                </div>
              </div>
              <Skeleton height={48} width="100%" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {(exams ?? []).map((exam) => {
            const subject = extractSubjectFromTags(exam.tags);
            const subjectInfo = SUBJECT_ICONS[subject] ?? SUBJECT_ICONS.general;

            if (theme.isElementary) {
              return (
                <div
                  key={exam.id}
                  className={`rounded-3xl border-2 ${subjectInfo.border} bg-white shadow-md p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-200`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${subjectInfo.bg} text-slate-800 border ${subjectInfo.border}`}>
                        {subjectInfo.label}
                      </span>
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                        ⭐ {exam.totalPoints} Stars
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 mb-2 leading-snug">
                      {exam.title}
                    </h2>

                    <div className="flex items-center gap-3 text-xs font-medium text-slate-600 mb-4">
                      <span>⏱️ ~{Math.round(exam.durationSeconds / 60)} min</span>
                      <span>·</span>
                      <span>📝 {exam.questionCount} Questions</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {exam.tags?.map((t) => (
                        <span
                          key={t}
                          className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-slate-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={createSession.isPending}
                    onClick={() =>
                      createSession.mutate(
                        { examId: exam.id, studentId },
                        {
                          onSuccess: () => toast.success('Starting learning quest... 🚀'),
                          onError: (e: Error) => toast.error(e.message || 'Failed to start quest.'),
                        },
                      )
                    }
                    className="w-full min-h-[52px] rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-base shadow-[0_4px_0_#d97706] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 select-none"
                  >
                    <span>Start Quest</span>
                    <span>🚀</span>
                  </button>
                </div>
              );
            }

            return (
              <div
                key={exam.id}
                className="border rounded-xl bg-white shadow-sm p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="text-lg font-semibold mb-1">{exam.title}</div>
                  <div className="text-sm text-gray-500 mb-2">
                    {exam.questionCount} questions · {Math.round(exam.durationSeconds / 60)} min ·{' '}
                    {exam.totalPoints} pts
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {exam.tags?.map((t) => (
                      <span
                        key={t}
                        className="text-primary text-xs px-2 py-0.5 rounded-full font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <Button
                  className="mt-2 w-full bg-primary hover:bg-primary-deep text-primary-on font-semibold py-2 rounded"
                  onClick={() =>
                    createSession.mutate(
                      { examId: exam.id, studentId },
                      {
                        onSuccess: () => toast.success('Starting exam session...'),
                        onError: (e: Error) => toast.error(e.message || 'Failed to start exam.'),
                      },
                    )
                  }
                  disabled={createSession.isPending}
                  variant="primary"
                >
                  Start Exam
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Elementary Recent Achievements Tray */}
      {theme.isElementary && (
        <div className="mt-12 rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>🏆</span>
            <span>Recent Badges & Achievements</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-center">
              <div className="text-2xl mb-1">🧙‍♂️</div>
              <div className="font-bold text-xs text-slate-900">Math Wizard</div>
              <div className="text-[10px] text-slate-500">Solved 10 Math Quests</div>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 text-center">
              <div className="text-2xl mb-1">📖</div>
              <div className="font-bold text-xs text-slate-900">Story Explorer</div>
              <div className="text-[10px] text-slate-500">Read 5 Passages</div>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-3 text-center">
              <div className="text-2xl mb-1">🚀</div>
              <div className="font-bold text-xs text-slate-900">Space Cadet</div>
              <div className="text-[10px] text-slate-500">Science Star</div>
            </div>
            <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-3 text-center">
              <div className="text-2xl mb-1">⚡</div>
              <div className="font-bold text-xs text-slate-900">Super Fast</div>
              <div className="text-[10px] text-slate-500">Completed under time</div>
            </div>
          </div>
        </div>
      )}
    </StudentManLandingLayout>
  );
};

export default LandingPage;
