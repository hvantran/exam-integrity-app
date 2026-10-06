import React from 'react';
import {
  ExamIntegrityStudentLandingTemplate,
  StudentPortalSection,
  FilterItem,
} from '@hvantran/ui-component-library';

export type FilterOption = FilterItem;

export interface LandingLayoutProps {
  studentName?: string;
  studentRole?: string;
  activeSection?: StudentPortalSection;
  pageTitle?: string;
  pageSubtitle?: string;
  filters?: FilterOption[];
  activeFilter?: string;
  onFilterChange?: (value: string) => void;
  onNavigate?: (section: StudentPortalSection) => void;
  onHelp?: () => void;
  onSearch?: (query: string) => void;
  onNotifications?: () => void;
  onLogout?: () => void;
  children: React.ReactNode;
}

const StudentManLandingLayout: React.FC<LandingLayoutProps> = ({
  studentName = '',
  studentRole = 'Trung tam hoc tap',
  activeSection = 'dashboard',
  pageTitle = 'Ky thi dang dien ra',
  pageSubtitle = 'Danh sach cac bai kiem tra duoc giao cho ban.',
  filters = [],
  activeFilter = 'all',
  onFilterChange,
  onNavigate,
  onHelp,
  onSearch,
  onNotifications,
  onLogout,
  children,
}) => (
  <ExamIntegrityStudentLandingTemplate
    studentName={studentName}
    studentRole={studentRole}
    activeSection={activeSection}
    pageTitle={pageTitle}
    pageSubtitle={pageSubtitle}
    filters={filters}
    activeFilter={activeFilter}
    onFilterChange={onFilterChange}
    onNavigate={onNavigate}
    onHelp={onHelp}
    onSearch={onSearch}
    onNotifications={onNotifications}
    onLogout={onLogout}
  >
    {children}
  </ExamIntegrityStudentLandingTemplate>
);

export default StudentManLandingLayout;
