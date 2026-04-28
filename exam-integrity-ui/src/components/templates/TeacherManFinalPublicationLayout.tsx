import React, { useState, KeyboardEvent } from 'react';
import { Box, Button, Chip, Skeleton, TextField, Typography } from '@mui/material';
import PublishIcon from '@mui/icons-material/Publish';
import AddIcon from '@mui/icons-material/Add';
import { colors, spacing, borderRadius } from '../../design-system/tokens';
import {
  AppTopBar,
  TeacherManDashboardSidebar,
  APP_BAR_HEIGHT,
  TEACHER_SIDEBAR_WIDTH,
} from '../organisms';
import type { DashboardSection } from '../organisms';

export interface FinalPublicationStats {
  approvedQuestions?: number;
  totalPoints?: number;
  essayRubricsStatus?: string;
}

export interface FinalPublicationFormValues {
  examTitle?: string;
  durationSeconds?: number;
  tags?: string[];
  reviewNotes?: string;
}

export interface FinalPublicationLayoutProps {
  userName?: string;
  userRole?: string;
  onNavigate?: (section: DashboardSection) => void;
  onCreateExam?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  onSearch?: (query: string) => void;
  onNotifications?: () => void;
  onHelp?: () => void;
  stats?: FinalPublicationStats;
  formValues?: FinalPublicationFormValues;
  isLoading?: boolean;
  onFormChange?: (field: keyof FinalPublicationFormValues, value: string | string[] | number) => void;
  onSaveDraft?: () => void;
  onPublish?: () => void;
}

const StatCard: React.FC<{ icon: string; value: string | number; label: string; iconColor?: string }> = ({
  icon,
  value,
  label,
  iconColor = colors.secondary.main,
}) => (
  <Box
    sx={{
      backgroundColor: colors.surface.container.lowest,
      border: `1px solid ${colors.outlineVariant}`,
      borderRadius: borderRadius.default,
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: 1,
    }}
  >
    <Box
      component="span"
      className="material-symbols-outlined"
      sx={{ fontSize: '36px', color: iconColor, fontFamily: 'Material Symbols Outlined' }}
    >
      {icon}
    </Box>
    <Typography sx={{ fontSize: '32px', fontWeight: 600, color: colors.on.surface, lineHeight: 1 }}>
      {value}
    </Typography>
    <Typography
      sx={{
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        color: colors.on.surfaceVariant,
        mt: '2px',
      }}
    >
      {label}
    </Typography>
  </Box>
);

const TeacherManFinalPublicationLayout: React.FC<FinalPublicationLayoutProps> = ({
  userName = 'Giao vien',
  userRole,
  onNavigate,
  onCreateExam,
  onSettings,
  onLogout,
  onSearch,
  onNotifications,
  onHelp,
  stats = { approvedQuestions: 45, totalPoints: 100, essayRubricsStatus: 'Ready' },
  formValues = {
    examTitle: '',
    durationSeconds: 2700,
    tags: [],
    reviewNotes: '',
  },
  isLoading = false,
  onFormChange,
  onSaveDraft,
  onPublish,
}) => {
  const [tagInput, setTagInput] = useState('');

  const tags = formValues.tags ?? [];

  const addTag = (raw: string) => {
    const trimmed = raw.trim().toLowerCase();
    if (!trimmed || tags.includes(trimmed)) return;
    onFormChange?.('tags', [...tags, trimmed]);
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    onFormChange?.('tags', tags.filter(t => t !== tag));
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
  <Box sx={{ minHeight: '100vh', backgroundColor: colors.background }}>
    <AppTopBar
      userName={userName}
      onSearch={onSearch}
      onNotifications={onNotifications}
      onHelp={onHelp}
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
        minHeight: '100vh',
        overflowY: 'auto',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: spacing.paperWidth,
          p: `${spacing.margin}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: `${spacing.stackLg}px`,
        }}
      >
        {/* Page header */}
        <Box>
          <Typography
            variant="h2"
            sx={{ fontSize: '32px', fontWeight: 600, color: colors.on.surface, mb: 1, lineHeight: 1.25 }}
          >
            Final Publication Review
          </Typography>
          <Typography sx={{ fontSize: '14px', color: colors.on.surfaceVariant }}>
            Review exam details before publishing to students.
          </Typography>
        </Box>

        {/* Summary bento grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: `${spacing.gutter}px`,
          }}
        >
          {isLoading
            ? [0, 1, 2].map((i) => (
                <Skeleton key={i} variant="rounded" height={140} sx={{ borderRadius: borderRadius.default }} />
              ))
            : (
              <>
                <StatCard
                  icon="task_alt"
                  value={stats.approvedQuestions ?? 0}
                  label="Approved Questions"
                  iconColor={colors.secondary.main}
                />
                <StatCard
                  icon="toll"
                  value={stats.totalPoints ?? 0}
                  label="Total Points"
                  iconColor={colors.primary.main}
                />
                <StatCard
                  icon="check_circle"
                  value={stats.essayRubricsStatus ?? 'Ready'}
                  label="Essay Rubrics"
                  iconColor={colors.secondary.main}
                />
              </>
            )}
        </Box>

        {/* Exam configuration form */}
        <Box
          sx={{
            backgroundColor: colors.surface.container.lowest,
            border: `1px solid ${colors.outlineVariant}`,
            borderRadius: borderRadius.default,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: `${spacing.stackMd}px`,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontSize: '24px',
              fontWeight: 600,
              color: colors.on.surface,
              borderBottom: `1px solid ${colors.outlineVariant}`,
              pb: 2,
              mb: 1,
            }}
          >
            Exam Configuration
          </Typography>

          {isLoading ? (
            <>
              <Skeleton variant="rounded" height={56} />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${spacing.gutter}px` }}>
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={56} />
              </Box>
              <Skeleton variant="rounded" height={100} />
            </>
          ) : (
            <>
              <TextField
                label="Final Title"
                fullWidth
                value={formValues.examTitle ?? ''}
                onChange={(e) => onFormChange?.('examTitle', e.target.value)}
                variant="outlined"
                size="medium"
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${spacing.gutter}px` }}>
                <Box>
                  <TextField
                    label="Duration (seconds)"
                    fullWidth
                    type="number"
                    value={formValues.durationSeconds ?? 2700}
                    onChange={(e) => onFormChange?.('durationSeconds', e.target.value)}
                    variant="outlined"
                    size="medium"
                  />
                  {formValues.durationSeconds != null && (
                    <Typography sx={{ fontSize: '12px', color: colors.on.surfaceVariant, mt: 1, textAlign: 'right' }}>
                      {Math.round((formValues.durationSeconds as number) / 60)} min
                    </Typography>
                  )}
                </Box>

                {/* Tags chip input */}
                <Box>
                  <Typography
                    sx={{ fontSize: '12px', fontWeight: 500, color: colors.on.surfaceVariant, mb: 0.75, ml: 0.25 }}
                  >
                    Tags
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: 0.75,
                      minHeight: 56,
                      border: `1px solid ${colors.outlineVariant}`,
                      borderRadius: '4px',
                      px: 1.5,
                      py: 1,
                      '&:focus-within': { borderColor: colors.primary.main, borderWidth: 2 },
                    }}
                  >
                    {tags.map(tag => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        onDelete={() => removeTag(tag)}
                        sx={{
                          backgroundColor: `${colors.primary.main}18`,
                          color: colors.primary.main,
                          fontWeight: 500,
                          '& .MuiChip-deleteIcon': { color: colors.primary.main, opacity: 0.7 },
                        }}
                      />
                    ))}
                    <Box
                      component="input"
                      value={tagInput}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
                      placeholder={tags.length === 0 ? 'Enter tag then press Enter…' : 'Add tag…'}
                      sx={{
                        border: 'none',
                        outline: 'none',
                        flex: 1,
                        minWidth: 120,
                        fontSize: '14px',
                        color: colors.on.surface,
                        backgroundColor: 'transparent',
                        fontFamily: 'inherit',
                        '&::placeholder': { color: colors.on.surfaceVariant },
                      }}
                    />
                    {tagInput.trim() && (
                      <Chip
                        label={tagInput.trim()}
                        size="small"
                        icon={<AddIcon sx={{ fontSize: 14 }} />}
                        onClick={() => addTag(tagInput)}
                        sx={{
                          backgroundColor: colors.surface.container.high,
                          color: colors.on.surface,
                          cursor: 'pointer',
                          border: `1px dashed ${colors.outlineVariant}`,
                        }}
                      />
                    )}
                  </Box>
                  <Typography sx={{ fontSize: '11px', color: colors.on.surfaceVariant, mt: 0.5, ml: 0.25 }}>
                    Press Enter or comma to add a tag. Backspace to remove the last tag.
                  </Typography>
                </Box>
              </Box>

              <TextField
                label="Review Notes (Internal)"
                fullWidth
                multiline
                rows={3}
                value={formValues.reviewNotes ?? ''}
                onChange={(e) => onFormChange?.('reviewNotes', e.target.value)}
                variant="outlined"
              />
            </>
          )}
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: `${spacing.stackMd}px` }}>
          <Button
            variant="outlined"
            onClick={onSaveDraft}
            sx={{
              fontSize: '14px',
              fontWeight: 500,
              textTransform: 'none',
              borderColor: colors.outlineVariant,
              color: colors.on.surface,
              borderRadius: borderRadius.default,
              px: 3,
              py: 1.5,
            }}
          >
            Save Draft
          </Button>
          <Button
            variant="contained"
            startIcon={<PublishIcon />}
            onClick={onPublish}
            sx={{
              fontSize: '14px',
              fontWeight: 500,
              textTransform: 'none',
              backgroundColor: colors.primary.main,
              color: colors.primary.on,
              borderRadius: borderRadius.default,
              px: 4,
              py: 1.5,
              '&:hover': { backgroundColor: colors.primary.deep },
            }}
          >
            Publish Exam
          </Button>
        </Box>
      </Box>
    </Box>
  </Box>
  );
};

export default TeacherManFinalPublicationLayout;
