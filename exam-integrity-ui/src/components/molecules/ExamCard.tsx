import React from 'react';
import ScheduleIcon from '@mui/icons-material/Schedule';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import GradeIcon from '@mui/icons-material/Grade';
import { Button } from '../atoms';

export interface ExamCardProps {
  title: string;
  /** Primary subject tag e.g. "Toán", "Tiếng Việt" */
  subject: string;
  /** Grade tag e.g. "Lớp 4" */
  grade?: string;
  /** Type tag e.g. "Giữa kỳ", "Đọc hiểu" */
  type?: string;
  durationMinutes: number;
  questionCount: number;
  points?: number;
  /**
   * When true the left accent bar uses Trust Blue (assigned/active).
   * When false it uses a neutral surface-variant colour.
   */
  isHighlighted?: boolean;
  onStart?: () => void;
}

/**
 * Molecule — ExamCard
 *
 * Exam card used in the Student Portal Landing Page grid.
 * Per Zen Integrity System: white card, 1px outline-variant border, 4px
 * left accent bar (Trust Blue when highlighted, neutral otherwise).
 */
const ExamCard: React.FC<ExamCardProps> = ({
  title,
  subject,
  grade,
  type,
  durationMinutes,
  questionCount,
  points,
  isHighlighted = false,
  onStart,
}) => {
  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-lg bg-surface-lowest border border-outlineVariant p-8"
    >
      {/* Left accent bar — 4px Trust Blue strip per spec */}
      <div
        className={`absolute bottom-0 left-0 top-0 w-1 rounded-l-lg ${isHighlighted ? 'bg-primary-container' : 'bg-surface-highest'}`}
      />

      <div className="flex-1">
        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-2">
          {[subject, grade, type].filter(Boolean).map((tag) => (
            <span
              key={tag}
              className="uppercase inline-flex items-center text-[11px] font-semibold tracking-wide bg-surface-low text-primary-container rounded-sm px-1.5 h-5"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <div className="text-xl font-semibold leading-7 text-on-surface mb-4 line-clamp-2">
          {title}
        </div>

        {/* Metadata row */}
        <div
          className="mt-4 flex flex-wrap gap-4 pt-4 border-t border-surface-highest"
        >
          <div className="flex items-center gap-1 text-on-surfaceVariant">
            <ScheduleIcon sx={{ fontSize: 18 }} />
            <span className="text-sm font-medium leading-5">
              {durationMinutes} min
            </span>
          </div>
          <div className="flex items-center gap-1 text-on-surfaceVariant">
            <FormatListNumberedIcon sx={{ fontSize: 18 }} />
            <span className="text-sm font-medium leading-5">
              {questionCount} questions
            </span>
          </div>
          {points !== undefined && (
            <div className="flex items-center gap-1 text-on-surfaceVariant">
              <GradeIcon sx={{ fontSize: 18 }} />
              <span className="text-sm font-medium leading-5">
                {points} pts
              </span>
            </div>
          )}
        </div>
      </div>

      {/* CTA button */}
      <Button
        variant={isHighlighted ? 'primary' : 'outlined'}
        fullWidth
        onClick={onStart}
        className="mt-6"
        size="md"
      >
        Start Exam
      </Button>
    </div>
  );
};

export default ExamCard;
