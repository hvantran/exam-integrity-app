import React from 'react';
import {
  Box, FormControl, RadioGroup, FormControlLabel, Radio, Typography, TextField,
} from '@mui/material';
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
const AnswerBox: React.FC<Props> = ({ questionId, questionType, options, value, onChange, disabled, isLoading = false }) => {
  if (isLoading) {
    const itemCount = Math.max(options?.length ?? 0, questionType === 'MCQ' ? 4 : 1);
    return (
      <Box sx={{ width: '100%', mt: 1 }}>
        {questionType === 'MCQ' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Array.from({ length: itemCount }).map((_, idx) => (
              <Skeleton key={idx} height={50} width="100%" />
            ))}
          </Box>
        ) : (
          <Skeleton height={208} width="100%" />
        )}
      </Box>
    );
  }

  if (questionType === 'MCQ' && options) {
    return (
      <FormControl component="fieldset" disabled={disabled} sx={{ width: '100%' }}>
        <RadioGroup
          name={questionId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((opt, idx) => {
            const key = OPTION_KEYS[idx] ?? String(idx + 1);
            const selected = value === opt;
            return (
              <FormControlLabel
                key={opt}
                value={opt}
                control={<Radio size="small" />}
                label={
                  <Typography sx={{ fontSize: '15px', color: colors.on.surface }}>
                    <Box component="span" sx={{ fontWeight: 600, color: colors.primary.main, mr: 1 }}>
                      {key}.
                    </Box>
                    {opt.replace(/^[A-E]\.\s*/, '')}
                  </Typography>
                }
                sx={{
                  mx: 0,
                  mb: 1,
                  px: 2,
                  py: 1.25,
                  borderRadius: borderRadius.default,
                  border: `1.5px solid ${selected ? colors.primary.main : colors.outlineVariant}`,
                  backgroundColor: selected ? `${colors.primary.main}12` : colors.surface.container.lowest,
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
    <Box sx={{ mt: 1 }}>
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
    </Box>
  );
};

export default AnswerBox;
