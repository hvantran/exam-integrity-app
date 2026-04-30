import React from 'react';
// Removed MUI Box and tokens, using Tailwind CSS
import { AppTopBar, StudentManPortalSidebar, APP_BAR_HEIGHT, STUDENT_SIDEBAR_WIDTH } from '../organisms';
import type { PortalSection } from '../organisms';

export interface ReviewLayoutProps {
  studentName?: string;
  activeSection?: PortalSection;
  onNavigate?: (section: PortalSection) => void;
  onHelp?: () => void;
  onSearch?: (query: string) => void;
  onNotifications?: () => void;
  children: React.ReactNode;
}

const StudentManReviewLayout: React.FC<ReviewLayoutProps> = ({
  studentName = 'Hoc vien',
  activeSection = 'results',
  onNavigate,
  onHelp,
  onSearch,
  onNotifications,
  children,
}) => (
  <div className="min-h-screen bg-gray-50">
    <AppTopBar
      appTitle="Academic Management"
      userName={studentName}
      onSearch={onSearch}
      onNotifications={onNotifications}
      onHelp={onHelp}
    />
    <StudentManPortalSidebar
      activeSection={activeSection}
      studentName={studentName}
      onNavigate={onNavigate}
      onHelp={onHelp}
    />
    <main className="ml-[256px] pt-[64px] min-h-screen overflow-y-auto">
      <div className="p-6 max-w-6xl mx-auto">
        {children}
      </div>
    </main>
  </div>
);

export default StudentManReviewLayout;
