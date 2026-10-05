import React from 'react';
import { AppSwitcher, AppSwitcherItem } from '@hvantran/ui-component-library';

export const APP_BAR_HEIGHT = 64;

export interface AppTopBarProps {
  appTitle?: string;
  userName?: string;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  onNotifications?: () => void;
  onHelp?: () => void;
  onLogout?: () => void;
}

export default AppTopBar;

function AppTopBar({
  appTitle = 'Academic Management',
  userName,
  showSearch = true,
  onSearch,
  onNotifications,
  onHelp,
  onLogout,
}: AppTopBarProps) {
  const initials = userName
    ? userName
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const platformApps: AppSwitcherItem[] = [
    {
      id: 'template-manager',
      name: 'Templates',
      url: process.env.REACT_APP_TEMPLATE_MANAGER_FRONTEND_URL || 'http://localhost:6088/templates',
      iconSrc: '/template-manager.png',
    },
    {
      id: 'action-manager',
      name: 'Actions',
      url: process.env.REACT_APP_ACTION_MANAGER_FRONTEND_URL || 'http://localhost:6084/actions',
      iconSrc: '/action-manager.png',
    },
    {
      id: 'endpoint-collector',
      name: 'Collector',
      url: process.env.REACT_APP_ENDPOINT_MANAGER_FRONTEND_URL || 'http://localhost:6086/endpoints',
      iconSrc: '/data-collection.png',
    },
    {
      id: 'exam-integrity',
      name: 'Exam Integrity',
      url: '/',
      iconSrc: '/exam-integrity.png',
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-[90] bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <span className="font-bold text-2xl text-blue-700 select-none tracking-tight">
        {appTitle}
      </span>
      <div className="flex items-center gap-4">
        <AppSwitcher
          items={platformApps}
          currentAppId="exam-integrity"
          onNavigate={(app) => {
            window.location.href = app.url;
          }}
        />
        {userName && (
          <div className="ml-2 flex items-center gap-2">
            <span className="font-semibold text-gray-700">{userName}</span>
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-lg">
              {initials}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
