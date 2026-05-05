import React from 'react';
import { Button } from '../atoms';


interface Props {
  open: boolean;
  answeredCount: number;
  totalCount: number;
  onBack: () => void;
  onFinalSubmit: () => void;
}

/**
 * Submission confirmation dialog using Zen Integrity System design tokens.
 * NEVER uses browser confirm() or alert().
 */
const StudentManSubmitModal: React.FC<Props> = ({ open, answeredCount, totalCount, onBack, onFinalSubmit }) => {
  const unanswered = totalCount - answeredCount;
  const pct = Math.round((answeredCount / Math.max(totalCount, 1)) * 100);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-md p-8 animate-fadeIn">
        {/* Icon header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <span className="text-yellow-500 text-2xl" role="img" aria-label="warning">⚠️</span>
          </div>
          <div>
            <div className="font-bold text-lg text-gray-900">Confirm Submission</div>
            <div className="text-sm text-gray-500">This action cannot be undone</div>
          </div>
        </div>

        {/* Progress summary */}
        <div className="mb-6">
          <div className="flex justify-between mb-1 text-sm">
            <span className="text-gray-500">Answer Progress</span>
            <span className="font-semibold text-gray-900">{answeredCount} / {totalCount}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-500 h-2.5 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {unanswered > 0 && (
          <div
            className="flex items-center gap-2 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm"
          >
            <span className="text-lg">⚠️</span>
            {unanswered} unanswered question{unanswered > 1 ? 's' : ''} remain
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button
            onClick={onBack}
            variant="neutral"
            className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
          >
            Back
          </Button>
          <Button
            onClick={onFinalSubmit}
            variant="primary"
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  )
}

export default StudentManSubmitModal;
