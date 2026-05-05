import React from 'react';
import { Button } from '../atoms';


export interface StudentManQuestionPanelNewProps {
  questionNumber: number;
  questionText: string;
  questionType: string;
  options: { key: string; text: string }[];
  selectedAnswer: string;
  onAnswerChange: (answer: string) => void;
  flagged: boolean;
  onFlag: () => void;
  proctorStatus?: string;
  contractInfo?: string;
}

/**
 * StudentManQuestionPanelNew
 *
 * UI inspired by "The Proctor (Contract Aligned)" screen from Stitch project 8122037334464308531.
 */
const StudentManQuestionPanelNew: React.FC<StudentManQuestionPanelNewProps> = ({
  questionNumber,
  questionText,
  questionType,
  options,
  selectedAnswer,
  onAnswerChange,
  flagged,
  onFlag,
  proctorStatus,
  contractInfo,
}) => {
  return (
    <div className="rounded-xl shadow-lg p-0 overflow-visible bg-white">
      <div className="pb-2 px-6 pt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">Question {questionNumber}</span>
          <Button
            type="button"
            onClick={onFlag}
            variant="outlined"
            size="sm"
            className={`text-xs font-medium px-3 py-1 rounded border ${flagged ? 'bg-yellow-100 border-yellow-400 text-yellow-800' : 'bg-white border-gray-300 text-gray-600'} transition`}
          >
            {flagged ? 'Flagged for Review' : 'Mark for Review'}
          </Button>
        </div>
        <div className="text-lg font-semibold mb-4">{questionText}</div>
        <div className="flex flex-col gap-2 mb-4">
          {options.map(option => (
            <Button
              key={option.key}
              type="button"
              onClick={() => onAnswerChange(option.key)}
              disabled={!!proctorStatus && proctorStatus !== 'active'}
              variant="outlined"
              size="md"
              className={`w-full flex items-center justify-start px-4 py-2 rounded border-2 transition-all text-left ${selectedAnswer === option.key ? 'border-blue-600 bg-blue-50 font-semibold shadow' : 'border-gray-300 bg-white font-normal'} ${!!proctorStatus && proctorStatus !== 'active' ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-600 hover:bg-gray-50'}`}
            >
              <span className="mr-3 font-semibold">{option.key}</span>
              <span>{option.text}</span>
            </Button>
          ))}
        </div>
        {contractInfo && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <span className="text-xs text-gray-500">{contractInfo}</span>
          </div>
        )}
        {proctorStatus && (
          <div className="mt-4">
            <span className={`inline-block px-2 py-1 rounded border text-xs font-medium ${proctorStatus === 'active' ? 'border-green-400 text-green-700 bg-green-50' : 'border-red-400 text-red-700 bg-red-50'}`}>
              Proctor: {proctorStatus}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentManQuestionPanelNew;
