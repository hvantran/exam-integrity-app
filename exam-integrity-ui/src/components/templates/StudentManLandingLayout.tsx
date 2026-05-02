import React from 'react';
import { Chip } from '../atoms';
import { colors, spacing, borderRadius } from '../../design-system/tokens';
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
  <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
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
        <div style={{ marginBottom: `${spacing.stackLg}px` }}>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 600,
              color: colors.on.surface,
              lineHeight: '40px',
              letterSpacing: '-0.01em',
              marginBottom: '8px',
            }}
          >
            {pageTitle}
          </h1>
          {pageSubtitle && (
            <p style={{ fontSize: '16px', color: colors.on.surfaceVariant }}>
              {pageSubtitle}
            </p>
          )}
        </div>

        {/* Filter bar */}
        {filters.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2" style={{ marginBottom: `${spacing.stackLg}px` }}>
            {filters.map((f) => (
              <Chip
                key={f.value}
                label={f.label}
                onClick={() => onFilterChange?.(f.value)}
                style={{
                  backgroundColor: activeFilter === f.value ? colors.primary.fixed : colors.surface.container.default,
                  color: activeFilter === f.value ? colors.primary.deep : colors.on.surfaceVariant,
                  fontWeight: activeFilter === f.value ? 600 : 500,
                  borderRadius: borderRadius.full,
                }}
              />
            ))}
          </div>
        )}

        {children}
      </div>
    </main>
  </div>
);

export default StudentManLandingLayout;
