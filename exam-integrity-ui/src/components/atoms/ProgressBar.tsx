import React from 'react';
import { LinearProgress, Box } from '@mui/material';
import { colors } from '../../design-system/tokens';

export interface ProgressBarProps {
  /** 0–100 */
  value: number;
  /** When true the bar turns Warning Red (e.g. < 5 min remaining) */
  urgent?: boolean;
  /** Render at the very top of the viewport (fixed position) */
  fixed?: boolean;
}

/**
 * Atom — ProgressBar
 *
 * 4px-tall strip used as the exam progress indicator fixed at the top of the
 * viewport. Color transitions from Trust Blue to Warning Red when `urgent`.
 */
const ProgressBar: React.FC<ProgressBarProps> = ({ value, urgent = false, fixed = false }) => (
  <Box
    sx={
      fixed
        ? { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200 }
        : { width: '100%' }
    }
  >
    <LinearProgress
      variant="determinate"
      value={Math.min(100, Math.max(0, value))}
      sx={{
        height: 4,
        borderRadius: 0,
        backgroundColor: colors.outlineVariant,
        '& .MuiLinearProgress-bar': {
          backgroundColor: urgent ? colors.tertiary.main : colors.primary.main,
          transition: 'background-color 0.5s ease',
        },
      }}
    />
  </Box>
);

export default ProgressBar;
