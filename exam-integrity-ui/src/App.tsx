import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as UIThemeProvider, useTheme } from '@hvantran/ui-component-library';
import { getTheme } from './design-system';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/StudentManDashboardPage';
import StudentManMyExamsPage from './pages/StudentManMyExamsPage';
import StudentManShopPage from './pages/StudentManShopPage';
import StudentManCollectionPage from './pages/StudentManCollectionPage';
import ExamPage from './pages/StudentManExamPage';
import ReviewPage from './pages/ReviewPage';
import IngestionPage from './pages/TeacherManExamPdfUploadPage';
import QuestionReviewPage from './pages/QuestionReviewPage';
import QuestionBankPage from './pages/TeacherManQuestionBankPage';
import FinalPublicationPage from './pages/TeacherManFinalPublicationPage';
import TeacherManDashboardPage from './pages/TeacherManDashboardPage';
import TeacherManScoringPage from './pages/TeacherManScoringPage';
import TeacherManSettingsPage from './pages/TeacherManSettingsPage';
import { SettingProvider } from './context/SettingContext';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

const teacherRoles = ['ADMIN', 'TEACHER'];

const RootRoute: React.FC = () => {
  const { user } = useAuth();

  return user?.roles.some((role) => teacherRoles.includes(role)) ? (
    <Navigate to="/teacher/dashboard" replace />
  ) : (
    <LandingPage />
  );
};

const AppContent: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const muiTheme = React.useMemo(() => getTheme(resolvedTheme), [resolvedTheme]);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <SettingProvider>
            <Routes>
              {/* Student routes — any authenticated user */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <RootRoute />
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
              <Route
                path="/shop"
                element={
                  <ProtectedRoute>
                    <StudentManShopPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/collection"
                element={
                  <ProtectedRoute>
                    <StudentManCollectionPage />
                  </ProtectedRoute>
                }
              />

              {/* Teacher routes */}
              <Route
                path="/teacher/dashboard"
                element={
                  <ProtectedRoute allowedRoles={teacherRoles}>
                    <TeacherManDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/ingestion"
                element={
                  <ProtectedRoute allowedRoles={teacherRoles}>
                    <IngestionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/drafts/:draftId/review"
                element={
                  <ProtectedRoute allowedRoles={teacherRoles}>
                    <QuestionReviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/drafts/:draftId/publish"
                element={
                  <ProtectedRoute allowedRoles={teacherRoles}>
                    <FinalPublicationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/question-bank"
                element={
                  <ProtectedRoute allowedRoles={teacherRoles}>
                    <QuestionBankPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/scoring"
                element={
                  <ProtectedRoute allowedRoles={teacherRoles}>
                    <TeacherManScoringPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/settings"
                element={
                  <ProtectedRoute allowedRoles={teacherRoles}>
                    <TeacherManSettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SettingProvider>
          <ToastContainer
            position="bottom-right"
            autoClose={3500}
            newestOnTop
            closeOnClick
            pauseOnHover
            draggable
            theme={resolvedTheme === 'dark' ? 'dark' : 'colored'}
            transition={Slide}
            toastStyle={{ borderRadius: '12px', fontSize: '14px', fontWeight: 600 }}
            bodyStyle={{ padding: '10px 12px', margin: 0 }}
            progressStyle={{ height: '4px', background: 'rgba(255, 255, 255, 0.72)' }}
          />
        </AuthProvider>
      </BrowserRouter>
    </MuiThemeProvider>
  );
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <UIThemeProvider defaultTheme="system" storageKey="exam-integrity-theme">
      <AppContent />
    </UIThemeProvider>
  </QueryClientProvider>
);

export default App;
