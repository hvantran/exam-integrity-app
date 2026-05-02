import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Button, Typography } from '@mui/material';
import { Chip } from '../atoms';
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import TeacherManQuestionBankLayout from './TeacherManQuestionBankLayout';
import { colors, spacing, borderRadius } from '../../design-system/tokens';

const meta: Meta<typeof TeacherManQuestionBankLayout> = {
  title: 'Templates/TeacherManQuestionBankLayout',
  component: TeacherManQuestionBankLayout,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof TeacherManQuestionBankLayout>;

const FilterBar = () => (
  <>
    <Box sx={{ position: 'relative' }}>
      <SearchIcon sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: colors.on.surfaceVariant, fontSize: 20 }} />
      <Box
        component="input"
        placeholder="Search content, keywords, or subjects..."
        sx={{
          width: '100%',
          pl: '48px',
          pr: 2,
          py: 1.5,
          border: `1px solid ${colors.outlineVariant}`,
          borderRadius: borderRadius.default,
          fontSize: '14px',
          color: colors.on.surface,
          backgroundColor: colors.background,
          outline: 'none',
          fontFamily: 'inherit',
          '&:focus': { borderColor: colors.primary.main },
        }}
      />
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, pt: 2, borderTop: `1px solid ${colors.outlineVariant}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography sx={{ fontSize: '14px', fontWeight: 500, color: colors.on.surfaceVariant }}>Type:</Typography>
        {(['MCQ', 'ESSAY_SHORT', 'ESSAY_LONG'] as const).map((type, i) => (
          <Button
            key={type}
            variant={i === 0 ? 'contained' : 'outlined'}
            size="small"
            sx={{
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: borderRadius.default,
              ...(i === 0
                ? { backgroundColor: colors.primary.fixed, color: colors.primary.main, '&:hover': { backgroundColor: colors.primary.fixedDim } }
                : { borderColor: colors.outlineVariant, color: colors.on.surfaceVariant }),
            }}
          >
            {type}
          </Button>
        ))}
      </Box>
      <Box sx={{ width: 1, height: 24, backgroundColor: colors.outlineVariant }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography sx={{ fontSize: '14px', fontWeight: 500, color: colors.on.surfaceVariant }}>Tags:</Typography>
        {['math', 'grade4'].map((tag) => (
          <Chip
            key={tag}
            label={tag}
            size="small"
            onDelete={() => {}}
            style={{ backgroundColor: colors.surface.container.high, fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em' }}
          />
        ))}
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '9999px',
            border: `1px dashed ${colors.outlineVariant}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: colors.on.surfaceVariant,
          }}
        >
          <AddIcon sx={{ fontSize: 16 }} />
        </Box>
      </Box>
    </Box>
  </>
);

const ResultsBar = () => (
  <>
    <Typography sx={{ fontSize: '14px', fontWeight: 500, color: colors.on.surfaceVariant }}>
      Showing 24 results
    </Typography>
    <Button
      variant="text"
      startIcon={<SortIcon />}
      sx={{ fontSize: '14px', fontWeight: 500, textTransform: 'none', color: colors.primary.main }}
    >
      Sort by: Recent
    </Button>
  </>
);

interface QuestionCardProps {
  type: string;
  points: number;
  uses: number;
  text: string;
  tags: string[];
}

const QuestionCard: React.FC<QuestionCardProps> = ({ type, points, uses, text, tags }) => (
  <Box
    sx={{
      backgroundColor: colors.surface.container.lowest,
      border: `1px solid ${colors.outlineVariant}`,
      borderRadius: borderRadius.default,
      p: 4,
      position: 'relative',
      '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.03)' },
      transition: 'box-shadow 0.3s',
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        backgroundColor: 'transparent',
        borderRadius: '4px 0 0 4px',
        transition: 'background-color 0.2s',
        '.MuiBox-root:hover > &': { backgroundColor: colors.primary.main },
      }}
    />
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Chip
          label={type}
          size="small"
          variant="outlined"
          style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', borderColor: colors.outlineVariant }}
        />
        <Typography sx={{ fontSize: '14px', fontWeight: 500, color: colors.on.surfaceVariant, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <StarIcon sx={{ fontSize: 16 }} /> {points} pts
        </Typography>
        <Typography sx={{ fontSize: '14px', fontWeight: 500, color: colors.on.surfaceVariant, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <HistoryIcon sx={{ fontSize: 16 }} /> {uses} uses
        </Typography>
      </Box>
      <Button
        variant="outlined"
        size="small"
        sx={{
          fontSize: '14px',
          fontWeight: 500,
          textTransform: 'none',
          color: colors.primary.main,
          borderColor: colors.outlineVariant,
          borderRadius: borderRadius.default,
        }}
      >
        Add to Exam
      </Button>
    </Box>
    <Typography sx={{ fontSize: '14px', color: colors.on.surface, mb: 2 }}>{text}</Typography>
    <Box sx={{ display: 'flex', gap: 1 }}>
      {tags.map((tag) => (
        <Chip key={tag} label={tag} size="small" style={{ backgroundColor: colors.surface.container.high, fontSize: '12px' }} />
      ))}
    </Box>
  </Box>
);

const sampleQuestions: QuestionCardProps[] = [
  { type: 'MCQ', points: 5, uses: 124, text: 'If f(x) = 2x² + 3x − 1, what is the value of f(3)?', tags: ['algebra', 'grade10', 'functions'] },
  { type: 'MCQ', points: 3, uses: 88, text: 'Which of the following is NOT a prime number? A) 2  B) 17  C) 51  D) 97', tags: ['arithmetic', 'grade4', 'number-theory'] },
  { type: 'ESSAY_SHORT', points: 10, uses: 42, text: 'Explain the difference between mean, median, and mode with one example each.', tags: ['statistics', 'grade7'] },
];

export const Default: Story = {
  args: { userName: 'Dr. Nguyen', userRole: 'Senior Examiner' },
  render: (args) => (
    <TeacherManQuestionBankLayout {...args} filterBar={<FilterBar />} resultsBar={<ResultsBar />}>
      {sampleQuestions.map((q, i) => <QuestionCard key={i} {...q} />)}
    </TeacherManQuestionBankLayout>
  ),
};

export const NoFilters: Story = {
  args: { userName: 'Dr. Nguyen' },
  render: (args) => (
    <TeacherManQuestionBankLayout {...args}>
      {sampleQuestions.slice(0, 2).map((q, i) => <QuestionCard key={i} {...q} />)}
    </TeacherManQuestionBankLayout>
  ),
};

export const Loading: Story = {
  args: {
    userName: 'Dr. Nguyen',
    userRole: 'Senior Examiner',
    isLoading: true,
  },
};
