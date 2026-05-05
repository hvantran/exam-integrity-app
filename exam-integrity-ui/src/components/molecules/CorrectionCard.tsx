import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { ScoreResult } from '../../types/exam.types';
import { colors, borderRadius, shadow } from '../../design-system/tokens';
import Skeleton from './Skeleton';
import { Chip } from '../atoms';

interface Props {
  score: ScoreResult;
  isLoading?: boolean;
}

/**
 * Correction card — Zen Integrity System design.
 * Red student answer (incorrect) with X icon.
 * Green correct answer with checkmark.
 */
const CorrectionCard: React.FC<Props> = ({ score, isLoading = false }) => {
  if (isLoading) {
    return (
      <div
        className="mb-2 overflow-hidden p-3"
        style={{
          border: `1px solid ${colors.outlineVariant}`,
          borderRadius: borderRadius.md,
          boxShadow: shadow.cardActive,
        }}
      >
        <Skeleton height={22} width={180} className="mb-4" />
        <Skeleton height={16} width="35%" className="mb-2" />
        <Skeleton height={18} width="72%" className="mb-4" />
        <Skeleton height={1} width="100%" className="mb-4" />
        <Skeleton height={16} width="38%" className="mb-2" />
        <Skeleton height={18} width="68%" className="mb-3" />
      </div>
    );
  }

  const isPendingTeacherReview = score.status === 'SELF_GRADE_REQUIRED' || score.status === 'PENDING_ESSAY';
  const statusLabel = isPendingTeacherReview
    ? 'Awaiting Review'
    : score.status === 'INCORRECT'
      ? 'Incorrect'
      : 'Incomplete';
  const statusChipStyle = isPendingTeacherReview
    ? {
        backgroundColor: '#FEF3C7',
        color: '#92400E',
      }
    : {
        backgroundColor: `${colors.error}18`,
        color: colors.error,
      };

  return (
    <div
      className="mb-2 overflow-hidden"
      style={{
        border: `1px solid ${colors.outlineVariant}`,
        borderRadius: borderRadius.md,
        boxShadow: shadow.cardActive,
      }}
    >
      {/* Card header */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{
          backgroundColor: colors.surface.container.low,
          borderBottom: `1px solid ${colors.outlineVariant}`,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: '15px', color: colors.on.surface }}>
          Question {score.questionNumber}
        </span>
        <Chip
          label={statusLabel}
          size="small"
          style={{
            ...statusChipStyle,
            fontWeight: 600,
            fontSize: '11px',
          }}
        />
        <span className="ml-auto" style={{ fontSize: '13px', color: colors.on.surfaceVariant }}>
          {score.earnedPoints.toFixed(1)}/{score.maxPoints.toFixed(1)} pts
        </span>
      </div>

      {/* Answers */}
      <div className="px-3 py-2">
        {/* Student answer */}
        <div className="mb-2 flex items-start gap-1.5">
          <XCircle size={18} style={{ color: colors.error, marginTop: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '12px', color: colors.on.surfaceVariant, marginBottom: '2px' }}>
              Your Answer
            </div>
            <div style={{ fontSize: '14px', color: colors.error, fontWeight: 500 }}>
              {score.studentAnswer || '(No answer)'}
            </div>
          </div>
        </div>

        {!isPendingTeacherReview && score.correctAnswer && (
          <hr className="my-1.5" style={{ borderColor: colors.outlineVariant }} />
        )}

        {/* Correct answer */}
        {!isPendingTeacherReview && score.correctAnswer && (
          <div className={`flex items-start gap-1.5 ${score.explanation ? 'mb-2' : ''}`}>
            <CheckCircle2 size={18} style={{ color: colors.secondary.main, marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '12px', color: colors.on.surfaceVariant, marginBottom: '2px' }}>
                Correct Answer
              </div>
              <div style={{ fontSize: '14px', color: colors.secondary.main, fontWeight: 500 }}>
                {score.correctAnswer}
              </div>
            </div>
          </div>
        )}

        {/* Explanation */}
        {score.explanation && (
          <div
            className="mt-2 p-2"
            style={{
              borderRadius: borderRadius.default,
              backgroundColor: `${colors.primary.main}08`,
              border: `1px solid ${colors.primary.main}20`,
            }}
          >
            <span style={{ fontSize: '13px', color: colors.on.surfaceVariant }}>
              <strong style={{ color: colors.on.surface }}>Explanation: </strong>
              {score.explanation}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CorrectionCard;
