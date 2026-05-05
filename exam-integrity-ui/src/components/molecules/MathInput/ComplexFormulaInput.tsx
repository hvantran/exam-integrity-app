import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ParsedFormula } from '../../../utils/mathFormulaAnalyzer';

interface ComplexFormulaInputProps {
  formula: ParsedFormula;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

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
  return (
    <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="space-y-4">
        {/* Formula Display */}
        <div className="bg-white rounded-xl border border-purple-200 p-4">
          <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">
            Formula
          </div>
          <div className="text-lg md:text-2xl font-mono font-bold text-slate-900 text-center break-words">
            {formula.displayFormula}
          </div>
        </div>

        {/* Order of Operations Guidance */}
        <div className="flex gap-3 bg-purple-50 border border-purple-200 rounded-xl p-3">
          <AlertCircle size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-purple-900">
            <p className="font-semibold">Remember order of operations:</p>
            <p className="text-xs text-purple-800 mt-1">
              Multiply/Divide first (left to right), then Add/Subtract (left to right)
            </p>
          </div>
        </div>

        {/* Work Area Section */}
        <div>
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide block mb-2">
            Your Work
          </label>
          <textarea
            placeholder={`Show your steps here:\n\nStep 1: ...\nStep 2: ...\n\nFinal Answer: ...`}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            rows={6}
            className={`w-full font-mono text-sm leading-6 border border-purple-300 rounded-xl p-3 bg-white resize-vertical text-slate-900 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200 ${
              disabled ? 'cursor-not-allowed opacity-60' : ''
            }`}
          />
        </div>

        {/* Answer Input */}
        <div>
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide block mb-2">
            Final Answer
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-600">=</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Enter final result"
              value={value.split('\n').pop() || ''}
              disabled={disabled}
              onChange={(e) => {
                const lines = value.split('\n');
                lines[lines.length - 1] = e.target.value;
                onChange(lines.join('\n'));
              }}
              className={`flex-1 text-lg md:text-xl font-bold border border-purple-300 rounded-lg px-4 py-2 bg-white outline-none placeholder-slate-400 text-slate-900 focus:border-purple-400 focus:ring-1 focus:ring-purple-200 ${
                disabled ? 'cursor-not-allowed opacity-60' : ''
              }`}
            />
          </div>
        </div>

        {/* Helper text */}
        <div className="text-xs text-slate-600 text-center pt-2 border-t border-slate-200">
          <p>Show your work for partial credit</p>
        </div>
      </div>
    </div>
  );
};

export default ComplexFormulaInput;
