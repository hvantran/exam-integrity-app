import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, GraduationCap, Search, Users } from 'lucide-react';
import { Badge, Button, Card } from '../atoms';

export type GradeTierKey = 'all' | 'distinction' | 'good' | 'average' | 'remediation';

export interface StudentExamSummary {
  sessionId: string;
  studentId: string;
  studentName?: string;
  examTitle?: string;
  totalEarned: number;
  totalMax: number;
  finalScore10: number;
  pendingEssayCount?: number;
  submittedAt?: string;
  status?: string;
}

export interface GradeTierConfig {
  key: GradeTierKey;
  label: string;
  minScore: number;
  maxScore: number;
  badgeClass: string;
  activeClass: string;
}

export const DEFAULT_GRADE_TIERS: GradeTierConfig[] = [
  {
    key: 'distinction',
    label: 'Distinction (9.0–10.0)',
    minScore: 9.0,
    maxScore: 10.0,
    badgeClass: 'bg-indigo-100 text-indigo-800',
    activeClass: 'border-indigo-600 bg-indigo-50 text-indigo-900',
  },
  {
    key: 'good',
    label: 'Good (7.0–8.9)',
    minScore: 7.0,
    maxScore: 8.999,
    badgeClass: 'bg-emerald-100 text-emerald-800',
    activeClass: 'border-emerald-600 bg-emerald-50 text-emerald-900',
  },
  {
    key: 'average',
    label: 'Average (5.0–6.9)',
    minScore: 5.0,
    maxScore: 6.999,
    badgeClass: 'bg-amber-100 text-amber-800',
    activeClass: 'border-amber-600 bg-amber-50 text-amber-900',
  },
  {
    key: 'remediation',
    label: 'Remediation (<5.0)',
    minScore: 0.0,
    maxScore: 4.999,
    badgeClass: 'bg-rose-100 text-rose-800',
    activeClass: 'border-rose-600 bg-rose-50 text-rose-900',
  },
];

export function resolveGradeTierKey(score: number): GradeTierKey {
  if (score >= 9.0) return 'distinction';
  if (score >= 7.0) return 'good';
  if (score >= 5.0) return 'average';
  return 'remediation';
}

export interface StudentExamGradeSwitcherProps {
  students: StudentExamSummary[];
  selectedSessionId?: string;
  onSelectStudent: (student: StudentExamSummary) => void;
  tiers?: GradeTierConfig[];
  showStats?: boolean;
  className?: string;
  title?: string;
}

export const StudentExamGradeSwitcher: React.FC<StudentExamGradeSwitcherProps> = ({
  students,
  selectedSessionId,
  onSelectStudent,
  tiers = DEFAULT_GRADE_TIERS,
  showStats = true,
  className = '',
  title = 'Student Exam Submissions',
}) => {
  const [selectedTier, setSelectedTier] = useState<GradeTierKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'grade_desc' | 'grade_asc' | 'pending_first'>('grade_desc');

  const tierCounts = useMemo(() => {
    const counts: Record<GradeTierKey, number> = {
      all: students.length,
      distinction: 0,
      good: 0,
      average: 0,
      remediation: 0,
    };
    for (const student of students) {
      const tier = resolveGradeTierKey(student.finalScore10);
      counts[tier] += 1;
    }
    return counts;
  }, [students]);

  const stats = useMemo(() => {
    if (students.length === 0) {
      return { mean: 0, passRate: 0, distinctionRate: 0, pendingReviewCount: 0 };
    }
    const sumScore = students.reduce((acc, s) => acc + s.finalScore10, 0);
    const mean = sumScore / students.length;
    const passCount = students.filter((s) => s.finalScore10 >= 5.0).length;
    const passRate = (passCount / students.length) * 100;
    const distinctionRate = (tierCounts.distinction / students.length) * 100;
    const pendingReviewCount = students.filter(
      (s) => (s.pendingEssayCount ?? 0) > 0 || s.status === 'pending',
    ).length;

    return { mean, passRate, distinctionRate, pendingReviewCount };
  }, [students, tierCounts.distinction]);

  const filteredStudents = useMemo(() => {
    let list = [...students];

    if (selectedTier !== 'all') {
      list = list.filter((s) => resolveGradeTierKey(s.finalScore10) === selectedTier);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.studentId.toLowerCase().includes(q) ||
          (s.studentName && s.studentName.toLowerCase().includes(q)) ||
          (s.examTitle && s.examTitle.toLowerCase().includes(q)),
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'grade_desc') return b.finalScore10 - a.finalScore10;
      if (sortBy === 'grade_asc') return a.finalScore10 - b.finalScore10;
      if (sortBy === 'pending_first') {
        const aPending = (a.pendingEssayCount ?? 0) > 0 || a.status === 'pending';
        const bPending = (b.pendingEssayCount ?? 0) > 0 || b.status === 'pending';
        if (aPending !== bPending) return Number(bPending) - Number(aPending);
        const essayCountDifference = (b.pendingEssayCount ?? 0) - (a.pendingEssayCount ?? 0);
        if (essayCountDifference !== 0) return essayCountDifference;
        return b.finalScore10 - a.finalScore10;
      }
      return 0;
    });

    return list;
  }, [students, selectedTier, searchQuery, sortBy]);

  const currentIndex = filteredStudents.findIndex((s) => s.sessionId === selectedSessionId);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectStudent(filteredStudents[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex >= 0 && currentIndex < filteredStudents.length - 1) {
      onSelectStudent(filteredStudents[currentIndex + 1]);
    } else if (currentIndex === -1 && filteredStudents.length > 0) {
      onSelectStudent(filteredStudents[0]);
    }
  };

  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-gray-900 shadow-sm ${className}`}
      data-testid="student-exam-grade-switcher"
    >
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-base font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-600" />
            {title}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Switch and score student exams categorized by grade performance tier.
          </p>
        </div>

        {/* Quick Prev / Next Navigator */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-500 mr-1">
            {filteredStudents.length > 0 && currentIndex >= 0
              ? `${currentIndex + 1} of ${filteredStudents.length}`
              : `${filteredStudents.length} exams`}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handlePrev}
            disabled={currentIndex <= 0}
            aria-label="Previous student"
            className="p-1.5 min-w-[32px] h-[32px] flex items-center justify-center rounded-lg border border-gray-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleNext}
            disabled={currentIndex === -1 || currentIndex >= filteredStudents.length - 1}
            aria-label="Next student"
            className="p-1.5 min-w-[32px] h-[32px] flex items-center justify-center rounded-lg border border-gray-200"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Cohort Stats Ribbon */}
      {showStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-2.5">
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Mean Score
            </div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">
              {stats.mean.toFixed(1)}
              <span className="text-xs font-normal text-gray-500"> / 10</span>
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-2.5">
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Distinction
            </div>
            <div className="text-lg font-bold text-indigo-600 mt-0.5">
              {stats.distinctionRate.toFixed(0)}%
              <span className="text-xs font-normal text-gray-500"> ({tierCounts.distinction})</span>
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-2.5">
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Pass Rate
            </div>
            <div className="text-lg font-bold text-emerald-600 mt-0.5">
              {stats.passRate.toFixed(0)}%
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-2.5">
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Needs Scoring
            </div>
            <div className="text-lg font-bold text-amber-600 mt-0.5">
              {stats.pendingReviewCount}
            </div>
          </div>
        </div>
      )}

      {/* Grade Tier Tabs */}
      <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Grade tiers">
        <button
          type="button"
          role="tab"
          aria-selected={selectedTier === 'all'}
          onClick={() => setSelectedTier('all')}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
            selectedTier === 'all'
              ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>All</span>
          <span className="rounded-full bg-gray-100 px-1.5 py-0.2 text-[10px] font-bold">
            {tierCounts.all}
          </span>
        </button>

        {tiers.map((tier) => {
          const isSelected = selectedTier === tier.key;
          const count = tierCounts[tier.key] ?? 0;
          return (
            <button
              key={tier.key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedTier(tier.key)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                isSelected
                  ? tier.activeClass
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tier.label}</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${tier.badgeClass}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by student ID or name…"
            className="w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="grade-sort-select" className="text-xs text-gray-500 whitespace-nowrap">
            Sort:
          </label>
          <select
            id="grade-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="grade_desc">Grade (Highest First)</option>
            <option value="grade_asc">Grade (Lowest First)</option>
            <option value="pending_first">Needs Review First</option>
          </select>
        </div>
      </div>

      {/* Student Submissions List */}
      <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
        {filteredStudents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-500">
            No student exam submissions match the selected grade filter.
          </div>
        ) : (
          filteredStudents.map((student) => {
            const isSelected = student.sessionId === selectedSessionId;
            const tierKey = resolveGradeTierKey(student.finalScore10);
            const tierConfig = tiers.find((t) => t.key === tierKey);

            return (
              <Card
                key={student.sessionId}
                selected={isSelected}
                onClick={() => onSelectStudent(student)}
                className={`cursor-pointer transition hover:border-indigo-300 ${
                  isSelected ? 'ring-2 ring-indigo-500/20' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-xs text-indigo-700 shrink-0">
                      {student.studentName
                        ? student.studentName.slice(0, 2).toUpperCase()
                        : student.studentId.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-gray-900 truncate">
                        {student.studentName || student.studentId}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">
                        ID: {student.studentId}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-gray-900">
                        {student.finalScore10.toFixed(1)}
                        <span className="text-[10px] font-normal text-gray-500">/10</span>
                      </span>
                      {tierConfig && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tierConfig.badgeClass}`}>
                          {tierConfig.key.toUpperCase()}
                        </span>
                      )}
                    </div>
                    {(student.pendingEssayCount ?? 0) > 0 ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                        {student.pendingEssayCount} pending
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                        Graded
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-100 pt-1.5">
                  <span className="truncate max-w-[180px]">
                    {student.examTitle || 'Exam Submission'}
                  </span>
                  <span className="font-medium text-gray-700">
                    {student.totalEarned.toFixed(1)} / {student.totalMax.toFixed(1)} pts
                  </span>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentExamGradeSwitcher;
