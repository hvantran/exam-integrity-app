import React from 'react';
import { Box, Divider, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RateReviewIcon from '@mui/icons-material/RateReview';
import StorageIcon from '@mui/icons-material/Storage';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import { colors, typography, spacing, borderRadius } from '../../design-system/tokens';
import { APP_BAR_HEIGHT } from './AppTopBar';

export const TEACHER_SIDEBAR_WIDTH = 256;

export type DashboardSection = 'overview' | 'ingestion' | 'review' | 'question-bank' | 'reports';

export interface DashboardSidebarProps {
  activeSection?: DashboardSection;
  userName?: string;
  userRole?: string;
  onNavigate?: (section: DashboardSection) => void;
  onCreateExam?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

const navItems: { section: DashboardSection; icon: React.ReactNode; label: string }[] = [
  { section: 'overview',      icon: <DashboardIcon  sx={{ fontSize: 20 }} />, label: 'Ingestion' },
  { section: 'ingestion',     icon: <UploadFileIcon sx={{ fontSize: 20 }} />, label: 'Upload Exam' },
  { section: 'review',        icon: <RateReviewIcon sx={{ fontSize: 20 }} />, label: 'Review' },
  { section: 'question-bank', icon: <StorageIcon    sx={{ fontSize: 20 }} />, label: 'Question Bank' },
  { section: 'reports',       icon: <AnalyticsIcon  sx={{ fontSize: 20 }} />, label: 'Reports' },
];

const navBtnSx = (active: boolean) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  px: '16px',
  py: '12px',
  mr: '16px',
  borderRadius: `0 ${borderRadius.lg} ${borderRadius.lg} 0`,
  borderLeft: `4px solid ${active ? colors.primary.main : 'transparent'}`,
  borderTop: 'none',
  borderRight: 'none',
  borderBottom: 'none',
  backgroundColor: active ? colors.surface.container.lowest : 'transparent',
  color: active ? colors.primary.main : colors.on.surfaceVariant,
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.uiLabel.fontSize,
  fontWeight: active ? 600 : 500,
  cursor: 'pointer',
  textAlign: 'left' as const,
  width: '100%',
  outline: 'none',
  transition: 'background-color 0.15s, color 0.15s',
  '&:hover': active ? {} : { backgroundColor: colors.surface.container.default },
});

const TeacherManDashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeSection = 'overview',
  onNavigate,
  onCreateExam,
  onSettings,
  onLogout,
}) => (
  <Box
    component="nav"
    sx={{
      position: 'fixed',
      left: 0,
      top: APP_BAR_HEIGHT,
      width: TEACHER_SIDEBAR_WIDTH,
      height: `calc(100vh - ${APP_BAR_HEIGHT}px)`,
      zIndex: 80,
      backgroundColor: colors.surface.container.low,
      borderRight: `1px solid ${colors.outlineVariant}`,
      display: 'flex',
      flexDirection: 'column',
      py: `${spacing.stackLg}px`,
      overflowY: 'auto',
    }}
  >
    {/* Institution identity */}
    <Box
      sx={{
        px: `${spacing.margin}px`,
        mb: `${spacing.stackLg}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: borderRadius.default,
          backgroundColor: colors.surface.container.highest,
          border: `1px solid ${colors.outlineVariant}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: '8px',
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: '13px',
            fontWeight: 700,
            color: colors.primary.deep,
            userSelect: 'none',
          }}
        >
          EI
        </Typography>
      </Box>
      <Typography
        sx={{
          fontFamily: typography.fontFamily.sans,
          fontSize: typography.scale.uiLabel.fontSize,
          fontWeight: 700,
          color: colors.on.surface,
          lineHeight: 1.3,
        }}
      >
        Teacher Portal
      </Typography>
    </Box>

    {/* Navigation */}
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {navItems.map(({ section, icon, label }) => (
        <Box
          key={section}
          component="button"
          onClick={() => onNavigate?.(section)}
          sx={navBtnSx(activeSection === section)}
        >
          {icon}
          {label}
        </Box>
      ))}
    </Box>

    {/* Bottom section */}
    <Divider sx={{ mx: '16px', mb: '8px', borderColor: colors.outlineVariant }} />
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box
        component="button"
        onClick={onSettings}
        sx={navBtnSx(false)}
      >
        <SettingsIcon sx={{ fontSize: 20 }} />
        Cai dat
      </Box>
      <Box
        component="button"
        onClick={onLogout}
        sx={navBtnSx(false)}
      >
        <LogoutIcon sx={{ fontSize: 20 }} />
        Logout
      </Box>
    </Box>
  </Box>
);

export default TeacherManDashboardSidebar;
