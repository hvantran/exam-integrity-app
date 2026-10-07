import React from 'react';
import {
  ExamIntegrityTeacherProctorTemplate,
  ExamIntegrityTeacherProctorTemplateProps,
  ExamIntegrityProctorNavSection,
} from '@hvantran/ui-component-library';

export type ProctorNavSection = ExamIntegrityProctorNavSection;
export type ProctorLayoutProps = ExamIntegrityTeacherProctorTemplateProps;

/**
 * Template - TeacherManProctorLayout
 *
 * Page-level wrapper delegating to ExamIntegrityTeacherProctorTemplate
 * from @hvantran/ui-component-library.
 */
const TeacherManProctorLayout: React.FC<ProctorLayoutProps> = (props) => (
  <ExamIntegrityTeacherProctorTemplate {...props} />
);

export default TeacherManProctorLayout;
