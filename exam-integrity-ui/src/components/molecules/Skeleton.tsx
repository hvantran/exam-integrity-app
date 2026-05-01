import React from 'react';
import MuiSkeleton from '@mui/material/Skeleton';
import type { SkeletonProps as MuiSkeletonProps } from '@mui/material/Skeleton';

export interface SkeletonProps extends Omit<MuiSkeletonProps, 'variant'> {
  /** Legacy prop kept for backwards compatibility. */
  rounded?: boolean;
  /** MUI-like shape variants. */
  variant?: MuiSkeletonProps['variant'];
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  height = 16,
  width = '100%',
  rounded = true,
  variant,
  animation = 'wave',
  ...rest
}) => {
  const resolvedVariant = variant ?? (rounded ? 'rounded' : 'rectangular');

  return (
    <MuiSkeleton
      className={className}
      variant={resolvedVariant}
      animation={animation}
      width={width}
      height={height}
      {...rest}
    />
  );
};

export default Skeleton;
