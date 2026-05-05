import React from 'react';
import { ArrowLeft, ArrowRight, ClipboardEdit } from 'lucide-react';
import Button from '../atoms/Button';

export interface ExamNavigationBarProps {
  canGoPrev: boolean;
  canGoNext: boolean;
  isLastQuestion?: boolean;
  flaggedCount?: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onReviewFlagged?: () => void;
}

type NavTone = 'neutral' | 'accent' | 'warning' | 'danger';

const toneToVariant: Record<NavTone, React.ComponentProps<typeof Button>['variant']> = {
  neutral: 'neutral',
  accent: 'accent',
  warning: 'warning',
  danger: 'danger',
};

/**
 * Organism — StudentManExamNavigationBar
 *
 * Fixed bottom-of-content navigation strip from "Student Portal – Active Exam".
 * Presents movement actions, review helpers, and submit action in clear groups.
 */
const StudentManExamNavigationBar: React.FC<ExamNavigationBarProps> = ({
  canGoPrev,
  canGoNext,
  isLastQuestion = false,
  onPrevious,
  onNext,
  onSubmit,
  flaggedCount = 0,
  onReviewFlagged,
}) => {
  const hasFlaggedReviewAction = isLastQuestion && flaggedCount > 0 && Boolean(onReviewFlagged);
  const submitTone: NavTone = isLastQuestion ? 'danger' : 'neutral';

  return (
    <section
      className="w-full rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-slate-50/70 p-3 md:p-4 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.5)]"
      aria-label="Exam question actions"
    >

      <div className="mt-3 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <Button
          variant={toneToVariant.accent}
          icon={<ArrowLeft size={18} className="text-white/90" />}
          onClick={onPrevious}
          disabled={!canGoPrev}
          className="min-w-[122px]"
        >
          Previous
        </Button>

        <div className="flex flex-wrap items-center gap-2 md:gap-3 xl:justify-end">
          {hasFlaggedReviewAction && onReviewFlagged && (
            <Button
              variant={toneToVariant.warning}
              icon={<ClipboardEdit size={18} className="text-warning-700" />}
              onClick={onReviewFlagged}
            >
              {`Review Flagged (${flaggedCount})`}
            </Button>
          )}
          <Button
            variant={toneToVariant.accent}
            icon={<ArrowRight size={18} className="text-white/90" />}
            iconPlacement="right"
            onClick={onNext}
            disabled={!canGoNext}
            className="min-w-[122px]"
          >
            Next
          </Button>

          {isLastQuestion &&
            <Button
              variant={toneToVariant.danger}
              onClick={onSubmit}
            >
              Submit Exam
            </Button>
          }
        </div>
      </div>

    </section>
  );
};

export default StudentManExamNavigationBar;
