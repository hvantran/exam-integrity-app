import React from 'react';

export interface StudentManExamFooterProps {
  children?: React.ReactNode;
}

const StudentManExamFooter: React.FC<StudentManExamFooterProps> = ({ children }) => (
  <div className="flex justify-center px-2 md:px-8 pb-8">
    <div className="w-full max-w-[1040px]">{children}</div>
  </div>
);

export default StudentManExamFooter;
