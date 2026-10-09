/** FE-20: Teacher final publication page */
import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Alert } from '@mui/material';
import { toast } from 'react-toastify';
import {
  ExamIntegrityTeacherFinalPublicationTemplate as TeacherManFinalPublicationLayout,
  type ExamIntegrityDashboardSection as DashboardSection,
  type ExamIntegrityFinalPublicationFormValues as FinalPublicationFormValues,
} from '@hvantran/ui-component-library';
import { useDraft, usePublishDraft } from '../hooks/useDraft';
import { useAuth } from '../context/AuthContext';
import { useNavDockMode, TEACHER_NAV_DOCK_STORAGE_KEY } from '../hooks/useNavDockMode';

const SECTION_ROUTES: Record<DashboardSection, string> = {
  dashboard: '/teacher/dashboard',
  ingestion: '/teacher/ingestion',
  review: '/teacher/ingestion',
  scoring: '/teacher/scoring',
  'question-bank': '/teacher/question-bank',
  reports: '/teacher/ingestion',
};

const FinalPublicationPage: React.FC = () => {
  const { draftId = '' } = useParams<{ draftId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, displayName } = useAuth();
  const [dockMode, setDockMode] = useNavDockMode('pinned', TEACHER_NAV_DOCK_STORAGE_KEY);
  const handleLogout = () => {
    logout();
  };
  const handleNavigate = (section: DashboardSection) => navigate(SECTION_ROUTES[section]);
  const { data: draft, isLoading } = useDraft(draftId);
  const publishDraft = usePublishDraft(draftId);

  const [formValues, setFormValues] = useState<FinalPublicationFormValues>({
    examTitle: '',
    durationSeconds: 3600,
    tags: [],
    reviewNotes: '',
  });

  const handlePublish = () => {
    publishDraft.mutate(
      {
        title: formValues.examTitle || draft?.summary.originalFilename || 'Exam',
        durationSeconds: Number(formValues.durationSeconds) || 3600,
        tags: (formValues.tags?.length ?? 0) > 0 ? formValues.tags : undefined,
        reviewNotes: formValues.reviewNotes,
      },
      {
        onSuccess: () => {
          toast.success('Exam published successfully.');
          navigate('/teacher/ingestion');
        },
        onError: (e: Error) => toast.error(e.message || 'Failed to publish exam.'),
      },
    );
  };

  if (isLoading) {
    return (
      <TeacherManFinalPublicationLayout
        userName={displayName}
        isLoading
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onSaveDraft={() => navigate(`/teacher/drafts/${draftId}/review`)}
        onPublish={() => {}}
      />
    );
  }
  if (!draft) return <Alert severity="error">Draft not found.</Alert>;

  const locationState = location.state as { pendingQuestionImages?: Record<string, string> } | null;
  const pendingQuestionImages = locationState?.pendingQuestionImages ?? {};

  // Only count questions that will actually be published (not excluded)
  const activeQuestions = draft.questions
    .filter((q) => q.reviewStatus !== 'EXCLUDED')
    .map((q) => {
      const pendingImage = pendingQuestionImages[q.id];
      if (pendingImage === undefined) return q;
      return {
        ...q,
        imageData: pendingImage,
      };
    });
  const approved = activeQuestions.filter(
    (q) => q.reviewStatus === 'APPROVED' || q.reviewStatus === 'CORRECTED',
  ).length;
  const readyCount = activeQuestions.length; // pending + approved + corrected
  const activePoints = activeQuestions.reduce((sum, q) => sum + (q.points ?? 0), 0);
  const essayQuestions = activeQuestions.filter((q) => q.type !== 'MCQ');
  const rubricsCount = essayQuestions.filter(
    (q) => q.rubric && (q.rubric.keywords?.length ?? 0) > 0,
  ).length;

  return (
    <TeacherManFinalPublicationLayout
      userName={displayName}
      stats={{
        approvedQuestions: readyCount,
        totalPoints: activePoints,
        essayRubricsStatus:
          essayQuestions.length > 0
            ? `${rubricsCount} / ${essayQuestions.length}`
            : 'No essay questions',
      }}
      formValues={formValues}
      isLoading={publishDraft.isPending}
      onFormChange={(k, v) => setFormValues((prev) => ({ ...prev, [k]: v }))}
      onSaveDraft={() => navigate(`/teacher/drafts/${draftId}/review`)}
      onPublish={handlePublish}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      dockMode={dockMode}
      onDockModeChange={setDockMode}
      questions={activeQuestions}
    />
  );
};

export default FinalPublicationPage;
