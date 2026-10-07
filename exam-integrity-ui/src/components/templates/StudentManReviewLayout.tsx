import React from 'react';
import {
  ExamIntegrityStudentReviewTemplate,
  ExamIntegrityStudentReviewTemplateProps,
  ExamIntegrityStudentPortalSection,
} from '@hvantran/ui-component-library';

export type PortalSection = ExamIntegrityStudentPortalSection;
export type ReviewLayoutProps = ExamIntegrityStudentReviewTemplateProps;

/**
 * Template - StudentManReviewLayout
 *
 * Page-level wrapper delegating to ExamIntegrityStudentReviewTemplate
 * from @hvantran/ui-component-library.
 */
const StudentManReviewLayout: React.FC<ReviewLayoutProps> = (props) => (
  <ExamIntegrityStudentReviewTemplate {...props} />
);

export default StudentManReviewLayout;
