import React from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import { colors, spacing } from '../../design-system/tokens';
import {
  AppTopBar,
  TeacherManDashboardSidebar,
  APP_BAR_HEIGHT,
  TEACHER_SIDEBAR_WIDTH,
} from '../organisms';
import type { DashboardSection } from '../organisms';

export interface QuestionBankLayoutProps {
  userName?: string;
  userRole?: string;
  onNavigate?: (section: DashboardSection) => void;
  onCreateExam?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  onSearch?: (query: string) => void;
  onNotifications?: () => void;
  onHelp?: () => void;
  /** Slot: search/filter bar rendered above the question list */
  filterBar?: React.ReactNode;
  /** Slot: results summary row (count + sort) */
  resultsBar?: React.ReactNode;
  isLoading?: boolean;
  children?: React.ReactNode;
}

const TeacherManQuestionBankLayout: React.FC<QuestionBankLayoutProps> = ({
  userName = 'Giao vien',
  userRole,
  onNavigate,
  onCreateExam,
  onSettings,
  onLogout,
  onSearch,
  onNotifications,
  onHelp,
  filterBar,
  resultsBar,
  isLoading = false,
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
      activeSection="question-bank"
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
      <Box sx={{ pt: `${spacing.stackLg}px`, pb: '128px', px: `${spacing.margin}px` }}>
        <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
          {/* Page header */}
          <Box sx={{ mb: `${spacing.stackLg}px` }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: '32px',
                fontWeight: 600,
                color: colors.on.surface,
                mb: `${spacing.stackSm}px`,
                lineHeight: 1.25,
              }}
            >
              Question Bank
            </Typography>
            <Typography sx={{ fontSize: '14px', color: colors.on.surfaceVariant }}>
              Browse and filter approved questions to build your examination draft.
            </Typography>
          </Box>

          {isLoading ? (
            <>
              <Skeleton variant="rounded" height={72} sx={{ mb: `${spacing.stackLg}px`, borderRadius: '8px' }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: `${spacing.stackMd}px` }}>
                <Skeleton variant="text" width={180} height={24} />
                <Skeleton variant="text" width={120} height={24} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rounded" height={96} sx={{ borderRadius: '8px' }} />
                ))}
              </Box>
            </>
          ) : (
            <>
              {/* Search + filter panel */}
              {filterBar && (
                <Box
                  sx={{
                    backgroundColor: colors.surface.container.lowest,
                    border: `1px solid ${colors.outlineVariant}`,
                    borderRadius: '8px',
                    p: '20px 24px',
                    mb: `${spacing.stackLg}px`,
                  }}
                >
                  {filterBar}
                </Box>
              )}

              {/* Results bar */}
              {resultsBar && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: '12px',
                  }}
                >
                  {resultsBar}
                </Box>
              )}

              {/* Question cards */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {children}
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  </Box>
);

export default TeacherManQuestionBankLayout;

