/** FE-14: Student exam-taking page */
import React, { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert } from '@mui/material';
import { toast } from 'react-toastify';
import {
  StudentManExamLayout,
  StudentManExamContent,
  StudentManExamFooter,
} from '../components/templates';
import {
  StudentManExamHeader,
  StudentManQuestionPanel,
  StudentManExamNavigationBar,
  StudentManSubmitModal,
} from '../components/organisms';
import { Skeleton } from '../components/molecules';
import StudentManFlaggedSidebar from '../components/organisms/StudentManFlaggedSidebar';
import StudentManProTips from '../components/organisms/StudentManProTips';
import type { QuestionOption } from '../components/organisms';
import { useSession, useQuestion, useSaveAnswer, useSubmitExam } from '../hooks/useSession';
import { useExam } from '../hooks/useExams';
import { useWebSocketTimer } from '../hooks/useWebSocketTimer';
import { useProctor } from '../hooks/useProctor';
import type { AnswerPart } from '../types/exam.types';

type ExamUiVariant = 'elementary' | 'middle' | 'high';

const extractGradeNumber = (gradeTag?: string): number | null => {
  if (!gradeTag) {
    return null;
  }

  const match = gradeTag.match(/(?:grade|lop|lớp)\s*(\d+)/iu);
  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
};

const resolveExamUiVariant = (gradeTag?: string): ExamUiVariant => {
  const grade = extractGradeNumber(gradeTag);
  if (grade !== null && grade <= 5) {
    return 'elementary';
  }
  if (grade !== null && grade <= 9) {
    return 'middle';
  }
  return 'high';
};

const EXAM_UI_THEME: Record<
  ExamUiVariant,
  {
    brandName: string;
    headerClass: string;
    pageAccentClass: string;
    sidebarClass: string;
    proTips: string[];
  }
> = {
  elementary: {
    brandName: 'ExamIntegrity Junior',
    headerClass: 'bg-gradient-to-r from-sky-50 via-white to-cyan-50',
    pageAccentClass:
      'bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(20,184,166,0.14),_transparent_44%)]',
    sidebarClass: 'border-cyan-200 bg-cyan-50/40',
    proTips: [
      'Đọc kỹ đề và gạch dưới từ khóa trước khi trả lời.',
      'Nếu chưa chắc, đánh dấu lại để quay lại sau.',
      'Kiểm tra phép tính một lần nữa trước khi sang câu mới.',
    ],
  },
  middle: {
    brandName: 'ExamIntegrity Plus',
    headerClass: 'bg-gradient-to-r from-emerald-50 via-white to-lime-50',
    pageAccentClass:
      'bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_42%),radial-gradient(circle_at_top_right,_rgba(132,204,22,0.14),_transparent_45%)]',
    sidebarClass: 'border-emerald-200 bg-emerald-50/35',
    proTips: [
      'Phân bổ thời gian theo nhóm câu dễ, trung bình, khó.',
      'Giữ nhịp làm bài ổn định, tránh dừng quá lâu ở một câu.',
      'Ưu tiên hoàn thành câu chắc chắn trước khi rà soát lại.',
    ],
  },
  high: {
    brandName: 'ExamIntegrity',
    headerClass: 'bg-gradient-to-r from-indigo-50 via-white to-blue-50',
    pageAccentClass:
      'bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.14),_transparent_45%),radial-gradient(circle_at_top_right,_rgba(37,99,235,0.14),_transparent_45%)]',
    sidebarClass: 'border-indigo-200 bg-indigo-50/30',
    proTips: [
      'Giữ tốc độ làm bài đều, ưu tiên điểm chắc trước.',
      'Đánh dấu câu cần suy luận sâu để xử lý ở lượt rà soát.',
      'Rà soát các câu gần tương đồng để tránh sai sót bất cẩn.',
    ],
  },
};

const extractFinalComplexResult = (raw: string): string => {
  const equalsLines = raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('='));

  const lastEqualsLine = equalsLines[equalsLines.length - 1];
  if (!lastEqualsLine) {
    return '';
  }

  const content = lastEqualsLine.slice(1).trim();
  if (!content) {
    return '';
  }

  const segments = content
    .split('=')
    .map((segment) => segment.trim())
    .filter(Boolean);
  return segments[segments.length - 1] ?? '';
};

const toPersistedPartAnswer = (answer: string, _prompt: string): string => {
  // Always store the full answer / work text. For complex formulas this preserves
  // the student's working steps so the teacher can review them during scoring.
  return answer.trim();
};

const hasAnswerPartsContent = (
  parts: AnswerPart[],
  promptsByKey: Record<string, string>,
): boolean =>
  parts.some((part) => toPersistedPartAnswer(part.answer, promptsByKey[part.key] ?? '').length > 0);

const serializeAnswerParts = (parts: AnswerPart[], promptsByKey: Record<string, string>): string =>
  parts
    .map((part) => ({
      key: part.key,
      answer: toPersistedPartAnswer(part.answer, promptsByKey[part.key] ?? ''),
    }))
    .filter((part) => part.answer.length > 0)
    .map((part) => `${part.key}) ${part.answer}`)
    .join('\n\n');

const ExamPage: React.FC = () => {
  const { sessionId = '' } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [reviewFlaggedMode, setReviewFlaggedMode] = useState(false);
  const [flaggedReviewIndex, setFlaggedReviewIndex] = useState(0);
  // Store answers per question number
  const [answerMap, setAnswerMap] = useState<Record<number, string>>({});
  const [answerPartsMap, setAnswerPartsMap] = useState<Record<number, AnswerPart[]>>({});
  const [answeredMap, setAnsweredMap] = useState<Record<number, boolean>>({});
  const [flaggedMap, setFlaggedMap] = useState<Record<number, boolean>>({});

  const { data: session, isLoading: sessionLoading } = useSession(sessionId);
  const { data: question, isLoading: questionLoading } = useQuestion(sessionId, currentQuestion);
  const { data: exam } = useExam(session?.examId ?? '');
  const saveAnswer = useSaveAnswer(sessionId);
  const submitExam = useSubmitExam(sessionId);

  const handleForceSubmit = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['student-results'] });
    queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
    navigate('/my-exams', { replace: true });
  }, [navigate, queryClient, sessionId]);

  const { remaining } = useWebSocketTimer(sessionId, handleForceSubmit);
  useProctor(sessionId, session?.studentId ?? '');

  const displayRemaining = remaining ?? session?.remainingSeconds ?? null;
  const totalQuestions = exam?.questionCount ?? 0;
  const answeredCount = Object.values(answeredMap).filter(Boolean).length;
  const gradeLevelTag = exam?.tags?.find((tag) => /(?:grade|lop|lớp)\s*\d+/iu.test(tag));
  const examVariant = resolveExamUiVariant(gradeLevelTag);
  const examTheme = EXAM_UI_THEME[examVariant];

  useEffect(() => {
    if (session?.status === 'FORCE_SUBMITTED') {
      queryClient.invalidateQueries({ queryKey: ['student-results'] });
      navigate('/my-exams', { replace: true });
    }
  }, [navigate, queryClient, session?.status]);

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f7fafc] to-[#e9eef6] px-4 md:px-8 py-8">
        <div className="max-w-[1200px] mx-auto">
          <Skeleton width="45%" height={28} className="mb-3" />
          <Skeleton width="30%" height={18} className="mb-8" />
          <Skeleton width="100%" height={460} />
        </div>
      </div>
    );
  }
  if (!session) return <Alert severity="error">Exam session not found.</Alert>;

  // Utility to strip leading option prefixes like "A.", "B/", etc.
  const stripOptionPrefix = (text: string): string =>
    text.replace(/^[A-Da-d][./、]\s*/u, '').trim();

  // Map string[] options from API to QuestionOption[] and strip prefix
  const mappedOptions: QuestionOption[] | undefined = question?.options?.map(
    (text: string, i: number) => ({
      key: String.fromCharCode(65 + i), // A, B, C, D...
      text: stripOptionPrefix(text),
    }),
  );

  // Compute flagged question numbers
  const flaggedNumbers = Object.entries(flaggedMap)
    .filter(([_, flagged]) => flagged)
    .map(([num]) => Number(num))
    .sort((a, b) => a - b);

  // If in review flagged mode, show only flagged questions and navigation
  const inReviewFlagged = reviewFlaggedMode && flaggedNumbers.length > 0;
  const flaggedQuestionNumber = inReviewFlagged
    ? flaggedNumbers[flaggedReviewIndex]
    : currentQuestion;

  return (
    <StudentManExamLayout>
      <div className={examTheme.pageAccentClass}>
        <div
          className={`sticky top-0 z-[1100] bg-white shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] ${examTheme.headerClass}`}
        >
          <StudentManExamHeader
            brandName={examTheme.brandName}
            remainingSeconds={displayRemaining ?? 0}
            currentQuestion={flaggedQuestionNumber}
            totalQuestions={totalQuestions}
          />
        </div>
        <div className="flex">
          <StudentManExamContent>
            <div className="flex flex-col xl:flex-row gap-6">
              <div className="flex-1 min-w-0 flex flex-col">
              {questionLoading ? (
                <StudentManQuestionPanel
                  questionNumber={flaggedQuestionNumber}
                  questionText=""
                  questionType="MCQ"
                  options={[]}
                  selectedAnswer=""
                  isLoading
                  onAnswerChange={() => {}}
                />
              ) : question ? (
                <StudentManQuestionPanel
                  questionNumber={flaggedQuestionNumber}
                  gradeLevel={gradeLevelTag}
                  questionText={question.content}
                  questionStem={question.stem}
                  questionType={question.type}
                  options={mappedOptions}
                  questionParts={question.questionParts}
                  selectedAnswer={answerMap[flaggedQuestionNumber] || ''}
                  selectedAnswerParts={answerPartsMap[flaggedQuestionNumber] ?? []}
                  isFlagged={flaggedMap[flaggedQuestionNumber] ?? false}
                  onFlag={() => {
                    const next = !flaggedMap[flaggedQuestionNumber];
                    setFlaggedMap((m) => ({ ...m, [flaggedQuestionNumber]: next }));
                    saveAnswer.mutate({
                      questionId: question.id,
                      payload: {
                        answer: answerMap[flaggedQuestionNumber] || '',
                        answerParts: answerPartsMap[flaggedQuestionNumber] ?? [],
                        flaggedForReview: next,
                      },
                    });
                  }}
                  onAnswerChange={(answer: string) => {
                    setAnswerMap((m) => ({ ...m, [flaggedQuestionNumber]: answer }));
                    setAnswerPartsMap((m) => ({ ...m, [flaggedQuestionNumber]: [] }));
                    setAnsweredMap((m) => ({
                      ...m,
                      [flaggedQuestionNumber]: answer.trim().length > 0,
                    }));
                    saveAnswer.mutate({
                      questionId: question.id,
                      payload: {
                        answer,
                        answerParts: [],
                        flaggedForReview: flaggedMap[flaggedQuestionNumber] ?? false,
                      },
                    });
                  }}
                  onAnswerPartsChange={(parts: AnswerPart[]) => {
                    const promptsByKey = Object.fromEntries(
                      (question.questionParts ?? []).map((part) => [part.key, part.prompt]),
                    );
                    const serialized = serializeAnswerParts(parts, promptsByKey);
                    setAnswerPartsMap((m) => ({ ...m, [flaggedQuestionNumber]: parts }));
                    setAnswerMap((m) => ({ ...m, [flaggedQuestionNumber]: serialized }));
                    setAnsweredMap((m) => ({
                      ...m,
                      [flaggedQuestionNumber]: hasAnswerPartsContent(parts, promptsByKey),
                    }));
                    saveAnswer.mutate({
                      questionId: question.id,
                      payload: {
                        answer: serialized,
                        answerParts: parts,
                        flaggedForReview: flaggedMap[flaggedQuestionNumber] ?? false,
                      },
                    });
                  }}
                  imageData={question.imageData}
                />
              ) : null}

                <div className="border-t border-slate-200 mt-6 pt-6">
                  <StudentManExamNavigationBar
                    canGoPrev={inReviewFlagged ? flaggedReviewIndex > 0 : flaggedQuestionNumber > 1}
                    canGoNext={
                      inReviewFlagged
                        ? flaggedReviewIndex < flaggedNumbers.length - 1
                        : flaggedQuestionNumber < totalQuestions
                    }
                    isLastQuestion={
                      inReviewFlagged
                        ? flaggedReviewIndex === flaggedNumbers.length - 1
                        : flaggedQuestionNumber === totalQuestions
                    }
                    flaggedCount={flaggedNumbers.length}
                    onPrevious={() => {
                      if (inReviewFlagged) {
                        setFlaggedReviewIndex((i) => Math.max(0, i - 1));
                      } else {
                        setCurrentQuestion((q) => Math.max(1, q - 1));
                      }
                    }}
                    onNext={() => {
                      if (inReviewFlagged) {
                        setFlaggedReviewIndex((i) => Math.min(flaggedNumbers.length - 1, i + 1));
                      } else {
                        setCurrentQuestion((q) => Math.min(totalQuestions, q + 1));
                      }
                    }}
                    onSubmit={() => setShowSubmitModal(true)}
                    onReviewFlagged={
                      !inReviewFlagged && flaggedNumbers.length > 0
                        ? () => {
                            setReviewFlaggedMode(true);
                            setFlaggedReviewIndex(0);
                          }
                        : undefined
                    }
                  />
                </div>
            </div>

              <div className="xl:w-[280px] xl:min-w-[220px] xl:max-w-[280px] self-start">
                <StudentManProTips tips={examTheme.proTips} variant={examVariant} />
              </div>
            </div>
          </StudentManExamContent>
          <div className="pt-12">
            <StudentManFlaggedSidebar
              flaggedMap={flaggedMap}
              totalQuestions={totalQuestions}
              currentQuestion={flaggedQuestionNumber}
              className={`xl:w-[280px] xl:min-w-[220px] xl:max-w-[280px] ${examTheme.sidebarClass}`}
              onJumpTo={(q) => {
                if (inReviewFlagged) {
                  const idx = flaggedNumbers.indexOf(q);
                  if (idx !== -1) setFlaggedReviewIndex(idx);
                } else {
                  setCurrentQuestion(q);
                }
              }}
            />
          </div>
        </div>
      </div>

      <StudentManExamFooter />

      <StudentManSubmitModal
        open={showSubmitModal}
        answeredCount={answeredCount}
        totalCount={totalQuestions}
        onBack={() => setShowSubmitModal(false)}
        onFinalSubmit={() => {
          submitExam.mutate(undefined, {
            onSuccess: () => toast.success('Exam submitted successfully.'),
            onError: (e: Error) => toast.error(e.message || 'Failed to submit exam.'),
          });
          setShowSubmitModal(false);
        }}
      />
    </StudentManExamLayout>
  );
};

export default ExamPage;
