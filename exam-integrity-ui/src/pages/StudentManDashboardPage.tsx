/** FE-16: Student landing page — browse and start exams */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '../components/molecules';
import { StudentManLandingLayout } from '../components/templates';
import { useExamList, useTagList } from '../hooks/useExams';
import { useCreateSession } from '../hooks/useSession';
import { useAuth } from '../context/AuthContext';



const LandingPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('');
  const tags = activeFilter ? [activeFilter] : undefined;
  const { data: exams, isLoading } = useExamList(tags);
  const { data: tagList = [], isLoading: isTagsLoading } = useTagList();

  const filterOptions = React.useMemo(() => [
    { label: 'All', value: '' },
    ...tagList.map(tag => ({ label: tag, value: tag })),
  ], [tagList]);
  const createSession = useCreateSession();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const studentId = user?.username ?? 'guest';

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  return (
    <StudentManLandingLayout
      studentName={user?.username ?? 'Student'}
      filters={filterOptions}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      onLogout={handleLogout}
    >
      {isLoading || isTagsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="border rounded-xl bg-white shadow p-4 flex flex-col justify-between">
              <div>
                <Skeleton height={24} width="72%" className="mb-3" />
                <Skeleton height={16} width="88%" className="mb-2" />
                <Skeleton height={16} width="60%" className="mb-3" />
                <div className="flex gap-2 mb-3">
                  <Skeleton height={20} width={56} />
                  <Skeleton height={20} width={56} />
                </div>
              </div>
              <Skeleton height={40} width="100%" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {(exams ?? []).map(exam => (
            <div key={exam.id} className="border rounded-xl bg-white shadow p-4 flex flex-col justify-between">
              <div>
                <div className="text-lg font-semibold mb-1">{exam.title}</div>
                <div className="text-sm text-gray-500 mb-2">
                  {exam.questionCount} questions · {Math.round(exam.durationSeconds / 60)} min · {exam.totalPoints} pts
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {exam.tags?.map(t => <span key={t} className="text-primary text-xs px-2 py-0.5 rounded-full font-medium">{t}</span>)}
                </div>
              </div>
              <button
                className="mt-2 w-full bg-primary hover:bg-primary-deep text-primary-on font-semibold py-2 rounded"
                onClick={() => createSession.mutate({ examId: exam.id, studentId })}
                disabled={createSession.isPending}
              >
                Start Exam
              </button>
            </div>
          ))}
        </div>
      )}
    </StudentManLandingLayout>
  );
};

export default LandingPage;
