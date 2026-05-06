import React from 'react';
import { Flag } from 'lucide-react';
import type { AnswerPart, QuestionPart, QuestionType } from '../../types/exam.types';
import Button from '../atoms/Button';
import { Skeleton } from '../molecules';
import { MathQuestionInput } from '../molecules/MathInput';
import { analyzeFormula } from '../../utils/mathFormulaAnalyzer';

export interface QuestionOption {
  key: string;
  text: string;
}

export interface QuestionPanelProps {
  questionNumber: number;
  subject?: string;
  gradeLevel?: string;
  questionText: string;
  questionStem?: string;
  questionType: QuestionType;
  options?: QuestionOption[];
  questionParts?: QuestionPart[];
  selectedAnswer?: string;
  selectedAnswerParts?: AnswerPart[];
  isFlagged?: boolean;
  disabled?: boolean;
  onAnswerChange: (value: string) => void;
  onAnswerPartsChange?: (parts: AnswerPart[]) => void;
  onFlag?: () => void;
  imageData?: string;
  isLoading?: boolean;
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
  questionStem,
  questionType,
  options,
  questionParts,
  selectedAnswer,
  selectedAnswerParts,
  isFlagged = false,
  disabled = false,
  onAnswerChange,
  onAnswerPartsChange,
  onFlag,
  imageData,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white min-w-[750px] w-full border border-slate-200 border-l-4 border-l-sky-600 rounded-2xl shadow-[0_18px_40px_-28px_rgba(15,23,42,0.55)] p-4 md:p-8">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Skeleton width={40} height={40} variant="rounded" />
            <div className="flex-1">
              <Skeleton width={140} height={14} className="mb-2" />
              <Skeleton width={180} height={12} />
            </div>
          </div>
          <Skeleton width={96} height={36} variant="rounded" />
        </div>

        <div className="border-b border-slate-200 mb-5" />

        <Skeleton width="96%" height={18} className="mb-2" />
        <Skeleton width="88%" height={18} className="mb-2" />
        <Skeleton width="62%" height={18} className="mb-6" />

        <Skeleton width="100%" height={52} className="mb-3" />
        <Skeleton width="100%" height={52} className="mb-3" />
        <Skeleton width="100%" height={52} className="mb-3" />
        <Skeleton width="100%" height={52} />
      </div>
    );
  }

  const isMcq = questionType === 'MCQ';
  const hasStructuredEssay = !isMcq && (questionParts?.length ?? 0) > 0;
  const answerPartMap = new Map((selectedAnswerParts ?? []).map((part) => [part.key, part.answer]));

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

  return (
    <div className="bg-white min-w-[750px] w-full border border-slate-200 border-l-4 border-l-sky-600 rounded-2xl shadow-[0_18px_40px_-28px_rgba(15,23,42,0.55)] p-4 md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-sm font-bold">{questionNumber}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs uppercase tracking-wide font-semibold text-slate-500">
              Question {questionNumber}
            </span>
            {(subject || gradeLevel) && (
              <span className="text-slate-500 text-xs font-medium truncate">
                {[subject, gradeLevel].filter(Boolean).join(' · ')}
              </span>
            )}
          </div>
        </div>

        {onFlag && (
          <Button
            variant={isFlagged ? 'warning' : 'neutral'}
            icon={<Flag size={16} className={isFlagged ? 'text-warning-700' : 'text-slate-500'} />}
            onClick={onFlag}
            className="shrink-0"
          >
            {isFlagged ? 'Unflag' : 'Flag'}
          </Button>
        )}
      </div>

      <div className="border-b border-slate-200 mb-5" />

      {/* Question body */}
      {(!hasStructuredEssay || questionStem) && (
        <div className="text-base md:text-[17px] font-normal leading-7 text-slate-900 mb-6 break-words whitespace-pre-line">
          {hasStructuredEssay ? questionStem : questionText}
        </div>
      )}
      {/* Question image */}
      {imageData && (
        <div className="mb-6 flex justify-center bg-slate-50 border border-slate-200 rounded-xl p-2 md:p-3">
          <img src={imageData} alt="Question" className="max-h-72 object-contain rounded" />
        </div>
      )}

      {/* Answer area */}
      {isMcq && options ? (
        <div className="flex flex-col gap-3">
          {options.map((opt) => {
            const isSelected = selectedAnswer === opt.key;
            return (
              <label
                key={opt.key}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${isSelected ? 'border-sky-500 bg-sky-50 shadow-[0_8px_20px_-18px_rgba(14,165,233,0.8)]' : 'border-slate-300 bg-white'} ${disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-sky-400 hover:bg-slate-50'}`}
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
      ) : hasStructuredEssay ? (
        <div className="grid gap-4">
          {questionParts?.map((part, index) => (
            <section
              key={part.key}
              className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-sky-50/60 p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.45)]"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="min-w-9 h-9 px-2 rounded-full bg-sky-600 text-white text-sm font-bold flex items-center justify-center uppercase shadow-sm">
                  {part.key}
                </div>
                <div className="pt-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 mb-1">Part {index + 1}</p>
                  <p className="text-sm md:text-[15px] leading-6 text-slate-900 break-words">
                    {part.prompt}
                  </p>
                </div>
              </div>
              {(() => {
                const partFormula = analyzeFormula(part.prompt);
                const isMathPart = [
                  'SIMPLE_ADDITION',
                  'SIMPLE_SUBTRACTION',
                  'SIMPLE_MULTIPLICATION',
                  'SIMPLE_DIVISION',
                  'COMPLEX_FORMULA',
                ].includes(partFormula.type);
                return isMathPart ? (
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
    </div>
  );
};

export default StudentManQuestionPanel;
