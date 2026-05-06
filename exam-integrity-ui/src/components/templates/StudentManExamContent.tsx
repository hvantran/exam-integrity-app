import React from 'react';
import StudentManProTips from '../organisms/StudentManProTips';

export interface StudentManExamContentProps {
  children: React.ReactNode;
  proTips?: string[];
  footer?: React.ReactNode;
}

const StudentManExamContent: React.FC<StudentManExamContentProps> = ({
  children,
  proTips,
  footer,
}) => (
  <div className="flex justify-center items-start px-2 md:px-8 py-4 md:pt-12 max-w-[1440px] mx-auto w-full">
    <div className="w-full rounded-2xl shadow-[0_4px_24px_0_rgba(0,0,0,0.07)] p-2 md:p-8 min-h-[600px] flex flex-col">
      <div className="flex flex-col xl:flex-row gap-6 flex-1">
        <div className="flex-1 bg-white min-w-0 flex flex-col">
          {children}
          {footer && (
            <>
              <div className="border-t border-slate-200 mt-6 pt-6" />
              {footer}
            </>
          )}
        </div>
        {proTips && proTips.length > 0 && (
          <div className="xl:w-[280px] xl:min-w-[220px] xl:max-w-[280px] self-start">
            <StudentManProTips tips={proTips} />
          </div>
        )}
      </div>
    </div>
  </div>
);

export default StudentManExamContent;
