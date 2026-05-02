import React from 'react';
import { Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { DashboardSection } from '../components/organisms';
import { TeacherManDashboardLayout } from '../components/templates';
import { useAuth } from '../context/AuthContext';
import { useReviewDashboard, useTeacherScore, useTeacherScoringQueue } from '../hooks/useReviewDashboard';

const SECTION_ROUTES: Record<DashboardSection, string> = {
  dashboard: '/teacher/dashboard',
  ingestion: '/teacher/ingestion',
  review: '/teacher/ingestion',
  scoring: '/teacher/scoring',
  'question-bank': '/teacher/question-bank',
  reports: '/teacher/ingestion',
};

const TeacherManScoringPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: queue = [], isLoading } = useTeacherScoringQueue();
  const [selectedSessionId, setSelectedSessionId] = React.useState('');
  const { data: dashboard, isLoading: reviewLoading } = useReviewDashboard(selectedSessionId);
  const teacherScore = useTeacherScore(selectedSessionId);
  const [drafts, setDrafts] = React.useState<Record<string, { earnedPoints: string; explanation: string }>>({});

  React.useEffect(() => {
    if (queue.length === 0) {
      return;
    }
    if (!selectedSessionId || !queue.some(item => item.sessionId === selectedSessionId)) {
      setSelectedSessionId(queue[0].sessionId);
    }
  }, [queue, selectedSessionId]);

  React.useEffect(() => {
    if (!dashboard) {
      return;
    }
    const nextDrafts = dashboard.scores
      .filter(score => score.questionType !== 'MCQ')
      .reduce<Record<string, { earnedPoints: string; explanation: string }>>((acc, score) => {
        acc[score.questionId] = {
          earnedPoints: String(score.earnedPoints),
          explanation: score.explanation ?? '',
        };
        return acc;
      }, {});
    setDrafts(nextDrafts);
  }, [dashboard]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleNavigate = (section: DashboardSection) => navigate(SECTION_ROUTES[section]);
  const selectedSummary = queue.find(item => item.sessionId === selectedSessionId);
  const essayScores = dashboard?.scores.filter(score => score.questionType !== 'MCQ') ?? [];

  return (
    <TeacherManDashboardLayout
      activeSection="scoring"
      userName={user?.username ?? 'Teacher'}
      userRole="Teacher"
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Essay Scoring</h1>
          <p className="mt-2 text-gray-600">Auto-grade MCQ on submission, then review and score essay questions manually.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-6">
            <CircularProgress size={20} />
            <span className="text-sm text-gray-600">Loading grading queue…</span>
          </div>
        ) : queue.length === 0 ? (
          <Alert severity="success">No essay submissions are waiting for teacher grading.</Alert>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)] gap-6">
            <div className="space-y-3">
              {queue.map((item) => {
                const isSelected = item.sessionId === selectedSummary?.sessionId;
                return (
                  <button
                    key={item.sessionId}
                    type="button"
                    onClick={() => setSelectedSessionId(item.sessionId)}
                    className={`w-full rounded-2xl border p-4 text-left shadow-sm transition ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-gray-900">{item.examTitle}</div>
                        <div className="text-sm text-gray-500">Student: {item.studentId}</div>
                      </div>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        {item.pendingEssayCount} pending
                      </span>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : 'Submitted'}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Current score: {item.totalEarned.toFixed(1)} / {item.totalMax.toFixed(1)} pts
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              {reviewLoading ? (
                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-6">
                  <CircularProgress size={20} />
                  <span className="text-sm text-gray-600">Loading selected submission…</span>
                </div>
              ) : !dashboard || !selectedSummary ? (
                <Alert severity="info">Select a submitted exam to score its essay questions.</Alert>
              ) : (
                <>
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{selectedSummary.examTitle}</div>
                        <div className="mt-1 text-sm text-gray-500">Student: {selectedSummary.studentId}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Current total</div>
                        <div className="text-3xl font-bold text-gray-900">{dashboard.finalScore10.toFixed(1)}<span className="text-base font-medium text-gray-500">/10</span></div>
                      </div>
                    </div>
                  </div>

                  {essayScores.map((score) => {
                    const draft = drafts[score.questionId] ?? { earnedPoints: String(score.earnedPoints), explanation: score.explanation ?? '' };
                    const parsedPoints = Number(draft.earnedPoints);
                    const isInvalid = draft.earnedPoints.trim() === '' || Number.isNaN(parsedPoints) || parsedPoints < 0 || parsedPoints > score.maxPoints;

                    return (
                      <div key={score.questionId} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                          <div>
                            <div className="text-lg font-semibold text-gray-900">Question {score.questionNumber}</div>
                            <div className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{score.questionText || 'Essay question'}</div>
                          </div>
                          <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                            Max {score.maxPoints.toFixed(1)} pts
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                            <div className="text-xs font-semibold uppercase tracking-wide text-red-700">Student Answer</div>
                            <div className="mt-2 whitespace-pre-wrap text-sm text-red-900">{score.studentAnswer || '(No answer)'}</div>
                          </div>
                          <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                            <div className="text-xs font-semibold uppercase tracking-wide text-green-700">Reference Answer</div>
                            <div className="mt-2 whitespace-pre-wrap text-sm text-green-900">{score.correctAnswer || 'No reference answer configured.'}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-[160px_minmax(0,1fr)] gap-4">
                          <label className="block">
                            <span className="mb-2 block text-sm font-medium text-gray-700">Awarded points</span>
                            <input
                              type="number"
                              min={0}
                              max={score.maxPoints}
                              step={0.1}
                              value={draft.earnedPoints}
                              onChange={(event) => setDrafts((current) => ({
                                ...current,
                                [score.questionId]: { ...draft, earnedPoints: event.target.value },
                              }))}
                              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            />
                          </label>

                          <label className="block">
                            <span className="mb-2 block text-sm font-medium text-gray-700">Teacher feedback</span>
                            <textarea
                              rows={4}
                              value={draft.explanation}
                              onChange={(event) => setDrafts((current) => ({
                                ...current,
                                [score.questionId]: { ...draft, explanation: event.target.value },
                              }))}
                              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                              placeholder="Optional guidance shown to the student"
                            />
                          </label>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-4">
                          <div className="text-sm text-gray-500">
                            Status: <span className="font-semibold text-gray-700">{score.status.replaceAll('_', ' ')}</span>
                          </div>
                          <button
                            type="button"
                            disabled={isInvalid || teacherScore.isPending}
                            onClick={() => teacherScore.mutate({
                              questionId: score.questionId,
                              payload: {
                                earnedPoints: parsedPoints,
                                explanation: draft.explanation.trim() || undefined,
                              },
                            })}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                          >
                            {teacherScore.isPending ? 'Saving…' : 'Save score'}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {essayScores.length === 0 && (
                    <Alert severity="success">All essay questions in this submission are already graded.</Alert>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </TeacherManDashboardLayout>
  );
};

export default TeacherManScoringPage;