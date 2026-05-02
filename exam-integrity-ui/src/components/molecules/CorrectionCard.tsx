import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
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
      <Box
        sx={{
          border: `1px solid ${colors.outlineVariant}`,
          borderRadius: borderRadius.md,
          overflow: 'hidden',
          mb: 2,
          boxShadow: shadow.cardActive,
          p: 3,
        }}
      >
        <Skeleton height={22} width={180} className="mb-4" />
        <Skeleton height={16} width="35%" className="mb-2" />
        <Skeleton height={18} width="72%" className="mb-4" />
        <Skeleton height={1} width="100%" className="mb-4" />
        <Skeleton height={16} width="38%" className="mb-2" />
        <Skeleton height={18} width="68%" className="mb-3" />
      </Box>
    );
  }

  const isPendingTeacherReview = score.status === 'SELF_GRADE_REQUIRED' || score.status === 'PENDING_ESSAY';
  const statusLabel = isPendingTeacherReview
    ? 'Awaiting Review'
    : score.status === 'INCORRECT'
      ? 'Incorrect'
      : 'Incomplete';
  const statusChipSx = isPendingTeacherReview
    ? {
        backgroundColor: '#FEF3C7',
        color: '#92400E',
      }
    : {
        backgroundColor: `${colors.error}18`,
        color: colors.error,
      };

  return (
    <Box
      sx={{
        border: `1px solid ${colors.outlineVariant}`,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        mb: 2,
        boxShadow: shadow.cardActive,
      }}
    >
    {/* Card header */}
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 3,
        py: 2,
        backgroundColor: colors.surface.container.low,
        borderBottom: `1px solid ${colors.outlineVariant}`,
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: '15px', color: colors.on.surface }}>
        Question {score.questionNumber}
      </Typography>
      <Chip
        label={statusLabel}
        size="small"
        style={{
          ...statusChipSx,
          fontWeight: 600,
          fontSize: '11px',
        }}
      />
      <Typography sx={{ ml: 'auto', fontSize: '13px', color: colors.on.surfaceVariant }}>
        {score.earnedPoints.toFixed(1)}/{score.maxPoints.toFixed(1)} pts
      </Typography>
    </Box>

    {/* Answers */}
    <Box sx={{ px: 3, py: 2 }}>
      {/* Student answer */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
        <CancelIcon sx={{ color: colors.error, fontSize: 18, mt: '2px', flexShrink: 0 }} />
        <Box>
          <Typography sx={{ fontSize: '12px', color: colors.on.surfaceVariant, mb: 0.5 }}>
            Your Answer
          </Typography>
          <Typography sx={{ fontSize: '14px', color: colors.error, fontWeight: 500 }}>
            {score.studentAnswer || '(No answer)'}
          </Typography>
        </Box>
      </Box>

      {!isPendingTeacherReview && score.correctAnswer && <Divider sx={{ my: 1.5 }} />}

      {/* Correct answer */}
      {!isPendingTeacherReview && score.correctAnswer && (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: score.explanation ? 2 : 0 }}>
          <CheckCircleIcon sx={{ color: colors.secondary.main, fontSize: 18, mt: '2px', flexShrink: 0 }} />
          <Box>
            <Typography sx={{ fontSize: '12px', color: colors.on.surfaceVariant, mb: 0.5 }}>
              Correct Answer
            </Typography>
            <Typography sx={{ fontSize: '14px', color: colors.secondary.main, fontWeight: 500 }}>
              {score.correctAnswer}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Explanation */}
      {score.explanation && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: borderRadius.default,
            backgroundColor: `${colors.primary.main}08`,
            border: `1px solid ${colors.primary.main}20`,
          }}
        >
          <Typography sx={{ fontSize: '13px', color: colors.on.surfaceVariant }}>
            <Box component="span" sx={{ fontWeight: 600, color: colors.on.surface }}>Explanation: </Box>
            {score.explanation}
          </Typography>
        </Box>
      )}
    </Box>
    </Box>
  );
};

export default CorrectionCard;
