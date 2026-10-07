import React from 'react';
import {
  ExamIntegrityTeacherQuestionReviewTemplate,
  ExamIntegrityTeacherQuestionReviewTemplateProps,
  ExamIntegrityDashboardSection,
} from '@hvantran/ui-component-library';

export type DashboardSection = ExamIntegrityDashboardSection;
export type QuestionReviewLayoutProps = ExamIntegrityTeacherQuestionReviewTemplateProps;

/**
 * Template - TeacherManQuestionReviewLayout
 *
 * Page-level wrapper delegating to ExamIntegrityTeacherQuestionReviewTemplate
 * from @hvantran/ui-component-library.
 */
const TeacherManQuestionReviewLayout: React.FC<QuestionReviewLayoutProps> = (props) => (
  <ExamIntegrityTeacherQuestionReviewTemplate {...props} />
);

export default TeacherManQuestionReviewLayout;
