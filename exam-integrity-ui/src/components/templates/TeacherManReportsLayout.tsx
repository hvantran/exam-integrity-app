import React from 'react';
import { Box, Tabs, Tab, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { colors, spacing, borderRadius } from '../../design-system/tokens';
import { AppTopBar, TeacherManDashboardSidebar, APP_BAR_HEIGHT, TEACHER_SIDEBAR_WIDTH } from '../organisms';
import type { DashboardSection } from '../organisms';

export interface ReportsLayoutProps {
  activeSection?: DashboardSection;
  userName?: string;
  activeTab?: number;
  tabs?: string[];
  onTabChange?: (tab: number) => void;
  onExport?: () => void;
  onNavigate?: (section: DashboardSection) => void;
  onSearch?: (query: string) => void;
  onNotifications?: () => void;
  onHelp?: () => void;
  children: React.ReactNode;
}

const TeacherManReportsLayout: React.FC<ReportsLayoutProps> = ({
  activeSection = 'reports',
  userName = 'Giao vien',
  activeTab = 0,
  tabs = ['Tong quan', 'Toan ven hoc thuat', 'Hieu suat', 'So sanh'],
  onTabChange,
  onExport,
  onNavigate,
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
    />
    <Box
      sx={{
        ml: `${TEACHER_SIDEBAR_WIDTH}px`,
        pt: `${APP_BAR_HEIGHT}px`,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Page-level toolbar: tabs + export */}
      <Box
        sx={{
          position: 'sticky',
          top: APP_BAR_HEIGHT,
          zIndex: 70,
          backgroundColor: colors.surface.container.lowest,
          borderBottom: `1px solid ${colors.outlineVariant}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: `${spacing.margin}px`,
          pr: `${spacing.stackLg}px`,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => onTabChange?.(v)}
          sx={{
            minHeight: 48,
            '& .MuiTab-root': {
              minHeight: 48,
              fontSize: '13px',
              textTransform: 'none',
              color: colors.on.surfaceVariant,
            },
            '& .Mui-selected': { color: colors.primary.main, fontWeight: 600 },
            '& .MuiTabs-indicator': {
              backgroundColor: colors.primary.main,
              height: 3,
              borderRadius: `${borderRadius.sm} ${borderRadius.sm} 0 0`,
            },
          }}
        >
          {tabs.map((label, i) => <Tab key={i} label={label} />)}
        </Tabs>
        {onExport && (
          <Button
            startIcon={<DownloadIcon />}
            variant="outlined"
            size="small"
            onClick={onExport}
            sx={{ borderColor: colors.outlineVariant, color: colors.on.surfaceVariant }}
          >
            Xuat bao cao
          </Button>
        )}
      </Box>
      <Box component="main" sx={{ flex: 1, p: `${spacing.margin}px`, maxWidth: spacing.containerMax, mx: 'auto', width: '100%' }}>
        {children}
      </Box>
    </Box>
  </Box>
);

export default TeacherManReportsLayout;
