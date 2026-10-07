import React from 'react';
import {
  ExamIntegrityStudentExamContentTemplate,
  ExamIntegrityStudentExamContentTemplateProps,
} from '@hvantran/ui-component-library';

export type StudentManExamContentProps = ExamIntegrityStudentExamContentTemplateProps;

/**
 * Template - StudentManExamContent
 *
 * Page-level wrapper delegating to ExamIntegrityStudentExamContentTemplate
 * from @hvantran/ui-component-library.
 */
const StudentManExamContent: React.FC<StudentManExamContentProps> = (props) => (
  <ExamIntegrityStudentExamContentTemplate {...props} />
);

export default StudentManExamContent;
