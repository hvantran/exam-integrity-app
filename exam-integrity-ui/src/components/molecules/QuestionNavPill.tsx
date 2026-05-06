import React from 'react';
import { Button } from '../atoms';
import { colors, borderRadius } from '../../design-system/tokens';

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
 * Molecule — QuestionNavPill
 *
 * Small numbered pill used in the exam sidebar question navigator.
 * Color-coded by answer state: unanswered / answered / flagged / current.
 */
const QuestionNavPill: React.FC<QuestionNavPillProps> = ({
  questionNumber,
  state = 'unanswered',
  onClick,
}) => {
  const style = stateStyle[state];

  return (
    <Button
      type="button"
      onClick={onClick}
      variant="ghost"
      size="md"
      className="inline-flex h-9 w-9 items-center justify-center transition-all duration-150 active:scale-95"
      style={{
        borderRadius: borderRadius.default,
        border: `1px solid ${style.border}`,
        backgroundColor: style.bg,
        color: style.text,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <span
        style={{ fontSize: '13px', fontWeight: state === 'current' ? 700 : 500, lineHeight: 1 }}
      >
        {questionNumber}
      </span>
    </Button>
  );
};

export default QuestionNavPill;
