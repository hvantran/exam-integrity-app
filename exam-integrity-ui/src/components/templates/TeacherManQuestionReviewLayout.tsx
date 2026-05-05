import React from 'react';
import { Button } from '../atoms';
import { Skeleton } from '../molecules';
import { Replace, Trash2, CircleCheck } from 'lucide-react';
import {
  AppTopBar,
  TeacherManDashboardSidebar,
} from '../organisms';
import type { DashboardSection } from '../organisms';

export interface QuestionReviewLayoutProps {
  userName?: string;
  userRole?: string;
  onNavigate?: (section: DashboardSection) => void;
  onCreateExam?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  onNotifications?: () => void;
  onHelp?: () => void;
  /** Current question number (1-based) */
  questionNumber?: number;
  /** Total questions in the exam */
  totalQuestions?: number;
  /** Exam name shown in breadcrumb */
  examName?: string;
  onReplace?: () => void;
  onDelete?: () => void;
  onApprove?: () => void;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  isLoading?: boolean;
  /** Slot: left panel content (original scan / image) */
  leftPanel?: React.ReactNode;
  /** Slot: right panel content (parsed content editor) */
  rightPanel?: React.ReactNode;
}

const TeacherManQuestionReviewLayout: React.FC<QuestionReviewLayoutProps> = ({
  userName = 'Admin',
  userRole,
  onNavigate,
  onCreateExam,
  onSettings,
  onLogout,
  onNotifications,
  onHelp,
  questionNumber = 1,
  totalQuestions = 1,
  examName,
  onReplace,
  onDelete,
  onApprove,
  onSaveDraft,
  onPublish,
  isLoading = false,
  leftPanel,
  rightPanel,
}) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <AppTopBar
      userName={userName}
      showSearch={false}
      onNotifications={onNotifications}
      onHelp={onHelp}
      appTitle={examName ? `IntegrityReview` : undefined}
    />
    <TeacherManDashboardSidebar
      activeSection="review"
      userName={userName}
      userRole={userRole}
      onNavigate={onNavigate}
      onCreateExam={onCreateExam}
      onSettings={onSettings}
      onLogout={onLogout}
    />
    <main className="ml-[256px] pt-[64px] flex-1 flex flex-col overflow-hidden h-[calc(100vh-64px)]">
      {/* Exam breadcrumb sub-header */}
      {examName && (
        <div className="flex justify-between items-center px-6 py-2 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{examName}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outlined" onClick={onSaveDraft} size="sm" disabled={isLoading}>Save Draft</Button>
            <Button variant="primary" onClick={onPublish} size="sm" disabled={isLoading}>Publish</Button>
          </div>
        </div>
      )}

      {/* Inner scrollable area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Screen header + actions */}
        <div className="flex items-end justify-between mb-8 flex-shrink-0">
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">
              Question {questionNumber} <span className="text-gray-400">/ {totalQuestions}</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 leading-tight">Review &amp; Edit Question</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outlined"
              size="sm"
              icon={<Replace size={18} />}
              onClick={onReplace}
            >
              Replace from Bank
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<CircleCheck size={18} />}
              onClick={onApprove}
            >
              Approve
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={18} />}
              onClick={onDelete}
            >
              Delete Question
            </Button>
          </div>
        </div>

        {/* Split 2-column panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[60vh]">
          {/* Left panel: Original Scan */}
          <div className="flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 flex-shrink-0">
              <span className="text-lg font-semibold text-gray-900">Original Scan</span>
            </div>
            <div className="flex-1 p-6 bg-gray-50 overflow-y-auto flex items-center justify-center">
              {isLoading ? (
                <Skeleton height={300} className="w-full h-full min-h-[300px] rounded-lg" />
              ) : (
                leftPanel ?? (
                  <span className="text-sm text-gray-400">No scan provided.</span>
                )
              )}
            </div>
          </div>

          {/* Right panel: Parsed Content */}
          <div className="flex flex-col bg-white border border-gray-200 border-l-4 border-l-primary-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 flex-shrink-0">
              <span className="text-lg font-semibold text-gray-900">Parsed Content</span>
            </div>
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
              {isLoading ? (
                <>
                  <Skeleton height={72} className="mb-2" />
                  <Skeleton height={80} className="mb-2" />
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} height={52} className="mb-2" />
                  ))}
                </>
              ) : (
                rightPanel ?? (
                  <span className="text-sm text-gray-400">No parsed content provided.</span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
);

export default TeacherManQuestionReviewLayout;
