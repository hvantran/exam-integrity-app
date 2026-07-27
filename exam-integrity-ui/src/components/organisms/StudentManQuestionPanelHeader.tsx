import React from 'react';
import { Flag } from 'lucide-react';
import Button from '../atoms/Button';

export interface StudentManQuestionPanelHeaderProps {
  questionNumber: number;
  subject?: string;
  gradeLevel?: string;
  tone?: 'elementary' | 'middle' | 'high';
  isFlagged?: boolean;
  onFlag?: () => void;
}

const StudentManQuestionPanelHeader: React.FC<StudentManQuestionPanelHeaderProps> = ({
  questionNumber,
  subject,
  gradeLevel,
  tone = 'high',
  isFlagged = false,
  onFlag,
}) => {
  const toneClasses = {
    elementary: {
      badge: 'bg-cyan-500',
      label: 'text-cyan-700',
    },
    middle: {
      badge: 'bg-emerald-600',
      label: 'text-emerald-700',
    },
    high: {
      badge: 'bg-sky-600',
      label: 'text-slate-500',
    },
  }[tone];

  return (
    <div className="flex items-start justify-between gap-3 mb-4">
    <div className="flex items-center gap-4 min-w-0">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${toneClasses.badge}`}
      >
        <span className="text-white text-sm font-bold">{questionNumber}</span>
      </div>
      <div className="flex flex-col min-w-0">
        <span className={`text-xs uppercase tracking-wide font-semibold ${toneClasses.label}`}>
          Question {questionNumber}
        </span>
        {(subject || gradeLevel) && (
          <span className="text-slate-500 text-xs font-medium truncate">
            {[subject, gradeLevel].filter(Boolean).join(' · ')}
          </span>
        )}
      </div>
    </div>

    <div className="flex items-start gap-3">
      {onFlag && (
        <Button
          variant={isFlagged ? 'warning' : 'neutral'}
          icon={<Flag size={16} className={isFlagged ? 'text-warning-700' : 'text-slate-500'} />}
          onClick={onFlag}
          className="shrink-0"
        >
          {isFlagged ? 'Unflag' : 'Flag'}
        </Button>
      )}
    </div>
  </div>
  );
};

export default StudentManQuestionPanelHeader;
