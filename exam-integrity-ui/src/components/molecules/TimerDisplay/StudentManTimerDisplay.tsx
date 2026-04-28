import React from 'react';
import { Box, Typography } from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { colors } from '../../../design-system/tokens';

export interface TimerDisplayProps {
  /** Total seconds remaining */
  remainingSeconds: number;
  /** Show schedule icon to the left of time */
  showIcon?: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Molecule — StudentManTimerDisplay
 *
 * Shows MM:SS countdown. Turns Warning Red when ≤ 5 minutes remain,
 * per Zen Integrity System spec ("Warning Red is used for time-remaining warnings").
 */
const StudentManTimerDisplay: React.FC<TimerDisplayProps> = ({ remainingSeconds, showIcon = true }) => {
  const isUrgent = remainingSeconds <= 300;
  const mm = pad(Math.floor(remainingSeconds / 60));
  const ss = pad(remainingSeconds % 60);
  const color = isUrgent ? colors.tertiary.main : colors.secondary.main;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color,
        transition: 'color 0.5s ease',
      }}
    >
      {showIcon && <ScheduleIcon sx={{ fontSize: 18, color }} />}
      <Typography
        component="span"
        sx={{
          fontFamily: '"Space Grotesk", monospace',
          fontSize: '16px',
          fontWeight: 700,
          letterSpacing: '0.04em',
          lineHeight: 1,
          color,
        }}
      >
        {mm}:{ss}
      </Typography>
      {isUrgent && (
        <Typography
          component="span"
          sx={{ fontSize: '11px', fontWeight: 600, color, opacity: 0.85 }}
        >
          Time running out
        </Typography>
      )}
    </Box>
  );
};

export default StudentManTimerDisplay;
