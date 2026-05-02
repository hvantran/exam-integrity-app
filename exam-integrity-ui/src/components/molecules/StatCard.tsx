import React from 'react';
import { colors, borderRadius, shadow } from '../../design-system/tokens';

export interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  /** Optional sub-label below value */
  sublabel?: string;
  variant?: 'default' | 'warning' | 'success';
}

const variantColor: Record<NonNullable<StatCardProps['variant']>, string> = {
  default: colors.primary.main,
  warning: colors.tertiary.main,
  success: colors.secondary.main,
};

/**
 * Molecule — StatCard
 *
 * Dashboard metric card used in the Teacher Command Center.
 * Shows icon + large numeric value + descriptive label.
 * E.g.: "42 / 45 Students Active", "00:45:12 Time Remaining".
 */
const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  sublabel,
  variant = 'default',
}) => {
  const accentColor = variantColor[variant];

  return (
    <div
      className="flex min-w-40 flex-col gap-2"
      style={{
        backgroundColor: colors.surface.container.lowest,
        border: `1px solid ${colors.outlineVariant}`,
        borderRadius: borderRadius.lg,
        boxShadow: shadow.cardActive,
        padding: '20px 24px',
      }}
    >
      <div className="flex items-center gap-2" style={{ color: accentColor }}>
        {icon}
        <span style={{ fontWeight: 600, fontSize: '11px', letterSpacing: '0.06em', color: colors.on.surfaceVariant, textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: '28px',
          fontWeight: 700,
          lineHeight: 1.1,
          color: accentColor,
          fontFamily: '"Space Grotesk", monospace',
        }}
      >
        {value}
      </div>
      {sublabel && (
        <div style={{ fontSize: '12px', color: colors.on.surfaceVariant }}>
          {sublabel}
        </div>
      )}
    </div>
  );
};

export default StatCard;
