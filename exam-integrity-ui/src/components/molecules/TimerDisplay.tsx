import React, { useEffect, useRef, useState } from 'react';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { colors } from '../../design-system/tokens';

export interface TimerDisplayProps {
  /** Total seconds remaining */
  remainingSeconds: number;
  /** Show schedule icon to the left of time */
  showIcon?: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Molecule — TimerDisplay
 *
 * Shows MM:SS countdown. Turns Warning Red when ≤ 5 minutes remain,
 * per Zen Integrity System spec ("Warning Red is used for time-remaining warnings").
 */
const TimerDisplay: React.FC<TimerDisplayProps> = ({ remainingSeconds, showIcon = true }) => {
  const [localSeconds, setLocalSeconds] = useState(remainingSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local timer with prop
  useEffect(() => {
    setLocalSeconds(remainingSeconds);
  }, [remainingSeconds]);

  // Per-second decrement
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (localSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setLocalSeconds(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [localSeconds]);

  const isUrgent = localSeconds <= 300;
  const mm = pad(Math.floor(localSeconds / 60));
  const ss = pad(localSeconds % 60);
  const color = isUrgent ? colors.tertiary.main : colors.secondary.main;

  return (
    <div className="inline-flex items-center gap-1.5 transition-colors duration-500" style={{ color }}>
      {showIcon && <ScheduleIcon style={{ fontSize: 18, color }} />}
      <span
        style={{
          fontFamily: '"Space Grotesk", monospace',
          fontSize: '16px',
          fontWeight: 700,
          letterSpacing: '0.04em',
          lineHeight: 1,
          color,
        }}
      >
        {mm}:{ss}
      </span>
      {isUrgent && (
        <span style={{ fontSize: '11px', fontWeight: 600, color, opacity: 0.85 }}>
          Time running out
        </span>
      )}
    </div>
  );
};

export default TimerDisplay;
