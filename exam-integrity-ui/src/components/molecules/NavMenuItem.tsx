import React from 'react';
import { Button } from '../atoms';

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
  <Button
    type="button"
    className={[
      'w-full flex gap-3 py-2.5 border-none text-left transition-all duration-150 rounded',
      collapsed ? 'px-3' : 'px-4',
      active
        ? 'bg-surface-low text-primary border-l-[3px] border-l-primary'
        : 'bg-transparent text-on-surfaceVariant border-l-[3px] border-l-transparent hover:bg-surface-low hover:text-primary',
    ].join(' ')}
    variant="ghost"
    size="md"
    onClick={onClick}
    title={collapsed ? label : undefined}
  >
    <span className="flex items-center justify-center shrink-0">{icon}</span>
    {!collapsed && (
      <span
        className={`text-sm leading-5 whitespace-nowrap ${active ? 'font-semibold' : 'font-normal'}`}
      >
        {label}
      </span>
    )}
  </Button>
);

export default NavMenuItem;
