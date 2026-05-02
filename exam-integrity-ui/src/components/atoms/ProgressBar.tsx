import React from 'react';
import { colors } from '../../design-system/tokens';

export interface ProgressBarProps {
  /** 0–100 */
  value: number;
  /** When true the bar turns Warning Red (e.g. < 5 min remaining) */
  urgent?: boolean;
  /** Render at the very top of the viewport (fixed position) */
  fixed?: boolean;
}

/**
 * Atom — ProgressBar
 *
 * 4px-tall strip used as the exam progress indicator fixed at the top of the
 * viewport. Color transitions from Trust Blue to Warning Red when `urgent`.
 */
const ProgressBar: React.FC<ProgressBarProps> = ({ value, urgent = false, fixed = false }) => (
  <div
    className={fixed ? 'fixed left-0 right-0 top-0 z-[200]' : 'w-full'}
    role="progressbar"
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.min(100, Math.max(0, value))}
  >
    <div className="h-1 w-full overflow-hidden" style={{ backgroundColor: colors.outlineVariant }}>
      <div
        className="h-full transition-all duration-300"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          backgroundColor: urgent ? colors.tertiary.main : colors.primary.main,
        }}
      />
    </div>
  </div>
);

export default ProgressBar;
