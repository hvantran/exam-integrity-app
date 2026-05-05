import React, { useMemo } from 'react';
import { ParsedFormula } from '../../../utils/mathFormulaAnalyzer';

interface SimpleArithmeticInputProps {
  formula: ParsedFormula;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

const operatorSymbols: Record<string, string> = {
  '+': '+',
  '-': '−',
  'x': '×',
  'X': '×',
  '*': '×',
  ':': '÷',
  '/': '÷',
};

/**
 * Molecule — SimpleArithmeticInput
 *
 * Provides specialized input UI for simple arithmetic problems (single operator).
 * Features:
 * - Clean vertical layout for formula display
 * - Large number inputs optimized for reading
 * - Operator symbol display
 * - Vertical calculation workspace visualization
 */
const SimpleArithmeticInput: React.FC<SimpleArithmeticInputProps> = ({
  formula,
  value,
  disabled = false,
  onChange,
}) => {
  const operatorSymbol = useMemo(() => {
    return operatorSymbols[formula.operator || ''] || formula.operator || '';
  }, [formula.operator]);

  const getOperatorColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'SIMPLE_ADDITION': 'text-green-600',
      'SIMPLE_SUBTRACTION': 'text-blue-600',
      'SIMPLE_MULTIPLICATION': 'text-orange-600',
      'SIMPLE_DIVISION': 'text-purple-600',
    };
    return colorMap[type] || 'text-slate-600';
  };

  const getBackgroundColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'SIMPLE_ADDITION': 'bg-green-50',
      'SIMPLE_SUBTRACTION': 'bg-blue-50',
      'SIMPLE_MULTIPLICATION': 'bg-orange-50',
      'SIMPLE_DIVISION': 'bg-purple-50',
    };
    return colorMap[type] || 'bg-slate-50';
  };

  const getBorderColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'SIMPLE_ADDITION': 'border-green-200',
      'SIMPLE_SUBTRACTION': 'border-blue-200',
      'SIMPLE_MULTIPLICATION': 'border-orange-200',
      'SIMPLE_DIVISION': 'border-purple-200',
    };
    return colorMap[type] || 'border-slate-200';
  };

  return (
    <div className={`rounded-2xl border ${getBorderColor(formula.type)} ${getBackgroundColor(formula.type)} p-4 md:p-6`}>
      <div className="space-y-4">
        {/* Calculation Display */}
        <div className="font-mono space-y-2.5">
          {/* First operand */}
          <div className="text-right pr-4">
            <div className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              {formula.operands?.[0]?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') || ''}
            </div>
          </div>

          {/* Operator and second operand */}
          <div className="flex items-center justify-between pr-4">
            <div className={`text-2xl md:text-3xl font-bold ${getOperatorColor(formula.type)}`}>
              {operatorSymbol}
            </div>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              {formula.operands?.[1]?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') || ''}
            </div>
          </div>

          {/* Divider line */}
          <div className="border-b-2 border-slate-400 my-1" />

          {/* Answer input area */}
          <input
            type="text"
            inputMode="decimal"
            placeholder="________"
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full text-right text-2xl md:text-3xl font-bold bg-transparent outline-none placeholder-slate-400 text-slate-900 ${
              disabled ? 'cursor-not-allowed opacity-60' : 'focus:text-sky-600'
            }`}
          />
        </div>

        {/* Helper text */}
        <div className="text-xs text-slate-600 text-center pt-2">
          <p>Enter your answer above</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleArithmeticInput;
