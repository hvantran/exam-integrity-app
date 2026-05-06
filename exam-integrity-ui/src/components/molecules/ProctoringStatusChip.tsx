import React from 'react';
import { colors, borderRadius } from '../../design-system/tokens';

export interface ProctoringStatusChipProps {
  active?: boolean;
  label?: string;
}

/**
 * Molecule — ProctoringStatusChip
 *
 * "Integrity Green" pill with a pulsing dot indicating live proctoring.
 * When active=false it shows a neutral "Proctoring Off" state.
 */
const ProctoringStatusChip: React.FC<ProctoringStatusChipProps> = ({ active = true, label }) => {
  const displayLabel = label ?? (active ? 'Proctoring Active' : 'Proctoring Off');
  const dotColor = active ? colors.secondary.main : colors.outline;
  const bgColor = active ? '#DCFCE7' : colors.surface.container.highest;
  const textColor = active ? colors.secondary.main : colors.on.surfaceVariant;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1"
      style={{
        borderRadius: borderRadius.full,
        backgroundColor: bgColor,
        border: `1px solid ${active ? '#86EFAC' : colors.outlineVariant}`,
      }}
    >
      <span
        className={active ? 'animate-pulse shrink-0' : 'shrink-0'}
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: dotColor,
        }}
      />
      <span style={{ fontSize: '12px', fontWeight: 600, color: textColor, whiteSpace: 'nowrap' }}>
        {displayLabel}
      </span>
    </span>
  );
};

export default ProctoringStatusChip;
