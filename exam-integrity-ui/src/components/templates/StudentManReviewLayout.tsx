import React from 'react';
import { Box } from '@mui/material';
import { colors, spacing } from '../../design-system/tokens';
import { AppTopBar, StudentManPortalSidebar, APP_BAR_HEIGHT, STUDENT_SIDEBAR_WIDTH } from '../organisms';
import type { PortalSection } from '../organisms';

export interface ReviewLayoutProps {
  studentName?: string;
  activeSection?: PortalSection;
  onNavigate?: (section: PortalSection) => void;
  onHelp?: () => void;
  onSearch?: (query: string) => void;
  onNotifications?: () => void;
  children: React.ReactNode;
}

const StudentManReviewLayout: React.FC<ReviewLayoutProps> = ({
  studentName = 'Hoc vien',
  activeSection = 'results',
  onNavigate,
  onHelp,
  onSearch,
  onNotifications,
  children,
}) => (
  <Box sx={{ minHeight: '100vh', backgroundColor: colors.background }}>
    <AppTopBar
      appTitle="Academic Management"
      userName={studentName}
      onSearch={onSearch}
      onNotifications={onNotifications}
      onHelp={onHelp}
    />
    <StudentManPortalSidebar
      activeSection={activeSection}
      studentName={studentName}
      onNavigate={onNavigate}
      onHelp={onHelp}
    />
    <Box
      component="main"
      sx={{
        ml: `${STUDENT_SIDEBAR_WIDTH}px`,
        pt: `${APP_BAR_HEIGHT}px`,
        minHeight: '100vh',
        overflowY: 'auto',
      }}
    >
      <Box sx={{ p: `${spacing.margin}px`, maxWidth: spacing.containerMax, mx: 'auto' }}>
        {children}
      </Box>
    </Box>
  </Box>
);

export default StudentManReviewLayout;
