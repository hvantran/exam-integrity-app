import React from 'react';
import {
  ExamIntegrityTeacherDashboardTemplate,
  ExamIntegrityDashboardSection,
} from '@hvantran/ui-component-library';

export interface DashboardLayoutProps {
  activeSection?: ExamIntegrityDashboardSection;
  userName?: string;
  userRole?: string;
  onNavigate?: (section: ExamIntegrityDashboardSection) => void;
  onCreateExam?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  onSearch?: (query: string) => void;
  onNotifications?: () => void;
  onHelp?: () => void;
  children: React.ReactNode;
}

const TeacherManDashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeSection = 'dashboard',
  userName = 'Admin',
  userRole,
  onNavigate,
  onCreateExam,
  onSettings,
  onLogout,
  onSearch,
  onNotifications,
  onHelp,
  children,
}) => (
  <ExamIntegrityTeacherDashboardTemplate
    activeSection={activeSection}
    userName={userName}
    userRole={userRole}
    onNavigate={onNavigate}
    onCreateExam={onCreateExam}
    onSettings={onSettings}
    onLogout={onLogout}
    onSearch={onSearch}
    onNotifications={onNotifications}
    onHelp={onHelp}
  >
    {children}
  </ExamIntegrityTeacherDashboardTemplate>
);

export default TeacherManDashboardLayout;
