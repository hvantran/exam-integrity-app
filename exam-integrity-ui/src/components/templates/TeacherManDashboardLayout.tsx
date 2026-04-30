import React from 'react';
// Removed MUI Box and tokens, using Tailwind CSS
import { AppTopBar, TeacherManDashboardSidebar, APP_BAR_HEIGHT, TEACHER_SIDEBAR_WIDTH } from '../organisms';
import type { DashboardSection } from '../organisms';

export interface DashboardLayoutProps {
  activeSection?: DashboardSection;
  userName?: string;
  userRole?: string;
  onNavigate?: (section: DashboardSection) => void;
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
  userName = 'Giao vien',
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
  <div className="min-h-screen bg-gray-50">
    <AppTopBar
      userName={userName}
      onSearch={onSearch}
      onNotifications={onNotifications}
      onHelp={onHelp}
      onLogout={onLogout}
    />
    <TeacherManDashboardSidebar
      activeSection={activeSection}
      userName={userName}
      userRole={userRole}
      onNavigate={onNavigate}
      onCreateExam={onCreateExam}
      onSettings={onSettings}
      onLogout={onLogout}
    />
    <main className="ml-[256px] pt-[64px] min-h-screen overflow-y-auto">
      <div className="p-6 max-w-6xl mx-auto">
        {children}
      </div>
    </main>
  </div>
);

export default TeacherManDashboardLayout;
