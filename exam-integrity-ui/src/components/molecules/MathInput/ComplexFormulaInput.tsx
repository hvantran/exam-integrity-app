import React, { useMemo } from 'react';
import { ParsedFormula } from '../../../utils/mathFormulaAnalyzer';

interface ComplexFormulaInputProps {
  formula: ParsedFormula;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

const normalizeComplexStepLines = (raw: string): string =>
  raw
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return '';
      }

      const content = trimmed.startsWith('=') ? trimmed.slice(1).trim() : trimmed;
      return `= ${content}`;
    })
    .join('\n');

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

/**
 * Molecule — ComplexFormulaInput
 *
 * Provides specialized input UI for complex arithmetic problems (multiple operators).
 * Features:
 * - Large formula display area for readability
 * - Multi-line input workspace
 * - Order of operations hint
 * - Step-by-step calculation guidance
 */
const ComplexFormulaInput: React.FC<ComplexFormulaInputProps> = ({
  formula,
  value,
  disabled = false,
  onChange,
}) => {
  // Derive the final answer live from the work textarea — no local state needed,
  // so it is never lost when the student navigates away and returns.
  const finalAnswer = useMemo(() => extractFinalComplexResult(value), [value]);

  return (
    <div className="rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 via-surface-50 to-accent-50 p-4 md:p-6">
      <div className="space-y-4">
        {/* Formula Display */}
        <div className="bg-surface-50 rounded-xl border border-primary-200 p-4">
          <div className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-2">
            Formula
          </div>
          <div className="text-lg md:text-2xl font-mono font-bold text-slate-900 text-center break-words">
            {formula.displayFormula}
          </div>
        </div>

        {/* Work Area Section */}
        <div>
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide block mb-2">
            Your Work
          </label>
          <textarea
            placeholder={`= 5 037 x 4 = 20 148\n= 12 740 + 20 148 = 32 888\n= 32 888`}
            value={value}
            disabled={disabled}
            onChange={(e) => {
              onChange(normalizeComplexStepLines(e.target.value));
            }}
            rows={6}
            className={`w-full font-mono text-sm leading-6 border border-primary-300 rounded-xl p-3 bg-surface-50 resize-vertical text-slate-900 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200 ${
              disabled ? 'cursor-not-allowed opacity-60' : ''
            }`}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide block mb-2">
            Final Answer
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-600">=</span>
            <input
              type="text"
              inputMode="decimal"
              value={finalAnswer}
              disabled
              placeholder="—"
              className="flex-1 text-lg md:text-xl font-bold border border-primary-300 rounded-lg px-4 py-2 bg-slate-100/80 outline-none placeholder-slate-400 text-slate-900 cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplexFormulaInput;
