import React from 'react';
import type { AnswerPart, QuestionPart, QuestionType } from '../types/exam.types';
import { MathQuestionInput } from './MathInput';
import { analyzeFormula } from '../utils/mathFormulaAnalyzer';

const DOTTED_LINE = '      ..................................................';

/** Matches prompts like "76 635 … 76 653" or "47 526 … 47 520 + 6" */
const COMPARISON_RE = /^(.+?)\s*(?:\.{3}|…)\s*(.+)$/u;

const MATH_OPERAND_RE = /^[\d\s()+\-*/xX×÷:.,]+$/u;

/** Matches measurement values like "8kg 234g", "8320g", "5m 30cm", "2l 500ml". */
const MEASUREMENT_RE =
  /^(?:\d+(?:[.,]\d+)?\s*(?:kg|g|mg|t|km|m|cm|mm|dm|l|ml|dl|cl|h|min|s)\s*)+$/iu;

function isMathOperand(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  // Reject placeholders/fillers made only from dots/ellipsis.
  if (/^[.…]+$/u.test(trimmed)) {
    return false;
  }

  // Allow measurement values like "8kg 234g", "8320g", "5m 30cm".
  if (MEASUREMENT_RE.test(trimmed)) {
    return true;
  }

  // Reject operands containing prose text, but allow x/X as multiplication operators.
  if (/[\p{L}]/u.test(trimmed.replace(/[xX]/g, ''))) {
    return false;
  }

  return MATH_OPERAND_RE.test(trimmed);
}

export function parseComparison(prompt: string): { left: string; right: string } | null {
  const m = prompt.trim().match(COMPARISON_RE);
  if (!m) return null;

  const left = m[1].trim();
  const right = m[2].trim();

  // Comparison prompts must have two concrete operands around the placeholder.
  // Example valid: "76 635 ... 76 653".
  // Example invalid (fill-in result): "229 + 126 x 3 = ...".
  if (!left || !right) {
    return null;
  }

  if (!isMathOperand(left) || !isMathOperand(right)) {
    return null;
  }

  if (/[=]$/.test(left) || /^=/.test(right)) {
    return null;
  }

  return { left, right };
}

const OPERATORS = ['<', '=', '>'] as const;
type ComparisonOp = (typeof OPERATORS)[number];

interface ComparisonInputProps {
  left: string;
  right: string;
  value: string;
  disabled: boolean;
  onChange: (op: ComparisonOp) => void;
}

const ComparisonInput: React.FC<ComparisonInputProps> = ({
  left,
  right,
  value,
  disabled,
  onChange,
}) => (
  <div className="flex items-center justify-center gap-3 flex-wrap">
    <span className="text-base font-mono font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 whitespace-nowrap">
      {left}
    </span>
    <div className="flex gap-2">
      {OPERATORS.map((op) => {
        const isSelected = value === op;
        return (
          <button
            key={op}
            type="button"
            disabled={disabled}
            onClick={() => onChange(op)}
            className={`w-11 h-11 rounded-xl border-2 text-lg font-bold transition-all duration-150 select-none
              ${
                isSelected
                  ? 'border-sky-500 bg-sky-500 text-white shadow-[0_4px_12px_-4px_rgba(14,165,233,0.6)]'
                  : 'border-slate-300 bg-white text-slate-600 hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50'
              }
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
          >
            {op}
          </button>
        );
      })}
    </div>
    <span className="text-base font-mono font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 whitespace-nowrap">
      {right}
    </span>
  </div>
);

export interface StudentManQuestionPanelContentProps {
  questionNumber: number;
  questionText: string;
  questionStem?: string;
  questionType: QuestionType;
  options?: Array<{ key: string; text: string }>;
  questionParts?: QuestionPart[];
  selectedAnswer?: string;
  selectedAnswerParts?: AnswerPart[];
  disabled?: boolean;
  onAnswerChange: (value: string) => void;
  onAnswerPartsChange?: (parts: AnswerPart[]) => void;
  imageData?: string;
  gradeLevel?: string;
  subject?: string;
}

const BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
  B: { bg: 'bg-sky-100', text: 'text-sky-900', border: 'border-sky-300' },
  C: { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300' },
  D: { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-300' },
};

const StudentManQuestionPanelContent: React.FC<StudentManQuestionPanelContentProps> = ({
  questionNumber,
  questionText,
  questionStem,
  questionType,
  options,
  questionParts,
  selectedAnswer,
  selectedAnswerParts,
  disabled = false,
  onAnswerChange,
  onAnswerPartsChange,
  imageData,
  gradeLevel,
  subject,
}) => {
  const isMcq = questionType === 'MCQ';
  const isLongEssay = questionType === 'ESSAY_LONG';
  const hasStructuredEssay = !isMcq && (questionParts?.length ?? 0) > 0;
  const answerPartMap = new Map((selectedAnswerParts ?? []).map((part) => [part.key, part.answer]));
  const [isPlayingAudio, setIsPlayingAudio] = React.useState(false);

  const gradeMatch = gradeLevel?.match(/(?:grade|lop|lớp)\s*(\d+)/iu);
  const gradeNumber = gradeMatch ? Number(gradeMatch[1]) : null;
  const isElementary = gradeNumber !== null && gradeNumber <= 5;
  const isEnglish = Boolean(subject && /(?:english|tiếng anh|reading)/iu.test(subject));

  const updateAnswerPart = (partKey: string, nextAnswer: string) => {
    if (!questionParts || !onAnswerPartsChange) {
      return;
    }

    onAnswerPartsChange(
      questionParts.map((part) => ({
        key: part.key,
        answer: part.key === partKey ? nextAnswer : (answerPartMap.get(part.key) ?? ''),
      })),
    );
  };

  const handleToggleReadAloud = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        const textToRead = [questionStem, questionText].filter(Boolean).join('. ');
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.rate = 0.9;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        setIsPlayingAudio(true);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <>
      {/* Subject-Aware English Reading Passage Tools for Elementary */}
      {isElementary && isEnglish && (
        <div className="mb-4 flex items-center justify-between gap-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
            <span>📖 Reading Tools:</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-950 font-bold">
              Story Mode
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggleReadAloud}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-sm ${
              isPlayingAudio
                ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300 animate-pulse'
                : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <span>{isPlayingAudio ? '⏹️ Stop Reading' : '🔊 Read Aloud'}</span>
          </button>
        </div>
      )}

      {(!hasStructuredEssay || questionStem) && (
        <div
          className={`${
            isElementary
              ? 'text-lg md:text-xl font-medium leading-relaxed text-slate-900 mb-6 p-4 rounded-2xl bg-amber-50/40 border border-amber-100/80'
              : 'text-base md:text-[17px] font-normal leading-7 text-slate-900 mb-6'
          } break-words whitespace-pre-line`}
        >
          {hasStructuredEssay ? questionStem : questionText}
        </div>
      )}

      {imageData && (
        <div className="mb-6 flex justify-center bg-slate-50 border border-slate-200 rounded-xl p-2 md:p-3">
          <img src={imageData} alt="Question" className="max-h-72 object-contain rounded" />
        </div>
      )}

      {isMcq && options ? (
        (() => {
          const visibleOptions = options.filter((opt) => opt.text.trim() !== '');
          const gridCols =
            visibleOptions.length === 3
              ? 'grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2';
          return (
            <div className={`grid ${gridCols} gap-4`}>
              {visibleOptions.map((opt) => {
                const isSelected = selectedAnswer === opt.key;
                const badge = BADGE_COLORS[opt.key.toUpperCase()] ?? {
                  bg: 'bg-slate-100',
                  text: 'text-slate-800',
                  border: 'border-slate-300',
                };

                if (isElementary) {
                  return (
                    <button
                      type="button"
                      key={opt.key}
                      disabled={disabled}
                      onClick={() => onAnswerChange(opt.key)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-150 min-h-[64px] select-none ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-[0_4px_0_#059669] ring-2 ring-emerald-200 -translate-y-0.5'
                          : 'border-amber-200/90 bg-white hover:border-amber-400 hover:bg-amber-50/50 shadow-[0_4px_0_#e2e8f0] active:translate-y-1 active:shadow-none'
                      } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-base flex-shrink-0 shadow-sm ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : `${badge.bg} ${badge.text} ${badge.border}`
                        }`}
                      >
                        {isSelected ? '✓' : opt.key}
                      </div>
                      <span className="text-base font-semibold leading-relaxed text-slate-900 flex-1">
                        {opt.text}
                      </span>
                    </button>
                  );
                }

                return (
                  <label
                    key={opt.key}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50 shadow-[0_8px_20px_-18px_rgba(14,165,233,0.8)]'
                        : 'border-slate-300 bg-white'
                    } ${disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-sky-400 hover:bg-slate-50'}`}
                  >
                    <input
                      type="radio"
                      name={`question-${questionNumber}`}
                      value={opt.key}
                      checked={isSelected}
                      disabled={disabled}
                      onChange={() => onAnswerChange(opt.key)}
                      className="mt-1 accent-sky-600 flex-shrink-0"
                    />
                    <span className="text-sm leading-6 text-slate-900">
                      <strong>{opt.key}.</strong>&nbsp;{opt.text}
                    </span>
                  </label>
                );
              })}
            </div>
          );
        })()
      ) : hasStructuredEssay ? (
        <div className="flex flex-wrap gap-4">
          {questionParts?.map((part, index) => (
            <section
              key={part.key}
              className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-sky-50/60 p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.45)] w-full sm:flex-1 sm:min-w-[calc(50%-0.5rem)]"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="min-w-9 h-9 px-2 rounded-full bg-sky-600 text-white text-sm font-bold flex items-center justify-center uppercase shadow-sm">
                  {part.key}
                </div>
                <div className="pt-1 min-w-0">
                  <p className="text-sm md:text-[15px] leading-6 text-slate-900 break-words">
                    {part.prompt}
                  </p>
                </div>
              </div>
              {(() => {
                const comparison = parseComparison(part.prompt);
                if (comparison && !isLongEssay) {
                  return (
                    <ComparisonInput
                      left={comparison.left}
                      right={comparison.right}
                      value={answerPartMap.get(part.key) ?? ''}
                      disabled={disabled}
                      onChange={(op) => updateAnswerPart(part.key, op)}
                    />
                  );
                }
                const partFormula = analyzeFormula(part.prompt);
                const isMathPart = [
                  'SIMPLE_ADDITION',
                  'SIMPLE_SUBTRACTION',
                  'SIMPLE_MULTIPLICATION',
                  'SIMPLE_DIVISION',
                  'COMPLEX_FORMULA',
                ].includes(partFormula.type);
                return isMathPart && !isLongEssay ? (
                  <MathQuestionInput
                    questionText={part.prompt}
                    value={answerPartMap.get(part.key) ?? ''}
                    disabled={disabled}
                    tags={gradeLevel ? [gradeLevel] : []}
                    onChange={(val) => updateAnswerPart(part.key, val)}
                  />
                ) : (
                  <textarea
                    rows={4}
                    placeholder="Nhập câu trả lời cho phần này"
                    value={answerPartMap.get(part.key) ?? ''}
                    disabled={disabled}
                    onChange={(event) => updateAnswerPart(part.key, event.target.value)}
                    className="w-full text-sm leading-6 border border-slate-300 rounded-xl p-3 bg-white resize-vertical text-slate-900 outline-none focus:border-sky-400"
                  />
                );
              })()}
            </section>
          ))}
        </div>
      ) : (
        <div className="border-l-4 border-slate-300 pl-4">
          <textarea
            rows={7}
            placeholder={Array(7).fill(DOTTED_LINE).join('\n')}
            value={selectedAnswer ?? ''}
            disabled={disabled}
            onChange={(e) => onAnswerChange(e.target.value)}
            className="w-full font-mono text-center text-sm leading-6 border border-dashed border-slate-300 rounded-xl p-3 bg-white resize-vertical text-slate-900 outline-none focus:border-sky-400"
          />
        </div>
      )}
    </>
  );
};

export default StudentManQuestionPanelContent;
