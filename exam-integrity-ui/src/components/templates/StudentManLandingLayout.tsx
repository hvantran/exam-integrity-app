import React from 'react';
import { spacing } from '../../design-system/tokens';
import { AppTopBar, StudentManPortalSidebar, APP_BAR_HEIGHT, STUDENT_SIDEBAR_WIDTH } from '../organisms';
import type { PortalSection } from '../organisms';

export interface FilterOption {
  label: string;
  value: string;
}

export interface LandingLayoutProps {
  studentName?: string;
  studentRole?: string;
  activeSection?: PortalSection;
  pageTitle?: string;
  pageSubtitle?: string;
  filters?: FilterOption[];
  activeFilter?: string;
  onFilterChange?: (value: string) => void;
  onNavigate?: (section: PortalSection) => void;
  onHelp?: () => void;
  onSearch?: (query: string) => void;
  onNotifications?: () => void;
  onLogout?: () => void;
  children: React.ReactNode;
}

const StudentManLandingLayout: React.FC<LandingLayoutProps> = ({
  studentName = 'Hoc vien',
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
  <div className="min-h-screen bg-background">
    <AppTopBar
      appTitle="Academic Management"
      userName={studentName}
      onSearch={onSearch}
      onNotifications={onNotifications}
      onHelp={onHelp}
      onLogout={onLogout}
    />
    <StudentManPortalSidebar
      activeSection={activeSection}
      studentName={studentName}
      studentRole={studentRole}
      onNavigate={onNavigate}
      onHelp={onHelp}
    />
    <main
      className="min-h-screen overflow-y-auto"
      style={{ marginLeft: `${STUDENT_SIDEBAR_WIDTH}px`, paddingTop: `${APP_BAR_HEIGHT}px` }}
    >
      <div className="mx-auto" style={{ padding: `${spacing.margin}px`, maxWidth: spacing.containerMax }}>
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-[32px] font-semibold text-on-surface leading-10 tracking-tight mb-2">
            {pageTitle}
          </h1>
          {pageSubtitle && (
            <p className="text-base text-on-surfaceVariant">
              {pageSubtitle}
            </p>
          )}
        </div>

        {/* Filter bar */}
        {filters.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => onFilterChange?.(f.value)}
                className={`inline-flex items-center rounded-full px-3 h-7 text-sm transition-colors ${
                  activeFilter === f.value
                    ? 'bg-primary-100 text-primary-deep font-semibold'
                    : 'bg-surface-high text-on-surfaceVariant font-medium hover:bg-surface-low'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {children}
      </div>
    </main>
  </div>
);

export default StudentManLandingLayout;
