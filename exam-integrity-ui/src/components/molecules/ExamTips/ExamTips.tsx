import React from 'react';
import { Box, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { colors, borderRadius } from '../../../design-system/tokens';

/**
 * Exam tips banner using Zen Integrity System design tokens.
 */
const ExamTips: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      gap: 1.5,
      p: 2,
      mb: 3,
      borderRadius: borderRadius.default,
      backgroundColor: `${colors.primary.main}0d`,
      border: `1px solid ${colors.primary.main}30`,
    }}
  >
    <InfoOutlinedIcon sx={{ color: colors.primary.main, fontSize: 20, flexShrink: 0, mt: '1px' }} />
    <Box>
      <Typography sx={{ fontWeight: 600, fontSize: '13px', color: colors.primary.main, mb: 0.5 }}>
        Exam Instructions
      </Typography>
      <Typography component="ul" sx={{ m: 0, pl: 2, fontSize: '13px', color: colors.on.surfaceVariant }}>
        <li>The system will automatically submit your exam when time runs out.</li>
        <li>Read each question carefully before answering to avoid mistakes.</li>
        <li>Use the <strong>Flag</strong> feature if you are unsure about an answer.</li>
      </Typography>
    </Box>
  </Box>
);

export default ExamTips;
