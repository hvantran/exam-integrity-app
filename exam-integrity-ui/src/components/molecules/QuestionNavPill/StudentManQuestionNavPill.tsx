import React from 'react';
import { Box, Typography } from '@mui/material';
import { colors, borderRadius } from '../../../design-system/tokens';

export type QuestionState = 'unanswered' | 'answered' | 'flagged' | 'current';

export interface QuestionNavPillProps {
  questionNumber: number;
  state?: QuestionState;
  onClick?: () => void;
}

const stateStyle: Record<QuestionState, { bg: string; text: string; border: string }> = {
  unanswered: {
    bg: colors.surface.container.lowest,
    text: colors.on.surface,
    border: colors.outlineVariant,
  },
  answered: {
    bg: colors.primary.fixed,
    text: colors.primary.deep,
    border: colors.primary.main,
  },
  flagged: {
    bg: '#FEF3C7',
    text: '#92400E',
    border: '#F59E0B',
  },
  current: {
    bg: colors.primary.main,
    text: '#fff',
    border: colors.primary.main,
  },
};

/**
 * Molecule — StudentManQuestionNavPill
 *
 * Small numbered pill used in the exam sidebar question navigator.
 * Color-coded by answer state: unanswered / answered / flagged / current.
 */
const StudentManQuestionNavPill: React.FC<QuestionNavPillProps> = ({
  questionNumber,
  state = 'unanswered',
  onClick,
}) => {
  const style = stateStyle[state];

  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        width: 36,
        height: 36,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.default,
        border: `1px solid ${style.border}`,
        backgroundColor: style.bg,
        color: style.text,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        fontFamily: 'inherit',
        '&:hover': onClick
          ? { filter: 'brightness(0.95)', transform: 'translateY(-1px)' }
          : {},
        '&:active': { transform: 'scale(0.95)' },
      }}
    >
      <Typography
        component="span"
        sx={{ fontSize: '13px', fontWeight: state === 'current' ? 700 : 500, lineHeight: 1 }}
      >
        {questionNumber}
      </Typography>
    </Box>
  );
};

export default StudentManQuestionNavPill;
