import React from 'react';

export type CardVariant = 'default' | 'outlined' | 'elevated';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visual style:
   * - `default`  → white background, 1px border, subtle shadow
   * - `outlined` → white background, 1px border, no shadow
   * - `elevated` → white background, no border, stronger shadow
   */
  variant?: CardVariant;
  /**
   * When true, renders a focused/selected ring (sky-blue border + tinted background).
   * Intended for selectable card lists.
   */
  selected?: boolean;
  /**
   * When provided the card becomes interactive: cursor-pointer, hover lift, focus ring.
   */
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  children: React.ReactNode;
}

const variantBase: Record<CardVariant, string> = {
  default: 'border border-gray-200 bg-white shadow-sm',
  outlined: 'border border-gray-200 bg-white',
  elevated: 'bg-white shadow-md',
};

/**
 * Atom — Card
 *
 * A generic surface container used throughout the Zen Integrity System.
 * Supports optional selection state and click interaction without
 * wrapping semantic content inside a `<button>`.
 */
const Card: React.FC<CardProps> = ({
  variant = 'default',
  selected = false,
  onClick,
  className = '',
  children,
  ...rest
}) => {
  const isInteractive = onClick !== undefined;

  const interactiveClasses = isInteractive
    ? 'cursor-pointer hover:border-sky-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-1 transition-all duration-150'
    : '';

  const selectedClasses = selected
    ? 'border-sky-500 bg-sky-50 shadow-[0_0_0_2px_rgba(14,165,233,0.25)]'
    : '';

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
              }
            }
          : undefined
      }
      className={[
        'rounded-2xl p-4',
        variantBase[variant],
        interactiveClasses,
        selectedClasses,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;
