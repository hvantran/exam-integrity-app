import React from 'react';
import ScheduleIcon from '@mui/icons-material/Schedule';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import GradeIcon from '@mui/icons-material/Grade';
import { colors, borderRadius, shadow, spacing } from '../../design-system/tokens';
import { Button, Chip } from '../atoms';

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
  const accentColor = isHighlighted ? colors.primary.container : colors.surface.container.highest;

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden"
      style={{
        backgroundColor: colors.surface.container.lowest,
        border: `1px solid ${colors.outlineVariant}`,
        borderRadius: borderRadius.lg,
        padding: `${spacing.stackLg}px`,
      }}
    >
      {/* Left accent bar — 4px Trust Blue strip per spec */}
      <div
        className="absolute bottom-0 left-0 top-0 w-1"
        style={{ backgroundColor: accentColor, borderRadius: `${borderRadius.lg} 0 0 ${borderRadius.lg}` }}
      />

      <div className="flex-1">
        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-2" style={{ marginBottom: `${spacing.stackMd}px` }}>
          {[subject, grade, type].filter(Boolean).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              className="uppercase"
              style={{ backgroundColor: colors.surface.container.low, color: colors.primary.container }}
            />
          ))}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '20px',
            fontWeight: 600,
            lineHeight: '28px',
            color: colors.on.surface,
            marginBottom: `${spacing.stackMd}px`,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </div>

        {/* Metadata row */}
        <div
          className="mt-4 flex flex-wrap gap-4 pt-4"
          style={{ marginTop: `${spacing.stackMd}px`, paddingTop: `${spacing.stackMd}px`, borderTop: `1px solid ${colors.surface.container.highest}` }}
        >
          <div className="flex items-center gap-1" style={{ color: colors.on.surfaceVariant }}>
            <ScheduleIcon style={{ fontSize: 18 }} />
            <span style={{ fontSize: '14px', fontWeight: 500, lineHeight: '20px' }}>
              {durationMinutes} min
            </span>
          </div>
          <div className="flex items-center gap-1" style={{ color: colors.on.surfaceVariant }}>
            <FormatListNumberedIcon style={{ fontSize: 18 }} />
            <span style={{ fontSize: '14px', fontWeight: 500, lineHeight: '20px' }}>
              {questionCount} questions
            </span>
          </div>
          {points !== undefined && (
            <div className="flex items-center gap-1" style={{ color: colors.on.surfaceVariant }}>
              <GradeIcon style={{ fontSize: 18 }} />
              <span style={{ fontSize: '14px', fontWeight: 500, lineHeight: '20px' }}>
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
