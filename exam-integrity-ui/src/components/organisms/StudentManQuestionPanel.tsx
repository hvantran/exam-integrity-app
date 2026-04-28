import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import type { QuestionType } from '../../types/exam.types';
import { colors, borderRadius, shadow } from '../../design-system/tokens';

export interface QuestionOption {
  key: string;
  text: string;
}

export interface QuestionPanelProps {
  questionNumber: number;
  subject?: string;
  gradeLevel?: string;
  questionText: string;
  questionType: QuestionType;
  options?: QuestionOption[];
  selectedAnswer?: string;
  disabled?: boolean;
  onAnswerChange: (value: string) => void;
}

const DOTTED_LINE = '      ..................................................';

/**
 * Organism — StudentManQuestionPanel
 *
 * The main exam content card derived from "Student Portal – Active Exam".
 * White "Paper" background, left-border active accent, 32px padding.
 * Renders MCQ radio options or a lined essay workspace.
 */
const StudentManQuestionPanel: React.FC<QuestionPanelProps> = ({
  questionNumber,
  subject,
  gradeLevel,
  questionText,
  questionType,
  options,
  selectedAnswer,
  disabled = false,
  onAnswerChange,
}) => (
  <Box
    sx={{
      backgroundColor: colors.surface.container.lowest,
      border: `1px solid ${colors.outlineVariant}`,
      borderLeft: `4px solid ${colors.primary.main}`,
      borderRadius: borderRadius.lg,
      boxShadow: shadow.cardActive,
      padding: '32px',
    }}
  >
    {/* Header */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: borderRadius.default,
          backgroundColor: colors.primary.main,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Typography sx={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>
          {questionNumber}
        </Typography>
      </Box>
      {(subject || gradeLevel) && (
        <Typography
          variant="caption"
          sx={{ color: colors.on.surfaceVariant, fontSize: '12px', fontWeight: 500 }}
        >
          {[subject, gradeLevel].filter(Boolean).join(' · ')}
        </Typography>
      )}
    </Box>

    <Divider sx={{ mb: 2.5 }} />

    {/* Question body */}
    <Typography
      sx={{
        fontSize: '16px',
        fontWeight: 400,
        lineHeight: '28px',
        color: colors.on.surface,
        mb: 3,
        whiteSpace: 'pre-wrap',
      }}
    >
      {questionText}
    </Typography>

    {/* Answer area */}
    {questionType === 'MCQ' && options ? (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {options.map((opt) => {
          const isSelected = selectedAnswer === opt.key;
          return (
            <Box
              key={opt.key}
              component="label"
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                p: '12px 16px',
                borderRadius: borderRadius.default,
                border: `1px solid ${isSelected ? colors.primary.main : colors.outlineVariant}`,
                backgroundColor: isSelected ? colors.primary.fixed : 'transparent',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                '&:hover': disabled
                  ? {}
                  : {
                      borderColor: colors.primary.main,
                      backgroundColor: colors.surface.container.low,
                    },
              }}
            >
              <input
                type="radio"
                name={`question-${questionNumber}`}
                value={opt.key}
                checked={isSelected}
                disabled={disabled}
                onChange={() => onAnswerChange(opt.key)}
                style={{ marginTop: 2, accentColor: colors.primary.main, flexShrink: 0 }}
              />
              <Typography sx={{ fontSize: '15px', lineHeight: '24px', color: colors.on.surface }}>
                <strong>{opt.key}.</strong>&nbsp;{opt.text}
              </Typography>
            </Box>
          );
        })}
      </Box>
    ) : (
      <Box
        sx={{
          borderLeft: `3px solid ${colors.outlineVariant}`,
          pl: 2,
        }}
      >
        <textarea
          rows={7}
          placeholder={Array(7).fill(DOTTED_LINE).join('\n')}
          value={selectedAnswer ?? ''}
          disabled={disabled}
          onChange={(e) => onAnswerChange(e.target.value)}
          style={{
            width: '100%',
            fontFamily: '"Space Grotesk", monospace',
            fontSize: '15px',
            lineHeight: '26px',
            border: `1px dashed ${colors.outlineVariant}`,
            borderRadius: 4,
            padding: '12px',
            backgroundColor: colors.surface.container.lowest,
            resize: 'vertical',
            color: colors.on.surface,
            outline: 'none',
          }}
        />
      </Box>
    )}
  </Box>
);

export default StudentManQuestionPanel;
