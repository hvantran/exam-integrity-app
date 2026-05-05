import React, { useMemo } from 'react';
import { ParsedFormula } from '../../../utils/mathFormulaAnalyzer';

interface LongDivisionInputProps {
  formula: ParsedFormula;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

interface RemainderRow {
  display: string;
}

function formatSpaced(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Builds the remainder rows for the long-division left column.
 *
 * For 93 645 ÷ 9 the rows are: "03", "  36", "   04", "    45", "      0"
 * Each partial is right-aligned to its corresponding digit column in the
 * formatted dividend string.
 */
function buildRemainderRows(dividend: number, divisor: number): RemainderRow[] {
  if (!divisor) return [];

  const digits = dividend.toString().split('').map(Number);
  const formatted = formatSpaced(dividend);

  // Map digit-index → display-column (ignore spaces in the formatted string)
  const digitCols: number[] = [];
  let d = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (formatted[i] !== ' ') {
      digitCols[d++] = i;
    }
  }

  const rows: RemainderRow[] = [];
  let remainder = 0;

  for (let i = 0; i < digits.length; i++) {
    const current = remainder * 10 + digits[i];
    const q = Math.floor(current / divisor);
    const r = current % divisor;

    // Skip step 0 — its partial IS the dividend (already shown in the top row).
    if (i > 0) {
      // partialStr = prev-remainder + brought-down digit, e.g. "0"+"3" → "03"
      const partialStr = remainder.toString() + digits[i].toString();
      const rightCol = digitCols[i];
      const leftCol = rightCol - partialStr.length + 1;
      const padding = ' '.repeat(Math.max(0, leftCol));
      rows.push({ display: padding + partialStr });
    }

    remainder = r;
  }

  // Final remainder — one column past the last digit
  const lastDigitCol = digitCols[digits.length - 1] ?? 0;
  const finalStr = remainder.toString();
  const finalLeftCol = lastDigitCol + 1 - finalStr.length + 1;
  rows.push({ display: ' '.repeat(Math.max(0, finalLeftCol)) + finalStr });

  return rows;
}

/**
 * Molecule — LongDivisionInput
 *
 * Renders a Grade-3-style long division bracket layout:
 *
 *   93 645  │  9
 *           │──────────
 *   03      │  [quotient input]
 *     36    │
 *       04  │
 *         45│
 *           0│
 */
const LongDivisionInput: React.FC<LongDivisionInputProps> = ({
  formula,
  value,
  disabled = false,
  onChange,
}) => {
  const dividend = formula.operands?.[0] ?? 0;
  const divisor = formula.operands?.[1] ?? 1;
  const dividendFormatted = formatSpaced(dividend);
  const divisorStr = divisor.toString();
  const quotientLen = Math.floor(dividend / divisor).toString().length;
  const separatorLength = Math.max(divisorStr.length, quotientLen) + 4;

  const remainderRows = useMemo(
    () => buildRemainderRows(dividend, divisor),
    [dividend, divisor],
  );

  return (
    <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4 md:p-6">
      <div className="space-y-4">
        <div className="font-mono text-xl md:text-2xl font-bold text-slate-900 tracking-tight overflow-x-auto">
          <div className="inline-flex items-start">
            {/* ── Left column: dividend + remainder steps ── */}
            <div>
              {/* Row 0: full dividend */}
              <div className="leading-8" style={{ whiteSpace: 'pre' }}>
                {dividendFormatted}
              </div>

              {/* Row 1: invisible spacer — keeps height in sync with the dashes row */}
              <div className="leading-6 select-none" aria-hidden="true">
                &nbsp;
              </div>

              {/* Rows 2+: remainder partials */}
              {remainderRows.map((row, i) => (
                <div key={i} className="leading-8" style={{ whiteSpace: 'pre' }}>
                  {row.display}
                </div>
              ))}
            </div>

            {/* ── Vertical dividing bar ── */}
            <div className="self-stretch border-l-2 border-slate-700 mx-2" />

            {/* ── Right column: divisor / separator / quotient ── */}
            <div className="min-w-0">
              {/* Row 0: divisor */}
              <div className="leading-8">{divisorStr}</div>

              {/* Row 1: dashes */}
              <div className="leading-6 text-slate-600" aria-hidden="true">
                {'─'.repeat(separatorLength)}
              </div>

              {/* Row 2: quotient input */}
              <div className="leading-8">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder={'_'.repeat(quotientLen)}
                  value={value}
                  disabled={disabled}
                  onChange={(e) => onChange(e.target.value)}
                  className={`bg-transparent outline-none placeholder-slate-400 w-36 ${
                    disabled
                      ? 'cursor-not-allowed opacity-60 text-slate-900'
                      : 'text-sky-600 focus:text-sky-700'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 text-center pt-1">
          <p>Enter the quotient on the right-hand side</p>
        </div>
      </div>
    </div>
  );
};

export default LongDivisionInput;
