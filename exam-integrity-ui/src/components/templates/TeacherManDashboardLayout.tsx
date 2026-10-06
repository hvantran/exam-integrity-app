import React from 'react';
import {
  ExamIntegrityTeacherDashboardTemplate,
  ExamIntegrityDashboardSection,
  SyncExamDialogState,
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
  headerTitle?: string;
  headerSubtitle?: string;
  headerActionsSlot?: React.ReactNode;
  filtersSlot?: React.ReactNode;
  syncDialogState?: SyncExamDialogState | null;
  onConfirmSync?: () => void;
  onCancelSync?: () => void;
  isSyncingQuestions?: boolean;
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
  headerTitle,
  headerSubtitle,
  headerActionsSlot,
  filtersSlot,
  syncDialogState,
  onConfirmSync,
  onCancelSync,
  isSyncingQuestions,
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
    headerTitle={headerTitle}
    headerSubtitle={headerSubtitle}
    headerActionsSlot={headerActionsSlot}
    filtersSlot={filtersSlot}
    syncDialogState={syncDialogState}
    onConfirmSync={onConfirmSync}
    onCancelSync={onCancelSync}
    isSyncingQuestions={isSyncingQuestions}
  >
    {children}
  </ExamIntegrityTeacherDashboardTemplate>
);

export default TeacherManDashboardLayout;
