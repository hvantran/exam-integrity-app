import {
  analyzeFormula,
  formatNumberDisplay,
  getAnswerPlaceholder,
  validateAnswerFormat,
} from './mathFormulaAnalyzer';

describe('mathFormulaAnalyzer', () => {
  describe('analyzeFormula', () => {
    it('returns UNKNOWN for empty input', () => {
      expect(analyzeFormula('')).toEqual({
        type: 'UNKNOWN',
        formula: '',
        operatorCount: 0,
        hasDecimal: false,
        displayFormula: '',
      });
    });

    it('classifies simple addition and extracts operands', () => {
      const parsed = analyzeFormula('4 722 + 5 369');

      expect(parsed.type).toBe('SIMPLE_ADDITION');
      expect(parsed.operator).toBe('+');
      expect(parsed.operatorCount).toBe(1);
      expect(parsed.operands).toEqual([4722, 5369]);
      expect(parsed.displayFormula).toBe('4 722 + 5 369');
    });

    it('classifies simple subtraction and keeps spaced thousands as one operand', () => {
      const parsed = analyzeFormula('56 058 - 46 902');

      expect(parsed.type).toBe('SIMPLE_SUBTRACTION');
      expect(parsed.operator).toBe('-');
      expect(parsed.operands).toEqual([56058, 46902]);
    });

    it('classifies simple multiplication and parses spaced operands', () => {
      const parsed = analyzeFormula('21 607 x 4');

      expect(parsed.type).toBe('SIMPLE_MULTIPLICATION');
      expect(parsed.operator).toBe('x');
      expect(parsed.operands).toEqual([21607, 4]);
    });

    it('classifies simple division and parses spaced operands', () => {
      const parsed = analyzeFormula('40 096 : 7');

      expect(parsed.type).toBe('SIMPLE_DIVISION');
      expect(parsed.operator).toBe(':');
      expect(parsed.operands).toEqual([40096, 7]);
    });

    it('classifies simple division and parses unspaced large numbers', () => {
      const parsed = analyzeFormula('6740096 : 7');

      expect(parsed.type).toBe('SIMPLE_DIVISION');
      expect(parsed.operator).toBe(':');
      expect(parsed.operands).toEqual([6740096, 7]);
    });

    it('classifies simple addition and parses unspaced large numbers', () => {
      const parsed = analyzeFormula('6740096 + 7');

      expect(parsed.type).toBe('SIMPLE_ADDITION');
      expect(parsed.operator).toBe('+');
      expect(parsed.operands).toEqual([6740096, 7]);
    });

    it('classifies simple multiplication and parses unspaced large numbers', () => {
      const parsed = analyzeFormula('6740096 x 7');

      expect(parsed.type).toBe('SIMPLE_MULTIPLICATION');
      expect(parsed.operator).toBe('x');
      expect(parsed.operands).toEqual([6740096, 7]);
    });

    it('classifies complex formula with multiple operators', () => {
      const parsed = analyzeFormula('38 040 : 5 : 2');

      expect(parsed.type).toBe('COMPLEX_FORMULA');
      expect(parsed.operatorCount).toBe(2);
      expect(parsed.displayFormula).toBe('38 040 : 5 : 2');
    });

    it('classifies bracketed formula as complex', () => {
      const parsed = analyzeFormula('(12 740 - 5 037) x 4');

      expect(parsed.type).toBe('COMPLEX_FORMULA');
      expect(parsed.operatorCount).toBe(2);
    });

    it('classifies unspaced bracketed formula as complex', () => {
      const parsed = analyzeFormula('(12740 - 5037) x 4');

      expect(parsed.type).toBe('COMPLEX_FORMULA');
      expect(parsed.operatorCount).toBe(2);
    });

    it('handles unary minus without counting it as an operator', () => {
      const parsed = analyzeFormula('-5 + 2');

      expect(parsed.type).toBe('SIMPLE_ADDITION');
      expect(parsed.operator).toBe('+');
      expect(parsed.operatorCount).toBe(1);
      expect(parsed.operands).toEqual([-5, 2]);
    });

    it('normalizes textual operators', () => {
      const parsed = analyzeFormula('9 divided by 3');

      expect(parsed.type).toBe('SIMPLE_DIVISION');
      expect(parsed.operator).toBe(':');
      expect(parsed.operands).toEqual([9, 3]);
    });
  });

  describe('validateAnswerFormat', () => {
    it('rejects empty answers', () => {
      expect(validateAnswerFormat('   ', 'SIMPLE_ADDITION')).toEqual({
        isValid: false,
        error: 'Answer cannot be empty',
      });
    });

    it('rejects non-numeric answers', () => {
      expect(validateAnswerFormat('abc', 'SIMPLE_ADDITION')).toEqual({
        isValid: false,
        error: 'Answer must be a number',
      });
    });

    it('accepts integer and decimal answers', () => {
      expect(validateAnswerFormat('12345', 'SIMPLE_MULTIPLICATION')).toEqual({ isValid: true });
      expect(validateAnswerFormat('-10.5', 'SIMPLE_DIVISION')).toEqual({ isValid: true });
      expect(validateAnswerFormat('10,5', 'SIMPLE_DIVISION')).toEqual({ isValid: true });
    });
  });

  describe('formatNumberDisplay', () => {
    it('formats number groups with spaces', () => {
      expect(formatNumberDisplay(1234567)).toBe('1 234 567');
      expect(formatNumberDisplay('40096')).toBe('40 096');
    });
  });

  describe('getAnswerPlaceholder', () => {
    it('returns placeholders for known and unknown formula types', () => {
      expect(getAnswerPlaceholder('SIMPLE_DIVISION')).toBe('Enter the quotient (e.g., 10.4)');
      expect(getAnswerPlaceholder('UNKNOWN')).toBe('Enter your answer');
    });
  });
});
