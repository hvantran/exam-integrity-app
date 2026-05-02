import React from 'react';
import { colors, borderRadius } from '../../design-system/tokens';

export interface NavMenuItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

/**
 * Molecule — NavMenuItem
 *
 * Sidebar navigation item used in the Teacher/Admin dashboard.
 * Shows icon + label; collapses to icon-only when `collapsed` is true.
 * Active item gets a Trust Blue left border accent + bg tint.
 */
const NavMenuItem: React.FC<NavMenuItemProps> = ({
  icon,
  label,
  active = false,
  collapsed = false,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    title={collapsed ? label : undefined}
    className="w-full flex items-center gap-3 py-2.5 border-none text-left font-inherit transition-all duration-150"
    style={{
      paddingLeft: collapsed ? '12px' : '16px',
      paddingRight: collapsed ? '12px' : '16px',
      borderRadius: borderRadius.default,
      backgroundColor: active ? colors.surface.container.low : 'transparent',
      color: active ? colors.primary.main : colors.on.surfaceVariant,
      borderLeft: active ? `3px solid ${colors.primary.main}` : '3px solid transparent',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = colors.surface.container.low;
      e.currentTarget.style.color = colors.primary.main;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = active ? colors.surface.container.low : 'transparent';
      e.currentTarget.style.color = active ? colors.primary.main : colors.on.surfaceVariant;
    }}
  >
    <span
      className="flex items-center justify-center shrink-0"
      style={{ color: 'inherit' }}
    >
      {icon}
    </span>
      {!collapsed && (
        <span
          style={{
            fontSize: '14px',
            fontWeight: active ? 600 : 400,
            lineHeight: '20px',
            color: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
      )}
  </button>
);

export default NavMenuItem;
