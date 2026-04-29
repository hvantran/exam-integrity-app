import React from 'react';
import { Box } from '@mui/material';
import StudentManProTips from '../organisms/StudentManProTips';
import { colors, spacing } from '../../design-system/tokens';

export interface ExamLayoutProps {
  header: React.ReactNode;
  children: React.ReactNode;
  /** Optional right-side question navigator panel */
  sidebar?: React.ReactNode;
  /** Optional footer (e.g., navigation bar) rendered inside the main card */
  footer?: React.ReactNode;
  /** Optional exam tips to display above the main content */
  proTips?: string[];
}

/**
 * Template — StudentManExamLayout
 *
 * Full-screen exam layout: sticky header at the top, centred 800px "Paper"
 * column (per Zen Integrity System spec), optional narrow question-nav sidebar.
 * Generous outer margins push distractions away from the peripheral vision.
 */
const StudentManExamLayout: React.FC<ExamLayoutProps> = ({ header, children, sidebar, footer, proTips }) => (
  <Box
    sx={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, #f7fafc 0%, #e9eef6 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    }}
  >
    {/* Sticky header rendered by caller (includes ProgressBar) */}
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
      }}
    >
      {header}
    </Box>

    {/* Content area */}
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        px: { xs: 1, md: 4 },
        py: { xs: 2, md: 6 },
        gap: { xs: 2, md: 4 },
        maxWidth: 1440,
        mx: 'auto',
        width: '100%',
      }}
    >
      {/* Paper column — 800px max, with card effect */}
      <Box
        sx={{
          flex: 1,
          maxWidth: 1040,
          backgroundColor: '#fff',
          borderRadius: 3,
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.07)',
          p: { xs: 2, md: 4 },
          minHeight: 600,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Main content and ProTips side by side */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row', gap: 3 }}>
          <Box sx={{ flex: 2, minWidth: 0, display: 'flex', flexDirection: 'column' }}>{children}</Box>
          {proTips && proTips.length > 0 && (
            <Box sx={{ flex: 1, minWidth: 220, maxWidth: 280, ml: 2, alignSelf: 'flex-start' }}>
              <StudentManProTips tips={proTips} />
            </Box>
          )}
        </Box>
        {footer && (
          <Box sx={{ mt: 3 }}>{footer}</Box>
        )}
      </Box>

      {/* Optional navigator sidebar */}
      {sidebar && (
        <Box
          sx={{
            width: 280,
            flexShrink: 0,
            display: { xs: 'none', lg: 'block' },
            backgroundColor: '#f5f7fa',
            borderRadius: 3,
            boxShadow: '0 2px 12px 0 rgba(0,0,0,0.04)',
            p: 2,
            minHeight: 600,
            ml: 2,
          }}
        >
          {sidebar}
        </Box>
      )}
    </Box>
  </Box>
);

export default StudentManExamLayout;
