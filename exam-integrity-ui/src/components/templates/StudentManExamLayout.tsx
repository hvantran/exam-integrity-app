import React from 'react';
import StudentManProTips from '../organisms/StudentManProTips';

export interface ExamLayoutProps {
  header: React.ReactNode;
  children: React.ReactNode;
  /** Optional right-side question navigator panel */
  sidebar?: React.ReactNode;
  /** Optional footer (e.g., navigation bar) rendered inside the main card */
  footer?: React.ReactNode;
  /** Optional exam tips to display above the main content */
  proTips?: string[];
}

/**
 * Template — StudentManExamLayout
 *
 * Full-screen exam layout: sticky header at the top, centred 800px "Paper"
 * column (per Zen Integrity System spec), optional narrow question-nav sidebar.
 * Generous outer margins push distractions away from the peripheral vision.
 */
const StudentManExamLayout: React.FC<ExamLayoutProps> = ({
  header,
  children,
  sidebar,
  footer,
  proTips,
}) => (
  <div className="min-h-screen flex flex-col items-stretch bg-gradient-to-b from-[#f7fafc] to-[#e9eef6]">
    {/* Sticky header rendered by caller (includes ProgressBar) */}
    <div className="sticky top-0 z-[1100] bg-white shadow-[0_2px_8px_0_rgba(0,0,0,0.04)]">
      {header}
    </div>

    {/* Content area */}
    <div className="flex flex-1 justify-center items-start px-2 md:px-8 py-4 md:pt-12 gap-2 md:gap-8 max-w-[1440px] mx-auto w-full">
      {/* Paper column — 800px max, with card effect */}
      <div className="flex-1 max-w-[1040px] bg-white rounded-2xl shadow-[0_4px_24px_0_rgba(0,0,0,0.07)] p-2 md:p-8 min-h-[600px] flex flex-col">
        {/* Main content and ProTips side by side */}
        <div className="flex flex-row gap-6 flex-1">
          <div className="flex-2 min-w-0 flex flex-col">{children}</div>
          {proTips && proTips.length > 0 && (
            <div className="flex-1 min-w-[220px] max-w-[280px] ml-2 self-start">
              <StudentManProTips tips={proTips} />
            </div>
          )}
        </div>
        {footer && <div className="mt-6">{footer}</div>}
      </div>

      {/* Optional navigator sidebar */}
      {sidebar && (
        <div className="hidden lg:block w-[280px] flex-shrink-0 bg-[#f5f7fa] rounded-2xl shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] p-4 min-h-[600px] ml-2">
          {sidebar}
        </div>
      )}
    </div>
  </div>
);

export default StudentManExamLayout;
