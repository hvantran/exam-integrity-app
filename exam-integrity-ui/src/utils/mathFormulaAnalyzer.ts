/**
 * Math Formula Analyzer Utility
 * Detects and classifies mathematical formulas for optimized student input rendering
 */

export type MathFormulaType =
  | 'SIMPLE_ADDITION'
  | 'SIMPLE_SUBTRACTION'
  | 'SIMPLE_MULTIPLICATION'
  | 'SIMPLE_DIVISION'
  | 'COMPLEX_FORMULA'
  | 'UNKNOWN';

export interface ParsedFormula {
  type: MathFormulaType;
  formula: string;
  operands?: number[];
  operator?: string;
  operatorCount: number;
  hasDecimal: boolean;
  displayFormula: string;
}

/**
 * Analyzes a formula string and returns its type and components
 * @param formula - The formula text to analyze
 * @returns ParsedFormula object with type and metadata
 */
export const analyzeFormula = (formula: string): ParsedFormula => {
  if (!formula || typeof formula !== 'string') {
    return {
      type: 'UNKNOWN',
      formula,
      operatorCount: 0,
      hasDecimal: false,
      displayFormula: formula,
    };
  }

  const normalizedFormula = normalizeFormula(formula);

  // Count operators
  const operators = extractOperators(normalizedFormula);
  const operatorCount = operators.length;

  // Check if it's a simple formula (single operator)
  if (operatorCount === 1) {
    const operator = operators[0];
    const operands = extractOperands(normalizedFormula);
    const hasDecimal = /\./g.test(normalizedFormula) || /,/g.test(normalizedFormula);

    const baseResult = {
      formula: normalizedFormula,
      operands,
      operator,
      operatorCount,
      hasDecimal,
      displayFormula: normalizedFormula,
    };

    if (operator === '+' || operator === 'plus') {
      return { ...baseResult, type: 'SIMPLE_ADDITION' };
    } else if (operator === '-' || operator === 'minus' || operator === '–') {
      return { ...baseResult, type: 'SIMPLE_SUBTRACTION' };
    } else if (operator === '*' || operator === 'x' || operator === 'X' || operator === '×') {
      return { ...baseResult, type: 'SIMPLE_MULTIPLICATION' };
    } else if (operator === '/' || operator === ':' || operator === '÷') {
      return { ...baseResult, type: 'SIMPLE_DIVISION' };
    }
  }

  // Complex formula (multiple operators)
  if (operatorCount > 1) {
    return {
      type: 'COMPLEX_FORMULA',
      formula: normalizedFormula,
      operatorCount,
      hasDecimal: /\./g.test(normalizedFormula) || /,/g.test(normalizedFormula),
      displayFormula: normalizedFormula,
    };
  }

  return {
    type: 'UNKNOWN',
    formula: normalizedFormula,
    operatorCount,
    hasDecimal: /\./g.test(normalizedFormula) || /,/g.test(normalizedFormula),
    displayFormula: normalizedFormula,
  };
};

/**
 * Normalizes formula by standardizing operators and spacing
 */
const normalizeFormula = (formula: string): string => {
  return formula
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/–/g, '-')
    .replace(/×/g, 'x')
    .replace(/÷/g, ':')
    .replace(/plus/gi, '+')
    .replace(/minus/gi, '-')
    .replace(/times/gi, 'x')
    .replace(/divided\s+by/gi, ':');
};

/**
 * Extracts all operators from a formula
 */
const extractOperators = (formula: string): string[] => {
  const operators: string[] = [];
  const operatorRegex = /[\+\-x*/:]/;

  for (let i = 0; i < formula.length; i += 1) {
    const char = formula[i];
    if (!operatorRegex.test(char)) {
      continue;
    }

    // Treat unary minus as part of a number, not an arithmetic operator.
    if (char === '-') {
      let prevIndex = i - 1;
      while (prevIndex >= 0 && formula[prevIndex] === ' ') {
        prevIndex -= 1;
      }

      const prevChar = prevIndex >= 0 ? formula[prevIndex] : '';
      if (!prevChar || prevChar === '(' || operatorRegex.test(prevChar)) {
        continue;
      }
    }

    operators.push(char);
  }

  return operators;
};

/**
 * Extracts operands from a formula
 */
const extractOperands = (formula: string): number[] => {
  // Capture grouped-thousands numbers like "21 607" as a single token.
  const numberRegex = /-?\d{1,3}(?: \d{3})+(?:[.,]\d+)?|-?\d+(?:[.,]\d+)?/g;
  const matches = formula.match(numberRegex) || [];

  return matches.map((num) => {
    const normalized = num.replace(/[ ,]/g, '');
    return parseFloat(normalized);
  });
};

/**
 * Determines if answer format is correct for the formula type
 */
export const validateAnswerFormat = (
  answer: string,
  formulaType: MathFormulaType,
): { isValid: boolean; error?: string } => {
  if (!answer || !answer.trim()) {
    return { isValid: false, error: 'Answer cannot be empty' };
  }

  const trimmed = answer.trim();

  // Check if it's a valid number
  const numberRegex = /^-?\d+(?:[.,]\d+)?$/;
  if (!numberRegex.test(trimmed)) {
    return { isValid: false, error: 'Answer must be a number' };
  }

  return { isValid: true };
};

/**
 * Formats a number for display (with proper spacing for large numbers)
 */
export const formatNumberDisplay = (num: number | string): string => {
  const numStr = num.toString();

  // Add spaces for thousands in display
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

/**
 * Extracts the expected answer format suggestion
 */
export const getAnswerPlaceholder = (formulaType: MathFormulaType): string => {
  const placeholders: Record<MathFormulaType, string> = {
    SIMPLE_ADDITION: 'Enter the sum (e.g., 10290)',
    SIMPLE_SUBTRACTION: 'Enter the difference (e.g., 4589)',
    SIMPLE_MULTIPLICATION: 'Enter the product (e.g., 20148)',
    SIMPLE_DIVISION: 'Enter the quotient (e.g., 10.4)',
    COMPLEX_FORMULA: 'Enter the final result (follow order of operations)',
    UNKNOWN: 'Enter your answer',
  };

  return placeholders[formulaType];
};
