import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '../atoms';
// Removed MUI tokens, using Tailwind CSS
import { AppTopBar, TeacherManDashboardSidebar, APP_BAR_HEIGHT, TEACHER_SIDEBAR_WIDTH } from '../organisms';
import type { DashboardSection } from '../organisms';

export interface ReportsLayoutProps {
  activeSection?: DashboardSection;
  userName?: string;
  activeTab?: number;
  tabs?: string[];
  onTabChange?: (tab: number) => void;
  onExport?: () => void;
  onNavigate?: (section: DashboardSection) => void;
  onSearch?: (query: string) => void;
  onNotifications?: () => void;
  onHelp?: () => void;
  children: React.ReactNode;
}

const TeacherManReportsLayout: React.FC<ReportsLayoutProps> = ({
  activeSection = 'reports',
  userName = 'Admin',
  activeTab = 0,
  tabs = ['Tong quan', 'Toan ven hoc thuat', 'Hieu suat', 'So sanh'],
  onTabChange,
  onExport,
  onNavigate,
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
    />
    <TeacherManDashboardSidebar
      activeSection={activeSection}
      userName={userName}
      onNavigate={onNavigate}
    />
    <div className="ml-[256px] pt-[64px] min-h-screen flex flex-col">
      {/* Page-level toolbar: tabs + export */}
      <div className="sticky top-[64px] z-70 bg-white border-b border-gray-200 flex items-center justify-between px-6 pr-8">
        <div className="flex space-x-2 min-h-[48px]">
          {tabs.map((label, i) => (
            <Button
              key={i}
              variant="ghost"
              size="md"
              className={`px-4 py-2 text-sm font-medium rounded-t ${activeTab === i ? 'text-primary-700 border-b-2 border-primary-700 bg-gray-50' : 'text-gray-500 hover:text-primary-700'} focus:outline-none`}
              onClick={() => onTabChange?.(i)}
              type="button"
            >
              {label}
            </Button>
          ))}
        </div>
        {onExport && (
          <Button
            icon={<Download size={18} />}
            variant="outlined"
            size="sm"
            onClick={onExport}
            className="text-gray-600"
          >
            Xuat bao cao
          </Button>
        )}
      </div>
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  </div>
);

export default TeacherManReportsLayout;
