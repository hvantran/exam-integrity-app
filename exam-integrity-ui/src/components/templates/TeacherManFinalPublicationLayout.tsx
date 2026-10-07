import React from 'react';
import {
  ExamIntegrityTeacherFinalPublicationTemplate,
  ExamIntegrityTeacherFinalPublicationTemplateProps,
  ExamIntegrityFinalPublicationStats,
  ExamIntegrityFinalPublicationFormValues,
} from '@hvantran/ui-component-library';

export type FinalPublicationStats = ExamIntegrityFinalPublicationStats;
export type FinalPublicationFormValues = ExamIntegrityFinalPublicationFormValues;
export type FinalPublicationLayoutProps = ExamIntegrityTeacherFinalPublicationTemplateProps;

/**
 * Template - TeacherManFinalPublicationLayout
 *
 * Page-level wrapper delegating to ExamIntegrityTeacherFinalPublicationTemplate
 * from @hvantran/ui-component-library.
 */
const TeacherManFinalPublicationLayout: React.FC<FinalPublicationLayoutProps> = (props) => (
  <ExamIntegrityTeacherFinalPublicationTemplate {...props} />
);

export default TeacherManFinalPublicationLayout;
