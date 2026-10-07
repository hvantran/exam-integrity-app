import React from 'react';
import {
  ExamIntegrityTeacherQuestionBankTemplate,
  ExamIntegrityTeacherQuestionBankTemplateProps,
  ExamIntegrityDashboardSection,
} from '@hvantran/ui-component-library';

export type DashboardSection = ExamIntegrityDashboardSection;
export type QuestionBankLayoutProps = ExamIntegrityTeacherQuestionBankTemplateProps;

/**
 * Template - TeacherManQuestionBankLayout
 *
 * Page-level wrapper delegating to ExamIntegrityTeacherQuestionBankTemplate
 * from @hvantran/ui-component-library.
 */
const TeacherManQuestionBankLayout: React.FC<QuestionBankLayoutProps> = (props) => (
  <ExamIntegrityTeacherQuestionBankTemplate {...props} />
);

export default TeacherManQuestionBankLayout;
