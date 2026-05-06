import React from 'react';
import { FormControl, RadioGroup, FormControlLabel, Radio, TextField } from '@mui/material';
import type { QuestionType } from '../../types/exam.types';
import { colors, borderRadius } from '../../design-system/tokens';
import Skeleton from './Skeleton';

interface Props {
  questionId: string;
  questionType: QuestionType;
  options?: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const OPTION_KEYS = ['A', 'B', 'C', 'D', 'E'];

/**
 * Renders the answer input area using design-system tokens:
 * - MCQ: styled radio options with hover/selected accent
 * - Essay: dotted textarea on surface-container background
 */
const AnswerBox: React.FC<Props> = ({
  questionId,
  questionType,
  options,
  value,
  onChange,
  disabled,
  isLoading = false,
}) => {
  if (isLoading) {
    const itemCount = Math.max(options?.length ?? 0, questionType === 'MCQ' ? 4 : 1);
    return (
      <div style={{ width: '100%', marginTop: 8 }}>
        {questionType === 'MCQ' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: itemCount }).map((_, idx) => (
              <Skeleton key={idx} height={50} width="100%" />
            ))}
          </div>
        ) : (
          <Skeleton height={208} width="100%" />
        )}
      </div>
    );
  }

  if (questionType === 'MCQ' && options) {
    return (
      <FormControl component="fieldset" disabled={disabled} sx={{ width: '100%' }}>
        <RadioGroup name={questionId} value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((opt, idx) => {
            const key = OPTION_KEYS[idx] ?? String(idx + 1);
            const selected = value === opt;
            return (
              <FormControlLabel
                key={opt}
                value={opt}
                control={<Radio size="small" />}
                label={
                  <span style={{ fontSize: '15px', color: colors.on.surface }}>
                    <span style={{ fontWeight: 600, color: colors.primary.main, marginRight: 8 }}>
                      {key}.
                    </span>
                    {opt.replace(/^[A-E]\.\s*/, '')}
                  </span>
                }
                sx={{
                  marginLeft: 0,
                  marginBottom: 8,
                  paddingLeft: 16,
                  paddingRight: 16,
                  paddingTop: 10,
                  paddingBottom: 10,
                  borderRadius: borderRadius.default,
                  border: `1.5px solid ${selected ? colors.primary.main : colors.outlineVariant}`,
                  backgroundColor: selected
                    ? `${colors.primary.main}12`
                    : colors.surface.container.lowest,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    backgroundColor: `${colors.primary.main}08`,
                    borderColor: colors.primary.main,
                  },
                }}
              />
            );
          })}
        </RadioGroup>
      </FormControl>
    );
  }

  return (
    <div style={{ marginTop: 8 }}>
      <TextField
        multiline
        rows={8}
        fullWidth
        placeholder="Type your answer here…"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        sx={{
          '& .MuiInputBase-root': {
            fontFamily: 'monospace',
            fontSize: '15px',
            backgroundColor: colors.surface.container.low,
            borderRadius: borderRadius.default,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderStyle: 'dashed',
            borderColor: colors.outlineVariant,
          },
        }}
      />
    </div>
  );
};

export default AnswerBox;
