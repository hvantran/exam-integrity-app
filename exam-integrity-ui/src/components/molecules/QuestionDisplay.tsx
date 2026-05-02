/**
 * QuestionDisplay — renders a DraftQuestionDTO in a teacher-friendly way.
 *
 * Strategies by question type:
 *  - MCQ:         A/B/C/D option cards with correct-answer highlight
 *  - Calculation: sub-expressions in a grid; dotted lines → styled answer blank
 *  - Essay:       clean prose; rubric keywords as chips
 */
import React from 'react';
import { Chip } from '../atoms';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { DraftQuestionDTO } from '../../types/exam.types';
import { colors, typography, borderRadius } from '../../design-system/tokens';
import Skeleton from './Skeleton';

// ── helpers ──────────────────────────────────────────────────────────────────

const BLANK_RE = /([.…_]{3,})/g;

/** Replace fill-in-blank dot runs with a styled underline span */
function renderWithBlanks(text: string): React.ReactNode {
  const parts = text.split(BLANK_RE);
  return (
    <>
      {parts.map((part, i) =>
        BLANK_RE.test(part) ? (
          <span
            key={i}
            style={{
              display: 'inline-block',
              minWidth: 72,
              borderBottom: `2px solid ${colors.primary.main}`,
              marginLeft: 4,
              marginRight: 4,
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
    <div>
      <p
        style={{
          fontFamily: typography.fontFamily.sans,
          fontSize: '0.95rem',
          fontWeight: 500,
          color: colors.on.surface,
          marginBottom: 16,
          whiteSpace: 'pre-wrap',
          lineHeight: 1.7,
        }}
      >
        {renderWithBlanks(q.content)}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(q.options ?? []).map((opt, i) => {
          const label = OPTION_LABELS[i] ?? String(i + 1);
          const isCorrect =
            q.correctAnswer === label ||
            q.correctAnswer === opt ||
            (q.correctAnswer ?? '').toUpperCase().startsWith(label);
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                paddingLeft: 16,
                paddingRight: 16,
                paddingTop: 8,
                paddingBottom: 8,
                borderRadius: borderRadius.default,
                border: `1.5px solid ${isCorrect ? colors.primary.main : colors.outlineVariant}`,
                backgroundColor: isCorrect
                  ? `${colors.primary.main}18`
                  : colors.surface.container.low,
              }}
            >
              <div
                style={{
                  minWidth: 26,
                  height: 26,
                  borderRadius: '50%',
                  border: `2px solid ${isCorrect ? colors.primary.main : colors.outlineVariant}`,
                  backgroundColor: isCorrect ? colors.primary.main : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: isCorrect ? colors.primary.on : colors.on.surfaceVariant,
                  }}
                >
                  {label}
                </span>
              </div>
              <span
                style={{
                  fontFamily: typography.fontFamily.sans,
                  fontSize: '0.9rem',
                  color: colors.on.surface,
                  lineHeight: 1.7,
                  paddingTop: 3,
                }}
              >
                {renderWithBlanks(opt)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Calculation renderer ──────────────────────────────────────────────────────

function CalculationQuestion({ q }: { q: DraftQuestionDTO }) {
  const parts = splitExpressions(q.content);
  // First part may be a prose prompt ("Đặt tính rồi tính")
  const promptPart = parts.length > 0 && !looksLikeCalc(parts[0]) ? parts[0] : null;
  const expressions = promptPart ? parts.slice(1) : parts;

  return (
    <div>
      {promptPart && (
        <p
          style={{
            fontFamily: typography.fontFamily.sans,
            fontSize: '0.95rem',
            fontWeight: 500,
            color: colors.on.surface,
            marginBottom: 12,
          }}
        >
          {promptPart}
        </p>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 12,
        }}
      >
        {expressions.map((expr, i) => (
          <div
            key={i}
            style={{
              padding: 12,
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
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Essay renderer ────────────────────────────────────────────────────────────

function EssayQuestion({ q }: { q: DraftQuestionDTO }) {
  const keywords = q.rubric?.keywords ?? [];
  return (
    <div>
      <p
        style={{
          fontFamily: typography.fontFamily.sans,
          fontSize: '0.95rem',
          fontWeight: 500,
          color: colors.on.surface,
          whiteSpace: 'pre-wrap',
          lineHeight: 1.8,
          marginBottom: keywords.length > 0 ? 16 : 0,
        }}
      >
        {renderWithBlanks(q.content)}
      </p>
      {keywords.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: colors.on.surfaceVariant }}>
            Rubric keywords:
          </span>
          {keywords.map(k => (
            <Chip key={k} label={k} size="small" variant="outlined" />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export interface QuestionDisplayProps {
  question: DraftQuestionDTO;
  index: number;
  isLoading?: boolean;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question: q, index, isLoading = false }) => {
  if (isLoading) {
    return (
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Skeleton height={22} width={92} />
          <Skeleton height={22} width={108} />
          <Skeleton height={22} width={56} />
        </div>
        <div
          style={{
            padding: 16,
            borderRadius: borderRadius.default,
            border: `1px solid ${colors.outlineVariant}`,
            backgroundColor: colors.surface.container.lowest,
          }}
        >
          <Skeleton height={18} width="88%" className="mb-2" />
          <Skeleton height={18} width="96%" className="mb-2" />
          <Skeleton height={18} width="64%" className="mb-4" />
          <Skeleton height={46} width="100%" className="mb-2" />
          <Skeleton height={46} width="100%" className="mb-2" />
          <Skeleton height={46} width="100%" />
        </div>
      </div>
    );
  }

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
    <div style={{ marginBottom: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <div
          style={{
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 2,
            paddingBottom: 2,
            borderRadius: borderRadius.default,
            backgroundColor: colors.surface.container.highest,
            border: `1px solid ${colors.outlineVariant}`,
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: colors.primary.main }}>
            Question {q.questionNumber > 0 ? q.questionNumber : index + 1}
          </span>
        </div>
        <Chip label={typeLabel} size="small" variant="outlined" className="text-[0.7rem]" style={{ height: 22 }} />
        {q.points > 0 && (
          <Chip
            label={`${q.points} pts`}
            size="small"
            className="text-[0.7rem]"
            style={{ height: 22, backgroundColor: `${colors.primary.main}18` }}
          />
        )}
        {lowConfidence && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <WarningAmberIcon sx={{ fontSize: 15, color: 'warning.main' }} />
            <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>
              Low confidence ({Math.round(q.parserConfidence * 100)}%)
            </span>
          </div>
        )}
      </div>

      {/* Body card */}
      <div
        style={{
          padding: 16,
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
      </div>

      {/* Parser warnings */}
      {warnings.length > 0 && (
        <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {warnings.map((w, i) => (
            <Chip
              key={i}
              icon={<WarningAmberIcon sx={{ fontSize: 13 }} />}
              label={w}
              size="small"
              color="warning"
              variant="outlined"
              className="text-[0.7rem]"
              style={{ height: 22 }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionDisplay;
