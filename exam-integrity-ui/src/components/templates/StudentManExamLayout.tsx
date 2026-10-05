import React from 'react';
import { ExamIntegrityStudentExamTemplate } from '@hvantran/ui-component-library';

export interface ExamLayoutProps {
  children: React.ReactNode;
}

/**
 * Template - StudentManExamLayout
 *
 * Page-level wrapper delegating to ExamIntegrityStudentExamTemplate
 * from @hvantran/ui-component-library.
 */
const StudentManExamLayout: React.FC<ExamLayoutProps> = ({ children }) => (
  <ExamIntegrityStudentExamTemplate>{children}</ExamIntegrityStudentExamTemplate>
);

export default StudentManExamLayout;
