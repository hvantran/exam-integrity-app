import React from 'react';
import {
  ExamIntegrityTeacherReportsTemplate,
  ExamIntegrityTeacherReportsTemplateProps,
  ExamIntegrityDashboardSection,
} from '@hvantran/ui-component-library';

export type DashboardSection = ExamIntegrityDashboardSection;
export type ReportsLayoutProps = ExamIntegrityTeacherReportsTemplateProps;

/**
 * Template - TeacherManReportsLayout
 *
 * Page-level wrapper delegating to ExamIntegrityTeacherReportsTemplate
 * from @hvantran/ui-component-library.
 */
const TeacherManReportsLayout: React.FC<ReportsLayoutProps> = (props) => (
  <ExamIntegrityTeacherReportsTemplate {...props} />
);

export default TeacherManReportsLayout;
