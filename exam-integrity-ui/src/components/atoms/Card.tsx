import React from 'react';
import { Card as LibCard, CardVariant as LibCardVariant } from '@hvantran/ui-component-library';

export type CardVariant = LibCardVariant;

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

/**
 * Atom — Card
 * Consumes published @hvantran/ui-component-library Card primitive.
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

  return (
    <LibCard
      variant={variant}
      selected={selected}
      interactive={isInteractive}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
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
      className={className}
      {...rest}
    >
      {children}
    </LibCard>
  );
};

export default Card;
