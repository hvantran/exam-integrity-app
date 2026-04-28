/** FE-16: Student landing page — browse and start exams */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, CircularProgress, Chip,
} from '@mui/material';
import { StudentManLandingLayout } from '../components/templates';
import { useExamList } from '../hooks/useExams';
import { useCreateSession } from '../hooks/useSession';
import { useAuth } from '../context/AuthContext';

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Math', value: 'math' },
  { label: 'Literature', value: 'literature' },
  { label: 'English', value: 'english' },
];

const LandingPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('');
  const tags = activeFilter ? [activeFilter] : undefined;
  const { data: exams, isLoading } = useExamList(tags);
  const createSession = useCreateSession();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const studentId = user?.username ?? 'guest';

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  return (
    <StudentManLandingLayout
      studentName={user?.username ?? 'Student'}
      filters={FILTERS}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      onLogout={handleLogout}
    >
      {isLoading ? (
        <CircularProgress />
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 2 }}>
          {(exams ?? []).map(exam => (
            <Card key={exam.id} variant="outlined">
              <CardContent>
                <Typography variant="h6">{exam.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {exam.questionCount} questions · {Math.round(exam.durationSeconds / 60)} min · {exam.totalPoints} pts
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {exam.tags?.map(t => <Chip key={t} label={t} size="small" />)}
                </Box>
              </CardContent>
              <Box sx={{ px: 2, pb: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => createSession.mutate({ examId: exam.id, studentId })}
                  disabled={createSession.isPending}
                >
                  Start Exam
                </Button>
              </Box>
            </Card>
          ))}
        </Box>
      )}
    </StudentManLandingLayout>
  );
};

export default LandingPage;
