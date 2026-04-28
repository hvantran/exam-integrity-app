import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { colors, spacing, borderRadius } from '../../design-system/tokens';
import { AppTopBar, StudentManPortalSidebar, APP_BAR_HEIGHT, STUDENT_SIDEBAR_WIDTH } from '../organisms';
import type { PortalSection } from '../organisms';

export interface FilterOption {
  label: string;
  value: string;
}

export interface LandingLayoutProps {
  studentName?: string;
  studentRole?: string;
  activeSection?: PortalSection;
  pageTitle?: string;
  pageSubtitle?: string;
  filters?: FilterOption[];
  activeFilter?: string;
  onFilterChange?: (value: string) => void;
  onNavigate?: (section: PortalSection) => void;
  onHelp?: () => void;
  onSearch?: (query: string) => void;
  onNotifications?: () => void;
  onLogout?: () => void;
  children: React.ReactNode;
}

const StudentManLandingLayout: React.FC<LandingLayoutProps> = ({
  studentName = 'Hoc vien',
  studentRole = 'Trung tam hoc tap',
  activeSection = 'overview',
  pageTitle = 'Ky thi dang dien ra',
  pageSubtitle = 'Danh sach cac bai kiem tra duoc giao cho ban.',
  filters = [],
  activeFilter = 'all',
  onFilterChange,
  onNavigate,
  onHelp,
  onSearch,
  onNotifications,
  onLogout,
  children,
}) => (
  <Box sx={{ minHeight: '100vh', backgroundColor: colors.background }}>
    <AppTopBar
      appTitle="Portal Kiem Tra"
      userName={studentName}
      onSearch={onSearch}
      onNotifications={onNotifications}
      onHelp={onHelp}
      onLogout={onLogout}
    />
    <StudentManPortalSidebar
      activeSection={activeSection}
      studentName={studentName}
      studentRole={studentRole}
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
        {/* Page header */}
        <Box sx={{ mb: `${spacing.stackLg}px` }}>
          <Typography
            sx={{
              fontSize: '32px',
              fontWeight: 600,
              color: colors.on.surface,
              lineHeight: '40px',
              letterSpacing: '-0.01em',
              mb: '8px',
            }}
          >
            {pageTitle}
          </Typography>
          {pageSubtitle && (
            <Typography sx={{ fontSize: '16px', color: colors.on.surfaceVariant }}>
              {pageSubtitle}
            </Typography>
          )}
        </Box>

        {/* Filter bar */}
        {filters.length > 0 && (
          <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap', mb: `${spacing.stackLg}px` }}>
            {filters.map((f) => (
              <Chip
                key={f.value}
                label={f.label}
                onClick={() => onFilterChange?.(f.value)}
                sx={{
                  backgroundColor: activeFilter === f.value ? colors.primary.fixed : colors.surface.container.default,
                  color: activeFilter === f.value ? colors.primary.deep : colors.on.surfaceVariant,
                  fontWeight: activeFilter === f.value ? 600 : 500,
                  borderRadius: borderRadius.full,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: activeFilter === f.value ? colors.primary.fixedDim : colors.surface.container.high },
                }}
              />
            ))}
          </Box>
        )}

        {children}
      </Box>
    </Box>
  </Box>
);

export default StudentManLandingLayout;
