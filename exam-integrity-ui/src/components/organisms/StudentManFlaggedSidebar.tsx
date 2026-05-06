import React from 'react';
import { Flag } from 'lucide-react';
import { Button } from '../atoms';

export interface StudentManFlaggedSidebarProps {
  flaggedMap: Record<number, boolean>;
  totalQuestions: number;
  onJumpTo: (questionNumber: number) => void;
  currentQuestion: number;
  className?: string;
}

const StudentManFlaggedSidebar: React.FC<StudentManFlaggedSidebarProps> = ({
  flaggedMap,
  totalQuestions,
  onJumpTo,
  currentQuestion,
  className,
}) => {
  const flaggedNumbers = Object.entries(flaggedMap)
    .filter(([_, flagged]) => flagged)
    .map(([num]) => Number(num))
    .sort((a, b) => a - b);

  return (
    <div className={`p-4 border rounded-lg bg-white shadow ${className}`}>
      {flaggedNumbers.length === 0 ? (
        <div className="text-gray-500 text-base font-medium mb-2">No flagged questions</div>
      ) : (
        <>
          <div className="flex items-center mb-3">
            <span className="font-semibold text-base text-gray-800 mr-2">Flagged Questions</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 ml-1">
              {flaggedNumbers.length}
            </span>
          </div>
          <ul className="space-y-1">
            {flaggedNumbers.map((num) => (
              <li key={num}>
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  icon={
                    <Flag
                      size={16}
                      className={`mr-2 ${num === currentQuestion ? 'text-blue-600' : 'text-amber-600'}`}
                    />
                  }
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition text-left ${num === currentQuestion ? 'bg-blue-50 border border-blue-500 text-blue-700 font-semibold' : 'bg-white border border-gray-200 text-gray-700'} hover:bg-blue-100`}
                  onClick={() => onJumpTo(num)}
                >
                  <span className="text-sm">Question {num}</span>
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default StudentManFlaggedSidebar;
