import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export type GradeTier = 'elementary' | 'middle' | 'high';
export type ExamSubject = 'math' | 'english' | 'science' | 'general';

export interface GradeThemeConfig {
  gradeNumber: number | null;
  tier: GradeTier;
  isElementary: boolean;
  brandTitle: string;
  badgeLabel: string;
  themeName: string;
  headerClass: string;
  cardClass: string;
  buttonPrimaryClass: string;
  buttonSecondaryClass: string;
  accentPillClass: string;
  containerBgClass: string;
}

export interface ExamLayoutThemeConfig extends GradeThemeConfig {
  subject: ExamSubject;
  subjectTitle: string;
  splitPassageView: boolean;
  showMathTools: boolean;
  showReadAloud: boolean;
  mascotName: string;
  mascotEmoji: string;
  mascotTip: string;
}

export function extractGradeNumber(gradeOrTag?: string | number | null): number | null {
  if (gradeOrTag == null) return null;
  if (typeof gradeOrTag === 'number' && Number.isFinite(gradeOrTag)) return gradeOrTag;

  const match = String(gradeOrTag).match(/(?:grade|lop|lớp)[\s\-_]*(\d+)/iu);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

export function resolveGradeTier(grade: number | null): GradeTier {
  if (grade !== null) {
    if (grade <= 5) return 'elementary';
    if (grade <= 9) return 'middle';
    return 'high';
  }
  return 'high';
}

export function extractSubjectFromTags(tags?: string[]): ExamSubject {
  if (!tags || tags.length === 0) return 'general';
  for (const rawTag of tags) {
    const tag = rawTag.toLowerCase();
    if (/(?:math|toán|algebra|geometry|arithmetic)/iu.test(tag)) return 'math';
    if (/(?:english|tiếng anh|reading|literature|language)/iu.test(tag)) return 'english';
    if (/(?:science|khoa học|physics|chemistry|biology)/iu.test(tag)) return 'science';
  }
  return 'general';
}

export const ELEMENTARY_THEME: Omit<GradeThemeConfig, 'gradeNumber' | 'tier' | 'isElementary' | 'badgeLabel'> = {
  brandTitle: 'ExamIntegrity Junior 🌟',
  themeName: 'Sprout UI (Playful Explorer)',
  headerClass: 'bg-gradient-to-r from-amber-50 via-sky-50 to-emerald-50 border-b-2 border-amber-200/80',
  cardClass: 'rounded-3xl border-2 border-amber-200/80 bg-white shadow-lg p-6 md:p-8',
  buttonPrimaryClass:
    'min-h-[56px] rounded-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-6 shadow-[0_4px_0_#d97706] active:translate-y-1 active:shadow-none transition-all',
  buttonSecondaryClass:
    'min-h-[56px] rounded-full bg-sky-400 hover:bg-sky-500 text-white font-bold px-6 shadow-[0_4px_0_#0284c7] active:translate-y-1 active:shadow-none transition-all',
  accentPillClass: 'rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-bold px-4 py-1.5',
  containerBgClass: 'min-h-screen bg-[#fffdf7] text-slate-900',
};

export const MIDDLE_THEME: Omit<GradeThemeConfig, 'gradeNumber' | 'tier' | 'isElementary' | 'badgeLabel'> = {
  brandTitle: 'ExamIntegrity Plus 🎯',
  themeName: 'Balanced Focus',
  headerClass: 'bg-gradient-to-r from-emerald-50 via-white to-teal-50 border-b border-emerald-200',
  cardClass: 'rounded-2xl border border-emerald-200 bg-white shadow-md p-6',
  buttonPrimaryClass:
    'min-h-[48px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 transition-all shadow-sm',
  buttonSecondaryClass:
    'min-h-[48px] rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 transition-all shadow-sm',
  accentPillClass: 'rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 font-semibold px-3 py-1',
  containerBgClass: 'min-h-screen bg-slate-50 text-slate-900',
};

export const HIGH_THEME: Omit<GradeThemeConfig, 'gradeNumber' | 'tier' | 'isElementary' | 'badgeLabel'> = {
  brandTitle: 'ExamIntegrity',
  themeName: 'Academic Precision',
  headerClass: 'bg-white border-b border-slate-200',
  cardClass: 'rounded-xl border border-slate-200 bg-white shadow-sm p-6',
  buttonPrimaryClass:
    'min-h-[42px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 transition-all shadow-sm',
  buttonSecondaryClass:
    'min-h-[42px] rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-medium px-4 transition-all shadow-sm',
  accentPillClass: 'rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium px-2.5 py-1',
  containerBgClass: 'min-h-screen bg-slate-50 text-slate-900',
};

export function getGradeTheme(gradeNumber: number | null): GradeThemeConfig {
  const tier = resolveGradeTier(gradeNumber);
  const isElementary = tier === 'elementary';
  const badgeLabel = gradeNumber ? `Grade ${gradeNumber}` : tier.toUpperCase();

  const base =
    tier === 'elementary'
      ? ELEMENTARY_THEME
      : tier === 'middle'
        ? MIDDLE_THEME
        : HIGH_THEME;

  return {
    ...base,
    gradeNumber,
    tier,
    isElementary,
    badgeLabel,
  };
}

/**
 * Hook for general student pages (Dashboard, My Exams, Results).
 * Resolves theme purely based on logged-in student grade (or override).
 */
export function useStudentPageTheme(fallbackGradeTag?: string): GradeThemeConfig {
  const { effectiveGrade } = useAuth();

  return useMemo(() => {
    const resolvedGrade = effectiveGrade ?? extractGradeNumber(fallbackGradeTag);
    return getGradeTheme(resolvedGrade);
  }, [effectiveGrade, fallbackGradeTag]);
}

/**
 * Hook for Exam Taking Room.
 * Resolves 2D theme based on Grade × Subject (parsed from tags).
 */
export function useExamLayoutTheme(tags?: string[]): ExamLayoutThemeConfig {
  const { effectiveGrade } = useAuth();

  return useMemo(() => {
    const gradeFromTag = tags?.find((t) => /(?:grade|lop|lớp)\s*\d+/iu.test(t));
    const resolvedGrade = effectiveGrade ?? extractGradeNumber(gradeFromTag);
    const baseTheme = getGradeTheme(resolvedGrade);
    const subject = extractSubjectFromTags(tags);

    let subjectTitle = 'General Exam';
    let splitPassageView = false;
    let showMathTools = false;
    let showReadAloud = false;
    let mascotName = 'Friendly Guardian';
    let mascotEmoji = '🛡️';
    let mascotTip = 'Take your time, read each question carefully, and do your best!';

    if (subject === 'math') {
      subjectTitle = '🦁 Elementary Math Quest';
      showMathTools = baseTheme.isElementary;
      mascotName = 'Professor Hoot';
      mascotEmoji = '🦉';
      mascotTip = 'Hoot! Double check place values and calculations before choosing!';
    } else if (subject === 'english') {
      subjectTitle = '📚 Reading & Language Quest';
      splitPassageView = baseTheme.isElementary;
      showReadAloud = baseTheme.isElementary;
      mascotName = 'Penelope Bookworm';
      mascotEmoji = '🐛';
      mascotTip = 'Take your time reading the story paragraph by paragraph to spot the clues!';
    } else if (subject === 'science') {
      subjectTitle = '🚀 Science Explorer Quest';
      mascotName = 'Cosmo the Rover';
      mascotEmoji = '🤖';
      mascotTip = 'Observe the evidence carefully before choosing your hypothesis!';
    }

    return {
      ...baseTheme,
      subject,
      subjectTitle,
      splitPassageView,
      showMathTools,
      showReadAloud,
      mascotName,
      mascotEmoji,
      mascotTip,
    };
  }, [effectiveGrade, tags]);
}
