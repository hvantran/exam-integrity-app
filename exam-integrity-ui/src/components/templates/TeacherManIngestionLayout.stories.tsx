import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Chip, Typography, Button } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import WarningIcon from '@mui/icons-material/Warning';
import TeacherManIngestionLayout from './TeacherManIngestionLayout';
import { colors, spacing, borderRadius } from '../../design-system/tokens';

const meta: Meta<typeof TeacherManIngestionLayout> = {
  title: 'Templates/TeacherManIngestionLayout',
  component: TeacherManIngestionLayout,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof TeacherManIngestionLayout>;

interface ExamCardProps {
  filename: string;
  status: 'PENDING_REVIEW' | 'UNDER_REVIEW' | 'APPROVED';
  ocrConfidence: number;
  flaggedQuestions: number;
  warning?: string;
}

const statusColors: Record<ExamCardProps['status'], string> = {
  PENDING_REVIEW: colors.surface.container.highest,
  UNDER_REVIEW: colors.primary.fixed,
  APPROVED: colors.secondary.container,
};
const statusTextColors: Record<ExamCardProps['status'], string> = {
  PENDING_REVIEW: colors.on.surfaceVariant,
  UNDER_REVIEW: colors.primary.main,
  APPROVED: colors.secondary.onContainer,
};
const accentColors: Record<ExamCardProps['status'], string> = {
  PENDING_REVIEW: colors.outlineVariant,
  UNDER_REVIEW: colors.primary.main,
  APPROVED: colors.secondary.main,
};

const ExamCard: React.FC<ExamCardProps> = ({ filename, status, ocrConfidence, flaggedQuestions, warning }) => (
  <Box
    sx={{
      backgroundColor: colors.surface.container.lowest,
      border: `1px solid ${colors.outlineVariant}`,
      borderRadius: borderRadius.xl,
      p: `${spacing.stackLg}px`,
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: accentColors[status] }} />
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: `${spacing.stackMd}px` }}>
      <Box>
        <Typography sx={{ fontSize: '14px', fontWeight: 500, color: colors.on.surfaceVariant, mb: 0.5 }}>
          {filename}
        </Typography>
        <Chip
          label={status}
          size="small"
          sx={{
            backgroundColor: statusColors[status],
            color: statusTextColors[status],
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.05em',
            height: 24,
          }}
        />
      </Box>
      <MoreVertIcon sx={{ color: colors.outline, fontSize: 20 }} />
    </Box>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: `${spacing.stackMd}px` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: '14px', color: colors.on.surfaceVariant }}>OCR Confidence</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 64, height: 6, backgroundColor: colors.surface.container.default, borderRadius: '9999px', overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${ocrConfidence}%`, backgroundColor: ocrConfidence >= 90 ? colors.secondary.main : '#EAB308', borderRadius: '9999px' }} />
          </Box>
          <Typography sx={{ fontSize: '14px', color: ocrConfidence >= 90 ? colors.secondary.main : '#CA8A04', fontWeight: 500 }}>
            {ocrConfidence}%
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: '14px', color: colors.on.surfaceVariant }}>Flagged Questions</Typography>
        <Typography sx={{ fontSize: '14px', color: flaggedQuestions > 0 ? '#BA1A1A' : colors.on.surface, fontWeight: 500 }}>
          {flaggedQuestions}
        </Typography>
      </Box>
      {warning && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, backgroundColor: '#FFDAD6', color: '#BA1A1A', p: 1, borderRadius: borderRadius.default }}>
          <WarningIcon sx={{ fontSize: 16 }} />
          <Typography sx={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em' }}>{warning}</Typography>
        </Box>
      )}
    </Box>
    <Box sx={{ mt: `${spacing.stackLg}px`, pt: `${spacing.stackSm}px`, borderTop: `1px solid ${colors.surface.container.high}`, display: 'flex', justifyContent: 'flex-end' }}>
      <Button variant="text" sx={{ fontSize: '14px', fontWeight: 500, textTransform: 'none', color: colors.primary.main }}>
        Review Upload
      </Button>
    </Box>
  </Box>
);

const sampleExams: ExamCardProps[] = [
  { filename: 'MATH_MIDTERM_2023.pdf', status: 'PENDING_REVIEW', ocrConfidence: 92, flaggedQuestions: 0 },
  { filename: 'PHYSICS_FINAL_V2.pdf', status: 'UNDER_REVIEW', ocrConfidence: 78, flaggedQuestions: 3, warning: 'Point Mismatch Detected' },
  { filename: 'CHEMISTRY_Q1.pdf', status: 'APPROVED', ocrConfidence: 97, flaggedQuestions: 0 },
];

export const Default: Story = {
  args: {
    userName: 'Dr. Nguyen',
    userRole: 'Senior Examiner',
  },
  render: (args) => (
    <TeacherManIngestionLayout {...args}>
      {sampleExams.map((exam) => (
        <ExamCard key={exam.filename} {...exam} />
      ))}
    </TeacherManIngestionLayout>
  ),
};

export const Empty: Story = {
  args: {
    userName: 'Dr. Nguyen',
  },
  render: (args) => (
    <TeacherManIngestionLayout {...args}>
      <Box
        sx={{
          gridColumn: '1 / -1',
          py: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          color: colors.on.surfaceVariant,
        }}
      >
        <Typography sx={{ fontSize: '16px' }}>No exam files uploaded yet.</Typography>
        <Typography sx={{ fontSize: '14px' }}>Click "Import New Exam" to get started.</Typography>
      </Box>
    </TeacherManIngestionLayout>
  ),
};

export const Loading: Story = {
  args: {
    userName: 'Dr. Nguyen',
    userRole: 'Senior Examiner',
    isLoading: true,
  },
};
