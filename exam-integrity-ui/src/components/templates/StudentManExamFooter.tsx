import React from 'react';
import {
  ExamIntegrityStudentExamFooterTemplate,
  ExamIntegrityStudentExamFooterTemplateProps,
} from '@hvantran/ui-component-library';

export type StudentManExamFooterProps = ExamIntegrityStudentExamFooterTemplateProps;

/**
 * Template - StudentManExamFooter
 *
 * Page-level wrapper delegating to ExamIntegrityStudentExamFooterTemplate
 * from @hvantran/ui-component-library.
 */
const StudentManExamFooter: React.FC<StudentManExamFooterProps> = (props) => (
  <ExamIntegrityStudentExamFooterTemplate {...props} />
);

export default StudentManExamFooter;
