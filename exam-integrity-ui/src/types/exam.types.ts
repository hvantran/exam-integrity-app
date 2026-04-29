/** FE-02: UI-level types matching BE DTOs. */

export type QuestionType = 'MCQ' | 'ESSAY_SHORT' | 'ESSAY_LONG';

export interface QuestionOption {
  label: string;
  text: string;
}

export interface RubricDTO {
  keywords?: string[];
  expectedSteps?: string[];
  finalAnswer?: string;
  modelAnswer?: string;
  formatChecks?: string[];
}

export interface QuestionSummaryDTO {
  id: string;
  questionNumber: number;
  content: string;
  type: QuestionType;
  points: number;
  options?: string[];
  truncated: boolean;
}

export interface DraftQuestionDTO {
  id: string;
  questionNumber: number;
  content: string;
  rawText?: string;
  type?: QuestionType;
  points: number;
  options?: string[];
  correctAnswer?: string;
  rubric?: RubricDTO;
  truncated: boolean;
  ocrConfidence?: number;
  parserConfidence: number;
  pageNumber?: number;
  parserWarnings?: string[];
  reviewStatus: 'PENDING' | 'APPROVED' | 'CORRECTED' | 'EXCLUDED';
}

export interface ExamDTO {
  id: string;
  title: string;
  durationSeconds: number;
  totalPoints: number;
  questionCount: number;
  tags?: string[];
  questions?: QuestionSummaryDTO[];
}

export interface ExamDraftSummaryDTO {
  draftId?: string;
  title?: string;
  originalFilename: string;
  pdfType?: string;
  ocrUsed: boolean;
  documentOcrConfidence?: number;
  totalQuestions: number;
  flaggedQuestionCount: number;
  hasPointMismatch: boolean;
  totalPoints: number;
  detectedPointsSum: number;
  tags?: string[];
  status: string;
  uploadedAt?: string;
  uploadedBy?: string;
}

export interface DraftQuestionEditCommand {
  content?: string;
  type?: QuestionType;
  points?: number;
  options?: string[];
  correctAnswer?: string;
  rubric?: RubricDTO;
  reviewStatus?: 'APPROVED' | 'CORRECTED' | 'EXCLUDED';
  teacherNotes?: string;
}

export interface ExamDraftPublishCommand {
  title: string;
  durationSeconds: number;
  tags?: string[];
  reviewNotes?: string;
}

export interface CreateExamFromBankCommand {
  title: string;
  durationSeconds: number;
  tags?: string[];
  reviewNotes?: string;
  mcqCount: number;
  essayShortCount: number;
  essayLongCount: number;
}

export interface SessionDTO {
  sessionId: string;
  examId: string;
  studentId: string;
  status: 'ACTIVE' | 'SUBMITTED' | 'FORCE_SUBMITTED' | 'FLAGGED';
  startedAt?: string;
  remainingSeconds: number;
}

export interface AnswerPayload {
  answer: string;
  flaggedForReview: boolean;
}

export type ScoreStatus =
  | 'CORRECT'
  | 'INCORRECT'
  | 'PARTIAL'
  | 'SELF_GRADE_REQUIRED'
  | 'PENDING_ESSAY'
  | 'INCOMPLETE_QUESTION'
  | 'MULTIPLE_ANSWERS_FLAG';

export interface ScoreDTO {
  questionId: string;
  questionNumber: number;
  earnedPoints: number;
  maxPoints: number;
  status: ScoreStatus;
  studentAnswer?: string;
  correctAnswer?: string;
  explanation?: string;
  scoreBreakdownJson?: string;
}

export interface ReviewDashboardDTO {
  sessionId: string;
  totalEarned: number;
  totalMax: number;
  finalScore10: number;
  missedQuestionNumbers?: number[];
  scores: ScoreDTO[];
}

/** Alias for ReviewDashboardDTO — used by ReviewDashboard organism */
export type ReviewDashboard = ReviewDashboardDTO;

/** Alias for ScoreDTO — used by CorrectionCard molecule */
export type ScoreResult = ScoreDTO;

export interface TimerTickMessage {
  type: 'TICK' | 'FORCE_SUBMIT';
  remaining?: number;
}

export interface QuestionBankPageDTO {
  content: DraftQuestionDTO[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
