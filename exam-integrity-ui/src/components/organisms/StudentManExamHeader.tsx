import React from 'react';
import { AppBar, Toolbar, Box, Typography, IconButton, Avatar } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SettingsIcon from '@mui/icons-material/Settings';
import { colors, zIndex } from '../../design-system/tokens';
import { ProgressBar } from '../atoms';
import { StudentManTimerDisplay, TeacherManProctoringStatusChip } from '../molecules';

export interface ExamHeaderProps {
  /** Application / exam brand name */
  brandName?: string;
  currentQuestion: number;
  totalQuestions: number;
  remainingSeconds: number;
  isProctoringActive?: boolean;
  onSettings?: () => void;
}

/**
 * Organism — StudentManExamHeader
 *
 * Sticky exam header derived from the Stitch "Student Portal – Active Exam" screen.
 * Contains: brand logo | question counter | proctoring chip | timer | action icons.
 * A 4px ProgressBar is rendered below the AppBar, fixed to the top of the viewport.
 */
const StudentManExamHeader: React.FC<ExamHeaderProps> = ({
  brandName = 'ExamIntegrity',
  currentQuestion,
  totalQuestions,
  remainingSeconds,
  isProctoringActive = true,
  onSettings,
}) => {
  const progress = Math.round((currentQuestion / totalQuestions) * 100);
  const isUrgent = remainingSeconds <= 300;

  return (
    <>
      {/* Fixed progress strip — topmost layer */}
      <ProgressBar value={progress} urgent={isUrgent} fixed />

      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          top: 4, // offset below the 4px progress bar
          backgroundColor: colors.surface.container.lowest,
          borderBottom: `1px solid ${colors.outlineVariant}`,
          zIndex: zIndex.examHeader,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 }, minHeight: 56, gap: 2 }}>
          {/* Brand */}
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '16px',
              color: colors.primary.main,
              flexShrink: 0,
              letterSpacing: '-0.02em',
            }}
          >
            {brandName}
          </Typography>

          {/* Question counter */}
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 600,
              color: colors.on.surface,
              flexShrink: 0,
            }}
          >
            Question {currentQuestion} / {totalQuestions}
          </Typography>

          <Box sx={{ flex: 1 }} />

          {/* Proctoring chip */}
          <TeacherManProctoringStatusChip active={isProctoringActive} />

          {/* Timer */}
          <StudentManTimerDisplay remainingSeconds={remainingSeconds} />

          {/* Action icons */}
          <IconButton size="small" aria-label="Notifications">
            <NotificationsNoneIcon sx={{ fontSize: 20, color: colors.on.surfaceVariant }} />
          </IconButton>
          <IconButton size="small" onClick={onSettings} aria-label="Settings">
            <SettingsIcon sx={{ fontSize: 20, color: colors.on.surfaceVariant }} />
          </IconButton>
          <Avatar
            sx={{ width: 32, height: 32, bgcolor: colors.primary.fixedDim, color: colors.primary.deep, fontSize: 14 }}
          >
            HS
          </Avatar>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default StudentManExamHeader;
