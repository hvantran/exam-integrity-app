import React from 'react';
import {
  ProgressBar as LibProgressBar,
  ProgressBarVariant as LibProgressBarVariant,
} from '@hvantran/ui-component-library';

export interface ProgressBarProps {
  /** 0–100 */
  value: number;
  /** When true the bar turns Warning Red (e.g. < 5 min remaining) */
  urgent?: boolean;
  /** Render at the very top of the viewport (fixed position) */
  fixed?: boolean;
  variant?: LibProgressBarVariant;
  className?: string;
}

/**
 * Atom — ProgressBar
 * Consumes published @hvantran/ui-component-library ProgressBar primitive.
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  urgent = false,
  fixed = false,
  variant,
  className = '',
}) => {
  const resolvedVariant: LibProgressBarVariant =
    variant ?? (urgent ? 'danger' : 'primary');

  const content = (
    <LibProgressBar
      value={value}
      variant={resolvedVariant}
      size="sm"
      className={fixed ? 'rounded-none' : className}
    />
  );

  if (fixed) {
    return (
      <div className={`fixed left-0 right-0 top-0 z-[200] ${className}`.trim()}>
        {content}
      </div>
    );
  }

  return content;
};

export default ProgressBar;
