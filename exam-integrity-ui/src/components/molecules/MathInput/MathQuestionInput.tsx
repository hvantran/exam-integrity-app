import React, { useMemo } from 'react';
import { analyzeFormula, MathFormulaType } from '../../../utils/mathFormulaAnalyzer';
import SimpleArithmeticInput from './SimpleArithmeticInput';
import ComplexFormulaInput from './ComplexFormulaInput';
import LongDivisionInput from './LongDivisionInput';

const sanitizeDigitsOnly = (raw: string): string => raw.replace(/\D+/g, '');
const sanitizeLongDivisionValue = (raw: string): string =>
  raw
    .split('\n')
    .map((line) => line.replace(/\D+/g, ''))
    .join('\n');
const sanitizeComplexMathValue = (raw: string): string => raw;

interface MathQuestionInputProps {
  questionText: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  /** Optional tags (e.g. ['grade 3', 'grade3']) that select a grade-appropriate renderer. */
  tags?: string[];
}

/**
 * Molecule — MathQuestionInput
 *
 * Main entry point for rendering math question inputs.
 * Automatically detects formula type and renders appropriate specialized component.
 *
 * Renders:
 * - SimpleArithmeticInput for single-operator formulas (addition, subtraction, multiplication, division)
 * - ComplexFormulaInput for multi-operator formulas
 */
const MathQuestionInput: React.FC<MathQuestionInputProps> = ({
  questionText,
  value,
  disabled = false,
  onChange,
  tags = [],
}) => {
  const parsedFormula = useMemo(() => {
    return analyzeFormula(questionText);
  }, [questionText]);

  const isGrade3 = tags.some((t) => /grade\s*3/i.test(t));

  const isSimpleArithmetic = [
    'SIMPLE_ADDITION',
    'SIMPLE_SUBTRACTION',
    'SIMPLE_MULTIPLICATION',
    'SIMPLE_DIVISION',
  ].includes(parsedFormula.type as MathFormulaType);

  const isComplexFormula = parsedFormula.type === 'COMPLEX_FORMULA';

  // Grade-3 long-division layout
  if (parsedFormula.type === 'SIMPLE_DIVISION' && isGrade3) {
    return (
      <LongDivisionInput
        formula={parsedFormula}
        value={value}
        disabled={disabled}
        onChange={(nextValue) => onChange(sanitizeLongDivisionValue(nextValue))}
      />
    );
  }

  // Render simple arithmetic input
  if (isSimpleArithmetic) {
    return (
      <SimpleArithmeticInput
        formula={parsedFormula}
        value={value}
        disabled={disabled}
        onChange={(nextValue) => onChange(sanitizeDigitsOnly(nextValue))}
      />
    );
  }

  // Render complex formula input
  if (isComplexFormula) {
    return (
      <ComplexFormulaInput
        formula={parsedFormula}
        value={value}
        disabled={disabled}
        onChange={(nextValue) => onChange(sanitizeComplexMathValue(nextValue))}
      />
    );
  }

  // Fallback: generic text input for unknown types
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-6">
      <textarea
        placeholder="Enter your answer here"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        className={`w-full text-sm leading-6 border border-slate-300 rounded-xl p-3 bg-white resize-vertical text-slate-900 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-200 ${
          disabled ? 'cursor-not-allowed opacity-60' : ''
        }`}
      />
    </div>
  );
};

export default MathQuestionInput;
