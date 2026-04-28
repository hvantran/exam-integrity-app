import React from 'react';
import {
  Box, Button, Dialog, DialogContent, Divider, Typography, LinearProgress,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { colors, borderRadius } from '../../design-system/tokens';

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
const SubmitModal: React.FC<Props> = ({ open, answeredCount, totalCount, onBack, onFinalSubmit }) => {
  const unanswered = totalCount - answeredCount;
  const pct = Math.round((answeredCount / Math.max(totalCount, 1)) * 100);

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.outlineVariant}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      <DialogContent sx={{ p: 4 }}>
        {/* Icon header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box
            sx={{
              width: 48, height: 48, borderRadius: '50%',
              backgroundColor: `${colors.tertiary.main}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <WarningAmberIcon sx={{ color: colors.tertiary.main, fontSize: 26 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '18px', color: colors.on.surface }}>
              Confirm Submission
            </Typography>
            <Typography sx={{ fontSize: '13px', color: colors.on.surfaceVariant }}>
              This action cannot be undone
            </Typography>
          </Box>
        </Box>

        {/* Progress summary */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ fontSize: '13px', color: colors.on.surfaceVariant }}>Answer Progress</Typography>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: colors.on.surface }}>
              {answeredCount} / {totalCount}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              height: 8, borderRadius: borderRadius.full,
              backgroundColor: colors.surface.container.high,
              '& .MuiLinearProgress-bar': { backgroundColor: colors.secondary.main },
            }}
          />
        </Box>

        {unanswered > 0 && (
          <Box
            sx={{
              p: 2, mb: 3, borderRadius: borderRadius.default,
              backgroundColor: `${colors.tertiary.main}12`,
              border: `1px solid ${colors.tertiary.main}40`,
            }}
          >
            <Typography sx={{ fontSize: '14px', color: colors.on.surface }}>
              You have <strong>{unanswered}</strong> unanswered questions.
              Are you sure you want to submit?
            </Typography>
          </Box>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={onBack}
            sx={{ borderColor: colors.outlineVariant, color: colors.on.surface }}
          >
            Go Back
          </Button>
          <Button
            variant="contained"
            onClick={onFinalSubmit}
            sx={{ backgroundColor: colors.error, '&:hover': { backgroundColor: `${colors.error}dd` } }}
          >
            Submit
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitModal;
