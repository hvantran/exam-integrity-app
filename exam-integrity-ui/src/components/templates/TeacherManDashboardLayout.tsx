import React from 'react';
import { Box } from '@mui/material';
import { colors, spacing } from '../../design-system/tokens';
import { AppTopBar, TeacherManDashboardSidebar, APP_BAR_HEIGHT, TEACHER_SIDEBAR_WIDTH } from '../organisms';
import type { DashboardSection } from '../organisms';

export interface DashboardLayoutProps {
  activeSection?: DashboardSection;
  userName?: string;
  userRole?: string;
  onNavigate?: (section: DashboardSection) => void;
  onCreateExam?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  onSearch?: (query: string) => void;
  onNotifications?: () => void;
  onHelp?: () => void;
  children: React.ReactNode;
}

const TeacherManDashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeSection = 'dashboard',
  userName = 'Giao vien',
  userRole,
  onNavigate,
  onCreateExam,
  onSettings,
  onLogout,
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
      onLogout={onLogout}
    />
    <TeacherManDashboardSidebar
      activeSection={activeSection}
      userName={userName}
      userRole={userRole}
      onNavigate={onNavigate}
      onCreateExam={onCreateExam}
      onSettings={onSettings}
      onLogout={onLogout}
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

export default TeacherManDashboardLayout;
