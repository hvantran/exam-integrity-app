import React from 'react';
import { LayoutDashboard, ClipboardList, BarChart2, Headphones, LogOut } from 'lucide-react';
import { Button } from '../atoms';

export const STUDENT_SIDEBAR_WIDTH = 256;

export type PortalSection = 'dashboard' | 'my-exams' | 'results';

const NAV_ITEMS: { id: PortalSection; label: string; Icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'my-exams', label: 'My Exams', Icon: ClipboardList },
  { id: 'results', label: 'Results', Icon: BarChart2 },
];

export interface PortalSidebarProps {
  activeSection?: PortalSection;
  studentName?: string;
  studentRole?: string;
  onNavigate?: (section: PortalSection) => void;
  onHelp?: () => void;
  onLogout?: () => void;
}

/**
 * Organism — StudentManPortalSidebar
 *
 * Left sidebar for the Student Portal (Landing Page screen).
 * Sticky, 256px wide, white background.
 * Contains: student avatar + name, nav items, bottom help button.
 */
const StudentManPortalSidebar: React.FC<PortalSidebarProps> = ({
  activeSection = 'dashboard',
  studentName = 'Student',
  studentRole = 'Learning Center',
  onNavigate,
  onHelp,
  onLogout,
}) => (
  <aside
    className="fixed left-0 top-16 w-[256px] h-[calc(100vh-64px)] z-80 flex flex-col gap-2 pt-8 pb-8 border-r border-gray-200 bg-white overflow-y-auto"
    style={{ minWidth: 256 }}
  >
    {/* Student identity block */}
    <div className="px-6 mb-6 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base border border-blue-300">
        {studentName.slice(0, 2).toUpperCase()}
      </div>
      <div>
        <div className="text-lg font-bold text-gray-900 leading-snug">{studentName}</div>
        <div className="text-sm font-medium text-gray-500 leading-tight">{studentRole}</div>
      </div>
    </div>

    {/* Navigation */}
    <nav className="flex-1 font-sans">
      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const isActive = activeSection === id;
        return (
          <a
            key={id}
            href="#"
            onClick={(e) => { e.preventDefault(); onNavigate?.(id); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all text-sm font-medium ${
              isActive
                ? 'border-l-4 border-blue-500 bg-blue-50 text-blue-700 mx-0'
                : 'border-l-4 border-transparent text-gray-500 hover:bg-gray-50 mx-2'
            }`}
          >
            <Icon size={22} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
            {label}
          </a>
        );
      })}
    </nav>

    {/* Help button */}
    <div className="mt-auto pb-2">
      <Button
        type="button"
        onClick={onHelp}
        variant="ghost"
        textJustify="left"
        size="md"
        icon={<Headphones size={18} className="text-slate-400" />}
        className="w-full flex items-center gap-2 border border-gray-300 text-gray-500 text-sm font-medium rounded-lg py-2 hover:bg-gray-50 transition"
      >
        Online Help
      </Button>
      <Button
        type="button"
        onClick={onLogout}
        variant="ghost"
        textJustify="left"
        size="md"
        icon={<LogOut size={18} className="text-slate-400" />}
        className="w-full flex items-center gap-2 border border-gray-300 text-gray-500 text-sm font-medium rounded-lg py-2 hover:bg-gray-50 transition"
      >
        Logout
      </Button>
    </div>
  </aside>
);

export default StudentManPortalSidebar;
