import AddIcon from '@mui/icons-material/Add';
import React from 'react';
import { Button } from '../atoms';
import { Skeleton } from '../molecules';
import type { DashboardSection } from '../organisms';
import {
  AppTopBar,
  TeacherManDashboardSidebar
} from '../organisms';

export interface IngestionLayoutProps {
  userName?: string;
  userRole?: string;
  onNavigate?: (section: DashboardSection) => void;
  onCreateExam?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  onSearch?: (query: string) => void;
  onNotifications?: () => void;
  onHelp?: () => void;
  onImportExam?: () => void;
  isLoading?: boolean;
  children?: React.ReactNode;
}

const TeacherManIngestionLayout: React.FC<IngestionLayoutProps> = ({
  userName = 'Admin',
  userRole,
  onNavigate,
  onCreateExam,
  onSettings,
  onLogout,
  onSearch,
  onNotifications,
  onHelp,
  onImportExam,
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
      activeSection="ingestion"
      userName={userName}
      userRole={userRole}
      onNavigate={onNavigate}
      onCreateExam={onCreateExam}
      onSettings={onSettings}
      onLogout={onLogout}
    />
    <main className="ml-[256px] pt-[64px] min-h-screen overflow-y-auto">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Page header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 leading-tight">Exam Ingestion</h2>
            <div className="text-sm text-gray-500 mt-1">Manage and review uploaded exam PDFs.</div>
          </div>
          <Button
            variant="primary"
            startIcon={<AddIcon />}
            onClick={onImportExam}
            className="font-medium"
          >
            Import New Exam
          </Button>
        </div>

        {/* Exam cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? [0, 1, 2].map((i) => (
              <Skeleton key={i} height={200} className="rounded-xl" />
            ))
            : children}
        </div>
      </div>
    </main>
  </div>
);

export default TeacherManIngestionLayout;
