/** FE-17: Teacher PDF ingestion page */
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Alert, LinearProgress } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { TeacherManIngestionLayout } from '../components/templates';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { draftService } from '../services/draftService';
import { useAuth } from '../context/AuthContext';
import type { DashboardSection } from '../components/organisms';

const SECTION_ROUTES: Record<DashboardSection, string> = {
  dashboard:        '/teacher/dashboard',
  ingestion:        '/teacher/ingestion',
  review:           '/teacher/ingestion',
  'question-bank':  '/teacher/question-bank',
  reports:          '/teacher/ingestion',
};

const IngestionPage: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };
  const handleNavigate = (section: DashboardSection) => navigate(SECTION_ROUTES[section]);

  const upload = useMutation({
    mutationFn: ({ file, examSetIndex }: { file: File; examSetIndex: number }) =>
      draftService.uploadPdf(file, examSetIndex),
    onSuccess: (draft) => {
      qc.invalidateQueries({ queryKey: ['drafts'] });
      setError(null);
      if (draft?.draftId) {
        navigate(`/teacher/drafts/${draft.draftId}/review`);
      }
    },
    onError: (e: Error) => setError(e.message),
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload.mutate({ file, examSetIndex: 0 });
    // reset so the same file can be re-selected after an error
    e.target.value = '';
  };

  return (
    <TeacherManIngestionLayout
      isLoading={upload.isPending}
      onImportExam={() => inputRef.current?.click()}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      <div className="p-6 text-center bg-surface text-on-surface">
        <input type="file" accept=".pdf" ref={inputRef} hidden onChange={handleFile} />
        {upload.isPending && (
          <>
            <LinearProgress className="mt-2" />
            <div className="mt-2 text-on-surface text-sm">Processing PDF…</div>
          </>
        )}
        {upload.isSuccess && (
          <Alert severity="success" className="mt-2">
            Upload successful! Redirecting to review page…
          </Alert>
        )}
        {error && <Alert severity="error" className="mt-2">{error}</Alert>}
      </div>
    </TeacherManIngestionLayout>
  );
};

export default IngestionPage;
