import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';
import { colors, borderRadius } from '../../../design-system/tokens';

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.6; transform: scale(1.35); }
`;

export interface ProctoringStatusChipProps {
  active?: boolean;
  label?: string;
}

/**
 * Molecule — TeacherManProctoringStatusChip
 *
 * "Integrity Green" pill with a pulsing dot indicating live proctoring.
 * When active=false it shows a neutral "Proctoring Off" state.
 */
const TeacherManProctoringStatusChip: React.FC<ProctoringStatusChipProps> = ({
  active = true,
  label,
}) => {
  const displayLabel = label ?? (active ? 'Proctoring Active' : 'Proctoring Off');
  const dotColor = active ? colors.secondary.main : colors.outline;
  const bgColor = active ? '#DCFCE7' : colors.surface.container.highest;
  const textColor = active ? colors.secondary.main : colors.on.surfaceVariant;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        px: '10px',
        py: '4px',
        borderRadius: borderRadius.full,
        backgroundColor: bgColor,
        border: `1px solid ${active ? '#86EFAC' : colors.outlineVariant}`,
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: dotColor,
          flexShrink: 0,
          ...(active && { animation: `${pulse} 1.8s ease-in-out infinite` }),
        }}
      />
      <Typography
        component="span"
        sx={{ fontSize: '12px', fontWeight: 600, color: textColor, whiteSpace: 'nowrap' }}
      >
        {displayLabel}
      </Typography>
    </Box>
  );
};

export default TeacherManProctoringStatusChip;
