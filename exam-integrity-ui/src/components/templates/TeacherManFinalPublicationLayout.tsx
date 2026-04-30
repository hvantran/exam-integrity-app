import React, { useState, KeyboardEvent } from 'react';
import { Box, Button, Chip, TextField, Typography } from '@mui/material';
import { Skeleton } from '../molecules';
import PublishIcon from '@mui/icons-material/Publish';
import {Add as AddIcon, CheckCircleOutlined, FunctionsOutlined, ChromeReaderModeOutlined} from '@mui/icons-material';
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

const StatCard: React.FC<{ icon: React.ReactNode; value: string | number; label: string; iconColor?: string }> = ({
  icon,
  value,
  label,
  iconColor = '#6D28D9', // fallback color
}) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center gap-2">
    <span className="material-symbols-outlined" style={{ fontSize: 36, color: iconColor, fontFamily: 'Material Symbols Outlined' }}>{icon}</span>
    <span className="text-3xl font-semibold text-gray-900 leading-none">{value}</span>
    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-0.5">{label}</span>
  </div>
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
    const trimmed = raw.trim();
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
    <div className="min-h-screen bg-gray-50">
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
      <main className="ml-[256px] pt-[64px] min-h-screen overflow-y-auto flex justify-center">
        <div className="w-full max-w-4xl p-6 flex flex-col gap-8">
        {/* Page header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1 leading-tight">Final Publication Review</h2>
          <div className="text-sm text-gray-500">Review exam details before publishing to students.</div>
        </div>

        {/* Summary bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isLoading
            ? [0, 1, 2].map((i) => (
                <Skeleton key={i} height={140} className="rounded-lg mb-2" />
              ))
            : (
              <>
                <StatCard
                  icon=<CheckCircleOutlined/>
                  value={stats.approvedQuestions ?? 0}
                  label="Approved Questions"
                  iconColor={colors.secondary.main}
                />
                <StatCard
                  icon=<FunctionsOutlined/>
                  value={stats.totalPoints ?? 0}
                  label="Total Points"
                  iconColor={colors.primary.main}
                />
                <StatCard
                  icon=<ChromeReaderModeOutlined/>
                  value={stats.essayRubricsStatus ?? 'Ready'}
                  label="Essay Rubrics"
                  iconColor={colors.secondary.main}
                />
              </>
            )}
        </div>

        {/* Exam configuration form */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col gap-6">
          <h3 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-1">Exam Configuration</h3>

          {isLoading ? (
            <>
              <Skeleton height={56} className="mb-2" />
              <div className="grid grid-cols-2 gap-4 mb-2">
                <Skeleton height={56} />
                <Skeleton height={56} />
              </div>
              <Skeleton height={100} />
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography
                    sx={{ fontSize: '12px', fontWeight: 500, color: colors.on.surfaceVariant, mb: 0.75, ml: 0.25 }}
                  >
                    Duaration (seconds)
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    value={formValues.durationSeconds ?? 2700}
                    onChange={(e) => onFormChange?.('durationSeconds', e.target.value)}
                    variant="outlined"
                    size="medium"
                  />
                </div>

                {/* Tags chip input */}
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1 ml-1">Tags</div>
                  <div className="flex flex-wrap items-center gap-2 min-h-[56px] border border-gray-200 rounded px-3 py-2 focus-within:border-violet-700 focus-within:border-2">
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
                    <input
                      className="border-none outline-none flex-1 min-w-[120px] text-sm bg-transparent font-inherit placeholder:text-gray-400"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
                      placeholder={tags.length === 0 ? 'Enter tag then press Enter…' : 'Add tag…'}
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
                  </div>
                </div>
              </div>

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
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            variant="outlined"
            onClick={onSaveDraft}
            className="text-sm font-medium border-gray-200 text-gray-900 rounded-lg px-6 py-2"
          >
            Save Draft
          </Button>
          <Button
            variant="contained"
            startIcon={<PublishIcon />}
            onClick={onPublish}
            className="text-sm font-medium bg-violet-700 text-white rounded-lg px-8 py-2 hover:bg-violet-800"
          >
            Publish Exam
          </Button>
        </div>
      </div>
    </main>
    </div>
  );
};

export default TeacherManFinalPublicationLayout;
