import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from './design-system';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/StudentManDashboardPage';
import StudentManMyExamsPage from './pages/StudentManMyExamsPage';
import StudentManEggShopPage from './pages/StudentManEggShopPage';
import ExamPage from './pages/StudentManExamPage';
import ReviewPage from './pages/ReviewPage';
import IngestionPage from './pages/TeacherManExamPdfUploadPage';
import QuestionReviewPage from './pages/QuestionReviewPage';
import QuestionBankPage from './pages/TeacherManQuestionBankPage';
import FinalPublicationPage from './pages/TeacherManFinalPublicationPage';
import TeacherManDashboardPage from './pages/TeacherManDashboardPage';
import TeacherManScoringPage from './pages/TeacherManScoringPage';
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

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
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
                  <StudentManEggShopPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/collection"
              element={
                <ProtectedRoute>
                  <StudentManEggShopPage />
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

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer
            position="bottom-right"
            autoClose={3500}
            newestOnTop
            closeOnClick
            pauseOnHover
            draggable
            theme="colored"
            transition={Slide}
            toastStyle={{ borderRadius: '12px', fontSize: '14px', fontWeight: 600 }}
            bodyStyle={{ padding: '10px 12px', color: '#ffffff', margin: 0 }}
            progressStyle={{ height: '4px', background: 'rgba(255, 255, 255, 0.72)' }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
