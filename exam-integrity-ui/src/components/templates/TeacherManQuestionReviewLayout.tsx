import React from 'react';
import { Box, Button, Divider, Skeleton, Typography } from '@mui/material';
import FindReplaceIcon from '@mui/icons-material/FindReplace';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { colors, spacing } from '../../design-system/tokens';
import {
  AppTopBar,
  TeacherManDashboardSidebar,
  APP_BAR_HEIGHT,
  TEACHER_SIDEBAR_WIDTH,
} from '../organisms';
import type { DashboardSection } from '../organisms';

export interface QuestionReviewLayoutProps {
  userName?: string;
  userRole?: string;
  onNavigate?: (section: DashboardSection) => void;
  onCreateExam?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  onNotifications?: () => void;
  onHelp?: () => void;
  /** Current question number (1-based) */
  questionNumber?: number;
  /** Total questions in the exam */
  totalQuestions?: number;
  /** Exam name shown in breadcrumb */
  examName?: string;
  onReplace?: () => void;
  onDelete?: () => void;
  onApprove?: () => void;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  isLoading?: boolean;
  /** Slot: left panel content (original scan / image) */
  leftPanel?: React.ReactNode;
  /** Slot: right panel content (parsed content editor) */
  rightPanel?: React.ReactNode;
}

const TeacherManQuestionReviewLayout: React.FC<QuestionReviewLayoutProps> = ({
  userName = 'Giao vien',
  userRole,
  onNavigate,
  onCreateExam,
  onSettings,
  onLogout,
  onNotifications,
  onHelp,
  questionNumber = 1,
  totalQuestions = 1,
  examName,
  onReplace,
  onDelete,
  onApprove,
  onSaveDraft,
  onPublish,
  isLoading = false,
  leftPanel,
  rightPanel,
}) => (
  <Box sx={{ minHeight: '100vh', backgroundColor: colors.background, display: 'flex', flexDirection: 'column' }}>
    <AppTopBar
      userName={userName}
      showSearch={false}
      onNotifications={onNotifications}
      onHelp={onHelp}
      appTitle={examName ? `IntegrityReview` : undefined}
    />
    <TeacherManDashboardSidebar
      activeSection="review"
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
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: `calc(100vh - ${APP_BAR_HEIGHT}px)`,
      }}
    >
      {/* Exam breadcrumb sub-header */}
      {examName && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: `${spacing.margin}px`,
            py: 1.5,
            borderBottom: `1px solid ${colors.outlineVariant}`,
            backgroundColor: colors.surface.container.lowest,
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ fontSize: '14px', color: colors.on.surfaceVariant }}>
              {examName}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={onSaveDraft}
              sx={{
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'none',
                borderColor: colors.outlineVariant,
                color: colors.primary.main,
                borderRadius: '4px',
              }}
            >
              Save Draft
            </Button>
            <Button
              variant="contained"
              onClick={onPublish}
              sx={{
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'none',
                backgroundColor: colors.primary.main,
                color: colors.primary.on,
                borderRadius: '4px',
                '&:hover': { backgroundColor: colors.primary.deep },
              }}
            >
              Publish
            </Button>
          </Box>
        </Box>
      )}

      {/* Inner scrollable area */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: `${spacing.margin}px` }}>
        {/* Screen header + actions */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            mb: `${spacing.stackLg}px`,
            flexShrink: 0,
          }}
        >
          <Box>
            <Typography
              sx={{ fontSize: '14px', fontWeight: 500, color: colors.on.surfaceVariant, mb: `${spacing.unit}px` }}
            >
              Question {questionNumber}{' '}
              <Box component="span" sx={{ color: colors.outline }}>
                / {totalQuestions}
              </Box>
            </Typography>
            <Typography
              variant="h2"
              sx={{ fontSize: '32px', fontWeight: 600, color: colors.on.surface, lineHeight: 1.25 }}
            >
              Review &amp; Edit Question
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: `${spacing.stackSm}px` }}>
            <Button
              variant="outlined"
              startIcon={<FindReplaceIcon />}
              onClick={onReplace}
              sx={{
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'none',
                borderColor: colors.outlineVariant,
                color: colors.on.surface,
                borderRadius: '8px',
                '&:hover': { backgroundColor: colors.surface.container.highest },
              }}
            >
              Replace from Bank
            </Button>
            <Button
              variant="outlined"
              startIcon={<CheckCircleOutlineIcon />}
              onClick={onApprove}
              sx={{
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'none',
                borderColor: colors.secondary.main,
                color: colors.secondary.main,
                borderRadius: '8px',
                '&:hover': { backgroundColor: `${colors.secondary.main}14` },
              }}
            >
              Approve
            </Button>
            <Button
              variant="outlined"
              startIcon={<DeleteOutlineIcon />}
              onClick={onDelete}
              sx={{
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'none',
                borderColor: '#FFDAD6',
                color: '#BA1A1A',
                borderRadius: '8px',
                '&:hover': { backgroundColor: '#FFDAD6' },
              }}
            >
              Delete Question
            </Button>
          </Box>
        </Box>

        {/* Split 2-column panel */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: `${spacing.gutter}px`,
            minHeight: '60vh',
          }}
        >
          {/* Left panel: Original Scan */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: colors.surface.container.lowest,
              border: `1px solid ${colors.outlineVariant}`,
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 3,
                py: 2,
                borderBottom: `1px solid ${colors.outlineVariant}`,
                flexShrink: 0,
              }}
            >
              <Typography sx={{ fontSize: '18px', fontWeight: 600, color: colors.on.surface }}>
                Original Scan
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                p: 3,
                backgroundColor: colors.surface.container.low,
                overflowY: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isLoading ? (
                <Skeleton variant="rounded" sx={{ width: '100%', height: '100%', minHeight: 300 }} />
              ) : (
                leftPanel ?? (
                  <Typography sx={{ color: colors.on.surfaceVariant, fontSize: '14px' }}>
                    No scan provided.
                  </Typography>
                )
              )}
            </Box>
          </Box>

          {/* Right panel: Parsed Content */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: colors.surface.container.lowest,
              border: `1px solid ${colors.outlineVariant}`,
              borderLeft: `4px solid ${colors.primary.main}`,
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 3,
                py: 2,
                borderBottom: `1px solid ${colors.outlineVariant}`,
                flexShrink: 0,
              }}
            >
              <Typography sx={{ fontSize: '18px', fontWeight: 600, color: colors.on.surface }}>
                Parsed Content
              </Typography>
            </Box>
            <Box sx={{ flex: 1, p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {isLoading ? (
                <>
                  <Skeleton variant="rounded" height={72} />
                  <Skeleton variant="rounded" height={80} />
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} variant="rounded" height={52} />
                  ))}
                </>
              ) : (
                rightPanel ?? (
                  <Typography sx={{ color: colors.on.surfaceVariant, fontSize: '14px' }}>
                    No parsed content provided.
                  </Typography>
                )
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  </Box>
);

export default TeacherManQuestionReviewLayout;
