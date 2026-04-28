import React from 'react';
import { Box } from '@mui/material';
import { colors, spacing } from '../../design-system/tokens';

export interface ExamLayoutProps {
  header: React.ReactNode;
  children: React.ReactNode;
  /** Optional right-side question navigator panel */
  sidebar?: React.ReactNode;
}

/**
 * Template — StudentManExamLayout
 *
 * Full-screen exam layout: sticky header at the top, centred 800px "Paper"
 * column (per Zen Integrity System spec), optional narrow question-nav sidebar.
 * Generous outer margins push distractions away from the peripheral vision.
 */
const StudentManExamLayout: React.FC<ExamLayoutProps> = ({ header, children, sidebar }) => (
  <Box
    sx={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    {/* Sticky header rendered by caller (includes ProgressBar) */}
    {header}

    {/* Content area */}
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        px: { xs: 2, md: `${spacing.gutter}px` },
        py: `${spacing.stackLg}px`,
        gap: 3,
        maxWidth: spacing.containerMax,
        mx: 'auto',
        width: '100%',
      }}
    >
      {/* Paper column — 800px max */}
      <Box sx={{ flex: 1, maxWidth: spacing.paperWidth }}>
        {children}
      </Box>

      {/* Optional navigator sidebar */}
      {sidebar && (
        <Box
          sx={{
            width: 260,
            flexShrink: 0,
            display: { xs: 'none', lg: 'block' },
          }}
        >
          {sidebar}
        </Box>
      )}
    </Box>
  </Box>
);

export default StudentManExamLayout;
