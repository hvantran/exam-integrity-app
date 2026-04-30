import React from 'react';

export interface ExamNavigationBarProps {
  canGoPrev: boolean;
  canGoNext: boolean;
  isFlagged?: boolean;
  isLastQuestion?: boolean;
  flaggedCount?: number;
  onPrevious: () => void;
  onNext: () => void;
  onFlag: () => void;
  onSubmit: () => void;
  onReviewFlagged?: () => void;
}

/**
 * Organism — StudentManExamNavigationBar
 *
 * Fixed bottom-of-content navigation strip from "Student Portal – Active Exam".
 * Back / Next on the left; Flag in the centre; Submit on the right.
 */
const StudentManExamNavigationBar: React.FC<ExamNavigationBarProps> = ({
  canGoPrev,
  canGoNext,
  isFlagged = false,
  isLastQuestion = false,
  onPrevious,
  onNext,
  onFlag,
  onSubmit,
  flaggedCount = 0,
  onReviewFlagged,
}) => (
  <div className="flex items-center gap-4 flex-wrap pt-3 border-t border-gray-200 mt-3 w-full">
    {/* Left cluster */}
    <button
      type="button"
      className={`flex items-center gap-1 px-4 py-2 rounded font-medium border border-gray-300 bg-white text-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-500 hover:bg-blue-50`}
      onClick={onPrevious}
      disabled={!canGoPrev}
    >
      <span className="text-lg">⬅️</span>
      Back
    </button>
    <button
      type="button"
      className={`flex items-center gap-1 px-4 py-2 rounded font-medium border border-gray-300 bg-white text-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-500 hover:bg-blue-50`}
      onClick={onNext}
      disabled={!canGoNext}
    >
      Next
      <span className="text-lg">➡️</span>
    </button>

    {/* Spacer */}
    <div className="flex-1" />

    {/* Flag */}
    <button
      type="button"
      className={`flex items-center gap-1 px-4 py-2 rounded font-medium border ${isFlagged ? 'border-yellow-400 bg-yellow-50 text-yellow-800' : 'border-gray-300 bg-white text-gray-700'} transition hover:border-yellow-400 hover:bg-yellow-50`}
      onClick={onFlag}
    >
      <span className="text-lg">🚩</span>
      {isFlagged ? 'Unflag' : 'Flag'}
    </button>

    {/* Review Flagged — only on last question and if flagged exist */}
    {isLastQuestion && flaggedCount > 0 && onReviewFlagged && (
      <button
        type="button"
        className="ml-4 px-4 py-2 rounded border border-yellow-400 text-yellow-800 bg-yellow-50 font-semibold transition hover:bg-yellow-100"
        onClick={onReviewFlagged}
      >
        Review Flagged ({flaggedCount})
      </button>
    )}

    {/* Submit — only shown on last question or always visible */}
    <button
      type="button"
      className="ml-4 px-4 py-2 rounded border border-red-500 text-white bg-red-500 font-semibold transition hover:bg-red-600"
      onClick={onSubmit}
    >
      Submit
    </button>
  </div>
);
// ...existing code...

export default StudentManExamNavigationBar;
