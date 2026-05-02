import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, TextField, Typography } from '@mui/material';
import { Chip } from '../atoms';
import TeacherManQuestionReviewLayout from './TeacherManQuestionReviewLayout';
import { colors, spacing, borderRadius } from '../../design-system/tokens';

const meta: Meta<typeof TeacherManQuestionReviewLayout> = {
  title: 'Templates/TeacherManQuestionReviewLayout',
  component: TeacherManQuestionReviewLayout,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof TeacherManQuestionReviewLayout>;

const OriginalScanPlaceholder = () => (
  <Box
    sx={{
      width: '100%',
      maxWidth: 500,
      backgroundColor: '#fff',
      boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
      border: `1px solid ${colors.outlineVariant}`,
      p: 3,
      transform: 'rotate(-1deg)',
    }}
  >
    <Typography sx={{ fontSize: '13px', fontFamily: 'monospace', color: '#333', lineHeight: 1.8 }}>
      <strong>Question 14.</strong> Given the function table:<br />
      x: 1, 2, 3, 4<br />
      y: 2, 4, 8, 16<br /><br />
      Which formula best represents this pattern?<br /><br />
      A) y = 2x<br />
      B) y = x²<br />
      C) y = 2^x<br />
      D) y = x + 1
    </Typography>
    <Box
      sx={{
        mt: 2,
        px: 1.5,
        py: 0.5,
        backgroundColor: colors.primary.fixed,
        borderRadius: '9999px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      <Box component="span" sx={{ width: 8, height: 8, borderRadius: '9999px', backgroundColor: colors.secondary.main, animation: 'pulse 2s infinite' }} />
      <Typography sx={{ fontSize: '12px', fontWeight: 600, color: colors.primary.main }}>OCR Confidence: 98%</Typography>
    </Box>
  </Box>
);

const ParsedContentEditor = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
      {[
        { label: 'Type', value: 'MCQ' },
        { label: 'Points', value: '5' },
        { label: 'Parser Confidence', value: '94%' },
      ].map(({ label, value }) => (
        <Box key={label} sx={{ backgroundColor: colors.surface.container.low, borderRadius: borderRadius.default, p: 1.5 }}>
          <Typography sx={{ fontSize: '12px', color: colors.on.surfaceVariant, mb: 0.5 }}>{label}</Typography>
          <Typography sx={{ fontSize: '14px', fontWeight: 600, color: colors.on.surface }}>{value}</Typography>
        </Box>
      ))}
    </Box>
    <TextField
      label="Question Text"
      multiline
      rows={3}
      fullWidth
      defaultValue="Given the function table shown, which formula best represents this pattern?"
      variant="outlined"
      size="small"
    />
    {['A', 'B', 'C', 'D'].map((opt, i) => (
      <Box key={opt} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip label={opt} size="small" style={{ fontWeight: 700, minWidth: 32 }} color={i === 2 ? 'primary' : 'default'} />
        <TextField
          fullWidth
          size="small"
          defaultValue={['y = 2x', 'y = x²', 'y = 2^x', 'y = x + 1'][i]}
          variant="outlined"
        />
      </Box>
    ))}
    <Box sx={{ backgroundColor: colors.secondary.container, borderRadius: borderRadius.default, p: 1.5 }}>
      <Typography sx={{ fontSize: '12px', fontWeight: 600, color: colors.secondary.onContainer }}>
        Correct Answer: C
      </Typography>
    </Box>
  </Box>
);

export const Default: Story = {
  args: {
    userName: 'Dr. Nguyen',
    userRole: 'Senior Examiner',
    questionNumber: 14,
    totalQuestions: 40,
    examName: 'Math K12 - Final Exam II',
  },
  render: (args) => (
    <TeacherManQuestionReviewLayout
      {...args}
      leftPanel={<OriginalScanPlaceholder />}
      rightPanel={<ParsedContentEditor />}
    />
  ),
};

export const NoExamName: Story = {
  args: {
    userName: 'Dr. Nguyen',
    questionNumber: 1,
    totalQuestions: 25,
  },
  render: (args) => (
    <TeacherManQuestionReviewLayout
      {...args}
      leftPanel={<OriginalScanPlaceholder />}
      rightPanel={<ParsedContentEditor />}
    />
  ),
};

export const Loading: Story = {
  args: {
    userName: 'Dr. Nguyen',
    questionNumber: 14,
    totalQuestions: 40,
    examName: 'Math K12 - Final Exam II',
    isLoading: true,
  },
};
