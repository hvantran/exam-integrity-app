import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ExamIntegrityReviewDashboardData } from '@hvantran/ui-component-library';

export interface ElementaryResultsCelebrationProps {
  dashboard: ExamIntegrityReviewDashboardData;
  studentName?: string;
  onBackToQuests?: () => void;
}

export const ElementaryResultsCelebration: React.FC<ElementaryResultsCelebrationProps> = ({
  dashboard,
  studentName = 'Adventurer',
  onBackToQuests,
}) => {
  const navigate = useNavigate();
  const correctCount = dashboard.scores.filter((s) => s.status === 'CORRECT').length;
  const incorrectCount = dashboard.scores.filter(
    (s) => s.status !== 'CORRECT' && s.status !== 'SELF_GRADE_REQUIRED' && s.status !== 'PENDING_ESSAY',
  ).length;
  const pendingCount = dashboard.scores.filter(
    (s) => s.status === 'SELF_GRADE_REQUIRED' || s.status === 'PENDING_ESSAY',
  ).length;

  const score10 = dashboard.finalScore10;
  const starCount = score10 >= 8.5 ? 3 : score10 >= 6.5 ? 2 : 1;
  const earnedStars = Math.round(score10);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = onBackToQuests ?? (() => navigate('/'));

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Top Celebration Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 border border-slate-200 rounded-2xl p-3 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <span>🌟 Celebration Mode Active</span>
          <span className="text-slate-400">·</span>
          <span className="font-bold text-amber-700">⭐ +{earnedStars} New Stars Added!</span>
        </div>
      </div>

      {/* Celebration Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-300 via-amber-200 to-yellow-100 p-5 sm:p-8 md:p-10 shadow-xl text-center">
        {/* Floating Confetti Graphics */}
        <div className="absolute top-3 left-4 text-2xl select-none animate-bounce">✨</div>
        <div className="absolute top-4 right-6 text-2xl select-none animate-bounce delay-100">🎉</div>
        <div className="absolute bottom-4 left-8 text-2xl select-none opacity-80">🎈</div>
        <div className="absolute bottom-4 right-8 text-2xl select-none opacity-80">🌟</div>

        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-white/90 border-4 border-amber-400 shadow-md flex items-center justify-center text-3xl sm:text-4xl">
          🏆
        </div>

        <h1 className="text-xl sm:text-2xl md:text-4xl font-black text-amber-950 mb-2">
          Quest Complete! Fantastic Job, {studentName}!
        </h1>
        <p className="text-amber-900 text-xs sm:text-sm md:text-base font-semibold max-w-lg mx-auto mb-6">
          You worked hard and did your best. Every challenge makes your brain stronger!
        </p>

        {/* Big Score & Glowing Stars */}
        <div className="inline-flex flex-col items-center bg-white/95 border-2 border-amber-400 rounded-3xl px-5 sm:px-8 py-4 sm:py-5 shadow-lg mb-6 max-w-full">
          <div className="flex items-center justify-center gap-2 text-2xl sm:text-3xl mb-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className={`transition-all ${
                  i < starCount ? 'text-amber-400 scale-110 drop-shadow-md' : 'text-slate-300'
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <div className="text-4xl sm:text-5xl font-black text-slate-900 leading-none my-1">
            {score10.toFixed(1)}
            <span className="text-lg sm:text-xl font-bold text-slate-500"> / 10</span>
          </div>
          <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-xs font-black text-amber-950 uppercase tracking-wide">
            <span>🥇</span>
            <span>
              {score10 >= 8.5 ? 'Master of Learning' : score10 >= 6.5 ? 'Super Explorer' : 'Rising Star'}
            </span>
          </div>
        </div>

        {/* Stat Bubbles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
          <div className="rounded-2xl bg-white/90 border border-emerald-300 p-4 shadow-sm">
            <div className="text-2xl mb-1">🎉</div>
            <div className="text-xl font-extrabold text-emerald-950">{correctCount}</div>
            <div className="text-xs font-semibold text-emerald-800">Correct Answers</div>
          </div>
          <div className="rounded-2xl bg-white/90 border border-sky-300 p-4 shadow-sm">
            <div className="text-2xl mb-1">💪</div>
            <div className="text-xl font-extrabold text-sky-950">{incorrectCount + pendingCount}</div>
            <div className="text-xs font-semibold text-sky-800">Super Efforts</div>
          </div>
          <div className="rounded-2xl bg-white/90 border border-amber-300 p-4 shadow-sm">
            <div className="text-2xl mb-1">⭐</div>
            <div className="text-xl font-extrabold text-amber-950">+{earnedStars}</div>
            <div className="text-xs font-semibold text-amber-800">Stars Earned</div>
          </div>
        </div>
      </div>

      {/* Per-Question Encouraging Checklist */}
      <div className="rounded-3xl border-2 border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-sm">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2">
          <span>📝</span>
          <span>Your Quest Review</span>
        </h2>

        <div className="space-y-4">
          {dashboard.scores.map((score, idx) => {
            const qNum = score.questionNumber ?? idx + 1;
            const isCorrect = score.status === 'CORRECT';

            if (isCorrect) {
              return (
                <div
                  key={score.questionId || idx}
                  className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-500 text-white font-black text-base sm:text-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                      ✓
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm sm:text-base">
                        Question {qNum}: Spot on! 🎯
                      </div>
                      <div className="text-xs text-slate-600 font-medium mt-0.5">
                        Your Answer: <span className="font-bold text-emerald-800">{score.studentAnswer || '(Completed)'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-emerald-800 bg-white px-3 py-1.5 rounded-full border border-emerald-200 shadow-xs self-end sm:self-center">
                    +{score.earnedPoints ?? 1} pts
                  </div>
                </div>
              );
            }

            return (
              <div
                key={score.questionId || idx}
                className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-3.5 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-sm"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-400 text-amber-950 font-black text-base sm:text-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    ⭐
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 flex-wrap">
                      <span>Question {qNum}: Good Try!</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950">
                        Learning Moment
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 font-medium mt-1">
                      Your answer: <span className="font-semibold">{score.studentAnswer || '(Not answered)'}</span>
                      {score.correctAnswer && (
                        <span> · Correct answer: <span className="font-bold text-emerald-700">{score.correctAnswer}</span></span>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-amber-900 font-semibold bg-white/90 border border-amber-200 rounded-xl p-2.5">
                      🦉 Professor Hoot Tip: Don't worry! Reviewing questions helps you get it right next time!
                    </div>
                  </div>
                </div>
                <div className="text-xs font-bold text-amber-900 self-end sm:self-center bg-white px-3 py-1.5 rounded-full border border-amber-200 shadow-xs">
                  {score.earnedPoints ?? 0} pts
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4">
        <button
          type="button"
          onClick={handleBack}
          className="w-full sm:w-auto min-h-[52px] sm:min-h-[56px] rounded-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-base px-8 shadow-[0_4px_0_#d97706] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 select-none"
        >
          <span>Back to Quests</span>
          <span>🚀</span>
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="w-full sm:w-auto min-h-[52px] sm:min-h-[56px] rounded-full bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 font-bold text-base px-7 shadow-sm transition-all flex items-center justify-center gap-2 select-none"
        >
          <span>Print Certificate</span>
          <span>📜</span>
        </button>
      </div>
    </div>
  );
};

export default ElementaryResultsCelebration;

