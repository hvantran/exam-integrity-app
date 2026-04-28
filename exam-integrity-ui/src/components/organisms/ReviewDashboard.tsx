import React from 'react';
import { Box, Typography, Paper, LinearProgress } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import type { ReviewDashboard as ReviewDashboardType } from '../../types/exam.types';
import { colors, borderRadius, shadow, spacing } from '../../design-system/tokens';
import { MistakeSummary } from '../molecules';
import { CorrectionCard } from '../molecules';

interface Props {
  dashboard: ReviewDashboardType;
}

const ReviewDashboard: React.FC<Props> = ({ dashboard }) => {
  const pct = Math.round((dashboard.totalEarned / Math.max(dashboard.totalMax, 1)) * 100);
  const correctCount = dashboard.scores.filter(s => s.status === 'CORRECT').length;
  const incorrectCount = dashboard.scores.length - correctCount;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        py: `${spacing.stackLg}px`,
        px: { xs: 2, md: `${spacing.gutter}px` },
      }}
    >
      <Box sx={{ maxWidth: spacing.paperWidth, mx: 'auto' }}>
        {/* Score hero card */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 3,
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.outlineVariant}`,
            boxShadow: shadow.cardActive,
            background: `linear-gradient(135deg, ${colors.primary.deep} 0%, ${colors.primary.main} 100%)`,
            color: '#fff',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 48, height: 48, borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <SchoolIcon sx={{ fontSize: 26 }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '20px' }}>
              Exam Results
            </Typography>
          </Box>

          {/* Big score */}
          <Typography sx={{ fontSize: '56px', fontWeight: 800, lineHeight: 1, mb: 1 }}>
            {dashboard.finalScore10.toFixed(1)}
            <Typography component="span" sx={{ fontSize: '24px', fontWeight: 400, opacity: 0.8 }}>
              /10
            </Typography>
          </Typography>

          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              height: 6,
              borderRadius: borderRadius.full,
              backgroundColor: 'rgba(255,255,255,0.25)',
              '& .MuiLinearProgress-bar': { backgroundColor: '#fff' },
              mb: 2,
            }}
          />

          {/* Stats row */}
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 18, opacity: 0.9 }} />
              <Typography sx={{ fontSize: '14px', opacity: 0.9 }}>
                Correct: <strong>{correctCount}</strong>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CancelOutlinedIcon sx={{ fontSize: 18, opacity: 0.9 }} />
              <Typography sx={{ fontSize: '14px', opacity: 0.9 }}>
                Incorrect: <strong>{incorrectCount}</strong>
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '14px', opacity: 0.9, ml: 'auto' }}>
              {dashboard.totalEarned.toFixed(1)} / {dashboard.totalMax.toFixed(1)} pts
            </Typography>
          </Box>
        </Paper>

        {/* Essay notice */}
        <Box
          sx={{
            p: 2,
            mb: 3,
            borderRadius: borderRadius.default,
            backgroundColor: `${colors.primary.main}0d`,
            border: `1px solid ${colors.primary.main}30`,
          }}
        >
          <Typography sx={{ fontSize: '13px', color: colors.on.surfaceVariant }}>
            Note: Essay questions require manual grading by the teacher.
          </Typography>
        </Box>

        <MistakeSummary missedNumbers={dashboard.missedQuestionNumbers ?? []} />

        {/* Corrections */}
        {dashboard.scores.filter(s => s.status !== 'CORRECT').length > 0 && (
          <>
            <Typography sx={{ fontWeight: 700, fontSize: '16px', color: colors.on.surface, mb: 2 }}>
              Questions to Review
            </Typography>
            {dashboard.scores
              .filter(s => s.status !== 'CORRECT')
              .map(s => <CorrectionCard key={s.questionId} score={s} />)}
          </>
        )}
      </Box>
    </Box>
  );
};

export default ReviewDashboard;
