import React from 'react';
import {
  ExamIntegrityTeacherIngestionTemplate,
  ExamIntegrityTeacherIngestionTemplateProps,
  ExamIntegrityDashboardSection,
} from '@hvantran/ui-component-library';

export type DashboardSection = ExamIntegrityDashboardSection;
export type IngestionLayoutProps = ExamIntegrityTeacherIngestionTemplateProps;

/**
 * Template - TeacherManIngestionLayout
 *
 * Page-level wrapper delegating to ExamIntegrityTeacherIngestionTemplate
 * from @hvantran/ui-component-library.
 */
const TeacherManIngestionLayout: React.FC<IngestionLayoutProps> = (props) => (
  <ExamIntegrityTeacherIngestionTemplate {...props} />
);

export default TeacherManIngestionLayout;
