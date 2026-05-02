import React from 'react';

import { APP_BAR_HEIGHT } from './AppTopBar';

export const TEACHER_SIDEBAR_WIDTH = 256;

export type DashboardSection = 'dashboard' | 'ingestion' | 'review' | 'scoring' | 'question-bank' | 'reports';

export interface DashboardSidebarProps {
  activeSection?: DashboardSection;
  userName?: string;
  userRole?: string;
  onNavigate?: (section: DashboardSection) => void;
  onCreateExam?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

const navItems: { section: DashboardSection; icon: React.ReactNode; label: string }[] = [
  { section: 'dashboard',      icon: <span className="text-lg">🏠</span>, label: 'Dashboard' },
  { section: 'ingestion',      icon: <span className="text-lg">📤</span>, label: 'Upload Exam' },
  { section: 'review',         icon: <span className="text-lg">📝</span>, label: 'Review' },
  { section: 'scoring',        icon: <span className="text-lg">✅</span>, label: 'Scoring' },
  { section: 'question-bank',  icon: <span className="text-lg">📚</span>, label: 'Question Bank' },
  { section: 'reports',        icon: <span className="text-lg">📊</span>, label: 'Reports' },
];




const TeacherManDashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeSection = 'dashboard',
  onNavigate,
  onCreateExam,
  onSettings,
  onLogout,
}) => (
  <nav
    className="fixed left-0 z-80 bg-gray-50 border-r border-gray-200 flex flex-col py-8 overflow-y-auto"
    style={{ top: APP_BAR_HEIGHT, width: TEACHER_SIDEBAR_WIDTH, height: `calc(100vh - ${APP_BAR_HEIGHT}px)` }}
  >
    {/* Institution identity */}
    <div className="px-6 mb-8 flex flex-col gap-2">
      <div className="w-12 h-12 rounded bg-white border border-gray-200 flex items-center justify-center mb-2 flex-shrink-0">
        <span className="text-xs font-bold text-blue-700 select-none">EI</span>
      </div>
      <span className="font-bold text-gray-900 leading-tight text-sm">Teacher Portal</span>
    </div>

    {/* Navigation */}
    <div className="flex-1 flex flex-col">
      {navItems.map(({ section, icon, label }) => (
        <button
          key={section}
          onClick={() => onNavigate?.(section)}
          className={`flex items-center gap-3 px-4 py-3 mr-4 rounded-r-xl border-l-4 text-left w-full outline-none transition-colors ${activeSection === section ? 'border-l-blue-600 bg-white text-blue-600 font-semibold' : 'border-l-transparent text-gray-500 font-medium hover:bg-gray-100'}`}
        >
          {icon}
          {label}
        </button>
      ))}
    </div>

    {/* Bottom section */}
    <div className="border-t border-gray-200 mx-4 mb-2" />
    <div className="flex flex-col">
      <button
        onClick={onSettings}
        className="flex items-center gap-3 px-4 py-3 mr-4 rounded-r-xl border-l-4 border-l-transparent text-gray-500 font-medium hover:bg-gray-100 text-left w-full outline-none transition-colors"
      >
        <span className="text-lg">⚙️</span>
        Settings
      </button>
      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-4 py-3 mr-4 rounded-r-xl border-l-4 border-l-transparent text-gray-500 font-medium hover:bg-gray-100 text-left w-full outline-none transition-colors"
      >
        <span className="text-lg">🚪</span>
        Logout
      </button>
    </div>
  </nav>
);

export default TeacherManDashboardSidebar;
