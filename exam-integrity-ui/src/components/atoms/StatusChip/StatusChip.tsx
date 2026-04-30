import React from 'react';


export type StatusChipVariant =
  | 'proctoring'
  | 'pending'
  | 'draft'
  | 'published'
  | 'active'
  | 'neutral';

export interface StatusChipProps {
  label: string;
  variant?: StatusChipVariant;
  icon?: React.ReactElement;
  onDelete?: () => void;
  size?: 'small' | 'medium';
}

const variantClass: Record<StatusChipVariant, string> = {
  proctoring: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-800',
  draft: 'bg-gray-100 text-gray-500',
  published: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  neutral: 'bg-gray-100 text-gray-700',
};

/**
 * Atom — StatusChip
 *
 * Pill-shaped status indicator used for exam states (Draft, Published),
 * proctoring status (Proctoring Active), and pending review counts.
 */
const StatusChip: React.FC<StatusChipProps> = ({
  label,
  variant = 'neutral',
  icon,
  onDelete,
  size = 'small',
}) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold ${size === 'small' ? 'text-xs' : 'text-sm'} ${variantClass[variant]}`}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {label}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="ml-1 text-gray-400 hover:text-gray-700 focus:outline-none"
        >
          ×
        </button>
      )}
    </span>
  );
};

export default StatusChip;
