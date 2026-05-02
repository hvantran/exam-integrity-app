import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from './design-system';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/StudentManDashboardPage';
import StudentManMyExamsPage from './pages/StudentManMyExamsPage';
import ExamPage from './pages/StudentManExamPage';
import ReviewPage from './pages/ReviewPage';
import IngestionPage from './pages/TeacherManExamPdfUploadPage';
import QuestionReviewPage from './pages/QuestionReviewPage';
import QuestionBankPage from './pages/TeacherManQuestionBankPage';
import FinalPublicationPage from './pages/TeacherManFinalPublicationPage';
import TeacherManDashboardPage from './pages/TeacherManDashboardPage';
import TeacherManScoringPage from './pages/TeacherManScoringPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public: login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Student routes — any authenticated user */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <LandingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam/:sessionId"
              element={
                <ProtectedRoute>
                  <ExamPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/review/:sessionId"
              element={
                <ProtectedRoute>
                  <ReviewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-exams"
              element={
                <ProtectedRoute>
                  <StudentManMyExamsPage />
                </ProtectedRoute>
              }
            />

            {/* Teacher routes — ADMIN role required */}
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <TeacherManDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/ingestion"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <IngestionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/drafts/:draftId/review"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <QuestionReviewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/drafts/:draftId/publish"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <FinalPublicationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/question-bank"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <QuestionBankPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/scoring"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <TeacherManScoringPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
