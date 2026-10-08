import {
  extractGradeNumber,
  resolveGradeTier,
  extractSubjectFromTags,
  getGradeTheme,
} from './useGradeTheme';

describe('useGradeTheme utilities', () => {
  describe('extractGradeNumber', () => {
    it('handles numeric input', () => {
      expect(extractGradeNumber(5)).toBe(5);
      expect(extractGradeNumber(10)).toBe(10);
    });

    it('extracts number from English grade strings', () => {
      expect(extractGradeNumber('Grade 5')).toBe(5);
      expect(extractGradeNumber('grade-3')).toBe(3);
      expect(extractGradeNumber('grade 12')).toBe(12);
    });

    it('extracts number from Vietnamese lop strings', () => {
      expect(extractGradeNumber('Lớp 4')).toBe(4);
      expect(extractGradeNumber('lop 9')).toBe(9);
    });

    it('returns null for unparseable input', () => {
      expect(extractGradeNumber(null)).toBeNull();
      expect(extractGradeNumber(undefined)).toBeNull();
      expect(extractGradeNumber('midterm')).toBeNull();
    });
  });

  describe('resolveGradeTier', () => {
    it('resolves elementary for grades <= 5', () => {
      expect(resolveGradeTier(1)).toBe('elementary');
      expect(resolveGradeTier(3)).toBe('elementary');
      expect(resolveGradeTier(5)).toBe('elementary');
    });

    it('resolves middle for grades 6 to 9', () => {
      expect(resolveGradeTier(6)).toBe('middle');
      expect(resolveGradeTier(8)).toBe('middle');
      expect(resolveGradeTier(9)).toBe('middle');
    });

    it('resolves high for grades >= 10 and null', () => {
      expect(resolveGradeTier(10)).toBe('high');
      expect(resolveGradeTier(12)).toBe('high');
      expect(resolveGradeTier(null)).toBe('high');
    });
  });

  describe('extractSubjectFromTags', () => {
    it('detects math', () => {
      expect(extractSubjectFromTags(['math', 'grade 5'])).toBe('math');
      expect(extractSubjectFromTags(['Toán', 'lớp 3'])).toBe('math');
      expect(extractSubjectFromTags(['algebra'])).toBe('math');
    });

    it('detects english', () => {
      expect(extractSubjectFromTags(['english', 'grade 4'])).toBe('english');
      expect(extractSubjectFromTags(['Tiếng Anh'])).toBe('english');
      expect(extractSubjectFromTags(['reading', 'literature'])).toBe('english');
    });

    it('detects science', () => {
      expect(extractSubjectFromTags(['science'])).toBe('science');
      expect(extractSubjectFromTags(['Khoa học'])).toBe('science');
      expect(extractSubjectFromTags(['biology'])).toBe('science');
    });

    it('falls back to general', () => {
      expect(extractSubjectFromTags([])).toBe('general');
      expect(extractSubjectFromTags(['midterm', 'final'])).toBe('general');
    });
  });

  describe('getGradeTheme', () => {
    it('returns elementary theme properties for grade 5', () => {
      const theme = getGradeTheme(5);
      expect(theme.tier).toBe('elementary');
      expect(theme.isElementary).toBe(true);
      expect(theme.brandTitle).toContain('Junior');
    });

    it('returns middle theme properties for grade 7', () => {
      const theme = getGradeTheme(7);
      expect(theme.tier).toBe('middle');
      expect(theme.isElementary).toBe(false);
      expect(theme.brandTitle).toContain('Plus');
    });

    it('returns high theme properties for grade 11', () => {
      const theme = getGradeTheme(11);
      expect(theme.tier).toBe('high');
      expect(theme.isElementary).toBe(false);
      expect(theme.brandTitle).toBe('ExamIntegrity');
    });
  });
});

