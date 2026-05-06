import React from 'react';
import { Settings } from 'lucide-react';
import { Button, ProgressBar } from '../atoms';
import { TimerDisplay, ProctoringStatusChip } from '../molecules';

export interface ExamHeaderProps {
  /** Application / exam brand name */
  brandName?: string;
  currentQuestion: number;
  totalQuestions: number;
  remainingSeconds: number;
  isProctoringActive?: boolean;
  onSettings?: () => void;
}

const StudentManExamHeader: React.FC<ExamHeaderProps> = ({
  brandName = 'ExamIntegrity',
  currentQuestion,
  totalQuestions,
  remainingSeconds,
  isProctoringActive = true,
  onSettings,
}) => {
  const progress = Math.round((currentQuestion / totalQuestions) * 100);
  const isUrgent = remainingSeconds <= 300;

  return (
    <>
      {/* Fixed progress strip topmost layer */}
      <ProgressBar value={progress} urgent={isUrgent} fixed />

      <header className="sticky top-1 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center min-h-[56px] gap-2 px-4 md:px-8">
          {/* Brand */}
          <span className="font-bold text-base text-blue-600 shrink-0 tracking-tight">
            {brandName}
          </span>

          {/* Question counter */}
          <span className="text-sm font-semibold text-gray-900 shrink-0">
            Question {currentQuestion} / {totalQuestions}
          </span>

          <div className="flex-1" />

          {/* Proctoring chip */}
          <span className="hidden md:inline-block mr-2">
            <ProctoringStatusChip active={isProctoringActive} />
          </span>

          {/* Timer */}
          <span className="mr-2">
            <TimerDisplay remainingSeconds={remainingSeconds} />
          </span>

          {/* Action icons */}
          <Button
            onClick={onSettings}
            variant="ghost"
            size="sm"
            icon={<Settings size={16} className="text-slate-400" />}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </header>
    </>
  );
};

export default StudentManExamHeader;
