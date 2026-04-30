import React from 'react';
import type { QuestionType } from '../../types/exam.types';

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
  <div className="bg-white min-w-[742px] border border-gray-300 border-l-4 border-l-blue-600 rounded-xl shadow-lg p-8">
    {/* Header */}
    <div className="flex items-center gap-4 mb-4">
      <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-bold">{questionNumber}</span>
      </div>
      {(subject || gradeLevel) && (
        <span className="text-gray-500 text-xs font-medium">
          {[subject, gradeLevel].filter(Boolean).join(' · ')}
        </span>
      )}
    </div>

    <div className="border-b border-gray-200 mb-6" />

    {/* Question body */}
    <div className="text-base font-normal leading-7 text-gray-900 mb-6 whitespace-pre-wrap">
      {questionText}
    </div>

    {/* Answer area */}
    {questionType === 'MCQ' && options ? (
      <div className="flex flex-col gap-3">
        {options.map((opt) => {
          const isSelected = selectedAnswer === opt.key;
          return (
            <label
              key={opt.key}
              className={`flex items-start gap-3 p-3 rounded border transition-all cursor-pointer ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-transparent'} ${disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-blue-600 hover:bg-gray-50'}`}
            >
              <input
                type="radio"
                name={`question-${questionNumber}`}
                value={opt.key}
                checked={isSelected}
                disabled={disabled}
                onChange={() => onAnswerChange(opt.key)}
                className="mt-1 accent-blue-600 flex-shrink-0"
              />
              <span className="text-sm leading-6 text-gray-900"><strong>{opt.key}.</strong>&nbsp;{opt.text}</span>
            </label>
          );
        })}
      </div>
    ) : (
      <div className="border-l-4 border-gray-300 pl-4">
        <textarea
          rows={7}
          placeholder={Array(7).fill(DOTTED_LINE).join('\n')}
          value={selectedAnswer ?? ''}
          disabled={disabled}
          onChange={(e) => onAnswerChange(e.target.value)}
          className="w-full font-mono text-sm leading-6 border border-dashed border-gray-300 rounded p-3 bg-white resize-vertical text-gray-900 outline-none"
        />
      </div>
    )}
  </div>
);

export default StudentManQuestionPanel;
