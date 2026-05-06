import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { colors, borderRadius } from '../../design-system/tokens';

interface Props {
  missedNumbers: number[];
}

const MistakeSummary: React.FC<Props> = ({ missedNumbers }) => {
  if (!missedNumbers.length) return null;
  return (
    <div
      className="mb-3 flex gap-1.5 p-2"
      style={{
        borderRadius: borderRadius.default,
        backgroundColor: `${colors.tertiary.main}12`,
        border: `1px solid ${colors.tertiary.main}50`,
      }}
    >
      <AlertTriangle
        size={20}
        style={{ color: colors.tertiary.main, flexShrink: 0, marginTop: '2px' }}
      />
      <div>
        <div
          style={{
            fontWeight: 600,
            fontSize: '13px',
            color: colors.tertiary.main,
            marginBottom: '2px',
          }}
        >
          Questions to Review
        </div>
        <div style={{ fontSize: '13px', color: colors.on.surfaceVariant }}>
          Review the following questions:{' '}
          <strong style={{ color: colors.on.surface }}>{missedNumbers.join(', ')}</strong>
        </div>
      </div>
    </div>
  );
};

export default MistakeSummary;
