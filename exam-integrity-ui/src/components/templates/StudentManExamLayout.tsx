import React from 'react';

export interface ExamLayoutProps {
  children: React.ReactNode;
}

/**
 * Template - StudentManExamLayout
 *
 * Page-level wrapper used with explicit child sections:
 * StudentManExamHeader, StudentManExamContent, and StudentManExamFooter.
 */
const StudentManExamLayout: React.FC<ExamLayoutProps> = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-b from-[#f7fafc] to-[#e9eef6]">{children}</div>
);

export default StudentManExamLayout;
