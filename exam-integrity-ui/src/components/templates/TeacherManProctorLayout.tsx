import React from 'react';


const PROCTOR_APP_BAR_HEIGHT = 64;
const PROCTOR_SIDEBAR_WIDTH = 256;

export type ProctorNavSection = 'dashboard' | 'exam' | 'results' | 'reports';

export interface ProctorLayoutProps {
  brandName?: string;
  timerDisplay?: string;
  progressPercent?: number;
  isProctoringActive?: boolean;
  completedCount?: number;
  totalCount?: number;
  activeNavSection?: ProctorNavSection;
  onNavigate?: (section: ProctorNavSection) => void;
  onSubmit?: () => void;
  children: React.ReactNode;
}

const navLabels: { section: ProctorNavSection; label: string }[] = [
  { section: 'dashboard', label: 'Bang dieu khien' },
  { section: 'exam',      label: 'Ky thi' },
  { section: 'results',   label: 'Ket qua' },
  { section: 'reports',   label: 'Bao cao' },
];

const TeacherManProctorLayout: React.FC<ProctorLayoutProps> = ({
  brandName = 'IntegrityEngine',
  timerDisplay = '00:59:59',
  progressPercent = 25,
  isProctoringActive = true,
  completedCount = 12,
  totalCount = 40,
  activeNavSection = 'exam',
  onNavigate,
  onSubmit,
  children,
}) => (
  <div className="min-h-screen bg-gray-50">
    {/* 4px progress bar */}
    <div className="fixed top-0 left-0 w-full h-1 bg-white z-[110]">
      <div
        className="h-full bg-blue-600 transition-all duration-500"
        style={{ width: `${progressPercent}%` }}
      />
    </div>

    {/* Specialized proctor AppBar */}
    <header
      className="fixed top-0 left-0 right-0 h-16 z-[100] bg-white border-b border-gray-200 flex items-center justify-between px-6"
    >
      {/* Left: brand + horizontal nav */}
      <div className="flex items-center gap-8">
        <span className="font-bold text-xl text-blue-700 select-none">{brandName}</span>
        <nav className="hidden md:flex gap-1">
          {navLabels.map(({ section, label }) => {
            const isActive = activeNavSection === section;
            return (
              <button
                key={section}
                onClick={() => onNavigate?.(section)}
                className={`px-3 py-2 border-b-2 bg-transparent text-sm font-${isActive ? 'semibold' : 'normal'} ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600'} transition-colors`}
              >
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right: proctor controls */}
      <div className="flex items-center gap-4">
        {isProctoringActive && (
          <span className="hidden lg:flex items-center bg-green-100 text-green-700 font-semibold text-xs rounded px-2 py-1 h-7 animate-pulse">
            <span className="mr-1 text-green-500 text-xs">●</span>Proctoring Active
          </span>
        )}
        <span className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded px-3 py-1">
          <span className="text-gray-500 text-base">⏰</span>
          <span className="font-mono text-sm font-medium text-gray-900 tracking-wider">{timerDisplay}</span>
        </span>
        {onSubmit && (
          <button
            type="button"
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            Nop bai
          </button>
        )}
      </div>
    </header>

    {/* Question progress sidebar */}
    <aside
      className="hidden md:flex fixed left-0 z-[80] bg-gray-50 border-r border-gray-200 flex-col p-8 overflow-y-auto"
      style={{ top: PROCTOR_APP_BAR_HEIGHT, width: PROCTOR_SIDEBAR_WIDTH, height: `calc(100vh - ${PROCTOR_APP_BAR_HEIGHT}px)` }}
    >
      <span className="font-bold text-gray-900 mb-1 text-sm">Tien do lam bai</span>
      <span className="text-xs text-gray-500 mb-4">Da hoan thanh {completedCount}/{totalCount}</span>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: totalCount || 0 }, (_, i) => {
          const num = i + 1;
          const done = num <= (completedCount || 0);
          return (
            <span
              key={num}
              className={`w-9 h-9 rounded border flex items-center justify-center text-xs font-medium cursor-pointer ${done ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-700'}`}
            >
              {num}
            </span>
          );
        })}
      </div>
    </aside>

    {/* Main content */}
    <main
      className="min-h-screen overflow-y-auto"
      style={{ marginLeft: `0px`, paddingTop: `${PROCTOR_APP_BAR_HEIGHT}px` }}
    >
      <div className="p-6">{children}</div>
    </main>
  </div>
);

export default TeacherManProctorLayout;
