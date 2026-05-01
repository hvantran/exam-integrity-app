import React from 'react';
import { Box, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { colors, borderRadius } from '../../design-system/tokens';

interface Props {
  missedNumbers: number[];
}

const MistakeSummary: React.FC<Props> = ({ missedNumbers }) => {
  if (!missedNumbers.length) return null;
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        p: 2,
        mb: 3,
        borderRadius: borderRadius.default,
        backgroundColor: `${colors.tertiary.main}12`,
        border: `1px solid ${colors.tertiary.main}50`,
      }}
    >
      <WarningAmberIcon sx={{ color: colors.tertiary.main, fontSize: 20, flexShrink: 0, mt: '2px' }} />
      <Box>
        <Typography sx={{ fontWeight: 600, fontSize: '13px', color: colors.tertiary.main, mb: 0.5 }}>
          Questions to Review
        </Typography>
        <Typography sx={{ fontSize: '13px', color: colors.on.surfaceVariant }}>
          Review the following questions:{' '}
          <strong style={{ color: colors.on.surface }}>
            {missedNumbers.join(', ')}
          </strong>
        </Typography>
      </Box>
    </Box>
  );
};

export default MistakeSummary;
