import React from 'react';
import { Box, Button, Skeleton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { colors, spacing } from '../../design-system/tokens';
import {
  AppTopBar,
  TeacherManDashboardSidebar,
  APP_BAR_HEIGHT,
  TEACHER_SIDEBAR_WIDTH,
} from '../organisms';
import type { DashboardSection } from '../organisms';

export interface IngestionLayoutProps {
  userName?: string;
  userRole?: string;
  onNavigate?: (section: DashboardSection) => void;
  onCreateExam?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  onSearch?: (query: string) => void;
  onNotifications?: () => void;
  onHelp?: () => void;
  onImportExam?: () => void;
  isLoading?: boolean;
  children?: React.ReactNode;
}

const TeacherManIngestionLayout: React.FC<IngestionLayoutProps> = ({
  userName = 'Giao vien',
  userRole,
  onNavigate,
  onCreateExam,
  onSettings,
  onLogout,
  onSearch,
  onNotifications,
  onHelp,
  onImportExam,
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
      activeSection="ingestion"
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
        {/* Page header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: `${spacing.stackLg}px`,
          }}
        >
          <Box>
            <Typography
              variant="h2"
              sx={{ fontSize: '32px', fontWeight: 600, color: colors.on.surface, lineHeight: 1.25 }}
            >
              Exam Ingestion
            </Typography>
            <Typography
              sx={{ fontSize: '14px', color: colors.on.surfaceVariant, mt: `${spacing.unit}px` }}
            >
              Manage and review uploaded exam PDFs.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onImportExam}
            sx={{
              backgroundColor: colors.primary.main,
              color: colors.primary.on,
              fontWeight: 500,
              fontSize: '14px',
              px: 3,
              py: 1.5,
              borderRadius: '4px',
              textTransform: 'none',
              '&:hover': { backgroundColor: colors.primary.deep },
            }}
          >
            Import New Exam
          </Button>
        </Box>

        {/* Exam cards grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: `${spacing.gutter}px`,
          }}
        >
          {isLoading
            ? [0, 1, 2].map((i) => (
                <Skeleton key={i} variant="rounded" height={200} sx={{ borderRadius: '12px' }} />
              ))
            : children}
        </Box>
      </Box>
    </Box>
  </Box>
);

export default TeacherManIngestionLayout;
