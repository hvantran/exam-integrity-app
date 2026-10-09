/** FE-14: Student exam-taking page */
import React, { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert } from '@mui/material';
import { toast } from 'react-toastify';
import {
  ExamIntegrityStudentExamTemplate as StudentManExamLayout,
  ExamIntegrityStudentExamFooterTemplate as StudentManExamFooter,
  ExamIntegrityStudentExamHeader as StudentManExamHeader,
  ExamIntegrityStudentExamNavigationBar as StudentManExamNavigationBar,
  ExamIntegrityStudentSubmitModal as StudentManSubmitModal,
  ExamIntegrityStudentFlaggedSidebar as StudentManFlaggedSidebar,
  ExamIntegrityStudentProTips as StudentManProTips,
  Skeleton,
} from '@hvantran/ui-component-library';
import StudentManQuestionPanel from '../components/QuestionPanel';
import type { QuestionOption } from '../components/QuestionPanel';
import { useSession, useQuestion, useSaveAnswer, useSubmitExam } from '../hooks/useSession';
import { useExam } from '../hooks/useExams';
import { useWebSocketTimer } from '../hooks/useWebSocketTimer';
import { useProctor } from '../hooks/useProctor';
import { useExamLayoutTheme } from '../hooks/useGradeTheme';
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
  const examLayoutTheme = useExamLayoutTheme(exam?.tags);
  const examVariant = examLayoutTheme.tier;
  const examTheme = {
    brandName: examLayoutTheme.brandTitle,
    headerClass: examLayoutTheme.headerClass,
    pageAccentClass: examLayoutTheme.isElementary
      ? 'bg-gradient-to-b from-amber-50/50 via-sky-50/30 to-white min-h-screen'
      : EXAM_UI_THEME[examVariant].pageAccentClass,
    sidebarClass: examLayoutTheme.isElementary
      ? 'border-2 border-amber-200 bg-amber-50/40 rounded-2xl'
      : EXAM_UI_THEME[examVariant].sidebarClass,
    proTips: EXAM_UI_THEME[examVariant].proTips,
  };

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

        {/* Dynamic Grade & Subject Banner for Elementary */}
        {examLayoutTheme.isElementary && (
          <div className="bg-amber-100/70 border-b border-amber-200/80 px-4 py-2.5">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{examLayoutTheme.mascotEmoji}</span>
                <span className="font-bold text-amber-950 text-sm">
                  {examLayoutTheme.subjectTitle}
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold text-xs">
                  🛡️ Friendly Guardian Active
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Gamified Quest Trail Stepping Stones for Elementary */}
        {examLayoutTheme.isElementary && totalQuestions > 0 && (
          <section className="bg-white/95 border-b-2 border-amber-200/80 shadow-sm py-3.5 px-4 md:px-8">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Stepping Stones Navigation Bar */}
              <div className="flex-1 overflow-x-auto pb-1 md:pb-0">
                <div className="flex items-center min-w-max space-x-1 sm:space-x-2">
                  <span className="text-xs font-black tracking-wide text-amber-950 uppercase flex items-center gap-1.5 mr-2">
                    <span className="text-base">🧭</span>
                    Quest Trail:
                  </span>

                  {Array.from({ length: totalQuestions }, (_, idx) => {
                    const qNum = idx + 1;
                    const isCurrent = qNum === flaggedQuestionNumber;
                    const isAnswered = Boolean(answeredMap[qNum]);
                    const isFlagged = Boolean(flaggedMap[qNum]);
                    const isLast = qNum === totalQuestions;

                    return (
                      <React.Fragment key={qNum}>
                        <button
                          type="button"
                          onClick={() => {
                            if (inReviewFlagged) {
                              const fIdx = flaggedNumbers.indexOf(qNum);
                              if (fIdx !== -1) setFlaggedReviewIndex(fIdx);
                            } else {
                              setCurrentQuestion(qNum);
                            }
                          }}
                          className={`group flex items-center justify-center transition-all cursor-pointer select-none focus:outline-none ${
                            isCurrent
                              ? 'px-3.5 h-11 rounded-full bg-amber-400 text-amber-950 border-2 border-amber-600 font-extrabold flex items-center gap-1.5 shadow-[0_4px_0_#d97706] ring-4 ring-amber-200/80 scale-105'
                              : isAnswered
                                ? 'w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 border-2 border-emerald-500 font-bold flex items-center justify-center shadow-[0_3px_0_#059669] hover:brightness-105 active:translate-y-1'
                                : isFlagged
                                  ? 'w-11 h-11 rounded-full bg-amber-50 text-amber-900 border-2 border-amber-400 font-bold flex items-center justify-center shadow-[0_3px_0_#d97706] hover:brightness-105 active:translate-y-1 relative'
                                  : 'w-11 h-11 rounded-full bg-slate-50 text-slate-600 border-2 border-slate-300 font-semibold flex items-center justify-center shadow-[0_3px_0_#cbd5e1] hover:bg-amber-50 hover:border-amber-300 active:translate-y-1'
                          }`}
                          title={`Question ${qNum}${isAnswered ? ' (Completed)' : isFlagged ? ' (Flagged)' : ''}`}
                        >
                          {isCurrent ? (
                            <>
                              <span className="text-base">⭐</span>
                              <span className="text-xs font-black">Quest {qNum}</span>
                              <span className="w-2 h-2 rounded-full bg-amber-950 animate-pulse" />
                            </>
                          ) : isFlagged ? (
                            <>
                              <span className="text-sm font-black">{qNum}</span>
                              <span className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center font-bold">
                                🚩
                              </span>
                            </>
                          ) : isAnswered ? (
                            <span className="text-base font-extrabold">✓</span>
                          ) : isLast ? (
                            <span className="text-base" title="Milestone">
                              🏆
                            </span>
                          ) : (
                            <span className="text-xs font-black">{qNum}</span>
                          )}
                        </button>

                        {!isLast && (
                          <div
                            className={`w-3 sm:w-4 h-0.5 border-b-2 border-dashed ${
                              isAnswered ? 'border-emerald-400' : 'border-amber-300'
                            }`}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Gamified Progress Spark Bar */}
              <div className="flex items-center gap-3 bg-amber-50/80 px-4 py-2 rounded-2xl border border-amber-200 shrink-0">
                <div className="w-32 sm:w-36 bg-amber-200/60 h-3 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-amber-950 whitespace-nowrap">
                  {answeredCount} of {totalQuestions} Done ({totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0}%) 🚀
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Main Workspace Grid (Unified max-w-7xl matching Quest Trail) */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Question Workspace Panel (8 cols) */}
            <section className="lg:col-span-8 flex flex-col gap-5">
              <div
                className={`w-full p-6 md:p-8 flex flex-col ${
                  examLayoutTheme.isElementary
                    ? 'rounded-3xl border-2 border-amber-200/90 bg-white shadow-[0_4px_0_#cbd5e1]'
                    : 'rounded-2xl border border-gray-200 bg-white shadow-sm'
                }`}
              >
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
                    subject={examLayoutTheme.subject}
                    gradeLevel={gradeLevelTag || (examLayoutTheme.gradeNumber ? `Grade ${examLayoutTheme.gradeNumber}` : undefined)}
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

              {/* Calming Bottom Reassurance Card (Stitch design) */}
              {examLayoutTheme.isElementary && (
                <div className="bg-[#f0fdfa] border-2 border-[#99f6e4] rounded-2xl p-4 flex items-center gap-3.5 shadow-sm text-[#134e4a]">
                  <div className="w-10 h-10 rounded-full bg-[#ccfbf1] flex items-center justify-center text-[#0f766e] text-lg font-bold shrink-0">
                    💚
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#115e59]">You are doing wonderfully!</h4>
                    <p className="text-xs text-[#134e4a] font-medium">
                      There are no trick questions here. Trust your thinking and take all the time you need! ✨
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Right Sidebar: Mascot & Tools (4 cols) */}
            <aside className="lg:col-span-4 flex flex-col gap-5">
              {examLayoutTheme.isElementary ? (
                <>
                  {/* Mascot Card */}
                  <div className="rounded-3xl border-2 border-amber-200 bg-white p-6 shadow-md relative">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-inner shrink-0">
                        {examLayoutTheme.mascotEmoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-900 text-base">{examLayoutTheme.mascotName}</h3>
                          <span className="text-sm">🦉</span>
                        </div>
                        <p className="text-xs font-bold text-emerald-700 mt-0.5">Your Exam Buddy & Cheerful Guide</p>
                        <div className="inline-flex items-center gap-1 mt-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                          Safe & Secure Quest ✨
                        </div>
                      </div>
                    </div>
                    {/* Mascot Speech Bubble */}
                    <div className="mt-4 relative bg-[#fffbeb] border-2 border-[#fde68a] rounded-2xl p-3.5 shadow-sm text-amber-950">
                      <div className="absolute -top-2 left-8 w-3.5 h-3.5 bg-[#fffbeb] border-t-2 border-l-2 border-[#fde68a] transform rotate-45" />
                      <div className="font-bold text-[11px] text-amber-800 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <span>💡 Friendly Tip:</span>
                      </div>
                      <p className="text-xs font-medium leading-relaxed">"{examLayoutTheme.mascotTip}"</p>
                    </div>
                  </div>

                  {/* Flagged for Review Drawer */}
                  <div className="rounded-3xl border-2 border-amber-200 bg-white p-5 shadow-md">
                    <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500 font-bold">🚩</span>
                        <h3 className="font-bold text-slate-900 text-sm">Flagged for Review</h3>
                      </div>
                      <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200">
                        {flaggedNumbers.length} Saved
                      </span>
                    </div>
                    <div className="mt-3">
                      {flaggedNumbers.length > 0 ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {flaggedNumbers.map((qNum) => (
                            <div
                              key={qNum}
                              className="bg-amber-50/70 rounded-xl p-2.5 border border-amber-200/80 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-7 h-7 rounded-full bg-amber-200 text-amber-900 font-bold text-xs flex items-center justify-center">
                                  {qNum}
                                </span>
                                <span className="font-bold text-slate-800 text-xs">Question {qNum}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (inReviewFlagged) {
                                    const idx = flaggedNumbers.indexOf(qNum);
                                    if (idx !== -1) setFlaggedReviewIndex(idx);
                                  } else {
                                    setCurrentQuestion(qNum);
                                  }
                                }}
                                className="px-2.5 py-1 rounded-full bg-white text-sky-700 hover:bg-sky-600 hover:text-white border border-sky-300 text-xs font-bold transition-all shadow-sm"
                              >
                                Jump →
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 font-medium py-1">
                          No questions flagged yet. Tap 🚩 on any question if you want to review it later!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Proctoring Status Card */}
                  <div className="rounded-3xl border-2 border-amber-200 bg-white p-5 shadow-md">
                    <div className="flex items-center gap-2 pb-2">
                      <span className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-bold">
                        🛡️
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">Proctoring Status</h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      Camera & microphone are listening kindly for background noise so nobody distracts your adventure! All secure & verified.
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span className="flex items-center gap-1 text-teal-700">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                        Connection: Excellent
                      </span>
                      <span>Room Integrity: Calm & Quiet</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <StudentManProTips tips={examTheme.proTips} variant={examVariant} />
                  <StudentManFlaggedSidebar
                    flaggedMap={flaggedMap}
                    totalQuestions={totalQuestions}
                    currentQuestion={flaggedQuestionNumber}
                    className={examTheme.sidebarClass}
                    onJumpTo={(q) => {
                      if (inReviewFlagged) {
                        const idx = flaggedNumbers.indexOf(q);
                        if (idx !== -1) setFlaggedReviewIndex(idx);
                      } else {
                        setCurrentQuestion(q);
                      }
                    }}
                  />
                </>
              )}
            </aside>
          </div>
        </main>
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
