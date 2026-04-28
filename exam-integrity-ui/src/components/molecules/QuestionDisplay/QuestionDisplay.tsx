/**
 * QuestionDisplay — renders a DraftQuestionDTO in a teacher-friendly way.
 *
 * Strategies by question type:
 *  - MCQ:         A/B/C/D option cards with correct-answer highlight
 *  - Calculation: sub-expressions in a grid; dotted lines → styled answer blank
 *  - Essay:       clean prose; rubric keywords as chips
 */
import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { DraftQuestionDTO } from '../../../types/exam.types';
import { colors, typography, borderRadius } from '../../../design-system/tokens';

// ── helpers ──────────────────────────────────────────────────────────────────

const BLANK_RE = /([.…_]{3,})/g;

/** Replace fill-in-blank dot runs with a styled underline span */
function renderWithBlanks(text: string): React.ReactNode {
  const parts = text.split(BLANK_RE);
  return (
    <>
      {parts.map((part, i) =>
        BLANK_RE.test(part) ? (
          <Box
            key={i}
            component="span"
            sx={{
              display: 'inline-block',
              minWidth: 72,
              borderBottom: `2px solid ${colors.primary.main}`,
              mx: 0.5,
              verticalAlign: 'bottom',
              height: '1.15em',
            }}
          />
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/** Heuristic: does this string look like a math/arithmetic expression? */
function looksLikeCalc(s: string) {
  return /\d/.test(s) && /[+\-x×÷:]/.test(s);
}

/** Split content into sub-expressions (by `;` or newline) */
function splitExpressions(content: string): string[] {
  return content
    .split(/[;\n]/)
    .map(s => s.trim())
    .filter(Boolean);
}

// ── MCQ renderer ──────────────────────────────────────────────────────────────

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

function McqQuestion({ q }: { q: DraftQuestionDTO }) {
  return (
    <Box>
      <Typography
        sx={{
          fontFamily: typography.fontFamily.sans,
          fontSize: '0.95rem',
          fontWeight: 500,
          color: colors.on.surface,
          mb: 2,
          whiteSpace: 'pre-wrap',
          lineHeight: 1.7,
        }}
      >
        {renderWithBlanks(q.content)}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {(q.options ?? []).map((opt, i) => {
          const label = OPTION_LABELS[i] ?? String(i + 1);
          const isCorrect =
            q.correctAnswer === label ||
            q.correctAnswer === opt ||
            (q.correctAnswer ?? '').toUpperCase().startsWith(label);
          return (
            <Box
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                px: 2,
                py: 1,
                borderRadius: borderRadius.default,
                border: `1.5px solid ${isCorrect ? colors.primary.main : colors.outlineVariant}`,
                backgroundColor: isCorrect
                  ? `${colors.primary.main}18`
                  : colors.surface.container.low,
              }}
            >
              <Box
                sx={{
                  minWidth: 26,
                  height: 26,
                  borderRadius: '50%',
                  border: `2px solid ${isCorrect ? colors.primary.main : colors.outlineVariant}`,
                  backgroundColor: isCorrect ? colors.primary.main : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  mt: '2px',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: isCorrect ? colors.primary.on : colors.on.surfaceVariant,
                  }}
                >
                  {label}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontFamily: typography.fontFamily.sans,
                  fontSize: '0.9rem',
                  color: colors.on.surface,
                  lineHeight: 1.7,
                  pt: '3px',
                }}
              >
                {renderWithBlanks(opt)}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ── Calculation renderer ──────────────────────────────────────────────────────

function CalculationQuestion({ q }: { q: DraftQuestionDTO }) {
  const parts = splitExpressions(q.content);
  // First part may be a prose prompt ("Đặt tính rồi tính")
  const promptPart = parts.length > 0 && !looksLikeCalc(parts[0]) ? parts[0] : null;
  const expressions = promptPart ? parts.slice(1) : parts;

  return (
    <Box>
      {promptPart && (
        <Typography
          sx={{
            fontFamily: typography.fontFamily.sans,
            fontSize: '0.95rem',
            fontWeight: 500,
            color: colors.on.surface,
            mb: 1.5,
          }}
        >
          {promptPart}
        </Typography>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 1.5,
        }}
      >
        {expressions.map((expr, i) => (
          <Box
            key={i}
            sx={{
              p: 1.5,
              borderRadius: borderRadius.default,
              border: `1px solid ${colors.outlineVariant}`,
              backgroundColor: colors.surface.container.low,
              fontFamily: '"Courier New", Courier, monospace',
              fontSize: '0.9rem',
              color: colors.on.surface,
              lineHeight: 2.2,
              wordBreak: 'break-word',
            }}
          >
            {renderWithBlanks(expr)}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ── Essay renderer ────────────────────────────────────────────────────────────

function EssayQuestion({ q }: { q: DraftQuestionDTO }) {
  const keywords = q.rubric?.keywords ?? [];
  return (
    <Box>
      <Typography
        sx={{
          fontFamily: typography.fontFamily.sans,
          fontSize: '0.95rem',
          fontWeight: 500,
          color: colors.on.surface,
          whiteSpace: 'pre-wrap',
          lineHeight: 1.8,
          mb: keywords.length > 0 ? 2 : 0,
        }}
      >
        {renderWithBlanks(q.content)}
      </Typography>
      {keywords.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: colors.on.surfaceVariant }}>
            Rubric keywords:
          </Typography>
          {keywords.map(k => (
            <Chip key={k} label={k} size="small" variant="outlined" />
          ))}
        </Box>
      )}
    </Box>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export interface QuestionDisplayProps {
  question: DraftQuestionDTO;
  index: number;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question: q, index }) => {
  const typeLabel =
    q.type === 'MCQ'
      ? 'Multiple Choice'
      : q.type === 'ESSAY_SHORT'
      ? 'Short Answer'
      : q.type === 'ESSAY_LONG'
      ? 'Long Answer'
      : 'Essay / Calculation';

  // Calculation heuristic: essay-type with `;` separators or digits + blanks
  const isCalc =
    q.type !== 'MCQ' &&
    (q.content.includes(';') ||
      /\d[^a-zA-ZÀ-ỹ]{0,10}[.…_]{3,}/.test(q.content) ||
      /[+\-x×÷:]\s*\d.*[.…_]{3,}/.test(q.content));

  const warnings = q.parserWarnings ?? [];
  const lowConfidence = q.parserConfidence < 0.7;

  return (
    <Box sx={{ mb: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
        <Box
          sx={{
            px: 1.5,
            py: 0.25,
            borderRadius: borderRadius.default,
            backgroundColor: colors.surface.container.highest,
            border: `1px solid ${colors.outlineVariant}`,
          }}
        >
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: colors.primary.main }}>
            Question {q.questionNumber > 0 ? q.questionNumber : index + 1}
          </Typography>
        </Box>
        <Chip label={typeLabel} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 22 }} />
        {q.points > 0 && (
          <Chip
            label={`${q.points} pts`}
            size="small"
            sx={{ fontSize: '0.7rem', height: 22, backgroundColor: `${colors.primary.main}18` }}
          />
        )}
        {lowConfidence && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <WarningAmberIcon sx={{ fontSize: 15, color: 'warning.main' }} />
            <Typography sx={{ fontSize: '0.7rem', color: 'warning.main' }}>
              Low confidence ({Math.round(q.parserConfidence * 100)}%)
            </Typography>
          </Box>
        )}
      </Box>

      {/* Body card */}
      <Box
        sx={{
          p: 2,
          borderRadius: borderRadius.default,
          border: `1px solid ${lowConfidence ? '#f59e0b66' : colors.outlineVariant}`,
          backgroundColor: colors.surface.container.lowest,
        }}
      >
        {q.type === 'MCQ' ? (
          <McqQuestion q={q} />
        ) : isCalc ? (
          <CalculationQuestion q={q} />
        ) : (
          <EssayQuestion q={q} />
        )}
      </Box>

      {/* Parser warnings */}
      {warnings.length > 0 && (
        <Box sx={{ mt: 0.75, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {warnings.map((w, i) => (
            <Chip
              key={i}
              icon={<WarningAmberIcon sx={{ fontSize: 13 }} />}
              label={w}
              size="small"
              color="warning"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 22 }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default QuestionDisplay;
