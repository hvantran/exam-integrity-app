import React from 'react';
import {
  ExamIntegrityTeacherDraftsTemplate,
  ExamIntegrityTeacherDraftsTemplateProps,
  ExamIntegrityDashboardSection,
} from '@hvantran/ui-component-library';

export type DashboardSection = ExamIntegrityDashboardSection;
export type DraftsLayoutProps = ExamIntegrityTeacherDraftsTemplateProps;

/**
 * Template - TeacherManDraftsLayout
 *
 * Page-level wrapper delegating to ExamIntegrityTeacherDraftsTemplate
 * from @hvantran/ui-component-library.
 */
const TeacherManDraftsLayout: React.FC<DraftsLayoutProps> = (props) => (
  <ExamIntegrityTeacherDraftsTemplate {...props} />
);

export default TeacherManDraftsLayout;
