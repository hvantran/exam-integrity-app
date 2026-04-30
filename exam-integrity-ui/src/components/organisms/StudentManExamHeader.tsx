
import React from 'react';
import { ProgressBar } from '../atoms';
import { StudentManTimerDisplay, TeacherManProctoringStatusChip } from '../molecules';

export interface ExamHeaderProps {
	/** Application / exam brand name */
	brandName?: string;
	currentQuestion: number;
	totalQuestions: number;
	remainingSeconds: number;
	isProctoringActive?: boolean;
	onSettings?: () => void;
}

const StudentManExamHeader: React.FC<ExamHeaderProps> = ({
	brandName = 'ExamIntegrity',
	currentQuestion,
	totalQuestions,
	remainingSeconds,
	isProctoringActive = true,
	onSettings,
}) => {
	const progress = Math.round((currentQuestion / totalQuestions) * 100);
	const isUrgent = remainingSeconds <= 300;

	return (
		<>
			{/* Fixed progress strip topmost layer */}
			<ProgressBar value={progress} urgent={isUrgent} fixed />

			<header className="sticky top-1 z-40 bg-white border-b border-gray-200">
				<div className="flex items-center min-h-[56px] gap-2 px-4 md:px-8">
					{/* Brand */}
					<span className="font-bold text-base text-blue-600 shrink-0 tracking-tight">{brandName}</span>

					{/* Question counter */}
					<span className="text-sm font-semibold text-gray-900 shrink-0">
						Question {currentQuestion} / {totalQuestions}
					</span>

					<div className="flex-1" />

					{/* Proctoring chip */}
					<span className="hidden md:inline-block mr-2">
						<TeacherManProctoringStatusChip active={isProctoringActive} />
					</span>

					{/* Timer */}
					<span className="mr-2">
						<StudentManTimerDisplay remainingSeconds={remainingSeconds} />
					</span>

					{/* Action icons */}
					<button
						onClick={onSettings}
						className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
						title="Settings"
					>
						<span role="img" aria-label="settings">⚙️</span>
					</button>
				</div>
			</header>
		</>
	);
};

export default StudentManExamHeader;
