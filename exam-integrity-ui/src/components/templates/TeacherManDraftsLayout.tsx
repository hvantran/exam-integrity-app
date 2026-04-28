import React from 'react';
import { Box } from '@mui/material';
import { colors, spacing } from '../../design-system/tokens';
import { AppTopBar, TeacherManDashboardSidebar, APP_BAR_HEIGHT, TEACHER_SIDEBAR_WIDTH } from '../organisms';
import type { DashboardSection } from '../organisms';

export interface DraftsLayoutProps {
  activeSection?: DashboardSection;
  userName?: string;
  onNavigate?: (section: DashboardSection) => void;
  onCreateNew?: () => void;
  onSearch?: (query: string) => void;
  onNotifications?: () => void;
  onHelp?: () => void;
  children: React.ReactNode;
}

const TeacherManDraftsLayout: React.FC<DraftsLayoutProps> = ({
  activeSection = 'review',
  userName = 'Giao vien',
  onNavigate,
  onCreateNew,
  onSearch,
  onNotifications,
  onHelp,
  children,
}) => (
  <Box sx={{ minHeight: '100vh', backgroundColor: colors.background }}>
    <AppTopBar
      userName={userName}
      onSearch={onSearch}
      onNotifications={onNotifications}
      onHelp={onHelp}
    />
    <TeacherManDashboardSidebar
      activeSection={activeSection}
      userName={userName}
      onNavigate={onNavigate}
      onCreateExam={onCreateNew}
    />
    <Box
      component="main"
      sx={{
        ml: `${TEACHER_SIDEBAR_WIDTH}px`,
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

export default TeacherManDraftsLayout;
