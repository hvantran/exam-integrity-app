import React from 'react';
import { AppTopBar, TeacherManDashboardSidebar } from '../organisms';
import type { DashboardSection } from '../organisms';
import { Skeleton } from '../molecules';

export interface QuestionBankLayoutProps {
  userName?: string;
  userRole?: string;
  onNavigate?: (section: DashboardSection) => void;
  onCreateExam?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  onSearch?: (query: string) => void;
  onNotifications?: () => void;
  onHelp?: () => void;
  filterBar?: React.ReactNode;
  resultsBar?: React.ReactNode;
  isLoading?: boolean;
  children?: React.ReactNode;
}

const TeacherManQuestionBankLayout: React.FC<QuestionBankLayoutProps> = ({
  userName = 'Admin',
  userRole,
  onNavigate,
  onCreateExam,
  onSettings,
  onLogout,
  onSearch,
  onNotifications,
  onHelp,
  filterBar,
  resultsBar,
  isLoading = false,
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
      activeSection="question-bank"
      userName={userName}
      userRole={userRole}
      onNavigate={onNavigate}
      onCreateExam={onCreateExam}
      onSettings={onSettings}
      onLogout={onLogout}
    />
    <main className="ml-[256px] pt-[64px] min-h-screen overflow-y-auto">
      <div className="pt-8 pb-32 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Page header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">Question Bank</h2>
            <div className="text-sm text-gray-500">
              Browse and filter approved questions to build your examination draft.
            </div>
          </div>
          {isLoading ? (
            <>
              <Skeleton height={72} className="mb-8" />
              <div className="flex justify-between items-center mb-6">
                <Skeleton height={24} width={180} />
                <Skeleton height={24} width={120} />
              </div>
              <div className="flex flex-col gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} height={96} />
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Search + filter panel */}
              {filterBar && (
                <div className="bg-white border border-gray-200 rounded-lg p-5 mb-8">
                  {filterBar}
                </div>
              )}
              {/* Results bar */}
              {resultsBar && (
                <div className="flex items-center justify-between mb-3">{resultsBar}</div>
              )}
              {/* Question cards */}
              <div className="flex flex-col gap-3">{children}</div>
            </>
          )}
        </div>
      </div>
    </main>
  </div>
);

export default TeacherManQuestionBankLayout;
