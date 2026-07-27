import React from 'react';
import type { AnswerPart, QuestionPart, QuestionType } from '../../types/exam.types';
import { Skeleton } from '../molecules';
import StudentManQuestionPanelHeader from './StudentManQuestionPanelHeader';
import StudentManQuestionPanelContent from './StudentManQuestionPanelContent';

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

const extractGradeNumber = (gradeLevel?: string): number | null => {
  if (!gradeLevel) {
    return null;
  }

  const match = gradeLevel.match(/(?:grade|lop|lớp)\s*(\d+)/iu);
  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
};

const resolveTone = (gradeLevel?: string): 'elementary' | 'middle' | 'high' => {
  const grade = extractGradeNumber(gradeLevel);
  if (grade !== null && grade <= 5) {
    return 'elementary';
  }
  if (grade !== null && grade <= 9) {
    return 'middle';
  }
  return 'high';
};

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
  const tone = resolveTone(gradeLevel);
  const panelToneClasses = {
    elementary: {
      card: 'border-cyan-200 border-l-cyan-500 shadow-[0_18px_40px_-28px_rgba(6,182,212,0.5)]',
      divider: 'border-cyan-100',
    },
    middle: {
      card: 'border-emerald-200 border-l-emerald-600 shadow-[0_18px_40px_-28px_rgba(16,185,129,0.5)]',
      divider: 'border-emerald-100',
    },
    high: {
      card: 'border-slate-200 border-l-sky-600 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.55)]',
      divider: 'border-slate-200',
    },
  }[tone];

  if (isLoading) {
    return (
      <div
        className={`bg-white min-w-[750px] w-full border border-l-4 rounded-2xl p-4 md:p-8 ${panelToneClasses.card}`}
      >
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

        <div className={`border-b mb-5 ${panelToneClasses.divider}`} />

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

  return (
    <div
      className={`bg-white min-w-[750px] w-full border border-l-4 rounded-2xl p-4 md:p-8 ${panelToneClasses.card}`}
    >
      <StudentManQuestionPanelHeader
        questionNumber={questionNumber}
        subject={subject}
        gradeLevel={gradeLevel}
        tone={tone}
        isFlagged={isFlagged}
        onFlag={onFlag}
      />

      <div className={`border-b mb-5 ${panelToneClasses.divider}`} />

      <StudentManQuestionPanelContent
        questionNumber={questionNumber}
        questionText={questionText}
        questionStem={questionStem}
        questionType={questionType}
        options={options}
        questionParts={questionParts}
        selectedAnswer={selectedAnswer}
        selectedAnswerParts={selectedAnswerParts}
        disabled={disabled}
        onAnswerChange={onAnswerChange}
        onAnswerPartsChange={onAnswerPartsChange}
        imageData={imageData}
        gradeLevel={gradeLevel}
      />
    </div>
  );
};

export default StudentManQuestionPanel;
