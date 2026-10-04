import React from 'react';
import { Badge as LibBadge, BadgeVariant as LibBadgeVariant } from '@hvantran/ui-component-library';

export type BadgeColor = 'primary' | 'secondary' | 'error' | 'neutral' | 'warning';

export interface BadgeProps {
  /** Numeric or short text count to display */
  count: number | string;
  color?: BadgeColor;
  /** Max value — displays "{max}+" when count exceeds it */
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
}

const colorToVariantMap: Record<BadgeColor, LibBadgeVariant> = {
  primary: 'primary',
  secondary: 'secondary',
  error: 'danger',
  warning: 'warning',
  neutral: 'neutral',
};

const sizeClasses: Record<'sm' | 'md', string> = {
  sm: 'text-[10px] min-w-[18px] h-[18px] px-1',
  md: 'text-xs min-w-[22px] h-[22px] px-1.5',
};

/**
 * Atom — Badge
 * Consumes published @hvantran/ui-component-library Badge primitive.
 */
const Badge: React.FC<BadgeProps> = ({
  count,
  color = 'primary',
  max,
  size = 'md',
  className = '',
}) => {
  return (
    <LibBadge
      variant={colorToVariantMap[color]}
      count={count}
      max={max}
      className={[sizeClasses[size], className].filter(Boolean).join(' ')}
    />
  );
};

export default Badge;
