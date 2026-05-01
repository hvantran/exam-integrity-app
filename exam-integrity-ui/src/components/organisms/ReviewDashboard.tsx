import React from 'react';

import type { ReviewDashboard as ReviewDashboardType } from '../../types/exam.types';
import { MistakeSummary, CorrectionCard, Skeleton } from '../molecules';

interface Props {
  dashboard: ReviewDashboardType;
  isLoading?: boolean;
}

const ReviewDashboard: React.FC<Props> = ({ dashboard, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-2 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 mb-6 rounded-2xl border border-gray-200 shadow-lg bg-white">
            <Skeleton width={180} height={28} className="mb-6" />
            <Skeleton width={200} height={64} className="mb-4" />
            <Skeleton width="100%" height={8} className="mb-4" />
            <div className="flex gap-6">
              <Skeleton width={130} height={20} />
              <Skeleton width={130} height={20} />
              <Skeleton width={120} height={20} className="ml-auto" />
            </div>
          </div>

          <Skeleton width="100%" height={52} className="mb-6" />
          <Skeleton width="48%" height={52} className="mb-6" />

          <div className="mb-3">
            <Skeleton width={180} height={24} />
          </div>
          <Skeleton width="100%" height={170} className="mb-4" />
          <Skeleton width="100%" height={170} />
        </div>
      </div>
    );
  }

  const pct = Math.round((dashboard.totalEarned / Math.max(dashboard.totalMax, 1)) * 100);
  const correctCount = dashboard.scores.filter(s => s.status === 'CORRECT').length;
  const incorrectCount = dashboard.scores.length - correctCount;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-2 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Score hero card */}
        <div className="p-8 mb-6 rounded-2xl border border-gray-200 shadow-lg bg-gradient-to-br from-blue-800 to-blue-500 text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <span className="text-2xl">🎓</span>
            </div>
            <div className="font-bold text-2xl">Exam Results</div>
          </div>

          {/* Big score */}
          <div className="text-6xl font-extrabold leading-none mb-2">
            {dashboard.finalScore10.toFixed(1)}
            <span className="text-2xl font-normal opacity-80">/10</span>
          </div>

          <div className="w-full bg-white bg-opacity-25 rounded-full h-1.5 mb-3">
            <div
              className="bg-white h-1.5 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Stats row */}
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <span className="text-lg">✅</span>
              <span className="font-semibold text-base">Correct</span>
              <span className="font-bold text-lg ml-1">{correctCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">❌</span>
              <span className="font-semibold text-base">Incorrect</span>
              <span className="font-bold text-lg ml-1">{incorrectCount}</span>
            </div>
            <span className="text-base opacity-90 ml-auto">
              {dashboard.totalEarned.toFixed(1)} / {dashboard.totalMax.toFixed(1)} pts
            </span>
          </div>
        </div>

        {/* Essay notice */}
        <div className="p-4 mb-6 rounded-lg bg-blue-100 border border-blue-200">
          <span className="text-sm text-blue-700">
            Note: Essay questions require manual grading by the teacher.
          </span>
        </div>

        <MistakeSummary missedNumbers={dashboard.missedQuestionNumbers ?? []} />

        {/* Corrections */}
        {dashboard.scores.filter(s => s.status !== 'CORRECT').length > 0 && (
          <>
            <div className="font-bold text-lg text-gray-900 mb-2">Questions to Review</div>
            {dashboard.scores
              .filter(s => s.status !== 'CORRECT')
              .map(s => <CorrectionCard key={s.questionId} score={s} />)}
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewDashboard;
